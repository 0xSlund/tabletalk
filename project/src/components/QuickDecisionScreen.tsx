import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, Zap, RefreshCw, Loader2, Filter, Check } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { fadeVariants, foodCardVariants } from './PageTransition';

type MealType = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'appetizers_snacks' | 'soups_salads' | 'side_dishes';

interface FilterOption {
  value: MealType;
  label: string;
  description: string;
  image: string;
}

const filterOptions: FilterOption[] = [
  {
    value: 'all',
    label: 'All Meals',
    description: 'Show suggestions from all meal types',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80'
  },
  {
    value: 'breakfast',
    label: 'Breakfast',
    description: 'Morning meals and brunch options',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=300&q=80'
  },
  {
    value: 'lunch',
    label: 'Lunch',
    description: 'Midday meals and light options',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'
  },
  {
    value: 'dinner',
    label: 'Dinner',
    description: 'Evening meals and main courses',
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=300&q=80'
  },
  {
    value: 'dessert',
    label: 'Dessert',
    description: 'Sweet treats and desserts',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80'
  },
  {
    value: 'appetizers_snacks',
    label: 'Appetizers & Snacks',
    description: 'Small bites and starters',
    image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=300&q=80'
  },
  {
    value: 'soups_salads',
    label: 'Soups & Salads',
    description: 'Light and refreshing options',
    image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=300&q=80'
  },
  {
    value: 'side_dishes',
    label: 'Side Dishes',
    description: 'Complementary dishes',
    image: 'https://images.unsplash.com/photo-1534938665420-4193effeacc4?auto=format&fit=crop&w=300&q=80'
  }
];

export function QuickDecisionScreen() {
  const { setActiveTab, auth: { user } } = useAppStore();
  const [suggestion, setSuggestion] = useState<{
    recipe_id: string;
    recipe_name: string;
    recipe_description: string;
    recipe_image_url: string;
    recipe_prep_time: string;
    recipe_servings: number;
    recipe_difficulty: number;
    recipe_meal_type: string;
    cuisine_name: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<MealType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const generateSuggestion = async () => {
    setIsGenerating(true);
    setSuggestion(null);
    setError(null);

    try {
      // Call the database function with meal type filter
      const { data, error: dbError } = await supabase
        .rpc('get_filtered_recipes', { 
          p_meal_type: selectedFilter === 'all' ? null : selectedFilter,
          p_user_id: user?.id
        });

      if (dbError) throw dbError;

      if (data && data.length > 0) {
        setSuggestion(data[0]);
      } else {
        setError('No suggestions found for the selected criteria. Try a different filter!');
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

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50"
      initial="initial"
      exit="exit"
      variants={fadeVariants}
      animate={isExiting ? "exit" : "initial"}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Meal Type</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {filterOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => setSelectedFilter(option.value)}
                      className={cn(
                        "relative group rounded-xl overflow-hidden aspect-square",
                        selectedFilter === option.value && "ring-2 ring-orange-500"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <img
                        src={option.image}
                        alt={option.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {selectedFilter === option.value && (
                        <div className="absolute top-2 right-2 bg-orange-500 rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <p className="font-medium text-sm">{option.label}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            >
              <Zap className="w-8 h-8 text-orange-500" />
            </motion.div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Decision
          </h2>
          <p className="text-gray-600 mb-8">
            Can't decide what to eat? Let us make a suggestion!
          </p>

          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center justify-center gap-3 min-h-[200px]"
              >
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                <span className="text-gray-500 font-medium">
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
                  onClick={generateSuggestion}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </motion.button>
              </motion.div>
            ) : suggestion ? (
              <motion.div
                key="suggestion"
                variants={foodCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <motion.div
                  className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg"
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={suggestion.recipe_image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80`}
                    alt={suggestion.recipe_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute bottom-0 left-0 right-0 p-6"
                  >
                    <h3 className="text-3xl font-bold text-white mb-2">{suggestion.recipe_name}</h3>
                    <p className="text-white/90">{suggestion.recipe_description}</p>
                  </motion.div>
                </motion.div>

                <motion.button
                  onClick={generateSuggestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mt-6"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                onClick={generateSuggestion}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Decide Now
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </motion.div>
  );
}