import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check, Crown, Zap, Star } from 'lucide-react';

const Subscription = () => {
  const { user } = useAuth();

  const plans = [
    {
      id: 'plan_1',
      name: 'Basic Plan',
      price: '₹499',
      period: '/month',
      icon: Zap,
      color: 'blue',
      features: [
        'Daily summarized cases via WhatsApp',
        'Access to case summaries only',
        'No full case text access',
        'No download/copy/print'
      ]
    },
    {
      id: 'plan_2',
      name: 'Professional Plan',
      price: '₹799',
      period: '/month',
      icon: Star,
      color: 'green',
      popular: true,
      features: [
        'Daily summarized cases via WhatsApp',
        '2 full case texts per month',
        'Download/copy/print for 2 cases',
        'AI Draft Assistant access',
        'Priority support'
      ]
    },
    {
      id: 'plan_3',
      name: 'Enterprise Plan',
      price: '₹1,299',
      period: '/month',
      icon: Crown,
      color: 'purple',
      features: [
        'Daily summarized cases via WhatsApp',
        'Unlimited full case texts',
        'Unlimited download/copy/print',
        'AI Draft Assistant access',
        'Advanced AI features',
        'Priority support',
        'Custom integrations'
      ]
    }
  ];

  const handleSubscribe = (planId) => {
    // Payment integration will be implemented
    console.log(`Subscribing to ${planId}`);
  };

  const getTrialStatus = () => {
    if (user?.subscription_plan === 'free_trial') {
      const daysLeft = Math.ceil((new Date(user.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24));
      return `${daysLeft} days left in your free trial`;
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12 fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get access to comprehensive legal case summaries and AI-powered drafting tools
        </p>
        
        {getTrialStatus() && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <p className="text-blue-800 font-medium">{getTrialStatus()}</p>
          </div>
        )}
      </div>

      {/* Current Plan Status */}
      {user?.subscription_plan !== 'free_trial' && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg fade-in-delay-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">Current Plan</h3>
              <p className="text-green-700">
                You are currently subscribed to {plans.find(p => p.id === user.subscription_plan)?.name}
              </p>
            </div>
            <div className="text-green-600">
              <Check size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const IconComponent = plan.icon;
          const isCurrentPlan = user?.subscription_plan === plan.id;
          
          return (
            <div
              key={plan.id}
              className={`card relative ${plan.popular ? 'ring-2 ring-blue-500' : ''} fade-in-delay-${index + 1}`}
              data-testid={`plan-card-${plan.id}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${plan.color}-100 flex items-center justify-center`}>
                  <IconComponent className={`text-${plan.color}-600`} size={28} />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <Check className="text-green-500 mt-0.5 mr-3 flex-shrink-0" size={16} />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Subscribe Button */}
              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full btn-secondary opacity-50 cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                  data-testid={`subscribe-btn-${plan.id}`}
                >
                  {user?.subscription_plan === 'free_trial' ? 'Upgrade Now' : 'Switch Plan'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 fade-in-delay-3">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <details className="card cursor-pointer">
            <summary className="font-medium text-gray-900">What happens after my free trial expires?</summary>
            <p className="mt-3 text-gray-600">
              After your 7-day free trial expires, you'll need to choose a paid plan to continue accessing case summaries and features.
            </p>
          </details>
          
          <details className="card cursor-pointer">
            <summary className="font-medium text-gray-900">Can I cancel my subscription anytime?</summary>
            <p className="mt-3 text-gray-600">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
            </p>
          </details>
          
          <details className="card cursor-pointer">
            <summary className="font-medium text-gray-900">Do you offer refunds?</summary>
            <p className="mt-3 text-gray-600">
              We offer a 30-day money-back guarantee for all paid plans. Contact support if you're not satisfied.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Subscription;