import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Dices } from 'lucide-react';
import { itemVariants } from '../types';
import { PLACEHOLDER_EXAMPLES } from '../constants';
import { getTimePeriodGreeting } from '../utils';

interface RoomNameInputProps {
  roomName: string;
  setRoomName: (name: string) => void;
  error: string;
  setError: (error: string) => void;
  isCreating: boolean;
}

export const RoomNameInput: React.FC<RoomNameInputProps> = ({
  roomName,
  setRoomName,
  error,
  setError,
  isCreating
}) => {
  // State for animated placeholder
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isValidInput, setIsValidInput] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
  const [justRerolled, setJustRerolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkmarkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
      
  // Enhanced placeholder examples based on time and more creative options
  const [enhancedPlaceholders, setEnhancedPlaceholders] = useState<string[]>([]);

  // Success color for validated text
  const SUCCESS_COLOR = 'text-green-600';
  
  // Maximum character limit (increased from 30 to 50)
  const MAX_CHARS = 50;

  // Generate enhanced placeholders based on time of day
  useEffect(() => {
    const greeting = getTimePeriodGreeting();
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Remove "e.g., " from all original placeholders
    const cleanedOriginals = PLACEHOLDER_EXAMPLES.map(p => p.replace('e.g., ', ''));
    
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
    const combined = [...cleanedOriginals.slice(0, 4), ...timeBased];
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

  // Generate four random suggestions (avoiding already used ones)
  const generateSuggestions = useCallback(() => {
    // All potential suggestions
    const allSuggestions = [
      ...PLACEHOLDER_EXAMPLES.map(p => p.replace('e.g., ', '')),
      `${getTimePeriodGreeting()} Food Adventure`,
      `${new Date().toLocaleDateString('en-US', { weekday: 'long' })} Feast`,
      `${getTimePeriodGreeting()} Flavor Quest`,
      `Quick Bites ${getTimePeriodGreeting()}`,
      `Food Explorers Club`,
      `Taste Test ${new Date().toLocaleDateString('en-US', { month: 'long' })}`,
      `${getTimePeriodGreeting()} Menu Mashup`,
      `Culinary Quest`,
      `Food Finder Group`,
      `Flavor Hunters`,
      `Meal Deciders`,
      `Dining Decisions`,
      `Foodie Friends Meetup`,
      `Gourmet Gathering`,
      `Tasty Takeout Team`,
      `Restaurant Roundup`,
      `Flavor Favorites`,
      `Meal Mates`,
      `Food Court`,
    ];
    
    // Filter out suggestions that have been used recently
    const availableSuggestions = allSuggestions.filter(item => !usedSuggestions.has(item));
    
    // If we're running low on options, reset the used list but keep the most recent ones
    if (availableSuggestions.length < 5) {
      const recentlyUsed = Array.from(usedSuggestions).slice(-4);
      setUsedSuggestions(new Set(recentlyUsed));
      return generateSuggestions(); // Recursively try again
    }
    
    // Select 4 random suggestions
    const selected: string[] = [];
    const tempAvailable = [...availableSuggestions];
    
    while (selected.length < 4 && tempAvailable.length > 0) {
      const randomIndex = Math.floor(Math.random() * tempAvailable.length);
      const suggestion = tempAvailable[randomIndex];
      selected.push(suggestion);
      tempAvailable.splice(randomIndex, 1);
      
      // Add to used set
      setUsedSuggestions(prev => new Set([...prev, suggestion]));
    }
    
    return selected;
  }, [usedSuggestions]);

  // Handle input changes with immediate feedback
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Enforce character limit
    if (newValue.length > MAX_CHARS) return;
    
    setRoomName(newValue);
    
    // Reset validation states when input changes
    setShowCheckmark(false);
    
    // Clear error if there's text
    if (newValue.trim()) {
      setError('');
    } else {
      // If input is cleared, reset validation state immediately
      setIsValidInput(false);
    }
    
    // Start validation process
    validateInput(newValue);
  };

  // Toggle dropdown visibility
  const handleInputFocus = () => {
    setInputFocused(true);
    if (!dropdownOpen) {
      setDropdownOpen(true);
      // Generate suggestions only when opening dropdown for the first time
      if (suggestions.length === 0) {
        setSuggestions(generateSuggestions());
      }
    }
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reroll suggestions
  const handleRerollSuggestions = () => {
    const newSuggestions = generateSuggestions();
    setSuggestions(newSuggestions);
    setJustRerolled(true);
    
    // Reset the rerolled state after animation completes
    setTimeout(() => {
      setJustRerolled(false);
    }, 1500);
  };

  // Apply suggestion to input
  const handleSelectSuggestion = (suggestion: string) => {
    setRoomName(suggestion);
    setDropdownOpen(false);
    validateInput(suggestion);
  };

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
        if (checkmarkTimeoutRef.current) {
          clearTimeout(checkmarkTimeoutRef.current);
        }
        
        checkmarkTimeoutRef.current = setTimeout(() => {
          setShowCheckmark(true);
          
          // Auto-hide checkmark after a brief period
          setTimeout(() => {
            setShowCheckmark(false);
          }, 1500);
        }, 150);
      } else {
        setShowCheckmark(false);
      }
    }, 400); // Debounce time
  }, []);

  // Watch for roomName changes and validate
  useEffect(() => {
    // Initial validation when component mounts
    validateInput(roomName);
    
    // Cleanup function
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (checkmarkTimeoutRef.current) {
        clearTimeout(checkmarkTimeoutRef.current);
      }
    };
  }, [roomName, validateInput]);

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

  // Checkmark animation variants
  const checkmarkVariants = {
    hidden: { 
      scale: 0,
      opacity: 0,
      rotate: -45, 
      x: 10
    },
    visible: { 
      scale: 1,
      opacity: 1,
      rotate: 0,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
        duration: 0.4
      }
    }
  };

  // Animation for suggestion items
  const suggestionVariants = {
    hidden: { 
      opacity: 0,
      y: 10,
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }
    },
    exit: {
      opacity: 0,
      y: -5,
      transition: {
        duration: 0.2
      }
    }
  };

  // Get text color class based on validation state
  const getTextColorClass = () => {
    if (!roomName.trim() || !isValidInput || error) return 'text-gray-900';
    return SUCCESS_COLOR; // Consistent success color
  };

  // Get character count color class
  const getCharCountColorClass = () => {
    const length = roomName.length;
    if (length === 0) return 'text-gray-400';
    if (length > MAX_CHARS * 0.8) return 'text-amber-500';
    if (length === MAX_CHARS) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <motion.div variants={itemVariants} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Room Name</label>
      
      <div className="relative" ref={inputContainerRef}>
        {/* The actual input field - with success text color applied when valid */}
        <input
          ref={inputRef}
          type="text"
          value={roomName}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={() => setInputFocused(false)}
          placeholder=" " // Empty placeholder as we use the overlay
          disabled={isCreating}
          className={`w-full px-4 py-3 border ${error ? 'border-red-500' : isValidInput ? 'border-blue-300' : 'border-gray-300'} 
            rounded-lg focus:ring-2 ${isValidInput ? 'focus:ring-blue-200' : 'focus:ring-primary'} focus:border-transparent 
            transition-all ${isCreating ? 'bg-gray-100 cursor-not-allowed' : ''} 
            ${getTextColorClass()} font-medium`}
        />
        
        {/* Animated placeholder overlay - grey placeholders */}
        {!roomName && !isCreating && (
          <div className="absolute left-0 top-0 w-full h-full pointer-events-none overflow-hidden rounded-lg flex items-center px-4">
            <div className="relative overflow-hidden h-6">
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

        {/* Character count & Checkmark container - right aligned */}
        <div className="absolute right-3 top-0 bottom-0 flex items-center gap-3">
          {/* Character count display */}
          {roomName && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs font-medium ${getCharCountColorClass()}`}
            >
              {roomName.length}/{MAX_CHARS}
            </motion.span>
          )}
          
          {/* Enhanced animated checkmark - fixed vertical alignment */}
          <AnimatePresence>
            {roomName && isValidInput && !error && showCheckmark && (
              <motion.div 
                key="checkmark"
                className="flex items-center justify-center"
                variants={checkmarkVariants}
                initial="hidden"
                animate="visible"
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Dropdown with suggestions - Position exactly below input with identical width */}
      <AnimatePresence>
        {dropdownOpen && !isCreating && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="relative z-10 w-full border border-gray-200 rounded-lg shadow-lg overflow-hidden bg-white"
            style={{ 
              width: inputContainerRef.current?.offsetWidth + 'px',
              marginTop: '1px'
            }}
          >
            {/* Dropdown header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Dices className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Suggested room names</span>
              </div>
              
              {/* Show notification when suggestions are rerolled */}
              <AnimatePresence>
                {justRerolled ? (
                  <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-blue-500 font-medium"
                  >
                    New suggestions rolled
                  </motion.span>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRerollSuggestions}
                    className="text-xs font-medium text-blue-500 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1 transition-colors"
                  >
                    <Dices className="w-3 h-3" />
                    <span>Refresh</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            
            {/* Grid of suggestions */}
            <div className="p-2 grid grid-cols-2 gap-2">
              <AnimatePresence mode="popLayout">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={`${suggestion}-${index}`}
                    layout
                    variants={suggestionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ 
                      scale: 1.02, 
                      borderColor: 'rgb(59, 130, 246)',
                      transition: { duration: 0.2 } 
                    }}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="text-left px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all overflow-hidden whitespace-nowrap text-ellipsis"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error message */}
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm font-medium mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}; 