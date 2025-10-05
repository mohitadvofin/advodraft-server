import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Crown, FileText, Wand2 } from 'lucide-react';

const AIDraftAssistant = () => {
  const [draftText, setDraftText] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const canAccessAIDraft = ['plan_2', 'plan_3'].includes(user?.subscription_plan);

  const handleGenerateDraft = async () => {
    if (!canAccessAIDraft) return;
    
    setLoading(true);
    // AI draft generation will be implemented with OpenAI integration
    setTimeout(() => {
      setGeneratedDraft('AI-generated draft will appear here...');
      setLoading(false);
    }, 2000);
  };

  if (!canAccessAIDraft) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Crown size={48} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Draft Assistant</h2>
          <p className="text-gray-600 mb-6">Upgrade to Plan 2 or Plan 3 to access AI-powered draft generation</p>
          <button className="btn-primary">
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Draft Assistant</h1>
        <p className="text-gray-600">Generate intelligent legal drafts from case summaries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText size={20} className="mr-2" />
            Case Summary Input
          </h3>
          
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Enter case summary or legal text for AI draft generation..."
            className="form-input h-64 resize-none"
            data-testid="ai-draft-input"
          />
          
          <button
            onClick={handleGenerateDraft}
            disabled={!draftText.trim() || loading}
            className="btn-primary mt-4 flex items-center space-x-2"
            data-testid="generate-draft-btn"
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <Wand2 size={16} />
                <span>Generate AI Draft</span>
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain size={20} className="mr-2" />
            Generated Draft
          </h3>
          
          {generatedDraft ? (
            <div className="h-64 p-4 bg-blue-50 border border-blue-200 rounded-lg overflow-y-auto">
              <p className="text-gray-800 whitespace-pre-wrap" data-testid="generated-draft">
                {generatedDraft}
              </p>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Generated draft will appear here...</p>
            </div>
          )}
          
          {generatedDraft && (
            <div className="flex space-x-2 mt-4">
              <button className="btn-secondary">
                Copy Draft
              </button>
              <button className="btn-secondary">
                Download
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDraftAssistant;