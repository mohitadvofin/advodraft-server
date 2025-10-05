import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, CreditCard, FileText, Brain, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getSubscriptionBadge = () => {
    if (!user) return null;
    
    const planNames = {
      free_trial: 'Free Trial',
      plan_1: 'Plan ₹499',
      plan_2: 'Plan ₹799',
      plan_3: 'Plan ₹1299'
    };

    const badgeColors = {
      free_trial: 'badge-warning',
      plan_1: 'badge-primary',
      plan_2: 'badge-success',
      plan_3: 'badge-primary'
    };

    return (
      <span className={`badge ${badgeColors[user.subscription_plan]}`}>
        {planNames[user.subscription_plan]}
      </span>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">AL</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AdvoDraft</h1>
                <p className="text-xs text-gray-500">Legal Feed</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              to="/dashboard"
              className={`nav-link flex items-center space-x-2 ${isActive('/dashboard') ? 'active' : ''}`}
              data-testid="nav-dashboard"
            >
              <Home size={18} />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            
            <Link
              to="/my-cases"
              className={`nav-link flex items-center space-x-2 ${isActive('/my-cases') ? 'active' : ''}`}
              data-testid="nav-my-cases"
            >
              <FileText size={18} />
              <span className="hidden md:inline">My Cases</span>
            </Link>
            
            <Link
              to="/ai-draft-assistant"
              className={`nav-link flex items-center space-x-2 ${isActive('/ai-draft-assistant') ? 'active' : ''}`}
              data-testid="nav-ai-draft"
            >
              <Brain size={18} />
              <span className="hidden md:inline">AI Draft</span>
            </Link>
            
            <Link
              to="/subscription"
              className={`nav-link flex items-center space-x-2 ${isActive('/subscription') ? 'active' : ''}`}
              data-testid="nav-subscription"
            >
              <CreditCard size={18} />
              <span className="hidden md:inline">Subscription</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Subscription Badge */}
            <div className="hidden sm:block">
              {getSubscriptionBadge()}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                <User size={18} />
                <span className="hidden md:inline text-sm font-medium">{user?.full_name}</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    data-testid="nav-profile"
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    data-testid="nav-logout"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;