import React from 'react';
import { Bot } from 'lucide-react';

export const ContentHeader: React.FC = () => (
  <div className="text-center mb-8">
    <div className="bg-indigo-100 text-indigo-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm ring-1 ring-indigo-200/50">
      <Bot className="w-8 h-8" />
    </div>
    
    <h2 className="text-3xl font-bold mb-2" style={{ color: '#4A3B5C' }}>
      Smart Food Recommendations
    </h2>
    <p className="text-lg" style={{ color: '#4A4A4A' }}>
      Discover personalized food suggestions tailored just for you
    </p>
  </div>
); 