import React from 'react';
import { Bot } from 'lucide-react';

export const ContentHeader: React.FC = () => (
  <div className="text-center mb-8">
    <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
      <Bot className="w-8 h-8 text-primary" />
    </div>
    
    <h2 className="text-3xl font-bold text-gray-900 mb-2">
      Smart Food Recommendations
    </h2>
    <p className="text-gray-600 text-lg">
      Discover personalized food suggestions tailored just for you
    </p>
  </div>
); 