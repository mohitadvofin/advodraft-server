import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Calendar, 
  MapPin, 
  Tag, 
  Eye, 
  Download, 
  Bookmark, 
  Brain,
  FileText,
  Clock,
  AlertCircle,
  Crown
} from 'lucide-react';

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [summaryType, setSummaryType] = useState('short'); // short, medium, detailed
  const { user } = useAuth();

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await axios.get('/cases');
      setCases(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch cases';
      toast.error(errorMessage);
      
      if (error.response?.status === 403) {
        // Subscription expired
        console.log('Subscription expired');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const canAccessFeature = (feature) => {
    if (!user) return false;
    
    switch (feature) {
      case 'full_text':
        return ['plan_2', 'plan_3'].includes(user.subscription_plan);
      case 'download':
        return ['plan_2', 'plan_3'].includes(user.subscription_plan);
      case 'ai_draft':
        return ['plan_2', 'plan_3'].includes(user.subscription_plan);
      default:
        return true;
    }
  };

  const getSubscriptionMessage = () => {
    if (!user?.subscription_active) {
      return "Your subscription has expired. Please upgrade to continue accessing cases.";
    }
    
    if (user.subscription_plan === 'free_trial') {
      const daysLeft = Math.ceil((new Date(user.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24));
      return `Free trial - ${daysLeft} days remaining`;
    }
    
    return null;
  };

  const getSummaryContent = (caseItem, type) => {
    switch (type) {
      case 'short':
        return caseItem.short_summary || 'Summary not available';
      case 'medium':
        return caseItem.medium_summary || 'Medium summary not available';
      case 'detailed':
        return caseItem.detailed_analysis || 'Detailed analysis not available';
      default:
        return 'Summary not available';
    }
  };

  const handleDownload = (caseItem) => {
    if (!canAccessFeature('download')) {
      toast.error('Upgrade to Plan 2 or Plan 3 to download cases');
      return;
    }
    
    // Implement download functionality
    toast.success('Download started');
  };

  const handleBookmark = (caseId) => {
    // Implement bookmark functionality
    toast.success('Case bookmarked');
  };

  const handleAIDraft = (caseItem) => {
    if (!canAccessFeature('ai_draft')) {
      toast.error('Upgrade to Plan 2 or Plan 3 to use AI Draft Assistant');
      return;
    }
    
    // Navigate to AI Draft Assistant with case context
    toast.info('Redirecting to AI Draft Assistant...');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Case Dashboard</h1>
        <p className="text-gray-600">Stay updated with the latest GST and Income Tax case summaries</p>
        
        {/* Subscription Status */}
        {getSubscriptionMessage() && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <AlertCircle className="text-yellow-600 mr-3" size={20} />
            <span className="text-yellow-800">{getSubscriptionMessage()}</span>
          </div>
        )}
      </div>

      {/* Cases Grid */}
      {cases.length === 0 ? (
        <div className="text-center py-12 fade-in-delay-1">
          <FileText size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No new cases available</h3>
          <p className="text-gray-600">Check back later for new case updates.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {cases.map((caseItem, index) => (
            <div 
              key={caseItem.id} 
              className={`card card-hover fade-in-delay-${Math.min(index + 1, 3)}`}
              data-testid={`case-card-${index}`}
            >
              {/* Case Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid={`case-title-${index}`}>
                    {caseItem.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center" data-testid={`case-court-${index}`}>
                      <MapPin size={14} className="mr-1" />
                      {caseItem.court}
                    </div>
                    <div className="flex items-center" data-testid={`case-date-${index}`}>
                      <Calendar size={14} className="mr-1" />
                      {formatDate(caseItem.date)}
                    </div>
                    <div className="flex items-center" data-testid={`case-section-${index}`}>
                      <FileText size={14} className="mr-1" />
                      {caseItem.section}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleBookmark(caseItem.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    data-testid={`bookmark-btn-${index}`}
                  >
                    <Bookmark size={18} />
                  </button>
                  
                  {canAccessFeature('download') ? (
                    <button
                      onClick={() => handleDownload(caseItem)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      data-testid={`download-btn-${index}`}
                    >
                      <Download size={18} />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="p-2 text-gray-300 cursor-not-allowed"
                      title="Upgrade to access download"
                    >
                      <Download size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Summary Tabs */}
              <div className="mb-4">
                <div className="flex space-x-1 mb-3">
                  {['short', 'medium', 'detailed'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSummaryType(type)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        summaryType === type
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      data-testid={`summary-tab-${type}-${index}`}
                    >
                      {type === 'short' && 'Short (≤50)'}
                      {type === 'medium' && 'Medium (≤150)'}
                      {type === 'detailed' && 'Detailed (≤400)'}
                    </button>
                  ))}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4" data-testid={`case-summary-${index}`}>
                  <p className="text-gray-700 leading-relaxed">
                    {getSummaryContent(caseItem, summaryType)}
                  </p>
                </div>
              </div>

              {/* Tags and Outcome */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  {caseItem.tags && caseItem.tags.length > 0 && (
                    <>
                      <Tag size={16} className="text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {caseItem.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="badge badge-primary"
                            data-testid={`case-tag-${index}-${tagIndex}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Outcome Badge */}
                  <span
                    className={`badge ${
                      caseItem.outcome === 'For Assessee' 
                        ? 'badge-success' 
                        : caseItem.outcome === 'For Revenue'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}
                    data-testid={`case-outcome-${index}`}
                  >
                    {caseItem.outcome}
                  </span>
                  
                  {/* AI Draft Button */}
                  {canAccessFeature('ai_draft') ? (
                    <button
                      onClick={() => handleAIDraft(caseItem)}
                      className="btn-primary flex items-center space-x-2"
                      data-testid={`ai-draft-btn-${index}`}
                    >
                      <Brain size={16} />
                      <span>AI Draft</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="btn-secondary opacity-50 cursor-not-allowed flex items-center space-x-2"
                      title="Upgrade to Plan 2 or Plan 3 to use AI Draft"
                    >
                      <Crown size={16} />
                      <span>AI Draft</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Full Text Preview (for eligible plans) */}
              {caseItem.full_text && canAccessFeature('full_text') && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                    View Full Case Text
                  </summary>
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                      {caseItem.full_text.substring(0, 500)}...
                    </p>
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;