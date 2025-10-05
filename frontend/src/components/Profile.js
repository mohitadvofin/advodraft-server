import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Calendar, Crown } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPlanDetails = () => {
    const planNames = {
      free_trial: 'Free Trial',
      plan_1: 'Basic Plan - ₹499/month',
      plan_2: 'Professional Plan - ₹799/month',
      plan_3: 'Enterprise Plan - ₹1,299/month'
    };
    
    return planNames[user?.subscription_plan] || 'Unknown Plan';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account settings and subscription details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card fade-in-delay-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={20} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900" data-testid="profile-name">{user?.full_name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="text-green-600" size={20} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <p className="text-gray-900" data-testid="profile-email">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Phone className="text-purple-600" size={20} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="text-gray-900" data-testid="profile-phone">
                    {user?.phone_number || 'Not provided'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="text-orange-600" size={20} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="text-gray-900" data-testid="profile-member-since">
                    {user?.created_at ? formatDate(user.created_at) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button className="btn-primary">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="space-y-6">
          <div className="card fade-in-delay-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Crown className="mr-2 text-yellow-600" size={20} />
              Subscription
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Plan</label>
                <p className="text-gray-900 font-medium" data-testid="profile-subscription-plan">
                  {getPlanDetails()}
                </p>
              </div>
              
              {user?.subscription_plan === 'free_trial' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trial Ends</label>
                  <p className="text-gray-900" data-testid="profile-trial-end">
                    {user?.trial_end_date ? formatDate(user.trial_end_date) : 'Unknown'}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`badge ${
                  user?.subscription_active ? 'badge-success' : 'badge-danger'
                }`} data-testid="profile-subscription-status">
                  {user?.subscription_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {user?.subscription_plan === 'plan_2' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cases Used This Month</label>
                  <p className="text-gray-900" data-testid="profile-cases-used">
                    {user?.plan_2_cases_used || 0} / 2
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <button className="btn-outline w-full">
                Manage Subscription
              </button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="card fade-in-delay-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Cases Viewed</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Drafts Generated</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Downloads</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;