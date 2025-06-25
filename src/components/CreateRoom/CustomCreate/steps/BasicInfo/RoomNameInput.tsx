import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Info, CheckCircle, Search, X, Check, AlertTriangle, Clock, Dices, RefreshCw } from 'lucide-react';
import { FoodMode, FOOD_MODE_THEMES, PLACEHOLDER_EXAMPLES, SUGGESTION_BANK, getTimePeriodGreeting } from './constants';
import { cn } from '../../../../../lib/utils';
import { supabase } from '../../../../../lib/supabaseClient';

// Add custom animation styles
const spinAnimationStyle = `
  @keyframes spin-fast {
    0% { transform: rotate(0deg) scale(1); opacity: 1; }
    10% { transform: rotate(45deg) scale(1.2); opacity: 1; }
    30% { transform: rotate(180deg) scale(1.4); opacity: 0.9; }
    60% { transform: rotate(480deg) scale(1.2); opacity: 1; }
    100% { transform: rotate(720deg) scale(1); opacity: 1; }
  }
  .animate-spin-fast {
    animation: spin-fast 1.2s cubic-bezier(0.11, 0.8, 0.29, 1) forwards;
  }
  
  @keyframes suggestion-refresh {
    0% { transform: scale(1); box-shadow: 0 0 0 rgba(59, 130, 246, 0); opacity: 1; }
    10% { transform: scale(1.03); box-shadow: 0 0 25px rgba(59, 130, 246, 0.5); opacity: 1; }
    30% { transform: scale(1.02); box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); opacity: 1; }
    100% { transform: scale(1); box-shadow: 0 0 0 rgba(59, 130, 246, 0); opacity: 1; }
  }
  
  .suggestion-refresh-pulse {
    animation: suggestion-refresh 1s cubic-bezier(0.19, 1, 0.22, 1);
  }
  
  @keyframes fade-in-scale {
    0% { opacity: 0; transform: translateY(-5px) scale(0.98); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  
  .fade-in-scale {
    animation: fade-in-scale 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  
  @keyframes border-glow {
    0% { border-color: rgba(59, 130, 246, 0.3); }
    50% { border-color: rgba(59, 130, 246, 0.6); }
    100% { border-color: rgba(59, 130, 246, 0.3); }
  }
  
  .hover-border-glow:hover {
    animation: border-glow 2s ease-in-out infinite;
  }
  
  @keyframes checkmark-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); color: #10b981; }
    100% { transform: scale(1); }
  }
  
  .checkmark-pulse {
    animation: checkmark-pulse 0.8s cubic-bezier(0.3, 0.7, 0.4, 1.5);
  }
  
  @keyframes slide-in-right {
    0% { transform: translateX(20px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  
  .slide-in-right {
    animation: slide-in-right 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  
  @keyframes suggestion-fade-out {
    0% { opacity: 1; transform: translateX(0) scale(1); }
    100% { opacity: 0; transform: translateX(-25px) scale(0.95); }
  }
  
  .suggestion-fade-out {
    opacity: 0.3;
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
  
  @keyframes suggestion-fade-in {
    0% { opacity: 0; transform: translateX(25px) scale(0.95); }
    100% { opacity: 1; transform: translateX(0) scale(1); }
  }
  
  .suggestion-fade-in {
    animation: suggestion-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  @keyframes reroll-highlight {
    0% { background-color: rgba(239, 246, 255, 0.9); border-color: rgba(59, 130, 246, 0.4); transform: scale(1); }
    30% { background-color: rgba(219, 234, 254, 0.95); border-color: rgba(59, 130, 246, 0.8); box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); transform: scale(1.03); }
    70% { background-color: rgba(224, 231, 255, 0.9); border-color: rgba(59, 130, 246, 0.6); box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); transform: scale(1.01); }
    100% { background-color: rgba(239, 246, 255, 0.9); border-color: rgba(59, 130, 246, 0.4); transform: scale(1); }
  }
  
  .reroll-highlight {
    animation: reroll-highlight 1.2s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .no-transition {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
  
  @keyframes text-color-transition {
    0% { color: #10b981; }  /* green-600 */
    100% { color: inherit; }
  }
  
  .text-color-transition {
    animation: text-color-transition 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes text-emphasis {
    0% { transform: scale(1); letter-spacing: normal; }
    30% { transform: scale(1.02); letter-spacing: 0.01em; }
    100% { transform: scale(1); letter-spacing: normal; }
  }
  
  .text-emphasis {
    animation: text-emphasis 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;

interface RoomNameInputProps {
  roomName: string;
  setRoomName: (name: string) => void;
  foodMode: FoodMode;
  isLoading: boolean;
}

export function RoomNameInput({ roomName, setRoomName, foodMode, isLoading }: RoomNameInputProps) {
  // Remove or comment out the debug logs to prevent excessive console output
  // console.log('RoomNameInput - current foodMode:', foodMode);
  const [isFocused, setIsFocused] = useState(false);
  const [nameValidationError, setNameValidationError] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isValidInput, setIsValidInput] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [enhancedPlaceholders, setEnhancedPlaceholders] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
  const [recentlyUsedSuggestions, setRecentlyUsedSuggestions] = useState<string[]>([]);
  const [isDropdownDetached, setIsDropdownDetached] = useState(false);
  const [suggestionBank, setSuggestionBank] = useState<Array<{category: string, suggestions: string[]}>>([]); 
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastInputUpdate, setLastInputUpdate] = useState(Date.now());
  const [transitionCompleted, setTransitionCompleted] = useState(false);
  const [textAnimationKey, setTextAnimationKey] = useState(0);
  const [textTransitionClass, setTextTransitionClass] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  
  const MAX_SUGGESTIONS = 3; // We'll show 3 suggestions + 1 reroll button
  const MAX_RECENT_MEMORY = 12; // Remember last 12 suggestions to avoid repeats
  const SUCCESS_COLOR = 'text-green-600';
  
  // Add multiple neutral color options
  const neutralColorOptions = {
    slate: {
      primary: 'from-slate-600 to-gray-700',
      secondary: 'from-slate-200 to-gray-300',
      accent: 'slate-800',
      light: 'slate-100',
      border: 'slate-400'
    },
    rose: {
      primary: 'from-rose-400 to-pink-500',
      secondary: 'from-rose-50 to-pink-100',
      accent: 'rose-500',
      light: 'rose-50',
      border: 'rose-200'
    },
    cyan: {
      primary: 'from-cyan-400 to-sky-500',
      secondary: 'from-cyan-50 to-sky-100',
      accent: 'cyan-600',
      light: 'cyan-50',
      border: 'cyan-200'
    },
    stone: {
      primary: 'from-stone-400 to-neutral-500',
      secondary: 'from-stone-100 to-neutral-200',
      accent: 'stone-600',
      light: 'stone-50',
      border: 'stone-200'
    },
    lime: {
      primary: 'from-lime-400 to-green-500', 
      secondary: 'from-lime-50 to-green-100',
      accent: 'lime-600',
      light: 'lime-50',
      border: 'lime-200'
    }
  };
  
  // Use blue only for the neutral state (no indigo)
  const neutralColors = {
    primary: 'from-blue-400 to-blue-600',
    secondary: 'from-blue-50 to-blue-100',
    accent: 'blue-600',
    light: 'blue-50',
    border: 'blue-200'
  };
  
  // Regular mode colors
  const modeColors = {
    'dining-out': {
      primary: 'from-violet-500 to-purple-600',
      secondary: 'from-violet-100 to-purple-200',
      accent: 'violet-600',
      light: 'violet-50',
      border: 'violet-300'
    },
    'cooking': {
      primary: 'from-teal-500 to-emerald-600',
      secondary: 'from-teal-100 to-emerald-200',
      accent: 'teal-600',
      light: 'teal-50',
      border: 'teal-300'
    },
    'both': {
      primary: 'from-orange-500 to-amber-600',
      secondary: 'from-orange-100 to-amber-200',
      accent: 'orange-600',
      light: 'orange-50',
      border: 'orange-300'
    },
    'neutral': { ...neutralColors }
  };
  
  // Determine which colors to use - neutral initially, then mode color when selected
  // Make sure we're using a strict check to handle null/undefined/empty strings
  const currentColors = (foodMode && foodMode !== '' && foodMode !== 'neutral') 
    ? modeColors[foodMode as keyof typeof modeColors] || neutralColors
    : neutralColors;
  
  // Remove or comment out the debug logs to prevent excessive console output
  // console.log('RoomNameInput - color scheme:', !foodMode ? 'neutral/slate' : foodMode, currentColors);
  
  // Format room name based on food mode
  const formatRoomNameWithFoodMode = () => {
    // Simply return the room name without appending the food mode
    return roomName.trim();
  };
  
  // Generate enhanced placeholders based on time of day
  useEffect(() => {
    const greeting = getTimePeriodGreeting();
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    const timeBased = [
      `${greeting} Food Hangout`,
      `Quick ${greeting} Bite`,
      `${greeting} Food Decision`,
      `${currentMonth} Food Adventure`,
      `${dayOfWeek} Foodie Meetup`,
      `Flavor Quest ${currentMonth}`,
      `Tasty ${greeting} Decisions`,
      `${greeting} Cravings Solved`
    ];
    
    // Mix original examples with time-based ones
    const combined = [...PLACEHOLDER_EXAMPLES.slice(0, 4), ...timeBased];
    setEnhancedPlaceholders(combined);
  }, []);
  
  // Rotate placeholders with smooth animation
  useEffect(() => {
    if (enhancedPlaceholders.length === 0) return;
    
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % enhancedPlaceholders.length);
    }, 3500);
    
    return () => clearInterval(interval);
  }, [enhancedPlaceholders]);
  
  // Debounced validation function
  const validateInput = useCallback((input: string) => {
    // Clear any previous validation timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // If input is empty, reset validation state immediately
    if (!input.trim()) {
      setIsValidInput(false);
      setShowCheckmark(false);
      return;
    }

    // Set a timeout for validation (simulate checking)
    validationTimeoutRef.current = setTimeout(() => {
      // Simple validation: input must be at least 3 characters
      const isValid = input.trim().length >= 3;
      
      // Update validation state
      setIsValidInput(isValid);
      
      // Show the checkmark with a slight delay for a nice sequence
      if (isValid) {
        setTimeout(() => {
          setShowCheckmark(true);
          setNameValidationError(null);
          
          // Hide the checkmark after a short period (more dynamic)
          setTimeout(() => {
            setShowCheckmark(false);
          }, 1200);
          
          // Show the success animation
          setShowSuccessAnimation(true);
          
          // Hide it after a few seconds
          setTimeout(() => {
            setShowSuccessAnimation(false);
          }, 2000);
        }, 100);
      } else {
        setShowCheckmark(false);
        setShowSuccessAnimation(false);
      }
    }, 300); // Slightly faster validation
  }, []);
  
  // Handle input changes with immediate feedback
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const isFirstEntry = !roomName && newValue;
    
    setRoomName(newValue);
    setLastInputUpdate(Date.now());
    setTransitionCompleted(false);
    
    // Reset validation states when input changes
    setShowCheckmark(false);
    
    // Clear error if there's text
    if (newValue.trim()) {
      setNameValidationError(null);
      
      // If this is adding text for the first time or after clearing, add animation
      if (isFirstEntry) {
        setTextAnimationKey(prev => prev + 1);
        setTextTransitionClass('text-emphasis text-color-transition');
        
        // Remove animation class after it completes
        setTimeout(() => {
          setTextTransitionClass('');
        }, 1200);
      }
    } else {
      // If input is cleared, reset validation state immediately
      setIsValidInput(false);
    }
    
    // Start validation process
    validateInput(newValue);
  };
  
  // Watch for roomName changes and validate
  useEffect(() => {
    // Initial validation when component mounts
    validateInput(roomName);
    
    // Cleanup function
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [roomName, validateInput]);
  
  // Add effect to animate text when it's validated
  useEffect(() => {
    if (isValidInput && roomName.trim()) {
      setTextAnimationKey(prev => prev + 1);
      setTextTransitionClass('text-emphasis text-color-transition');
      
      // Remove animation class after it completes
      const timer = setTimeout(() => {
        setTextTransitionClass('');
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [isValidInput, roomName]);
  
  // Handle clicks outside of the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    
    // Add event listener when dropdown is shown
    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSuggestions]);
  
  // Fetch suggestion bank from Supabase
  useEffect(() => {
    const fetchSuggestionBank = async () => {
      setIsFetchingSuggestions(true);
      try {
        console.log('Fetching suggestions from Supabase...');
        // Fetch suggestions from Supabase
        const { data, error } = await supabase
          .from('room_name_suggestions')
          .select('*');
          
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} suggestions from Supabase`);
        
        if (data && data.length > 0) {
          // Group suggestions by category
          const groupedSuggestions: { [key: string]: string[] } = {};
          
          data.forEach(item => {
            const category = item.category;
            if (!groupedSuggestions[category]) {
              groupedSuggestions[category] = [];
            }
            groupedSuggestions[category].push(item.text);
          });
          
          // Transform to the format our app expects
          const formattedBank = Object.entries(groupedSuggestions).map(([category, suggestions]) => ({
            category,
            suggestions
          }));
          
          setSuggestionBank(formattedBank);
          console.log('Suggestion bank updated with categories:', Object.keys(groupedSuggestions).join(', '));
          
          // Set isFetchingSuggestions to false now that we have successfully loaded suggestions
          setIsFetchingSuggestions(false);
          
          // After successfully fetching suggestions, update current suggestions
          if (showSuggestions) {
            // The dropdown is already open, so we should update suggestions immediately
            const freshSuggestions = generateSuggestionsFromBank(formattedBank);
            setCurrentSuggestions(freshSuggestions);
          }
        } else {
          console.warn('No suggestions found in the database');
          throw new Error('No suggestions found');
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setFetchError('Failed to load suggestions');
        
        // Fallback to some basic suggestions if fetch fails
        console.log('Using fallback suggestions');
        const fallbackBank = [
          {
            category: 'general',
            suggestions: [
              'Food Group Chat',
              'Dinner Decisions',
              'Lunch Planners',
              'Foodie Friends',
              'Meal Planning Committee',
              'Tasty Times'
            ]
          },
          {
            category: 'morning',
            suggestions: [
              'Morning Food Hangout',
              'Breakfast Brigade',
              'Rise & Dine'
            ]
          },
          {
            category: 'evening',
            suggestions: [
              'Dinner Discovery',
              'Evening Epicureans',
              'Twilight Tastings'
            ]
          },
          {
            category: 'cooking',
            suggestions: [
              'Home Chef Gathering',
              'Kitchen Collective',
              'Recipe Roundup'
            ]
          },
          {
            category: 'dining-out',
            suggestions: [
              'Restaurant Hunt',
              'Dining Adventure',
              'Food Explorer Group'
            ]
          },
          {
            category: 'both',
            suggestions: [
              'Cook & Dine Experience',
              'Kitchen to Table Journey',
              'Food Adventure'
            ]
          }
        ];
        setSuggestionBank(fallbackBank);
        
        // Even if we failed to fetch, we should still update suggestions with fallbacks
        setIsFetchingSuggestions(false);
        
        // After setting the fallback bank, update current suggestions
        if (showSuggestions) {
          const fallbackSuggestions = generateSuggestionsFromBank(fallbackBank);
          setCurrentSuggestions(fallbackSuggestions);
        }
      }
    };
    
        fetchSuggestionBank();
  }, []);
  
  // Helper function to generate suggestions from a specific bank
  const generateSuggestionsFromBank = useCallback((bank: Array<{category: string, suggestions: string[]}>) => {
    // Get current time for precise time-based selection
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    // Get primary time category based on precise time ranges
    let primaryTimeCategory = '';
    if (hour >= 5 && hour < 11) {
      primaryTimeCategory = 'morning';
    } else if (hour >= 11 && hour < 14) {
      primaryTimeCategory = 'lunch';
    } else if (hour >= 14 && hour < 17) {
      primaryTimeCategory = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      primaryTimeCategory = 'evening';
    } else {
      primaryTimeCategory = 'latenight';
    }

    // Create weighted suggestion pools for better time relevance
    let timeSpecificSuggestions: string[] = [];
    let foodModeSpecificSuggestions: string[] = [];
    let secondarySuggestions: string[] = [];
    let fallbackSuggestions: string[] = [];
    
    // Find and prioritize suggestions matching current time
    const timeSpecificBank = bank.find(item => item.category === primaryTimeCategory);
    if (timeSpecificBank) {
      // Filter out already used suggestions
      timeSpecificSuggestions = timeSpecificBank.suggestions.filter(s => !recentlyUsedSuggestions.includes(s));
    }
    
    // Add weekend-specific suggestions if it's the weekend
    if (isWeekend) {
      const weekendBank = bank.find(item => item.category === 'weekend');
      if (weekendBank) {
        // Filter out already used suggestions
        const unusedWeekendSuggestions = weekendBank.suggestions.filter(s => !recentlyUsedSuggestions.includes(s));
        timeSpecificSuggestions = [...timeSpecificSuggestions, ...unusedWeekendSuggestions];
      }
    }
    
    // Add food mode specific suggestions if a mode is selected
    if (foodMode && foodMode !== 'neutral') {
      // Find food mode specific suggestions
      const modeSuggestions = bank
        .find(item => item.category === foodMode)
        ?.suggestions.filter(s => !recentlyUsedSuggestions.includes(s)) || [];
        
      // Add time-aware customization by prepending time period to some suggestions
      const timeEnhancedSuggestions = modeSuggestions.map(s => {
        // Apply time period enhancement to ~30% of suggestions
        if (Math.random() > 0.7 && s.indexOf('${') === -1) {
          return s.replace(/^/, `${getTimePeriodGreeting()} `);
        }
        return s;
      });
      
      foodModeSpecificSuggestions = timeEnhancedSuggestions;
    }
    
    // Add occasion suggestions as secondary options
    const occasionBank = bank.find(item => item.category === 'occasion');
    if (occasionBank) {
      // Filter out already used suggestions
      secondarySuggestions = occasionBank.suggestions.filter(s => !recentlyUsedSuggestions.includes(s));
    }
    
    // Add all other suggestions as fallbacks
    bank.forEach(item => {
      if (item.category !== primaryTimeCategory && 
          item.category !== 'weekend' && 
          item.category !== 'occasion' &&
          item.category !== 'cooking' && 
          item.category !== 'dining-out' && 
          item.category !== 'both') {
        // Filter out already used suggestions
        const unusedSuggestions = item.suggestions.filter(s => !recentlyUsedSuggestions.includes(s));
        fallbackSuggestions = [...fallbackSuggestions, ...unusedSuggestions];
      }
    });
    
    // Existing shuffle and prioritization logic
    const shuffledFoodModeSpecific = [...foodModeSpecificSuggestions].sort(() => 0.5 - Math.random());
    const shuffledTimeSpecific = [...timeSpecificSuggestions].sort(() => 0.5 - Math.random());
    const shuffledSecondary = [...secondarySuggestions].sort(() => 0.5 - Math.random());
    const shuffledFallback = [...fallbackSuggestions].sort(() => 0.5 - Math.random());
    
    // Create final suggestion list with priority for food mode specific and time-specific ones
    let finalSuggestions: string[] = [];
    
    // First, add food mode specific suggestions if available
    if (foodMode && foodMode !== 'neutral') {
      const foodModeCount = Math.min(2, shuffledFoodModeSpecific.length);
      finalSuggestions = [...shuffledFoodModeSpecific.slice(0, foodModeCount)];
    }
    
    // Then add time-specific suggestions
    if (finalSuggestions.length < MAX_SUGGESTIONS) {
      const timeSpecificCount = Math.min(MAX_SUGGESTIONS - finalSuggestions.length, shuffledTimeSpecific.length);
      finalSuggestions = [...finalSuggestions, ...shuffledTimeSpecific.slice(0, timeSpecificCount)];
    }
    
    // Then add secondary suggestions if needed
    if (finalSuggestions.length < MAX_SUGGESTIONS) {
      const secondaryCount = Math.min(MAX_SUGGESTIONS - finalSuggestions.length, shuffledSecondary.length);
      finalSuggestions = [...finalSuggestions, ...shuffledSecondary.slice(0, secondaryCount)];
    }
    
    // Finally add fallback suggestions if still needed
    if (finalSuggestions.length < MAX_SUGGESTIONS) {
      const fallbackCount = Math.min(MAX_SUGGESTIONS - finalSuggestions.length, shuffledFallback.length);
      finalSuggestions = [...finalSuggestions, ...shuffledFallback.slice(0, fallbackCount)];
    }
    
    // Shuffle the final list for variety and limit to MAX_SUGGESTIONS
    finalSuggestions = finalSuggestions.sort(() => 0.5 - Math.random()).slice(0, MAX_SUGGESTIONS);
    
    // If we still don't have enough suggestions, add some default ones
    if (finalSuggestions.length < MAX_SUGGESTIONS) {
      const defaultSuggestions = [
        'Food Planning Group',
        'Meal Decision Squad',
        'Dinner Plans',
        'Food Adventure',
        'Dining Group'
      ].slice(0, MAX_SUGGESTIONS - finalSuggestions.length);
      
      finalSuggestions = [...finalSuggestions, ...defaultSuggestions];
    }
    
    // Mark these suggestions as recently used
    setRecentlyUsedSuggestions(prev => {
      // Create a new array with the current suggestions added
      const newRecents = [...prev, ...finalSuggestions];
      // If the array is too long, remove oldest suggestions
      if (newRecents.length > MAX_RECENT_MEMORY) {
        return newRecents.slice(newRecents.length - MAX_RECENT_MEMORY);
      }
      return newRecents;
    });
    
    // Also update the permanent used suggestions set for legacy support
    finalSuggestions.forEach(suggestion => {
      setUsedSuggestions(prev => new Set([...prev, suggestion]));
    });
    
    return finalSuggestions;
  }, [foodMode, recentlyUsedSuggestions]);
  
  // Generate suggestions based on food mode and time of day without repeating previously shown suggestions
  const generateSuggestions = useCallback(() => {
    // If suggestions are still loading, don't return any suggestions yet
    // Let the UI handle the loading state separately
    if (isFetchingSuggestions) {
      return [];
    }
    
    // If error occurred and we have no suggestions, return generic options
    if (fetchError && suggestionBank.length === 0) {
      return ['Food Group', 'Meal Planning', 'Dining Decisions'];
    }
    
    return generateSuggestionsFromBank(suggestionBank);
  }, [foodMode, recentlyUsedSuggestions, isFetchingSuggestions, fetchError, suggestionBank, generateSuggestionsFromBank]);

  // Auto-update suggestions when fetching completes and dropdown is open
  useEffect(() => {
    if (!isFetchingSuggestions && showSuggestions && currentSuggestions.length === 0) {
      const suggestions = generateSuggestions();
      setCurrentSuggestions(suggestions);
    }
  }, [isFetchingSuggestions, showSuggestions, currentSuggestions.length, generateSuggestions]);

  // Handle opening suggestions
  const handleOpenSuggestions = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(true);
    
    // Only generate suggestions if not currently fetching
    if (!isFetchingSuggestions) {
      const suggestions = generateSuggestions();
      setCurrentSuggestions(suggestions);
    } else {
      // Clear suggestions while loading
      setCurrentSuggestions([]);
    }
  }, [generateSuggestions, isFetchingSuggestions]);
  
  // Add refs to track timeouts and elements
  const timeoutRefs = useRef<number[]>([]);
  const flashOverlayRef = useRef<HTMLDivElement | null>(null);

  // Cleanup function to remove overlay elements and clear timeouts
  const cleanupRefreshAnimations = useCallback(() => {
    // Clear all tracked timeouts
    timeoutRefs.current.forEach(timeoutId => {
      window.clearTimeout(timeoutId);
    });
    timeoutRefs.current = [];
    
    // Remove any flash overlay if it exists
    if (flashOverlayRef.current && document.body.contains(flashOverlayRef.current)) {
      document.body.removeChild(flashOverlayRef.current);
      flashOverlayRef.current = null;
    }
    
    // Remove any notification elements
    const notifications = document.querySelectorAll('.suggestion-notification');
    notifications.forEach(notification => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
    
    // Remove any animation classes from container
    const container = document.querySelector('.suggestions-container');
    if (container) {
      container.classList.remove('suggestion-refresh-pulse');
    }
  }, []);

  // Monitor dropdown closing to perform cleanup
  useEffect(() => {
    if (!showSuggestions) {
      cleanupRefreshAnimations();
    }
    
    return () => {
      // Cleanup on component unmount
      cleanupRefreshAnimations();
    };
  }, [showSuggestions, cleanupRefreshAnimations]);

  // Utility function to safely add timeout and track it
  const safeSetTimeout = (callback: () => void, delay: number) => {
    const timeoutId = window.setTimeout(() => {
      // Remove this ID from the tracking array when it executes
      timeoutRefs.current = timeoutRefs.current.filter(id => id !== timeoutId);
      callback();
    }, delay);
    
    // Track the timeout ID
    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  };

  // Handle rerolling for new suggestions
  const handleRerollSuggestions = () => {
    // Don't allow reroll if still fetching suggestions
    if (isFetchingSuggestions) {
      return;
    }
    
    setShowSuggestions(true); // Explicitly ensure dropdown stays open
    
    // Clean up any existing animations first
    cleanupRefreshAnimations();
    
    // Add dice animation to reroll button
    const diceButton = document.querySelector('.reroll-dice');
    if (diceButton) {
      diceButton.classList.add('animate-spin-fast');
      safeSetTimeout(() => {
        diceButton.classList.remove('animate-spin-fast');
      }, 1000);
    }
    
    // Highlight the reroll button
    const rerollButton = document.querySelector('[data-testid="reroll-button"]');
    if (rerollButton) {
      rerollButton.classList.add('reroll-highlight');
      safeSetTimeout(() => {
        rerollButton.classList.remove('reroll-highlight');
      }, 1200);
    }
    
    // Generate new suggestions
    const freshSuggestions = generateSuggestions();
    
    // Instead of animating the whole container, only animate the suggestion items
    // Find and animate just the suggestion items
    const suggestionItems = document.querySelectorAll('.suggestion-item');
    suggestionItems.forEach((item, index) => {
      // Add fade-out animation class to each item
      item.classList.add('suggestion-fade-out');
    });
    
    // Add notification to the header
    const container = document.querySelector('.suggestions-container');
    if (container) {
      const headerRow = container.querySelector('.suggestion-header-row');
      if (headerRow) {
        // First, remove any existing notification
        const existingNotification = headerRow.querySelector('.suggestion-notification');
        if (existingNotification) {
          headerRow.removeChild(existingNotification);
        }
        
        // Create notification element
        const notificationEl = document.createElement('div');
        notificationEl.className = `suggestion-notification ml-auto text-${!foodMode || foodMode === 'neutral' ? 'blue-600' : `${currentColors?.accent || 'blue-600'}`} px-2 py-1 rounded-full text-sm font-medium bg-${!foodMode || foodMode === 'neutral' ? 'blue-50' : `${currentColors?.light || 'blue-50'}`} flex items-center gap-1 opacity-0 transition-opacity duration-300`;
        notificationEl.innerHTML = `
          <svg class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.071 4.929a10 10 0 00-14.142 0M5.93 18.071a10 10 0 0014.142 0" />
          </svg>
          <span>New suggestions rolled!</span>
        `;
        headerRow.appendChild(notificationEl);
        
        // Show with animation
        safeSetTimeout(() => {
          notificationEl.style.opacity = '1';
          
          // Hide after 2 seconds
          safeSetTimeout(() => {
            notificationEl.style.opacity = '0';
            
            // Remove from DOM after fade out
            safeSetTimeout(() => {
              try {
                if (headerRow.contains(notificationEl)) {
                  headerRow.removeChild(notificationEl);
                }
              } catch (e) {
                // Element might be already removed
              }
            }, 300);
          }, 2000);
        }, 100);
      }
    }
    
    // Update with better animation - fade out current suggestions
    setCurrentSuggestions(prev => {
      // Mark current suggestions for fade out animation
      return prev.map(suggestion => `__fadeout__${suggestion}`);
    });
    
    // Then show new suggestions after a short delay
    safeSetTimeout(() => {
      setCurrentSuggestions(freshSuggestions);
    }, 250);
  };
  
  // Helper function to check if a suggestion is a loading placeholder
  const isLoadingPlaceholder = (suggestion: string) => {
    const loadingTexts = ['Looking for ideas', 'Getting suggestions', 'Finding options', 'Loading...', 'Please wait'];
    return loadingTexts.some(loading => suggestion.toLowerCase().includes(loading.toLowerCase()));
  };

  // Handle clicking a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    // Don't allow selection of loading placeholders
    if (isLoadingPlaceholder(suggestion)) {
      return;
    }
    
    setRoomName(suggestion);
    // Explicitly close dropdown when selecting a suggestion
    setShowSuggestions(false);
    validateInput(suggestion);
  };
  
  // Variants for the placeholder animations
  const placeholderVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 15 : -15,
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      y: direction > 0 ? -15 : 15,
      opacity: 0
    })
  };

  // Checkmark animation variants - adjusted for new position
  const checkmarkVariants = {
    hidden: { 
      scale: 0,
      opacity: 0,
      rotate: -45, 
      x: -10 // Coming from left instead of right
    },
    visible: { 
      scale: 1.2, // Slightly larger for emphasis
      opacity: 1,
      rotate: 0,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400, // Springier animation
        damping: 12, // Less damping for more bounce
        duration: 0.3 // Faster appearance
      }
    },
    exit: {
      scale: 0,
      opacity: 0,
      x: -10, // Exit to left
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };
  
  // Get text color class based on validation state
  const getTextColorClass = () => {
    if (!roomName.trim() || !isValidInput || nameValidationError) return 'text-gray-900';
    // Only show success color temporarily when checkmark is visible
    if (showCheckmark) return SUCCESS_COLOR;
    // Otherwise use the theme color based on food mode
    return (foodMode && foodMode !== '' && foodMode !== 'neutral')
      ? `text-${currentColors?.accent || 'blue-700'}`
      : 'text-blue-700';
  };
  
  // Enhanced suggestions animation variants
  const suggestionsContainerVariants = {
    hidden: { opacity: 0, y: 0, height: 0, scaleY: 0, transformOrigin: "top" },
    visible: { 
      opacity: 1, 
      y: 0,
      height: 'auto',
      scaleY: 1,
      transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.07
      }
    },
    exit: { 
      opacity: 0, 
      y: 0, 
      height: 0,
      scaleY: 0,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  // Improved suggestion item variants with better transitions
  const suggestionItemVariants = {
    hidden: { opacity: 0, x: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 220,
        damping: 18
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      x: -20,
      transition: {
        duration: 0.25,
        ease: "easeInOut"
      }
    },
    refresh: {
      opacity: 0,
      scale: 0.9,
      x: -20,
      transition: {
        duration: 0.25,
        ease: "easeInOut"
      }
    },
    refreshEnd: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 220,
        damping: 18,
        delay: 0.1
      }
    }
  };
  
  // Get character count color based on length
  const getCharCountColorClass = () => {
    const length = formatRoomNameWithFoodMode().length;
    if (length > 45) return 'text-amber-500'; // Getting close to limit
    if (length > 40) return 'text-blue-500'; // Approaching limit
    return 'text-gray-400'; // Default color
  };
  
  // Add this near the top of the RoomNameInput component, before any use of activeBorderColor
  const activeBorderColor = '#60a5fa'; // Tailwind blue-400
  
  // Get input border color based on focus state and food mode
  const getInputBorderColor = () => {
    if (nameValidationError) {
      return 'border-red-500';
    }
    
    if (isFocused) {
      // When focused, use the accent color for the active food mode
      return (foodMode && foodMode !== '' && foodMode !== 'neutral')
        ? `border-${FOOD_MODE_THEMES[foodMode]?.primaryColor.split('-')[1]}-500`
        : 'border-blue-500';
    }
    
    // Default state - use food mode border color if selected, otherwise neutral blue
    return (foodMode && foodMode !== '' && foodMode !== 'neutral')
      ? `border-${FOOD_MODE_THEMES[foodMode]?.borderColor.split('#')[1]}`
      : 'border-blue-200';
  };
  
  // Get input background color based on food mode
  const getInputBackgroundColor = () => {
    if (nameValidationError) {
      return 'bg-red-50';
    }
    
    // Use the light background color for the active food mode
    return (foodMode && foodMode !== '' && foodMode !== 'neutral')
      ? `bg-${FOOD_MODE_THEMES[foodMode]?.bgLight.split('-')[1]}`
      : 'bg-blue-50';
  };
  
  // Get badge colors based on completion state
  const getBadgeColors = () => {
    // Always use themed colors - no initial green state
    if (!roomName) {
      return {
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-700'
      };
    } else if (!foodMode || foodMode === 'neutral') {
      return {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700'
      };
    } else if (foodMode === 'dining-out') {
      return {
        bgColor: 'bg-violet-100',
        textColor: 'text-violet-700'
      };
    } else if (foodMode === 'cooking') {
      return {
        bgColor: 'bg-teal-100',
        textColor: 'text-teal-700'
      };
    } else {
      return {
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700'
      };
    }
  };

  // Effect to handle badge transition after input
  useEffect(() => {
    if (roomName && !transitionCompleted) {
      // Immediately set transition as completed since we don't need the delay anymore
      setTransitionCompleted(true);
    }
  }, [roomName, lastInputUpdate, transitionCompleted]);
  
  return (
    <div className={`bg-white rounded-xl p-6 shadow-md mb-12 relative overflow-visible transition-all duration-500 ${!foodMode || foodMode === 'neutral' ? 'border-2 border-blue-200' : `border border-${currentColors?.border || 'blue-200'}`}`}>
      {/* Add custom animation styles */}
      <style>{spinAnimationStyle}</style>
      {/* Color transition border - use better colors for neutral state */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-500 bg-gradient-to-r ${!foodMode || foodMode === 'neutral' ? 'from-blue-50 to-blue-100' : currentColors?.secondary || 'from-blue-50 to-blue-100'} ${!foodMode || foodMode === 'neutral' ? 'opacity-70' : 'opacity-40'}`}></div>
      
      {/* Accent color top bar - improved neutral colors */}
      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${!foodMode || foodMode === 'neutral' ? 'from-blue-400 to-blue-500' : currentColors?.primary || 'from-blue-400 to-blue-500'} rounded-t-xl transition-all duration-500`}></div>
      
      {/* Animated background gradient - improved neutral colors */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r transition-all duration-500 ${!foodMode || foodMode === 'neutral' ? 'from-blue-50 to-blue-100' : currentColors?.secondary || 'from-blue-50 to-blue-100'} opacity-20 rounded-xl`}
        animate={{
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className={`text-xl font-bold transition-all duration-500 ${!foodMode || foodMode === 'neutral' ? 'text-blue-700' : `text-${currentColors?.accent || 'blue-700'}`}`}>
              Name Your Room
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${!roomName ? 'required' : 'completed'}-${foodMode || 'neutral'}-${transitionCompleted}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: [0.9, 1.05, 1],
                  opacity: 1 
                }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                }}
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full transition-all duration-700 ${getBadgeColors().bgColor} ${getBadgeColors().textColor}`}
              >
                {!roomName ? 'Required' : 'Completed'}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="relative w-full z-20 roomname-input-container">
          {/* Input field with validation styling */}
          <motion.div
            className={`absolute inset-0 rounded-xl border transition-all duration-300 ${getInputBorderColor()} ${getInputBackgroundColor()}`}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Add a click area to focus the input */}
          <div 
            className="absolute inset-0 z-0 cursor-text"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
          />
          
          <motion.div
            key={`input-wrapper-${textAnimationKey}`}
            initial={{ scale: 1 }}
            animate={{ 
              scale: roomName && isValidInput ? [1, 1.01, 1] : 1,
            }}
            transition={{ 
              duration: 0.5,
              ease: "easeInOut" 
            }}
            className="w-full relative"
          >
            <input
              ref={inputRef}
              type="text"
              id="roomName"
              value={formatRoomNameWithFoodMode()}
              onChange={handleInputChange}
              onFocus={handleOpenSuggestions}
              onBlur={() => {
                setIsFocused(false);
                // We'll handle closing in the global click handler
              }}
              placeholder=" "
              className={`w-full px-5 py-4 rounded-xl border-none bg-transparent relative z-10 ${getTextColorClass()} focus:ring-0 focus:outline-none text-lg ${textTransitionClass} transition-all duration-700 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
              disabled={isLoading}
              maxLength={50}
            />
          </motion.div>
          
          {/* Animated placeholder overlay */}
          {!formatRoomNameWithFoodMode() && !isLoading && (
            <div className="absolute left-0 top-0 w-full h-full pointer-events-none overflow-hidden rounded-lg flex items-center px-5 py-4">
              <div className="relative overflow-hidden h-7 flex items-center">
                <AnimatePresence mode="popLayout" initial={false} custom={1}>
                  <motion.span
                    key={placeholderIndex}
                    custom={1}
                    variants={placeholderVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      y: { type: "spring", stiffness: 250, damping: 25 },
                      opacity: { duration: 0.3 }
                    }}
                    className="block text-gray-400 font-normal"
                  >
                    {enhancedPlaceholders[placeholderIndex] || ''}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          )}
          
          {/* Character counter - moved to right edge with padding */}
          <div className="absolute right-3 top-0 bottom-0 flex items-center mr-0.5">
            {formatRoomNameWithFoodMode() && (
              <motion.span 
                className={`text-sm font-medium ${getCharCountColorClass()}`}
                animate={{ 
                  scale: formatRoomNameWithFoodMode().length > 45 ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: formatRoomNameWithFoodMode().length > 45 ? 1 : 0,
                  repeatType: "reverse" 
                }}
              >
                {formatRoomNameWithFoodMode().length}/50
              </motion.span>
            )}
          </div>
          
          {/* Animated checkmark - moved to left of character counter with padding */}
          <AnimatePresence>
            {formatRoomNameWithFoodMode() && isValidInput && !nameValidationError && showCheckmark && (
              <motion.div
                key="checkmark"
                className="absolute right-[4.2rem] top-0 bottom-0 flex items-center"
                variants={checkmarkVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <CheckCircle className="w-5 h-5 text-green-500 checkmark-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Suggestions Dropdown - with loading state */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                ref={suggestionsRef}
                variants={suggestionsContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`absolute left-0 w-full z-40 bg-white border rounded-xl suggestions-container p-0 ${getInputBorderColor().replace('border-', 'border-')}`}
                style={{
                  top: "100%",
                  minWidth: 0,
                  boxSizing: "border-box"
                }}
              >
                <div className="p-3 pt-2">
                  <div className="flex items-center gap-2 mb-3 px-2 py-1 suggestion-header-row">
                    <div className={`bg-${!foodMode || foodMode === 'neutral' ? 'blue-50' : currentColors?.light || 'blue-50'} p-1.5 rounded-full`}>
                      <Clock className={`w-4 h-4 text-${!foodMode || foodMode === 'neutral' ? 'blue-600' : currentColors?.accent || 'blue-600'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Suggested room names</span>
                    {isFetchingSuggestions && (
                      <div className="ml-auto flex items-center gap-1">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                        <span className="text-xs text-blue-500">Loading...</span>
                      </div>
                    )}
                    {fetchError && (
                      <div className="ml-auto flex items-center gap-1 text-amber-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs">Using fallback suggestions</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                    {/* Show loading state when fetching suggestions */}
                    {isFetchingSuggestions ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <div className="animate-spin h-8 w-8 border-3 border-blue-500 rounded-full border-t-transparent"></div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600 mb-1">Finding perfect suggestions...</p>
                          <p className="text-xs text-gray-500">This may take a moment</p>
                        </div>
                      </div>
                    ) : currentSuggestions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <div className="p-3 bg-gray-100 rounded-full">
                          <Clock className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600 mb-1">No suggestions available</p>
                          <p className="text-xs text-gray-500">Try refreshing or enter your own name</p>
                        </div>
                      </div>
                    ) : (
                      /* Main Grid: 2x2 grid for suggestions (3 regular + 1 reroll) */
                      <div className="grid grid-cols-2 gap-2 grid-rows-2">
                        {/* Suggestion Buttons - Always exactly 3 regular suggestions */}
                        {currentSuggestions.map((suggestion, index) => {
                        // Check if this suggestion is marked for fade out
                        const isFadingOut = suggestion.startsWith('__fadeout__');
                        // Get the actual suggestion text
                        const actualSuggestion = isFadingOut ? suggestion.replace('__fadeout__', '') : suggestion;
                        
                        return (
                          <motion.button
                            key={suggestion}
                            variants={suggestionItemVariants}
                            custom={index}
                            initial={isFadingOut ? "visible" : "hidden"}
                            animate={isFadingOut ? "refresh" : "refreshEnd"}
                            exit={{ opacity: 0, x: -20 }}
                            className={`suggestion-item flex items-center gap-2 px-3 py-3 text-left text-gray-700 rounded-lg transition-all border hover-border-glow border-${!foodMode || foodMode === 'neutral' ? 'blue-200' : currentColors?.border || 'blue-200'} hover:border-${!foodMode || foodMode === 'neutral' ? 'blue-400' : currentColors?.border || 'blue-300'} hover:shadow-md hover:bg-${!foodMode || foodMode === 'neutral' ? 'blue-50' : currentColors?.light || 'blue-50'} bg-white/70 h-full focus:outline-none focus:ring-2 focus:ring-${!foodMode || foodMode === 'neutral' ? 'blue-400' : currentColors?.accent || 'blue-600'} focus:ring-offset-2 ${isFadingOut ? 'pointer-events-none suggestion-fade-out' : 'suggestion-fade-in'}`}
                            onClick={() => {
                              // Don't allow clicks on fading out suggestions
                              if (isFadingOut) return;
                              handleSuggestionClick(actualSuggestion);
                            }}
                          >
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className={`transition-all duration-500 text-${!foodMode || foodMode === 'neutral' ? 'blue-600' : currentColors?.accent || 'blue-600'} text-xs bg-${!foodMode || foodMode === 'neutral' ? 'blue-50' : currentColors?.light || 'blue-50'} px-2 py-1 rounded-full font-medium flex-shrink-0`}
                            >
                              {index + 1}
                            </motion.span>
                            <span className="text-sm font-medium truncate flex-1 min-w-0 overflow-hidden">{actualSuggestion}</span>
                            
                            {/* Show a highlight for food mode specific suggestions */}
                            {foodMode && foodMode !== 'neutral' && 
                            (actualSuggestion.toLowerCase().includes('cooking') && foodMode === 'cooking' ||
                              actualSuggestion.toLowerCase().includes('dining') && foodMode === 'dining-out' ||
                              actualSuggestion.toLowerCase().includes('dine') && foodMode === 'both' ||
                              actualSuggestion.toLowerCase().includes('cook') && (foodMode === 'cooking' || foodMode === 'both')) && (
                                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full bg-${currentColors?.light || 'blue-50'} text-${currentColors?.accent || 'blue-600'} font-medium`}>
                                  {foodMode === 'cooking' ? '👨‍🍳' : foodMode === 'dining-out' ? '🍽️' : '🍳🍽️'}
                                </span>
                            )}
                          </motion.button>
                        );
                      })}

                      {/* Reroll Button - 4th option in the 2x2 grid */}
                      <motion.button
                        variants={suggestionItemVariants}
                        custom={currentSuggestions.length}
                        whileHover={{ 
                          scale: 1.03, // Slightly more pronounced hover scale
                          y: 0, // No vertical movement
                          boxShadow: "0 6px 12px rgba(59, 130, 246, 0.25)",
                          backgroundColor: !foodMode || foodMode === 'neutral' ? "rgba(239, 246, 255, 0.9)" : undefined,
                          borderColor: "rgba(59, 130, 246, 0.8)",
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 15
                          }
                        }}
                        whileTap={{
                          scale: 0.97,
                          boxShadow: "0 2px 4px rgba(59, 130, 246, 0.1)",
                          transition: { duration: 0.1 }
                        }}
                        onClick={handleRerollSuggestions}
                        tabIndex={0}
                        aria-label="Reroll suggestions"
                        data-testid="reroll-button"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleRerollSuggestions();
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-3 text-left text-gray-700 rounded-lg transition-all border hover-border-glow border-${!foodMode || foodMode === 'neutral' ? 'blue-200' : currentColors?.border || 'blue-200'} hover:border-${!foodMode || foodMode === 'neutral' ? 'blue-400' : currentColors?.border || 'blue-300'} hover:shadow-md hover:bg-${!foodMode || foodMode === 'neutral' ? 'blue-50' : currentColors?.light || 'blue-50'} bg-white/70 h-full focus:outline-none focus:ring-2 focus:ring-${!foodMode || foodMode === 'neutral' ? 'blue-400' : currentColors?.accent || 'blue-600'} focus:ring-offset-2 slide-in-right`}
                      >
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.15 }}
                          className={`transition-all duration-500 text-${!foodMode || foodMode === 'neutral' ? 'blue-600' : currentColors?.accent || 'blue-600'} text-xs bg-${!foodMode || foodMode === 'neutral' ? 'blue-50' : currentColors?.light || 'blue-50'} px-2 py-1 rounded-full font-medium flex-shrink-0 flex items-center gap-1`}
                        >
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ 
                              duration: 2.5, 
                              repeat: Infinity, 
                              repeatType: "loop",
                              ease: "easeInOut",
                              times: [0, 0.25, 0.75, 1],
                              repeatDelay: 1.5
                            }}
                            className="relative"
                          >
                            <Dices className="w-4 h-4 reroll-dice" />
                            <motion.div 
                              className="absolute inset-0 rounded-full bg-blue-400/20"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ 
                                opacity: [0, 0.7, 0], 
                                scale: [0.8, 1.5, 2.2], 
                              }}
                              transition={{ 
                                duration: 3, 
                                repeat: Infinity,
                                repeatDelay: 3,
                                ease: "easeOut" 
                              }}
                            />
                          </motion.div>
                          <span>New suggestions</span>
                        </motion.span>
                        <span className="text-sm font-medium truncate flex-1 min-w-0 overflow-hidden">Refresh</span>
                      </motion.button>
                    </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}