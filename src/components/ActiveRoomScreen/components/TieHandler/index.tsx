import React from 'react';
import { Scale, Shuffle } from 'lucide-react';
import { useAppStore } from '../../../../lib/store';
import { motion } from 'framer-motion';

interface FoodSuggestion {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const TieHandler: React.FC<{
  tiedSuggestions: FoodSuggestion[];
  onResolveTie: (winnerId: string) => void;
}> = ({ tiedSuggestions, onResolveTie }) => {
  const handleRandomPick = () => {
    // Pick a random suggestion from the tied ones
    const randomIndex = Math.floor(Math.random() * tiedSuggestions.length);
    onResolveTie(tiedSuggestions[randomIndex].id);
  };
  
  return (
    <motion.div 
      className="w-full bg-yellow-50 p-4 rounded-lg border border-yellow-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center mb-4">
        <Scale className="mr-2 text-yellow-600" size={20} />
        <h2 className="text-xl font-bold text-yellow-800">We Have a Tie!</h2>
      </div>
      
      <p className="mb-4 text-yellow-700">
        There's a tie between the following options. Please select one or use random pick.
      </p>
      
      <div className="grid grid-cols-1 gap-3 mb-4">
        {tiedSuggestions.map((suggestion) => (
          <div 
            key={suggestion.id} 
            className="bg-white p-3 rounded-lg border border-yellow-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{suggestion.emoji}</span>
                <div>
                  <h3 className="font-medium text-gray-800">{suggestion.name}</h3>
                  {suggestion.description && (
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => onResolveTie(suggestion.id)}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleRandomPick}
          className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          <Shuffle size={16} className="mr-2" />
          Random Pick
        </button>
      </div>
    </motion.div>
  );
};

// Simple component to display when no tie exists
export const NoTie: React.FC = () => {
  return (
    <div className="text-center py-8 text-gray-500">
      <p>No tie to resolve.</p>
      <p>The winning option is clear!</p>
    </div>
  );
}; 