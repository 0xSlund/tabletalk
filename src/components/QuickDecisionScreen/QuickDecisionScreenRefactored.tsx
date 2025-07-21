import React, { useState, useRef, useEffect } from 'react';
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
  
  // Prevent multiple requests with ref and add abort controller
  const requestInProgress = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  // Reset function to initialize/reset all state
  const resetToInitialState = () => {
    // Removed console logging for performance
    // console.log('🔄 Resetting QuickDecisionScreen to initial state');
    
    // Cancel any ongoing requests
    if (abortController.current) {
      // console.log('🚫 Aborting ongoing request');
      abortController.current.abort();
      abortController.current = null;
    }
    
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
    
    // console.log('✅ State reset complete');
  };

  // Component initialization and cleanup
  useEffect(() => {
    // Force reset all state on mount to ensure clean initialization
    resetToInitialState();
    
    // Add visibility change listener to handle tab switching
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // If we're stuck in loading state when page becomes visible, reset
        if (requestInProgress.current && loadingState === 'loading') {
          // Cancel any ongoing requests
          if (abortController.current) {
            abortController.current.abort();
            abortController.current = null;
          }
          
          requestInProgress.current = false;
          setLoadingState('idle');
          setLoadingProgress(0);
          setIsTransitioning(false);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup on unmount
    return () => {
      // Remove event listener
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Cancel any ongoing requests
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
      
      // Clear any stuck request flags
      requestInProgress.current = false;
      
      // Reset all state to prevent issues on re-mount
      setIsStarted(false);
      setSuggestions([]);
      setCurrentIndex(0);
      setLoadingState('idle');
      setLoadingProgress(0);
      setError(null);
      setIsTransitioning(false);
      setShowFilters(false);
      
      // Clear global window state to prevent interference with other screens
      if (window && window.__tabletalk_state) {
        delete window.__tabletalk_state;
      }
    };
  }, []); // Only run on mount/unmount

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
    // Force clear any stuck state before starting
    if (requestInProgress.current) {
      // Cancel any ongoing requests
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
      
      requestInProgress.current = false;
    }
    
    if (loadingState === 'loading') {
      setLoadingState('idle');
      setLoadingProgress(0);
      setIsTransitioning(false);
    }
    
    // Double-check after forced reset
    if (requestInProgress.current) {
      return;
    }
    
    // Create new abort controller for this request
    abortController.current = new AbortController();
    
    requestInProgress.current = true;
    setLoadingState('loading');
    setError(null);
    setLoadingProgress(0);
    setIsTransitioning(true);
    
    // Add timeout to prevent infinite loading - reduced to 10 seconds
    const timeoutId = setTimeout(() => {
      // Cancel the request
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
      
      setError('Loading timed out. Please try again.');
      setLoadingState('error');
      setLoadingProgress(0);
      setIsTransitioning(false);
      requestInProgress.current = false;
    }, 10000); // Reduced to 10 second timeout
    
    try {
      // Stage 1: Analyzing preferences (0-25%)
      setLoadingProgress(25);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Stage 2: Searching recipes (25-50%)
      setLoadingProgress(50);
      
      const mealType = selectedFilter === 'all' ? null : selectedFilter;
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Stage 3: Filtering results (50-75%)
      setLoadingProgress(75);
      
      // Check if request was aborted before making API call
      if (abortController.current?.signal.aborted) {
        return;
      }
      
      // Make the API call
      let recipes;
      try {
        recipes = await fetchFilteredRecipes(mealType, user?.id || null, 5, abortController.current?.signal);
      } catch (apiError) {
        // Check if it was an abort error
        if (apiError instanceof Error && (apiError.name === 'AbortError' || apiError.message === 'Request was aborted')) {
          return;
        }
        
        throw new Error(`API call failed: ${apiError instanceof Error ? apiError.message : 'Unknown API error'}`);
      }
      
      // Check if request was aborted after API call
      if (abortController.current?.signal.aborted) {
        return;
      }
      
      // Stage 4: Preparing suggestions (75-100%)
      setLoadingProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      if (!recipes || recipes.length === 0) {
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
      
      // Set data and prepare for transition
      setSuggestions(suggestionsWithVotes);
      setCurrentIndex(0);
      
      // Smooth transition delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Complete transition
      setLoadingState('success');
      setLoadingProgress(0);
      setIsTransitioning(false);
      
      // Clear timeout since we succeeded
      clearTimeout(timeoutId);
      
    } catch (err) {
      // Clear timeout on error
      clearTimeout(timeoutId);
      
      // Check if it was an abort error (user navigated away)
      if (err instanceof Error && (err.name === 'AbortError' || err.message === 'Request was aborted')) {
        return; // Don't show error for aborted requests
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load suggestions: ${errorMessage}`);
      setSuggestions([]);
      setLoadingState('error');
      setLoadingProgress(0);
      setIsTransitioning(false);
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

  // Event handlers with better state management
  const handleStart = () => {
    // console.log('🎬 Starting Quick Decision...');
    setIsStarted(true);
    loadSuggestions();
  };

  const handleVote = (vote: 'yes' | 'no') => {
    if (!getCurrentSuggestion() || currentIndex >= suggestions.length) {
      // console.log('⚠️ Cannot vote: no current suggestion');
      return;
    }
    
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
        // console.log('➡️ Moving to next suggestion');
        setCurrentIndex(currentIndex + 1);
      } else {
        // console.log('🔄 End of suggestions, loading more...');
        // console.log('🔍 Before loadSuggestions call:', { 
        //   requestInProgress: requestInProgress.current,
        //   loadingState,
        //   currentIndex,
        //   suggestionsLength: suggestions.length 
        // });
        
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
        
        // Reset loading progress if it's stuck
        if (loadingProgress > 0 && loadingProgress < 100) {
          // console.log('🚨 Resetting stuck loading progress from:', loadingProgress);
          setLoadingProgress(0);
        }
        
        // Reset loading state if stuck
        if (loadingState === 'loading') {
          // console.log('🚨 Resetting stuck loading state');
          setLoadingState('idle');
          setIsTransitioning(false);
        }
        
        // console.log('🔄 Calling loadSuggestions...');
        loadSuggestions();
      }
    }, 1000);
  };

  const handleSave = async () => {
    if (!user || !getCurrentSuggestion()) {
      // console.log('⚠️ Cannot save: no user or suggestion');
      return;
    }
    
    const currentSuggestion = getCurrentSuggestion()!;
    // console.log('💾 Saving suggestion:', currentSuggestion.recipe_name);
    
    try {
      if (currentSuggestion.is_saved) {
        // Remove from saved_suggestions
        const { error } = await supabase
          .from('saved_suggestions')
          .delete()
          .eq('profile_id', user.id)
          .eq('recipe_id', currentSuggestion.recipe_id);
        
        if (error) throw error;
        // console.log('✅ Successfully removed from favorites');
      } else {
        // Add to saved_suggestions
        const { error } = await supabase
          .from('saved_suggestions')
          .insert({
            profile_id: user.id,
            recipe_id: currentSuggestion.recipe_id
          });
        
        if (error) throw error;
        // console.log('✅ Successfully added to favorites');
      }
      
      // Update local state
      const newSuggestions = [...suggestions];
      newSuggestions[currentIndex] = {
        ...newSuggestions[currentIndex],
        is_saved: !currentSuggestion.is_saved
      };
      setSuggestions(newSuggestions);
      
    } catch (err) {
      // console.error('❌ Error saving suggestion:', err);
    }
  };

  const handleFilterChange = (filter: MealType) => {
    // console.log('🎛️ Filter changed to:', filter);
    setSelectedFilter(filter);
  };

  const handleApplyFilters = () => {
    // console.log('✅ Applying filters');
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
    // console.log('🔄 Retrying...');
    resetToInitialState();
    
    // Small delay to ensure state is updated
    setTimeout(() => {
      loadSuggestions();
    }, 100);
  };

  const handleLoadMore = () => {
    // console.log('➕ Loading more suggestions...');
    // Force reset the loading state before calling loadSuggestions
    if (requestInProgress.current) {
      // console.log('🚨 Forcing reset of requestInProgress flag');
      
      // Cancel any ongoing requests
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
      
      requestInProgress.current = false;
    }
    if (loadingState === 'loading') {
      // console.log('🚨 Forcing reset of loading state');
      setLoadingState('idle');
      setLoadingProgress(0);
      setIsTransitioning(false);
    }
    loadSuggestions();
  };

  // Enhanced render content with improved transitions
  const renderContent = () => {
    const contentState = getContentState();
    // Removed console logging for performance
    // console.log('🎨 Rendering content for state:', contentState);

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
                    />
                  </motion.div>
                );
              } else {
                // Fallback - this shouldn't happen with our improved logic
                // console.log('⚠️ Suggestions state but no current suggestion, showing empty state');
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
              // console.log('⚠️ Unknown content state:', contentState);
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
      className="min-h-screen"
      style={{ 
        backgroundColor: '#FEFCF8'
      }}
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