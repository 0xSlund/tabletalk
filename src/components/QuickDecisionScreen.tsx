import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  UtensilsCrossed, ArrowLeft, Zap, RefreshCw, Loader2, Filter, Check, 
  DollarSign, MapPin, Heart, Share2, Save, X, ChevronLeft, ChevronRight,
  Utensils, Smile, AlertTriangle, BookmarkPlus, BookmarkCheck, Home,
  Coffee, Soup, Cake, Apple, SunSnow, Salad, SidebarClose
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { cn, pageTransitionVariants } from '../lib/utils';
import { fadeVariants, foodCardVariants } from './PageTransition';
import { MealType, FilteredRecipe } from '../lib/database.functions';
import BackButton from './BackButton';

type MoodType = 'all' | 'comfort_food' | 'healthy' | 'indulgent' | 'light' | 'hearty' | 'exotic' | 'familiar';
type DietaryRestrictionType = 'vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'nut_free';

interface SuggestionType extends FilteredRecipe {}

interface FilterOption {
  value: MealType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface MoodOption {
  value: MoodType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface DietaryRestrictionOption {
  value: DietaryRestrictionType;
  label: string;
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
    value: 'lunch',
    label: 'Lunch',
    description: 'Midday meals and light options',
    icon: <Utensils className="w-6 h-6" />
  },
  {
    value: 'dinner',
    label: 'Dinner',
    description: 'Evening meals and main courses',
    icon: <SunSnow className="w-6 h-6" />
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
  },
  {
    value: 'side_dishes',
    label: 'Side Dishes',
    description: 'Complementary dishes',
    icon: <SidebarClose className="w-6 h-6" />
  }
];

const moodOptions: MoodOption[] = [
  {
    value: 'all',
    label: 'Any Mood',
    icon: <Smile className="w-5 h-5" />,
    description: 'No specific mood preference'
  },
  {
    value: 'comfort_food',
    label: 'Comfort Food',
    icon: <Utensils className="w-5 h-5" />,
    description: 'Warm, filling, and satisfying'
  },
  {
    value: 'healthy',
    label: 'Healthy',
    icon: <Smile className="w-5 h-5" />,
    description: 'Nutritious and balanced options'
  },
  {
    value: 'indulgent',
    label: 'Indulgent',
    icon: <Heart className="w-5 h-5" />,
    description: 'Rich, decadent treats'
  },
  {
    value: 'light',
    label: 'Light',
    icon: <Zap className="w-5 h-5" />,
    description: 'Not too heavy or filling'
  },
  {
    value: 'hearty',
    label: 'Hearty',
    icon: <Utensils className="w-5 h-5" />,
    description: 'Substantial and filling'
  },
  {
    value: 'exotic',
    label: 'Exotic',
    icon: <MapPin className="w-5 h-5" />,
    description: 'Unique and adventurous flavors'
  },
  {
    value: 'familiar',
    label: 'Familiar',
    icon: <Home className="w-5 h-5" />,
    description: 'Classic and nostalgic'
  }
];

const dietaryRestrictionOptions: DietaryRestrictionOption[] = [
  {
    value: 'vegetarian',
    label: 'Vegetarian',
    icon: <AlertTriangle className="w-5 h-5" />
  },
  {
    value: 'vegan',
    label: 'Vegan',
    icon: <AlertTriangle className="w-5 h-5" />
  },
  {
    value: 'gluten_free',
    label: 'Gluten-Free',
    icon: <AlertTriangle className="w-5 h-5" />
  },
  {
    value: 'dairy_free',
    label: 'Dairy-Free',
    icon: <AlertTriangle className="w-5 h-5" />
  },
  {
    value: 'nut_free',
    label: 'Nut-Free',
    icon: <AlertTriangle className="w-5 h-5" />
  }
];

export function QuickDecisionScreen() {
  const { setActiveTab, auth: { user } } = useAppStore();
  const [suggestions, setSuggestions] = useState<SuggestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [savingToFavorites, setSavingToFavorites] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [showNarrowedDown, setShowNarrowedDown] = useState(false);
  const [shareURL, setShareURL] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardControls = useAnimation();
  
  // Filters
  const [selectedFilter, setSelectedFilter] = useState<MealType>('all');
  const [selectedMood, setSelectedMood] = useState<MoodType>('all');
  const [priceRange, setPriceRange] = useState<number>(4); // 1-4, representing $ to $$$$
  const [maxDistance, setMaxDistance] = useState<number>(20); // in miles or km
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestrictionType[]>([]);
  
  useEffect(() => {
    // Reset suggestions when filters change
    setSuggestions([]);
    setCurrentIndex(0);
  }, [selectedFilter, selectedMood, priceRange, maxDistance, dietaryRestrictions]);
  
  const getCurrentSuggestion = () => {
    return suggestions.length > 0 ? suggestions[currentIndex] : null;
  };
  
  const generateSuggestion = async (count: number = 1) => {
    setIsGenerating(true);
    setSuggestions([]);
    setError(null);
    setCurrentIndex(0);
    setShowNarrowedDown(count > 1);

    try {
      // Call the database function with all filters
      const { data, error: dbError } = await supabase
        .rpc('get_filtered_recipes', { 
          p_meal_type: selectedFilter === 'all' ? null : selectedFilter,
          p_user_id: user?.id,
          p_price_range: priceRange,
          p_max_distance: maxDistance,
          p_mood: selectedMood === 'all' ? null : selectedMood,
          p_limit: count
        });

      if (dbError) throw dbError;

      if (data && data.length > 0) {
        setSuggestions(data);
      } else {
        setError('No suggestions found for the selected criteria. Try different filters!');
      }
    } catch (err) {
      console.error('Error generating suggestion:', err);
      setError('Failed to get a suggestion. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNavigate = (tab: string) => {
    setIsExiting(true);
    setTimeout(() => {
      setActiveTab(tab as any);
    }, 300);
  };
  
  const handleSwipe = (direction: 'left' | 'right') => {
    if (!cardRef.current || isGenerating) return;
    
    // Animate the card
    const xOffset = direction === 'left' ? -100 : 100;
    
    cardControls.start({
      x: xOffset,
      opacity: 0,
      transition: { duration: 0.3 }
    }).then(() => {
      if (direction === 'left') {
        // Swipe left - reject and get a new suggestion
        generateSuggestion();
      } else if (direction === 'right') {
        // Swipe right - save this suggestion and get a new one
        const currentSuggestion = getCurrentSuggestion();
        if (currentSuggestion && !currentSuggestion.is_saved) {
          saveSuggestion(currentSuggestion.recipe_id);
        }
        generateSuggestion();
      }
    });
  };
  
  const handleShake = async () => {
    if (isGenerating) return;
    
    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    // Animate the shake
    await cardControls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    });
    
    // Generate a new suggestion
    generateSuggestion();
  };
  
  const saveSuggestion = async (recipeId: string) => {
    if (!user) return;
    
    setSavingToFavorites(true);
    
    try {
      // Use the RPC function instead of direct table access
      const { error } = await supabase
        .rpc('save_recipe_to_favorites', { 
          p_user_id: user.id, 
          p_recipe_id: recipeId 
        });
      
      if (error) throw error;
      
      // Update the current suggestion to show it's saved
      setSuggestions(suggestions.map(s => 
        s.recipe_id === recipeId ? { ...s, is_saved: true } : s
      ));
      
      // Show saved message
      setSavedMessage('Saved to favorites!');
      setTimeout(() => setSavedMessage(null), 2000);
      
    } catch (err) {
      console.error('Error saving suggestion:', err);
      setError('Failed to save to favorites');
    } finally {
      setSavingToFavorites(false);
    }
  };
  
  const removeSuggestion = async (recipeId: string) => {
    if (!user) return;
    
    setSavingToFavorites(true);
    
    try {
      // Use the RPC function instead of direct table access
      const { error } = await supabase
        .rpc('remove_recipe_from_favorites', { 
          p_user_id: user.id, 
          p_recipe_id: recipeId 
        });
      
      if (error) throw error;
      
      // Update the current suggestion to show it's not saved
      setSuggestions(suggestions.map(s => 
        s.recipe_id === recipeId ? { ...s, is_saved: false } : s
      ));
      
      // Show removed message
      setSavedMessage('Removed from favorites');
      setTimeout(() => setSavedMessage(null), 2000);
      
    } catch (err) {
      console.error('Error removing suggestion:', err);
      setError('Failed to remove from favorites');
    } finally {
      setSavingToFavorites(false);
    }
  };
  
  const shareCurrentSuggestion = () => {
    const suggestion = getCurrentSuggestion();
    if (!suggestion) return;
    
    // Create share text
    const shareText = `Check out this delicious ${suggestion.recipe_name} recipe!`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'Food Suggestion',
        text: shareText,
        url: window.location.origin
      }).catch(error => console.log('Error sharing:', error));
    } else {
      // Fallback to copy to clipboard
      const dummyUrl = `${window.location.origin}/recipe/${suggestion.recipe_id}`;
      setShareURL(dummyUrl);
      navigator.clipboard.writeText(`${shareText} ${dummyUrl}`);
      setShowShareMenu(true);
      setTimeout(() => setShowShareMenu(false), 3000);
    }
  };
  
  const moveToNextSuggestion = () => {
    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const moveToPreviousSuggestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const toggleDietaryRestriction = (restriction: DietaryRestrictionType) => {
    setDietaryRestrictions(prev => {
      if (prev.includes(restriction)) {
        return prev.filter(r => r !== restriction);
      } else {
        return [...prev, restriction];
      }
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]"
      initial="initial"
      exit="exit"
        variants={pageTransitionVariants}
        animate={isExiting ? "exit" : "enter"}
      onTouchStart={e => {
        if (cardRef.current) {
          const touch = e.touches[0];
          cardRef.current.dataset.touchStartX = touch.clientX.toString();
        }
      }}
      onTouchEnd={e => {
        if (cardRef.current && cardRef.current.dataset.touchStartX) {
          const touchEndX = e.changedTouches[0].clientX;
          const touchStartX = parseInt(cardRef.current.dataset.touchStartX);
          const diff = touchEndX - touchStartX;
          
          if (Math.abs(diff) > 100) {
            if (diff > 0) {
              // Swipe right
              handleSwipe('right');
            } else {
              // Swipe left
              handleSwipe('left');
            }
          }
        }
      }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <BackButton />
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Quick Decision</h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                showFilters 
                  ? "bg-orange-100 text-orange-600" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ 
                scale: isGenerating ? [1, 1.2, 1] : 1,
                rotate: isGenerating ? 360 : 0
              }}
              transition={{ 
                duration: 1.5,
                repeat: isGenerating ? Infinity : 0,
                ease: "easeInOut"
              }}
              className="bg-orange-100 p-4 rounded-full"
              onClick={handleShake}
            >
              <Zap className="w-8 h-8 text-orange-500" />
            </motion.div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {showNarrowedDown ? "Choose Between These Options" : "Quick Decision"}
          </h2>
          <p className="text-gray-600 mb-6">
            {showNarrowedDown 
              ? "We've narrowed it down to just a few choices for you." 
              : "Can't decide what to eat? Let us make a suggestion!"}
          </p>

          {/* Saved Message Toast */}
          <AnimatePresence>
            {savedMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
              >
                {savedMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Share Menu */}
          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Link copied to clipboard!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center gap-3 min-h-[300px]"
              >
                <motion.div 
                  animate={{ 
                    rotate: 360,
                    borderRadius: ["50% 50% 50% 50%", "40% 60% 60% 40%", "50% 50% 50% 50%"]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "linear" 
                  }}
                  className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500"
                />
                <span className="text-gray-500 font-medium mt-4">
                  Finding the perfect meal...
                </span>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-red-500 mb-4"
              >
                {error}
                <motion.button
                  onClick={() => generateSuggestion()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </motion.button>
              </motion.div>
            ) : suggestions.length > 0 ? (
              <div>
                {/* Narrowed Down Navigation */}
                {showNarrowedDown && (
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={moveToPreviousSuggestion}
                      disabled={currentIndex === 0}
                      className={cn(
                        "p-2 rounded-full",
                        currentIndex === 0 
                          ? "text-gray-300 cursor-not-allowed" 
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-500">
                      Option {currentIndex + 1} of {suggestions.length}
                    </span>
                    <button 
                      onClick={moveToNextSuggestion}
                      disabled={currentIndex === suggestions.length - 1}
                      className={cn(
                        "p-2 rounded-full",
                        currentIndex === suggestions.length - 1 
                          ? "text-gray-300 cursor-not-allowed" 
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <motion.div
                  key={`suggestion-${currentIndex}`}
                  variants={foodCardVariants}
                  initial="hidden"
                  animate={cardControls}
                  exit="exit"
                  className="space-y-4"
                  ref={cardRef}
                >
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg group">
                    <img
                      src={suggestions[currentIndex].recipe_image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80`}
                      alt={suggestions[currentIndex].recipe_name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Swipe Indicators */}
                    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="bg-white/90 p-3 rounded-full text-red-500"
                        onClick={() => handleSwipe('left')}
                      >
                        <X className="w-6 h-6" />
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="bg-white/90 p-3 rounded-full text-green-500"
                        onClick={() => handleSwipe('right')}
                      >
                        <Check className="w-6 h-6" />
                      </motion.div>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="absolute bottom-0 left-0 right-0 p-6"
                    >
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="bg-orange-500/80 text-white text-xs px-2 py-1 rounded-full">
                          {suggestions[currentIndex]?.cuisine_name}
                        </span>
                        <span className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full">
                          {suggestions[currentIndex]?.recipe_meal_type}
                        </span>
                        
                        {/* Show price range */}
                        <span className="bg-green-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          {[...Array(suggestions[currentIndex]?.recipe_price_range || 1)].map((_, i) => (
                            <DollarSign key={i} className="w-3 h-3" />
                          ))}
                        </span>
                        
                        {/* Show distance */}
                        <span className="bg-purple-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{suggestions[currentIndex]?.recipe_distance?.toFixed(1) || "?"} mi</span>
                        </span>
                      </div>
                      
                      <h3 className="text-3xl font-bold text-white mb-2">{suggestions[currentIndex]?.recipe_name}</h3>
                      <p className="text-white/90 mb-4">{suggestions[currentIndex]?.recipe_description || ""}</p>
                      
                      {/* Dietary tags */}
                      {suggestions[currentIndex]?.recipe_dietary_restrictions && 
                       Array.isArray(suggestions[currentIndex]?.recipe_dietary_restrictions) && 
                       suggestions[currentIndex]?.recipe_dietary_restrictions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {suggestions[currentIndex].recipe_dietary_restrictions.map(restriction => (
                            <span key={restriction} className="bg-green-700/60 text-white text-xs px-2 py-0.5 rounded-full">
                              {restriction.replace('_', '-')}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => suggestions[currentIndex]?.is_saved 
                            ? removeSuggestion(suggestions[currentIndex]?.recipe_id || '')
                            : saveSuggestion(suggestions[currentIndex]?.recipe_id || '')
                          }
                          disabled={savingToFavorites || !suggestions[currentIndex]?.recipe_id}
                          className="flex-1 bg-white/90 text-gray-800 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white transition-colors"
                        >
                          {suggestions[currentIndex]?.is_saved ? (
                            <>
                              <BookmarkCheck className="w-5 h-5 text-green-600" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-5 h-5" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                        <button 
                          onClick={shareCurrentSuggestion}
                          className="flex-1 bg-white/90 text-gray-800 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                          <span>Share</span>
                        </button>
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <motion.button
                      onClick={() => generateSuggestion()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Get Another
                    </motion.button>
                    
                    <motion.button
                      onClick={() => generateSuggestion(3)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5" />
                      Narrow Down
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.button
                onClick={() => generateSuggestion()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Decide Now
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Instructions for gestures */}
          {suggestions.length > 0 && !showNarrowedDown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              className="mt-6 text-sm text-gray-500"
            >
              <p>Swipe right to accept, left to try again, or shake for a new suggestion</p>
            </motion.div>
          )}
        </motion.div>
        
        {/* Side Panel Filter Overlay */}
        <AnimatePresence>
          {showFilters && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
                onClick={() => setShowFilters(false)}
              />
              
              {/* Side Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-30 overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Meal Type Section */}
                  <div className="mb-8">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Meal Type</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {filterOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => setSelectedFilter(option.value)}
                          className={cn(
                            "relative flex items-center gap-3 py-3 px-4 rounded-xl",
                            selectedFilter === option.value
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={cn(
                            "p-2 rounded-full",
                            selectedFilter === option.value ? "bg-orange-200" : "bg-white"
                          )}>
                            {option.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm">{option.label}</p>
                          </div>
                          {selectedFilter === option.value && (
                            <Check className="w-4 h-4 text-orange-600" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Range Section */}
                  <div className="mb-8">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Price Range</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="4"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-center gap-1 text-gray-700 min-w-[80px]">
                        {[...Array(priceRange)].map((_, i) => (
                          <DollarSign key={i} className="w-4 h-4 text-green-600" />
                        ))}
                        {[...Array(4 - priceRange)].map((_, i) => (
                          <DollarSign key={i + priceRange} className="w-4 h-4 text-gray-300" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Distance Section */}
                  <div className="mb-8">
                    <h3 className="text-md font-medium text-gray-900 mb-4">
                      Max Distance: {maxDistance} miles
                    </h3>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 min-w-[40px]">{maxDistance}mi</span>
                    </div>
                  </div>
                  
                  {/* Mood Selector */}
                  <div className="mb-8">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Mood</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {moodOptions.map((mood) => (
                        <button
                          key={mood.value}
                          onClick={() => setSelectedMood(mood.value)}
                          className={cn(
                            "py-3 px-4 rounded-lg flex items-center gap-2 text-left",
                            selectedMood === mood.value
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <span className={cn(
                            "p-1.5 rounded-full",
                            selectedMood === mood.value ? "bg-orange-200" : "bg-white"
                          )}>
                            {mood.icon}
                          </span>
                          <span className="font-medium text-sm">{mood.label}</span>
                          {selectedMood === mood.value && (
                            <Check className="w-4 h-4 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Dietary Restrictions */}
                  <div className="mb-8">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Dietary Restrictions</h3>
                    <div className="flex flex-wrap gap-2">
                      {dietaryRestrictionOptions.map((restriction) => (
                        <button
                          key={restriction.value}
                          onClick={() => toggleDietaryRestriction(restriction.value)}
                          className={cn(
                            "py-2 px-4 rounded-full flex items-center gap-2 border",
                            dietaryRestrictions.includes(restriction.value)
                              ? "bg-green-100 border-green-300 text-green-700"
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          {dietaryRestrictions.includes(restriction.value) && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span className="font-medium text-sm">{restriction.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Apply Filters Button */}
                  <motion.button
                    onClick={() => {
                      setShowFilters(false);
                      generateSuggestion();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Filter className="w-5 h-5" />
                    Apply Filters
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}