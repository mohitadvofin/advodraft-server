import React from 'react';
import { FileText } from 'lucide-react';

const MyCases = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <FileText size={48} className="text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Cases</h2>
        <p className="text-gray-600">Your bookmarked and saved cases will appear here</p>
      </div>
    </div>
  );
};

export default MyCases;