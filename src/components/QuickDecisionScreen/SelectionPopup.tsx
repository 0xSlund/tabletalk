import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, Users, ChefHat, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SuggestionWithVote } from './types';

interface SelectionPopupProps {
  isOpen: boolean;
  selectedSuggestions: SuggestionWithVote[];
  onFinalSelection: (suggestion: SuggestionWithVote) => void;
  onDiscard: () => void;
}

export const SelectionPopup: React.FC<SelectionPopupProps> = ({
  isOpen,
  selectedSuggestions,
  onFinalSelection,
  onDiscard
}) => {
  const getDifficultyStars = (difficulty: number | null) => {
    if (!difficulty) return null;
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={cn(
          "w-3 h-3",
          i < difficulty ? "text-yellow-400 fill-current" : "text-gray-300"
        )} 
      />
    ));
  };

  const getMoodTagColors = (mood: string) => {
    const lowerMood = mood.toLowerCase();
    switch (lowerMood) {
      case 'comfort_food':
      case 'comfort food':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'healthy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'indulgent':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'light':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'hearty':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'exotic':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'familiar':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const backgroundPattern = "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDiscard}
          />

          {/* Popup Content */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-20"
                style={{ backgroundImage: backgroundPattern }}
              />
              
              <button
                onClick={onDiscard}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10">
                <motion.div
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Great Choices!</h2>
                    <p className="text-white/90 text-sm">You've selected 3 amazing recipes</p>
                  </div>
                </motion.div>
                
                <motion.p
                  className="text-white/80 text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Which one would you like to try first? Or discard all and keep exploring?
                </motion.p>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.recipe_id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-purple-300 transition-all cursor-pointer group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => onFinalSelection(suggestion)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={suggestion.recipe_image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                        alt={suggestion.recipe_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      
                      {/* Winner Badge */}
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        #{index + 1}
                      </div>
                      
                      {/* Cuisine Tag */}
                      {suggestion.cuisine_name && (
                        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {suggestion.cuisine_name}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg mb-1 truncate" style={{ color: '#4A3B5C' }}>
                          {suggestion.recipe_name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {suggestion.recipe_description || 'A delicious recipe perfect for any occasion!'}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {suggestion.recipe_prep_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{suggestion.recipe_prep_time}</span>
                          </div>
                        )}
                        {suggestion.recipe_servings && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{suggestion.recipe_servings}</span>
                          </div>
                        )}
                        {suggestion.recipe_difficulty && (
                          <div className="flex items-center gap-1">
                            {getDifficultyStars(suggestion.recipe_difficulty)}
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {suggestion.recipe_meal_type && (
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                            {suggestion.recipe_meal_type.replace('_', ' ')}
                          </span>
                        )}
                        {suggestion.recipe_mood_tags?.slice(0, 2).map((mood, moodIndex) => (
                          <span key={moodIndex} className={`${getMoodTagColors(mood)} text-xs px-2 py-1 rounded-full border`}>
                            {mood.replace('_', ' ')}
                          </span>
                        ))}
                      </div>

                      {/* Select Button */}
                      <div className="pt-2">
                        <div className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-xl font-semibold text-sm text-center group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                          Choose This Recipe
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ChefHat className="w-4 h-4" />
                  <span>Click on any recipe to make it your final choice</span>
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    onClick={onDiscard}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Discard & Keep Exploring
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 