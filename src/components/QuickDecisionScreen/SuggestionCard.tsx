import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Enhanced swipe detection thresholds
  const SWIPE_THRESHOLD = 80; // Minimum distance to trigger vote
  const VELOCITY_THRESHOLD = 300; // Minimum velocity for quick swipes

  // Get mood tag colors based on their descriptors
  const getMoodTagColors = (mood: string) => {
    switch (mood.toLowerCase()) {
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
  
  // Check if device supports touch
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };
  
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

  // Enhanced mouse/touch event handlers for better swipe detection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (suggestion.userVote || isVoting) return;
    
    setIsMouseDown(true);
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || suggestion.userVote || isVoting) return;
    
    const currentX = e.clientX;
    const deltaX = currentX - startX;
    setDragX(deltaX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown || suggestion.userVote || isVoting) return;
    
    setIsMouseDown(false);
    setIsDragging(false);
    
    const finalX = e.clientX;
    const deltaX = finalX - startX;
    
    // Check if swipe threshold is met
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        handleVote('yes'); // Swiped right - like
      } else {
        handleVote('no'); // Swiped left - dislike
      }
    }
    
    // Reset drag position
    setDragX(0);
  };

  // Handle double-click/tap with left/right side detection and middle flip
  const handleTap = (event: any) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected - determine left/right/middle
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const cardWidth = rect.width;
      
      // Define zones: left 30%, middle 40%, right 30%
      const leftZone = clickX < cardWidth * 0.3;
      const rightZone = clickX > cardWidth * 0.7;
      const middleZone = !leftZone && !rightZone;
      
      if (middleZone) {
        // Middle zone = flip card for more details
        setIsFlipped(!isFlipped);
      } else if (!suggestion.userVote && !isVoting) {
        // Side zones = voting (only if not already voted)
        if (leftZone) {
          handleVote('no'); // Left side = disapprove
        } else if (rightZone) {
          handleVote('yes'); // Right side = approve
        }
      }
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

  // Enhanced drag end handler for Framer Motion
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    if (suggestion.userVote || isVoting) {
      setDragX(0);
      return;
    }
    
    const { offset, velocity } = info;
    const distance = Math.abs(offset.x);
    const speed = Math.abs(velocity.x);
    
    // Trigger vote if either distance or velocity threshold is met
    if (distance > SWIPE_THRESHOLD || speed > VELOCITY_THRESHOLD) {
      if (offset.x > 0) {
        handleVote('yes'); // Dragged right - like
      } else {
        handleVote('no'); // Dragged left - dislike
      }
    }
    
    setDragX(0);
  };

  // Get background color based on drag direction with enhanced visual feedback
  const getBackgroundColor = () => {
    if (suggestion.userVote) {
      return suggestion.userVote === 'yes' 
        ? 'bg-gradient-to-br from-green-50 to-green-100' 
        : 'bg-gradient-to-br from-red-50 to-red-100';
    }
    
    if (!isDragging && dragX === 0) return 'bg-white';
    
    const intensity = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);
    
    if (dragX > 20) {
      return `bg-gradient-to-r from-green-${Math.floor(intensity * 100) + 50} to-green-${Math.floor(intensity * 100) + 100}`;
    } else if (dragX < -20) {
      return `bg-gradient-to-r from-red-${Math.floor(intensity * 100) + 50} to-red-${Math.floor(intensity * 100) + 100}`;
    }
    
    return 'bg-white';
  };

  // Calculate rotation based on drag for more natural feel
  const getRotation = () => {
    if (suggestion.userVote || !isDragging) return 0;
    return dragX * 0.1; // Subtle rotation
  };

  // Calculate opacity for swipe-away effect
  const getOpacity = () => {
    if (suggestion.userVote || !isDragging) return 1;
    const distance = Math.abs(dragX);
    return Math.max(0.3, 1 - (distance / 300));
  };

  return (
    <motion.div
      ref={cardRef}
      key={`suggestion-${suggestion.recipe_id}`}
      drag={!suggestion.userVote && !isVoting ? "x" : false}
      dragConstraints={{ left: -300, right: 300 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDrag={(event, info) => setDragX(info.offset.x)}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isMouseDown) {
          setIsMouseDown(false);
          setIsDragging(false);
          setDragX(0);
        }
      }}
      whileDrag={{ 
        scale: 1.05, 
        rotate: getRotation(),
        opacity: getOpacity(),
        zIndex: 10
      }}
      animate={{ 
        x: dragX, 
        rotate: getRotation(),
        scale: 1,
        opacity: getOpacity()
      }}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        ease: "easeOut",
        x: { type: "spring", stiffness: 300, damping: 30 },
        rotate: { type: "spring", stiffness: 300, damping: 30 }
      }}
      className={cn(
        "rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto cursor-grab select-none relative",
        getBackgroundColor(),
        !suggestion.userVote && !isVoting && "hover:shadow-3xl transition-shadow",
        isDragging && "cursor-grabbing",
        suggestion.userVote && "ring-4",
        suggestion.userVote === 'yes' && "ring-green-200",
        suggestion.userVote === 'no' && "ring-red-200"
      )}
      style={{
        perspective: '1000px'
      }}
    >
      {/* Flip Container */}
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{
          transformStyle: 'preserve-3d'
        }}
        className="relative w-full h-full"
      >
        {/* Front Side */}
        <div
          style={{
            backfaceVisibility: 'hidden'
          }}
          className={cn(
            "w-full h-full",
            isFlipped && "pointer-events-none"
          )}
        >

      {/* Enhanced Drag Indicators */}
      <AnimatePresence>
        {isDragging && !suggestion.userVote && !isVoting && (
          <>
            {/* Left side - Dislike indicator */}
            <motion.div
              key="dislike-indicator"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20"
              initial={{ opacity: 0, scale: 0.5, x: -20 }}
              animate={{ 
                opacity: dragX < -20 ? Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1) : 0,
                scale: dragX < -20 ? 1 + (Math.abs(dragX) / 200) : 0.5,
                x: dragX < -20 ? 0 : -20
              }}
              exit={{ opacity: 0, scale: 0.5, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-red-500 text-white p-3 rounded-full shadow-lg border-2 border-red-600">
                <ThumbsDown className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                Not for me
              </div>
            </motion.div>
            
            {/* Right side - Like indicator */}
            <motion.div
              key="like-indicator"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20"
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ 
                opacity: dragX > 20 ? Math.min(dragX / SWIPE_THRESHOLD, 1) : 0,
                scale: dragX > 20 ? 1 + (dragX / 200) : 0.5,
                x: dragX > 20 ? 0 : 20
              }}
              exit={{ opacity: 0, scale: 0.5, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-green-500 text-white p-3 rounded-full shadow-lg border-2 border-green-600">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                I'd try this!
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Swipe Instructions Overlay */}
      {!suggestion.userVote && !isVoting && !isDragging && (
        <motion.div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {isTouchDevice() ? "Swipe left/right or tap buttons" : "Drag left/right or click buttons"}
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

        {/* Desktop Click Zones - Invisible overlays for interaction */}
        {!suggestion.userVote && !isVoting && !isTouchDevice() && (
          <>
            {/* Left side - Disapprove zone (invisible) */}
            <div 
              className="absolute left-0 top-0 w-[30%] h-full z-10 cursor-pointer"
              onClick={handleTap}
              title="Double-click to disapprove"
            />
            
            {/* Middle zone - Flip card (invisible) */}
            <div 
              className="absolute left-[30%] top-0 w-[40%] h-full z-10 cursor-pointer"
              onClick={handleTap}
              title="Double-click for more details"
            />
            
            {/* Right side - Approve zone (invisible) */}
            <div 
              className="absolute right-0 top-0 w-[30%] h-full z-10 cursor-pointer"
              onClick={handleTap}
              title="Double-click to approve"
            />
          </>
        )}
        
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
          <h3 className="text-xl font-bold mb-2" style={{ color: '#4A3B5C' }}>
            {suggestion.recipe_name}
          </h3>
          <p className="text-sm line-clamp-2" style={{ color: '#4A4A4A' }}>
            {suggestion.recipe_description || 'Delicious recipe waiting for you to try!'}
          </p>
        </motion.div>

        {/* Recipe Details */}
        <motion.div 
          className="flex items-center gap-4 text-sm"
          style={{ color: '#4A4A4A' }}
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
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: 'rgba(184, 169, 209, 0.2)', color: '#7D6B8A' }}>
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
            <span key={mood} className={`${getMoodTagColors(mood)} text-xs px-2 py-1 rounded-full border`}>
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
        </div>
        
        {/* Back Side */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
          className={cn(
            "absolute inset-0 w-full h-full bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl overflow-hidden",
            !isFlipped && "pointer-events-none"
          )}
        >
          {/* Back side header */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: '#4A3B5C' }}>
                Recipe Details
              </h3>
              <motion.button
                onClick={() => setIsFlipped(false)}
                className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-gray-600">✕</span>
              </motion.button>
            </div>
            
            <div className="space-y-4 text-sm">
              {/* Recipe Name */}
              <div>
                <h4 className="font-semibold text-purple-800 mb-1">Recipe Name</h4>
                <p className="text-gray-700">{suggestion.recipe_name}</p>
              </div>
              
              {/* Full Description */}
              <div>
                <h4 className="font-semibold text-purple-800 mb-1">Description</h4>
                <p className="text-gray-700 text-xs leading-relaxed">
                  {suggestion.recipe_description || 'A delicious recipe that combines wonderful flavors and textures. Perfect for any occasion and sure to impress your family and friends!'}
                </p>
              </div>
              
              {/* Detailed Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">Cook Time</h4>
                  <p className="text-gray-700">{suggestion.recipe_prep_time || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">Servings</h4>
                  <p className="text-gray-700">{suggestion.recipe_servings || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">Difficulty</h4>
                  <div className="flex">
                    {getDifficultyStars(suggestion.recipe_difficulty)}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">Cuisine</h4>
                  <p className="text-gray-700">{suggestion.cuisine_name || 'Various'}</p>
                </div>
              </div>
              
              {/* Price Range & Distance */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">Price Range</h4>
                  <p className="text-gray-700">{suggestion.recipe_price_range || 'Moderate'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">Distance</h4>
                  <p className="text-gray-700">{suggestion.recipe_distance || 'N/A'}</p>
                </div>
              </div>
              
              {/* All Dietary Restrictions */}
              {suggestion.recipe_dietary_restrictions && suggestion.recipe_dietary_restrictions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Dietary Info</h4>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.recipe_dietary_restrictions.map(restriction => (
                      <span key={restriction} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        {restriction.replace('_', '-')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* All Mood Tags */}
              {suggestion.recipe_mood_tags && suggestion.recipe_mood_tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Mood & Style</h4>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.recipe_mood_tags.map(mood => (
                      <span key={mood} className={`${getMoodTagColors(mood)} text-xs px-2 py-1 rounded-full border`}>
                        {mood.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Instructions */}
              <div>
                <h4 className="font-semibold text-purple-800 mb-1">Quick Instructions</h4>
                <p className="text-gray-700 text-xs leading-relaxed">
                  1. Prepare all ingredients and equipment<br/>
                  2. Follow cooking method for {suggestion.recipe_meal_type?.replace('_', ' ') || 'this dish'}<br/>
                  3. Cook according to difficulty level and timing<br/>
                  4. Serve and enjoy!
                </p>
              </div>
            </div>
            
            {/* Back to front button */}
            <div className="text-center pt-2">
              <motion.button
                onClick={() => setIsFlipped(false)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Back to Recipe
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 