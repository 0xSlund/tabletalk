import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  UtensilsCrossed, 
  Clock, 
  Users, 
  Check, 
  AlertTriangle,
  Sparkles,
  Coffee,
  Utensils,
  Cake,
  Apple,
  Soup,
  Settings,
  RefreshCw,
  Star,
  X,
  Bot
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { supabase, fetchFilteredRecipes } from '../lib/supabase';
import { cn, pageTransitionVariants } from '../lib/utils';
import { MealType, FilteredRecipe } from '../lib/database.functions';
import BackButton from './BackButton';

type SuggestionWithVote = FilteredRecipe & {
  userVote?: 'yes' | 'no' | null;
  votedAt?: Date;
};

interface FilterOption {
  value: MealType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const filterOptions: FilterOption[] = [
  {
    value: 'all',
    label: 'All Meals',
    description: 'Show suggestions from all meal types',
    icon: <UtensilsCrossed className="w-6 h-6" />
  },
  {
    value: 'breakfast',
    label: 'Breakfast',
    description: 'Morning meals and brunch options',
    icon: <Coffee className="w-6 h-6" />
  },
  {
    value: 'main_course',
    label: 'Main Course',
    description: 'Hearty main dishes for lunch or dinner',
    icon: <Utensils className="w-6 h-6" />
  },
  {
    value: 'dessert',
    label: 'Dessert',
    description: 'Sweet treats and desserts',
    icon: <Cake className="w-6 h-6" />
  },
  {
    value: 'appetizers_snacks',
    label: 'Appetizers & Snacks',
    description: 'Small bites and starters',
    icon: <Apple className="w-6 h-6" />
  },
  {
    value: 'soups_salads',
    label: 'Soups & Salads',
    description: 'Light and refreshing options',
    icon: <Soup className="w-6 h-6" />
  }
];

// Simple Loading Component with Progress Bar - Game Style
const SimpleLoader: React.FC<{ progress: number }> = ({ progress }) => {
  // Define the processing steps with their progress ranges
  const steps = [
    { range: [0, 30], text: 'Analyzing your taste preferences...', icon: Sparkles },
    { range: [30, 60], text: 'Searching through recipe database...', icon: UtensilsCrossed },
    { range: [60, 75], text: 'Filtering recipes for your dietary needs...', icon: Clock },
    { range: [75, 90], text: 'Fetching personalized recipes...', icon: Users },
    { range: [90, 100], text: 'Preparing suggestions for you...', icon: Sparkles }
  ];

  // Get the current active step based on progress
  const getCurrentStep = () => {
    return steps.find(step => progress >= step.range[0] && progress < step.range[1]) || 
           (progress >= 100 ? steps[steps.length - 1] : steps[0]);
  };

  const currentStep = getCurrentStep();

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 max-w-md mx-auto">
      <motion.div
        className="w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <UtensilsCrossed className="w-8 h-8 text-white" />
      </motion.div>
      
      <div className="w-full space-y-6">
        <p className="text-lg font-medium text-gray-700 text-center">
          Finding delicious options...
        </p>
        
        {/* Progress Bar Container */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Background shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          
          {/* Progress Bar */}
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              duration: 0.5, 
              ease: "easeOut",
              type: "spring",
              stiffness: 100
            }}
          >
            {/* Shimmer effect on progress bar */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s ease-in-out infinite'
              }}
            />
            
            {/* Completion glow effect */}
            {progress === 100 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-orange-500 rounded-full"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ 
                  opacity: [1, 0.7, 1],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: 2,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.div>
        </div>
        
        {/* Progress Text */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Progress</span>
          <motion.span
            className="font-medium"
            animate={{ 
              color: progress === 100 ? "#059669" : "#6B7280"
            }}
            transition={{ duration: 0.3 }}
          >
            {progress}%
          </motion.span>
        </div>

        {/* Game-style Processing Step Display */}
        <div className="text-center min-h-[80px] flex items-center justify-center">
          <motion.div
            key={currentStep.text} // This ensures re-mount when step changes
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ 
              duration: 0.5,
              ease: "easeOut"
            }}
            className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-md border border-gray-100"
          >
            {/* Animated Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-8 h-8 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center"
            >
              <currentStep.icon className="w-4 h-4 text-white" />
            </motion.div>

            {/* Processing Text with Typing Effect */}
            <motion.div className="text-left">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-medium text-gray-700"
              >
                {currentStep.text}
              </motion.p>
              
              {/* Animated dots */}
              <motion.div className="flex space-x-1 mt-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-primary rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Completion Message */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 text-green-600">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Check className="w-5 h-5" />
              </motion.div>
              <span className="font-medium">Recipes loaded successfully!</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Suggestion Card Component
interface SuggestionCardProps {
  suggestion: SuggestionWithVote;
  onVote: (vote: 'yes' | 'no') => void;
  onSave: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  suggestion, 
  onVote, 
  onSave
}) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTap, setLastTap] = useState(0);

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
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected - vote yes
      if (!suggestion.userVote) {
        onVote('yes');
      }
    }
    
    setLastTap(now);
  };

  // Handle drag end
  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const threshold = 100; // Minimum distance to trigger vote
    
    if (Math.abs(info.offset.x) > threshold && !suggestion.userVote) {
      if (info.offset.x > 0) {
        // Dragged right - vote yes
        onVote('yes');
      } else {
        // Dragged left - vote no
        onVote('no');
      }
    }
    
    setDragX(0);
  };

  // Get background color based on drag direction
  const getBackgroundColor = () => {
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
      drag={!suggestion.userVote ? "x" : false}
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
      initial={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto cursor-pointer select-none relative",
        getBackgroundColor(),
        !suggestion.userVote && "hover:shadow-3xl transition-shadow"
      )}
    >
      {/* Drag Indicators */}
      {isDragging && !suggestion.userVote && (
        <>
          {/* Left side - No indicator */}
          <motion.div
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: dragX < -50 ? 1 : 0,
              scale: dragX < -50 ? 1 : 0.5
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-red-500 text-white p-3 rounded-full shadow-lg">
              <ThumbsDown className="w-6 h-6" />
            </div>
          </motion.div>
          
          {/* Right side - Yes indicator */}
          <motion.div
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: dragX > 50 ? 1 : 0,
              scale: dragX > 50 ? 1 : 0.5
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-green-500 text-white p-3 rounded-full shadow-lg">
              <ThumbsUp className="w-6 h-6" />
            </div>
          </motion.div>
        </>
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
          <span className="bg-green-500/90 text-white text-xs px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
            Homemade
          </span>
          {suggestion.cuisine_name && (
            <span className="bg-orange-500/90 text-white text-xs px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
              {suggestion.cuisine_name}
            </span>
          )}
        </div>

        {/* Vote status overlay */}
        {suggestion.userVote && (
          <div className="absolute top-4 right-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shadow-lg",
                suggestion.userVote === 'yes' 
                  ? "bg-green-500 text-white" 
                  : "bg-red-500 text-white"
              )}
            >
              {suggestion.userVote === 'yes' ? (
                <ThumbsUp className="w-6 h-6" />
              ) : (
                <ThumbsDown className="w-6 h-6" />
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Title and Description */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {suggestion.recipe_name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {suggestion.recipe_description || 'Delicious recipe waiting for you to try!'}
          </p>
        </div>

        {/* Recipe Details */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
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
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
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
            <span key={mood} className={`${getMoodTagColors(mood)} text-xs px-2 py-1 rounded-full border`}>
              {mood.replace('_', ' ')}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Yes/No Voting Buttons */}
          {!suggestion.userVote && (
            <div className="flex gap-3">
              <button
                onClick={() => onVote('no')}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-2 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ThumbsDown className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Not for me</span>
              </button>
              
              <button
                onClick={() => onVote('yes')}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-2 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ThumbsUp className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Yes, I'd try this!</span>
              </button>
            </div>
          )}

          {/* Favorite Button */}
          <div className="flex justify-center">
            <button 
              onClick={onSave}
              className={cn(
                "w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg",
                suggestion.is_saved
                  ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300"
              )}
            >
              {suggestion.is_saved ? (
                <>
                  <Heart className="w-5 h-5 fill-current" />
                  <span>Favorited</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  <span>Add to Favorites</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function QuickDecisionScreen() {
  const { auth: { user } } = useAppStore();
  
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<SuggestionWithVote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<MealType>('all');
  
  // Prevent multiple requests and add abort controller
  const requestInProgress = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  // Enhanced component initialization and cleanup for navigation reliability
  useEffect(() => {
    // Reduced console logging for better performance
    // console.log('🎯 QuickDecisionScreen (simple) component mounted - initializing...');
    
    // Reset all state on mount
    setIsStarted(false);
    setIsLoading(false);
    setLoadingProgress(0);
    setSuggestions([]);
    setCurrentIndex(0);
    setError(null);
    setShowFilters(false);
    requestInProgress.current = false;
    
    // Cancel any existing requests
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    
    // Enhanced visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reduced console logging for better performance
        // console.log('👁️ Page became visible - performing comprehensive state check...');
        
        // More comprehensive stuck state detection
        const isStuckInLoading = requestInProgress.current || isLoading;
        const hasStuckProgress = loadingProgress > 0 && loadingProgress < 100 && !isLoading;
        
        if (isStuckInLoading || hasStuckProgress) {
          // Reduced console logging for better performance
          // console.log('🚨 Found stuck state after page visibility change - performing full reset');
          
          // Force complete reset
          if (abortController.current) {
            abortController.current.abort();
            abortController.current = null;
          }
          
          requestInProgress.current = false;
          setIsLoading(false);
          setLoadingProgress(0);
          setError(null);
          
          // console.log('✅ Comprehensive state reset complete');
        }
      } else {
        // Reduced console logging for better performance
        // console.log('👁️ Page became hidden - preparing for potential cleanup...');
        
        if (requestInProgress.current) {
          // console.log('⚠️ Page hidden during loading - request will be cleaned up on return');
        }
      }
    };

    // Handle page navigation cleanup
    const handleBeforeUnload = () => {
      // console.log('🚪 Page is about to unload - cleaning up requests...');
      
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
      
      requestInProgress.current = false;
    };

    // Handle focus events for additional safety
    const handleFocus = () => {
      // console.log('🎯 Window focused - checking for orphaned states...');
      
      setTimeout(() => {
        if (requestInProgress.current && !isLoading) {
          // console.log('🚨 Found orphaned requestInProgress flag - clearing');
          requestInProgress.current = false;
        }
        
        if (loadingProgress > 0 && !isLoading) {
          // console.log('🚨 Found orphaned loading progress - clearing');
          setLoadingProgress(0);
        }
      }, 100);
    };
    
    // Add all event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      // Remove all event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
      
      // Cancel any ongoing requests
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
      
      requestInProgress.current = false;
      setIsLoading(false);
      setLoadingProgress(0);
      
      // Clear global window state to prevent interference with other screens
      if (window && window.__tabletalk_state) {
        delete window.__tabletalk_state;
      }
    };
  }, []);

  // Load suggestions function - with real progress tracking
  const loadSuggestions = async () => {
    // Reduced console logging for better performance
    // console.log('🚀 loadSuggestions called (simple component)');
    
    // Force clear any stuck state before starting
    if (requestInProgress.current) {
      // Cancel any ongoing requests
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
      
      requestInProgress.current = false;
    }
    
    if (isLoading) {
      setIsLoading(false);
      setLoadingProgress(0);
    }
    
    // Double-check after forced reset
    if (requestInProgress.current) {
      return;
    }
    
    // console.log('✅ State validated, proceeding with new request...');
    
    // Create new abort controller for this request
    abortController.current = new AbortController();
    
    requestInProgress.current = true;
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      // Cancel the request
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
      
      setError('Loading timed out. Please try again.');
      setIsLoading(false);
      setLoadingProgress(0);
      requestInProgress.current = false;
    }, 10000); // Reduced to 10 second timeout
    
    try {
      // console.log('Loading suggestions for filter:', selectedFilter);
      
      // Stage 1: Start progress immediately
      setLoadingProgress(25);
      
      const mealType = selectedFilter === 'all' ? null : selectedFilter;
      
      // Stage 2: Preparing API call
      setLoadingProgress(50);
      
      // Stage 3: Making API call
      setLoadingProgress(75);
      
      // Check if request was aborted before making API call
      if (abortController.current?.signal.aborted) {
        // console.log('🚫 Request was aborted before API call');
        return;
      }
      
      const recipes = await fetchFilteredRecipes(mealType, user?.id || null, 5, abortController.current?.signal);
      
      // Check if request was aborted after API call
      if (abortController.current?.signal.aborted) {
        // console.log('🚫 Request was aborted after API call');
        return;
      }
      
      // API call completed - final stage
      setLoadingProgress(100);
      
      // console.log('Fetched recipes:', recipes.length, recipes);
      
      if (recipes.length === 0) {
        // console.log('No recipes found, showing error');
        setError('No recipes found. Try adjusting your filters.');
        setSuggestions([]);
        setIsLoading(false);
        setLoadingProgress(0);
        requestInProgress.current = false;
        return;
      }
      
      const suggestionsWithVotes: SuggestionWithVote[] = recipes.map(recipe => ({
        ...recipe,
        userVote: null,
        votedAt: undefined
      }));
      
      // console.log('Setting suggestions:', suggestionsWithVotes);
      setSuggestions(suggestionsWithVotes);
      setCurrentIndex(0);
      
      // Complete loading with final progress
      setLoadingProgress(100);
      // console.log('📊 Progress: 100% - Complete!');
      
      // Brief delay to show completion, then finish
      setTimeout(() => {
        // console.log('Finishing loading, showing suggestions');
        setIsLoading(false);
        setLoadingProgress(0);
      }, 300);
      
    } catch (err) {
      // console.error('Error loading suggestions:', err);
      
      // Clear timeout on error
      clearTimeout(timeoutId);
      
      // Check if it was an abort error (user navigated away)
      if (err instanceof Error && (err.name === 'AbortError' || err.message === 'Request was aborted')) {
        // console.log('🚫 Request was aborted by user navigation');
        return; // Don't show error for aborted requests
      }
      
      setError('Failed to load suggestions. Please try again.');
      setSuggestions([]);
      setIsLoading(false);
      setLoadingProgress(0);
    } finally {
      // Clear timeout since we're done
      clearTimeout(timeoutId);
      
      // Clean up abort controller
      if (abortController.current) {
        abortController.current = null;
      }
      
      requestInProgress.current = false;
    }
  };

  // Event handlers - simplified
  const handleStart = () => {
    setIsStarted(true);
    loadSuggestions();
  };

  const handleVote = (vote: 'yes' | 'no') => {
    if (currentIndex >= suggestions.length) return;
    
    const newSuggestions = [...suggestions];
    newSuggestions[currentIndex] = {
      ...newSuggestions[currentIndex],
      userVote: vote,
      votedAt: new Date()
    };
    setSuggestions(newSuggestions);
    
    // Move to next suggestion
    setTimeout(() => {
      if (currentIndex < suggestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Load more when we reach the end
        // console.log('🔄 End of suggestions, loading more...');
        
        // Force clear any stuck state before loading more
        if (requestInProgress.current) {
          // console.log('🚨 Clearing stuck requestInProgress flag');
          
          // Cancel any ongoing requests
          if (abortController.current) {
            abortController.current.abort();
            abortController.current = null;
          }
          
          requestInProgress.current = false;
        }
        
        if (isLoading) {
          // console.log('🚨 Resetting stuck loading state');
          setIsLoading(false);
          setLoadingProgress(0);
        }
        
        loadSuggestions();
      }
    }, 1000);
  };

  const handleSave = async () => {
    if (!user || currentIndex >= suggestions.length) return;
    
    const suggestion = suggestions[currentIndex];
    
    try {
      if (suggestion.is_saved) {
        // Remove from saved_suggestions
        const { error } = await supabase
          .from('saved_suggestions')
          .delete()
          .eq('profile_id', user.id)
          .eq('recipe_id', suggestion.recipe_id);
        
        if (error) throw error;
      } else {
        // Add to saved_suggestions
        const { error } = await supabase
          .from('saved_suggestions')
          .insert({
            profile_id: user.id,
            recipe_id: suggestion.recipe_id
          });
        
        if (error) throw error;
      }
      
      const newSuggestions = [...suggestions];
      newSuggestions[currentIndex] = {
        ...newSuggestions[currentIndex],
        is_saved: !suggestion.is_saved
      };
      setSuggestions(newSuggestions);
      
    } catch (err) {
      // console.error('Error saving suggestion:', err);
    }
  };

  const handleFilterChange = (filter: MealType) => {
    setSelectedFilter(filter);
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    if (isStarted) {
      loadSuggestions();
    }
  };

  const currentSuggestion = suggestions[currentIndex];

  return (
      <motion.div 
        className="min-h-screen"
        style={{ backgroundColor: '#FEFCF8' }}
        initial="initial"
      animate="enter"
        exit="exit"
          variants={pageTransitionVariants}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <BackButton />
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">TableTalk</h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                showFilters 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Filters</span>
            </button>
          </div>
        </div>
      </header>

        {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="bg-indigo-100 text-indigo-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm ring-1 ring-indigo-200/50">
              <Bot className="w-8 h-8" />
          </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Smart Food Recommendations
          </h2>
            <p className="text-gray-600 text-lg">
              Discover personalized food suggestions tailored just for you
            </p>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {!isStarted ? (
              // Start Screen
              <div className="text-center space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Ready to discover amazing food?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We'll show you personalized suggestions and you can vote yes or no on each one
                  </p>
                </div>
                
                <button
                  onClick={handleStart}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-shadow duration-200 shadow-lg mx-auto hover:shadow-cyan-300/40"
                >
                  Start Smart Suggestions
                </button>
                </div>
            ) : isLoading ? (
              // Loading Screen with Progress Bar
              <SimpleLoader progress={loadingProgress} />
            ) : error ? (
              // Error Screen
              <div className="text-center space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={loadSuggestions}
                    className="bg-red-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                      Try Again
                  </button>
                  </div>
                </div>
            ) : suggestions.length > 0 && currentSuggestion ? (
              // Suggestion Screen - Only show if we have suggestions AND a valid current suggestion
              <div className="space-y-6">
                {/* Suggestion Card */}
                <SuggestionCard
                  suggestion={currentSuggestion}
                  onVote={handleVote}
                  onSave={handleSave}
                />

                {/* Action Bar */}
                <div className="flex justify-center gap-4 pt-4">
                    <button 
                    onClick={loadSuggestions}
                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Get More Suggestions
                    </button>
                  </div>
                    </div>
            ) : suggestions.length > 0 && !currentSuggestion ? (
              // Fallback if we have suggestions but no valid current suggestion
              <div className="text-center space-y-4">
                <p className="text-gray-600">No more suggestions available</p>
                        <button 
                  onClick={loadSuggestions}
                  className="bg-primary text-white py-2 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Load More Suggestions
                        </button>
              </div>
            ) : (
              // Empty state - no suggestions loaded yet
              <div className="text-center space-y-4">
                <p className="text-gray-600">No suggestions loaded yet</p>
                        <button 
                  onClick={loadSuggestions}
                  className="bg-primary text-white py-2 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                  Load Suggestions
                        </button>
                      </div>
            )}
                  </div>
                  </div>
      </main>

      {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <>
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
                onClick={() => setShowFilters(false)}
              />
              
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-30 overflow-y-auto"
              >
              <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Filter Options</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Meal Type</h3>
                  <div className="grid grid-cols-1 gap-2">
                              {filterOptions.map((option) => (
                      <button
                                  key={option.value}
                        onClick={() => handleFilterChange(option.value)}
                                  className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                                    selectedFilter === option.value
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                  )}
                                >
                        <div className="p-2 rounded-lg bg-gray-100">
                                    {option.icon}
                                  </div>
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm opacity-70">{option.description}</p>
                                  </div>
                                    {selectedFilter === option.value && (
                          <Check className="w-5 h-5 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleApplyFilters}
                    className="w-full bg-gradient-to-r from-primary to-orange-500 text-white py-3 rounded-xl font-medium hover:from-primary/90 hover:to-orange-500/90 transition-all"
                  >
                    Apply Filters
                  </button>
                    </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
    </motion.div>
  );
}