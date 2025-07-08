import React from 'react';
import { RefreshCw } from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';
import { SuggestionScreenProps } from './types';

export const SuggestionScreen: React.FC<SuggestionScreenProps> = ({
  suggestion,
  onVote,
  onSave,
  onLoadMore
}) => (
  <div className="space-y-6">
    {/* Suggestion Card */}
    <SuggestionCard
      suggestion={suggestion}
      onVote={onVote}
      onSave={onSave}
    />

    {/* Action Bar */}
    <div className="flex justify-center gap-4 pt-4">
      <button
        onClick={onLoadMore}
        className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Get More Suggestions
      </button>
    </div>
  </div>
); 