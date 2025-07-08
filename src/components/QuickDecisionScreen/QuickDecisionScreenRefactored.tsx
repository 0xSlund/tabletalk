import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../lib/store';
import { supabase, fetchFilteredRecipes } from '../../lib/supabase';
import { MealType } from '../../lib/database.functions';
import {
  SuggestionWithVote
} from './types';
import {
  Header,
  ContentHeader,
  StartScreen,
  ModernLoader,
  ErrorScreen,
  SuggestionScreen,
  EmptyState,
  FilterPanel
} from './index';

// Enhanced state management types
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
type ContentState = 'start' | 'loading' | 'suggestions' | 'empty' | 'error';

// Enhanced page transition variants for smoother animations
const pageTransitionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
};

// Enhanced content transition variants with staggered animations
const contentTransitionVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1], // Custom easing for smoother feel
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -20,
    transition: { 
      duration: 0.4, 
      ease: "easeIn"
    }
  }
};

// Special transition variants for loading-to-content
const loadingToContentVariants = {
  initial: { opacity: 0, y: 30, scale: 0.9 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
      delay: 0.2 // Small delay to let loading complete
    }
  },
  exit: { 
    opacity: 0, 
    y: -30,
    scale: 0.9,
    transition: { 
      duration: 0.5, 
      ease: "easeIn"
    }
  }
};

export function QuickDecisionScreenRefactored() {
  const { auth: { user } } = useAppStore();
  
  // Core state
  const [isStarted, setIsStarted] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionWithVote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<MealType>('all');
  
  // Enhanced transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Prevent multiple requests with ref
  const requestInProgress = useRef(false);

  // Reset function to initialize/reset all state
  const resetToInitialState = () => {
    console.log('🔄 Resetting QuickDecisionScreen to initial state');
    
    setIsStarted(false);
    setSuggestions([]);
    setCurrentIndex(0);
    setLoadingState('idle');
    setLoadingProgress(0);
    setError(null);
    setIsTransitioning(false);
    setShowFilters(false);
    
    // Reset request tracking
    requestInProgress.current = false;
    
    console.log('✅ State reset complete');
  };

  // Simple function to compute current content state (no memoization to prevent infinite loops)
  const getContentState = (): ContentState => {
    if (!isStarted) return 'start';
    if (error || loadingState === 'error') return 'error';
    if (loadingState === 'loading') return 'loading';
    
    // If we have valid suggestions, show them immediately
    if (suggestions.length > 0 && currentIndex < suggestions.length) {
      return 'suggestions';
    }
    
    // If loading completed but no suggestions, show empty
    if (loadingState === 'success' && suggestions.length === 0) {
      return 'empty';
    }
    
    // If we're started but not loading and no suggestions, show empty
    if (isStarted && loadingState === 'idle') {
      return 'empty';
    }
    
    // Default to start state
    return 'start';
  };

  // Current suggestion with bounds checking (also remove memoization)
  const getCurrentSuggestion = () => {
    if (suggestions.length === 0 || currentIndex >= suggestions.length) {
      return null;
    }
    return suggestions[currentIndex];
  };

  // Enhanced loading function with smooth transitions and modern UX
  const loadSuggestions = async () => {
    if (requestInProgress.current) {
      console.log('🔄 Request already in progress, skipping');
      return;
    }
    
    console.log('🚀 Starting loadSuggestions for filter:', selectedFilter);
    
    requestInProgress.current = true;
    setLoadingState('loading');
    setError(null);
    setLoadingProgress(0);
    setIsTransitioning(true);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('⏰ Loading timeout after 30 seconds');
      setError('Loading timed out. Please try again.');
      setLoadingState('error');
      setLoadingProgress(0);
      setIsTransitioning(false);
      requestInProgress.current = false;
    }, 30000); // 30 second timeout
    
    try {
      // Stage 1: Analyzing preferences (0-25%)
      setLoadingProgress(15);
      console.log('📊 Progress: 15% - Analyzing preferences...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setLoadingProgress(25);
      console.log('📊 Progress: 25% - Preferences analyzed');
      
      // Stage 2: Searching recipes (25-50%)
      setLoadingProgress(35);
      console.log('📊 Progress: 35% - Searching recipes...');
      
      const mealType = selectedFilter === 'all' ? null : selectedFilter;
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLoadingProgress(50);
      console.log('📊 Progress: 50% - Recipes found');
      
      // Stage 3: Filtering results (50-75%)
      setLoadingProgress(60);
      console.log('📊 Progress: 60% - Filtering results...');
      
      // Make the API call
      let recipes;
      try {
        recipes = await fetchFilteredRecipes(mealType, user?.id || null, 5);
        console.log('🎉 API call completed, received:', recipes?.length || 0, 'recipes');
      } catch (apiError) {
        console.error('💥 API call failed:', apiError);
        throw new Error(`API call failed: ${apiError instanceof Error ? apiError.message : 'Unknown API error'}`);
      }
      
      setLoadingProgress(75);
      console.log('📊 Progress: 75% - Results filtered');
      
      // Stage 4: Preparing suggestions (75-100%)
      setLoadingProgress(85);
      console.log('📊 Progress: 85% - Preparing suggestions...');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!recipes || recipes.length === 0) {
        console.log('⚠️ No recipes found');
        setError('No recipes found. Try adjusting your filters or try again later.');
        setSuggestions([]);
        setLoadingState('error');
        setLoadingProgress(0);
        setIsTransitioning(false);
        requestInProgress.current = false;
        return;
      }
      
      // Process recipes
      const suggestionsWithVotes: SuggestionWithVote[] = recipes.map((recipe: any) => ({
        ...recipe,
        userVote: null,
        votedAt: undefined
      }));
      
      console.log('🎯 Processed', suggestionsWithVotes.length, 'suggestions');
      
      // Complete loading with smooth progress
      setLoadingProgress(95);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setLoadingProgress(100);
      console.log('📊 Progress: 100% - Complete!');
      
      // Set data and prepare for transition
      setSuggestions(suggestionsWithVotes);
      setCurrentIndex(0);
      
      // Smooth transition delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Complete transition
      console.log('🎉 Transitioning to suggestions');
      setLoadingState('success');
      setLoadingProgress(0);
      setIsTransitioning(false);
      
      // Clear timeout since we succeeded
      clearTimeout(timeoutId);
      
    } catch (err) {
      console.error('❌ Error in loadSuggestions:', err);
      
      // Clear timeout on error
      clearTimeout(timeoutId);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load suggestions: ${errorMessage}`);
      setSuggestions([]);
      setLoadingState('error');
      setLoadingProgress(0);
      setIsTransitioning(false);
    } finally {
      requestInProgress.current = false;
    }
  };

  // Event handlers with better state management
  const handleStart = () => {
    console.log('🎬 Starting Quick Decision...');
    setIsStarted(true);
    loadSuggestions();
  };

  const handleVote = (vote: 'yes' | 'no') => {
    if (!getCurrentSuggestion() || currentIndex >= suggestions.length) {
      console.log('⚠️ Cannot vote: no current suggestion');
      return;
    }
    
    console.log(`👍👎 Voting ${vote} on suggestion:`, getCurrentSuggestion()?.recipe_name);
    
    const newSuggestions = [...suggestions];
    newSuggestions[currentIndex] = {
      ...newSuggestions[currentIndex],
      userVote: vote,
      votedAt: new Date()
    };
    setSuggestions(newSuggestions);
    
    // Move to next suggestion with animation delay
    setTimeout(() => {
      if (currentIndex < suggestions.length - 1) {
        console.log('➡️ Moving to next suggestion');
        setCurrentIndex(currentIndex + 1);
      } else {
        console.log('🔄 End of suggestions, loading more...');
        loadSuggestions();
      }
    }, 1000);
  };

  const handleSave = async () => {
    if (!user || !getCurrentSuggestion()) {
      console.log('⚠️ Cannot save: no user or suggestion');
      return;
    }
    
    console.log('💾 Saving suggestion:', getCurrentSuggestion()?.recipe_name);
    
    try {
      if (getCurrentSuggestion()?.is_saved) {
        await supabase.rpc('remove_recipe_from_favorites', { 
          p_user_id: user.id, 
          p_recipe_id: getCurrentSuggestion()?.recipe_id 
        });
      } else {
        await supabase.rpc('save_recipe_to_favorites', { 
          p_user_id: user.id, 
          p_recipe_id: getCurrentSuggestion()?.recipe_id 
        });
      }
      
      const newSuggestions = [...suggestions];
      newSuggestions[currentIndex] = {
        ...newSuggestions[currentIndex],
        is_saved: !getCurrentSuggestion()?.is_saved
      };
      setSuggestions(newSuggestions);
      
      console.log('✅ Successfully saved/unsaved suggestion');
      
    } catch (err) {
      console.error('❌ Error saving suggestion:', err);
    }
  };

  const handleFilterChange = (filter: MealType) => {
    console.log('🎛️ Filter changed to:', filter);
    setSelectedFilter(filter);
  };

  const handleApplyFilters = () => {
    console.log('✅ Applying filters');
    setShowFilters(false);
    if (isStarted) {
      loadSuggestions();
    }
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCloseFilters = () => {
    setShowFilters(false);
  };

  const handleRetry = () => {
    console.log('🔄 Retrying...');
    resetToInitialState();
    
    // Small delay to ensure state is updated
    setTimeout(() => {
      loadSuggestions();
    }, 100);
  };

  const handleLoadMore = () => {
    console.log('➕ Loading more suggestions...');
    loadSuggestions();
  };

  // Enhanced render content with improved transitions
  const renderContent = () => {
    const contentState = getContentState();
    console.log('🎨 Rendering content for state:', contentState);

    // Choose appropriate transition variants based on state
    const getTransitionVariants = () => {
      // Use special variants for loading-to-content transition
      if (contentState === 'suggestions' && isTransitioning) {
        return loadingToContentVariants;
      }
      return contentTransitionVariants;
    };

    return (
      <motion.div
        key={contentState} // This ensures smooth transitions between different states
        variants={getTransitionVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full"
      >
        {(() => {
          switch (contentState) {
            case 'start':
              return (
                <motion.div
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                >
                  <StartScreen onStart={handleStart} />
                </motion.div>
              );
            
            case 'loading':
              return (
                <motion.div
                  variants={{
                    initial: { opacity: 0, scale: 0.95 },
                    animate: { 
                      opacity: 1, 
                      scale: 1, 
                      transition: { duration: 0.6, ease: "easeOut" } 
                    },
                    exit: { 
                      opacity: 0, 
                      scale: 0.95, 
                      transition: { duration: 0.5, ease: "easeIn" } 
                    }
                  }}
                >
                  <ModernLoader progress={loadingProgress} />
                </motion.div>
              );
            
            case 'error':
              return (
                <motion.div
                  variants={{
                    initial: { opacity: 0, x: -20 },
                    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                  }}
                >
                  <ErrorScreen error={error || 'Unknown error occurred'} onRetry={handleRetry} />
                </motion.div>
              );
            
            case 'suggestions':
              // Double-check we have a valid suggestion before rendering
              if (getCurrentSuggestion()) {
                return (
                  <motion.div
                    variants={{
                      initial: { opacity: 0, y: 40, scale: 0.9 },
                      animate: { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: { 
                          duration: 0.8,
                          ease: [0.25, 0.1, 0.25, 1],
                          delay: isTransitioning ? 0.3 : 0
                        } 
                      }
                    }}
                  >
                    <SuggestionScreen
                      suggestion={getCurrentSuggestion()!}
                      onVote={handleVote}
                      onSave={handleSave}
                      onLoadMore={handleLoadMore}
                    />
                  </motion.div>
                );
              } else {
                // Fallback - this shouldn't happen with our improved logic
                console.log('⚠️ Suggestions state but no current suggestion, showing empty state');
                return <EmptyState onLoad={handleLoadMore} />;
              }
            
            case 'empty':
              return (
                <motion.div
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                >
                  <EmptyState onLoad={handleLoadMore} />
                </motion.div>
              );
            
            default:
              // Fallback
              console.log('⚠️ Unknown content state:', contentState);
              return <StartScreen onStart={handleStart} />;
          }
        })()}
      </motion.div>
    );
  };

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      {/* Header */}
      <Header 
        onToggleFilters={handleToggleFilters}
        showFilters={showFilters}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Content Header */}
          <ContentHeader />

          {/* Dynamic Content */}
          <AnimatePresence mode="wait">
            <div className="space-y-6">
              {renderContent()}
            </div>
          </AnimatePresence>
        </div>
      </main>

      {/* Filter Panel */}
      <FilterPanel
        showFilters={showFilters}
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClose={handleCloseFilters}
      />
    </motion.div>
  );
} 