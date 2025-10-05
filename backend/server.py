from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
import jwt
import bcrypt
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
JWT_SECRET = "advocraft_legal_feed_secret_key_2025"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create the main app without a prefix
app = FastAPI(title="AdvoDraft Legal Feed API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    full_name: str
    phone_number: Optional[str] = None
    subscription_plan: str = "free_trial"  # free_trial, plan_1, plan_2, plan_3
    trial_start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    trial_end_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=7))
    subscription_active: bool = True
    plan_2_cases_used: int = 0  # For Plan 2 - 2 full cases per month limit
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Case(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    citation: str
    court: str
    date: datetime
    section: str
    full_text: str
    short_summary: Optional[str] = None  # ≤50 words
    medium_summary: Optional[str] = None  # ≤150 words
    detailed_analysis: Optional[str] = None  # ≤400 words
    tags: List[str] = []
    outcome: str  # "For Assessee" or "For Revenue"
    ai_generated: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CaseCreate(BaseModel):
    title: str
    citation: str
    court: str
    date: datetime
    section: str
    full_text: str

class CaseBulkImport(BaseModel):
    title: str
    court: str
    date: str  # Will be converted to datetime
    section: str
    text: str

class AISummaryRequest(BaseModel):
    case_id: str

class AIDraftRequest(BaseModel):
    summary_text: str
    draft_type: str = "reply"  # reply, petition, application

class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_type: str  # plan_1, plan_2, plan_3
    status: str = "active"  # active, cancelled, expired
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_date: datetime
    payment_id: Optional[str] = None
    amount: float
    currency: str = "INR"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Auth Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

async def check_subscription_status(user: User):
    """Check if user's subscription is active and valid"""
    now = datetime.now(timezone.utc)
    
    # Check free trial
    if user.subscription_plan == "free_trial":
        if now > user.trial_end_date:
            # Trial expired, update user status
            await db.users.update_one(
                {"id": user.id},
                {"$set": {"subscription_active": False}}
            )
            return False
    
    return user.subscription_active

# Auth Routes
@api_router.post("/auth/register")
async def register_user(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        phone_number=user_data.phone_number
    )
    
    user_dict = user.dict()
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "subscription_plan": user.subscription_plan,
            "trial_end_date": user.trial_end_date
        }
    }

@api_router.post("/auth/login")
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "subscription_plan": user["subscription_plan"],
            "trial_end_date": user["trial_end_date"],
            "subscription_active": user["subscription_active"]
        }
    }

@api_router.get("/auth/me")
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    # Check subscription status
    subscription_active = await check_subscription_status(current_user)
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "subscription_plan": current_user.subscription_plan,
        "trial_end_date": current_user.trial_end_date,
        "subscription_active": subscription_active,
        "plan_2_cases_used": current_user.plan_2_cases_used
    }

# Case Routes
@api_router.get("/cases")
async def get_cases(current_user: User = Depends(get_current_user)):
    # Check subscription status
    subscription_active = await check_subscription_status(current_user)
    if not subscription_active:
        raise HTTPException(status_code=403, detail="Subscription expired. Please upgrade your plan.")
    
    cases = await db.cases.find().sort("created_at", -1).limit(50).to_list(50)
    
    # Apply plan restrictions
    case_list = []
    for case_dict in cases:
        case_obj = Case(**case_dict)
        
        # Free trial users can only see summaries
        if current_user.subscription_plan == "free_trial":
            case_obj.full_text = ""  # Hide full text
        
        # Plan 1 users can only see summaries  
        elif current_user.subscription_plan == "plan_1":
            case_obj.full_text = ""  # Hide full text
            
        # Plan 2 users get 2 full cases per month
        elif current_user.subscription_plan == "plan_2":
            # For now, we'll implement a simple logic - first 2 cases show full text
            if len(case_list) >= 2:
                case_obj.full_text = ""
        
        # Plan 3 users get unlimited access (no restrictions)
        
        case_list.append(case_obj.dict())
    
    return case_list

@api_router.post("/cases")
async def create_case(case_data: CaseCreate, current_user: User = Depends(get_current_user)):
    # Only allow admin users to create cases (for now, any authenticated user)
    case = Case(**case_data.dict())
    case_dict = case.dict()
    await db.cases.insert_one(case_dict)
    return case

@api_router.post("/receive_cases")
async def receive_cases_bulk(cases_data: List[CaseBulkImport]):
    """Endpoint for receiving bulk case data from external systems"""
    created_cases = []
    
    for case_data in cases_data:
        try:
            # Convert string date to datetime
            case_date = datetime.fromisoformat(case_data.date.replace('Z', '+00:00'))
            
            case = Case(
                title=case_data.title,
                citation="",  # Will be populated by admin
                court=case_data.court,
                date=case_date,
                section=case_data.section,
                full_text=case_data.text,
                outcome="Pending Analysis"  # Will be updated by AI
            )
            
            case_dict = case.dict()
            result = await db.cases.insert_one(case_dict)
            created_cases.append(case.id)
            
        except Exception as e:
            logging.error(f"Error processing case {case_data.title}: {str(e)}")
            continue
    
    return {"created_cases": len(created_cases), "case_ids": created_cases}

@api_router.get("/")
async def root():
    return {"message": "AdvoDraft Legal Feed API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()