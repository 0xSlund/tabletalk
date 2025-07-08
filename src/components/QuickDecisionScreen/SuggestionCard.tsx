import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Clock, Users, ThumbsUp, ThumbsDown, Heart
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SuggestionCardProps } from './types';

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  suggestion, 
  onVote, 
  onSave
}) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  
  const getDifficultyStars = (difficulty: number | null) => {
    if (!difficulty) return null;
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={cn(
          "w-4 h-4",
          i < difficulty ? "text-yellow-400 fill-current" : "text-gray-300"
        )} 
      />
    ));
  };

  // Handle double-click/tap
  const handleTap = () => {
    if (suggestion.userVote || isVoting) return;
    
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected - vote yes
      handleVote('yes');
    }
    
    setLastTap(now);
  };

  // Handle vote with animation
  const handleVote = (vote: 'yes' | 'no') => {
    if (suggestion.userVote || isVoting) return;
    
    setIsVoting(true);
    onVote(vote);
    
    // Reset voting state after animation
    setTimeout(() => {
      setIsVoting(false);
    }, 1500);
  };

  // Handle drag end
  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const threshold = 100; // Minimum distance to trigger vote
    
    if (Math.abs(info.offset.x) > threshold && !suggestion.userVote && !isVoting) {
      if (info.offset.x > 0) {
        // Dragged right - vote yes
        handleVote('yes');
      } else {
        // Dragged left - vote no
        handleVote('no');
      }
    }
    
    setDragX(0);
  };

  // Get background color based on drag direction
  const getBackgroundColor = () => {
    if (suggestion.userVote) {
      return suggestion.userVote === 'yes' 
        ? 'bg-gradient-to-br from-green-50 to-green-100' 
        : 'bg-gradient-to-br from-red-50 to-red-100';
    }
    
    if (!isDragging) return 'bg-white';
    
    if (dragX > 50) {
      return 'bg-gradient-to-r from-green-50 to-green-100';
    } else if (dragX < -50) {
      return 'bg-gradient-to-r from-red-50 to-red-100';
    }
    
    return 'bg-white';
  };

  return (
    <motion.div
      key={`suggestion-${suggestion.recipe_id}`}
      drag={!suggestion.userVote && !isVoting ? "x" : false}
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDrag={(event, info) => setDragX(info.offset.x)}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      whileDrag={{ scale: 1.05, rotate: dragX * 0.1 }}
      animate={{ 
        x: 0, 
        rotate: 0,
        scale: 1
      }}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        ease: "easeOut"
      }}
      className={cn(
        "rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto cursor-pointer select-none relative",
        getBackgroundColor(),
        !suggestion.userVote && !isVoting && "hover:shadow-3xl transition-shadow",
        suggestion.userVote && "ring-4",
        suggestion.userVote === 'yes' && "ring-green-200",
        suggestion.userVote === 'no' && "ring-red-200"
      )}
    >
      {/* Drag Indicators */}
      <AnimatePresence>
        {isDragging && !suggestion.userVote && !isVoting && (
          <>
            {/* Left side - No indicator */}
            <motion.div
              key="no-indicator"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: dragX < -50 ? 1 : 0,
                scale: dragX < -50 ? 1 : 0.5
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-red-500 text-white p-3 rounded-full shadow-lg">
                <ThumbsDown className="w-6 h-6" />
              </div>
            </motion.div>
            
            {/* Right side - Yes indicator */}
            <motion.div
              key="yes-indicator"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: dragX > 50 ? 1 : 0,
                scale: dragX > 50 ? 1 : 0.5
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-green-500 text-white p-3 rounded-full shadow-lg">
                <ThumbsUp className="w-6 h-6" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Double-tap instruction overlay */}
      {!suggestion.userVote && !isDragging && !isVoting && (
        <motion.div 
          className="absolute top-4 right-4 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
            Double-tap or swipe
          </div>
        </motion.div>
      )}

      {/* Image Section */}
      <div className="relative aspect-[4/3]">
        <img
          src={suggestion.recipe_image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'}
          alt={suggestion.recipe_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        
        {/* Overlay with tags */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <motion.span 
            className="bg-green-500/90 text-white text-xs px-3 py-1 rounded-full font-semibold backdrop-blur-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Homemade
          </motion.span>
          {suggestion.cuisine_name && (
            <motion.span 
              className="bg-orange-500/90 text-white text-xs px-3 py-1 rounded-full font-semibold backdrop-blur-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {suggestion.cuisine_name}
            </motion.span>
          )}
        </div>

        {/* Vote status overlay */}
        <AnimatePresence>
          {suggestion.userVote && (
            <motion.div 
              className="absolute top-4 right-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15 
              }}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shadow-lg",
                suggestion.userVote === 'yes' 
                  ? "bg-green-500 text-white" 
                  : "bg-red-500 text-white"
              )}>
                {suggestion.userVote === 'yes' ? (
                  <ThumbsUp className="w-6 h-6" />
                ) : (
                  <ThumbsDown className="w-6 h-6" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Title and Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {suggestion.recipe_name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {suggestion.recipe_description || 'Delicious recipe waiting for you to try!'}
          </p>
        </motion.div>

        {/* Recipe Details */}
        <motion.div 
          className="flex items-center gap-4 text-sm text-gray-500"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {suggestion.recipe_prep_time && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{suggestion.recipe_prep_time}</span>
            </div>
          )}
          {suggestion.recipe_servings && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{suggestion.recipe_servings} servings</span>
            </div>
          )}
          {suggestion.recipe_difficulty && (
            <div className="flex items-center gap-1">
              {getDifficultyStars(suggestion.recipe_difficulty)}
            </div>
          )}
        </motion.div>

        {/* Tags */}
        <motion.div 
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Meal type first */}
          {suggestion.recipe_meal_type && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
              {suggestion.recipe_meal_type.replace('_', ' ')}
            </span>
          )}
          {/* Dietary restrictions */}
          {suggestion.recipe_dietary_restrictions?.map(restriction => (
            <span key={restriction} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
              {restriction.replace('_', '-')}
            </span>
          ))}
          {/* Mood tags */}
          {suggestion.recipe_mood_tags?.slice(0, 2).map(mood => (
            <span key={mood} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
              {mood.replace('_', ' ')}
            </span>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Yes/No Voting Buttons */}
          {!suggestion.userVote && !isVoting && (
            <div className="flex gap-3">
              <motion.button
                onClick={() => handleVote('no')}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-2 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ThumbsDown className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Not for me</span>
              </motion.button>
              
              <motion.button
                onClick={() => handleVote('yes')}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-2 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ThumbsUp className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Yes, I'd try this!</span>
              </motion.button>
            </div>
          )}

          {/* Voted state message */}
          {suggestion.userVote && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "text-center py-3 px-4 rounded-xl font-semibold",
                suggestion.userVote === 'yes' 
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              )}
            >
              {suggestion.userVote === 'yes' 
                ? "✨ You liked this suggestion!" 
                : "👋 Not your style, that's okay!"}
            </motion.div>
          )}

          {/* Favorite Button */}
          <div className="flex justify-center">
            <motion.button 
              onClick={onSave}
              className={cn(
                "w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg",
                suggestion.is_saved
                  ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ 
                  scale: suggestion.is_saved ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Heart className={cn("w-5 h-5", suggestion.is_saved && "fill-current")} />
              </motion.div>
              <span>{suggestion.is_saved ? "Favorited" : "Add to Favorites"}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}; 