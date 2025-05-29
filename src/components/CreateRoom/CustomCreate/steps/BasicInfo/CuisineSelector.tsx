import React, { useState, useRef, useEffect } from 'react';
import {
  UtensilsCrossed,
  Search,
  X,
  Plus,
  Info,
  Coffee,
  Star,
  Check,
  AlertTriangle,
  ChevronRight,
  ChevronsUpDown,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FoodMode, FOOD_MODE_THEMES, cuisines, DIETARY_RESTRICTIONS } from './constants';
import { AllCuisinesModal } from './AllCuisinesModal';

interface CuisineSelectorProps {
  selectedCuisines: string[];
  setSelectedCuisines: (cuisines: string[]) => void;
  foodMode: FoodMode;
  isLoading: boolean;
  dietaryRestrictions: string[];
  setDietaryRestrictions: (restrictions: string[]) => void;
}

export function CuisineSelector({
  selectedCuisines,
  setSelectedCuisines,
  foodMode,
  isLoading,
  dietaryRestrictions,
  setDietaryRestrictions
}: CuisineSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('cuisine');
  const [showAllCuisinesModal, setShowAllCuisinesModal] = useState(false);
  const [showSelectedCuisinesModal, setShowSelectedCuisinesModal] = useState(false);
  const [selectedCuisinesPage, setSelectedCuisinesPage] = useState(0);
  const cuisineTabRef = useRef<HTMLDivElement>(null);
  const dietaryTabRef = useRef<HTMLDivElement>(null);
  const [tabLayout, setTabLayout] = useState({ width: 0, left: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-switch to dietary tab if preferences are loaded
  useEffect(() => {
    if (dietaryRestrictions.length > 0) {
      // Auto-switch to dietary tab if it's the first time seeing the restrictions
      const hasSwitchedBefore = localStorage.getItem('tabletalk-dietary-notice-shown');
      if (!hasSwitchedBefore) {
        setCurrentTab('dietary');
        localStorage.setItem('tabletalk-dietary-notice-shown', 'true');
      }
    }
  }, [dietaryRestrictions]);

  // Listen for custom event to switch to dietary tab
  useEffect(() => {
    const handleSwitchToDietary = () => {
      setCurrentTab('dietary');
    };

    window.addEventListener('tabletalk:navigateToDietaryTab', handleSwitchToDietary);
    
    return () => {
      window.removeEventListener('tabletalk:navigateToDietaryTab', handleSwitchToDietary);
    };
  }, []);

  // Get color based on food mode
  const getColor = (type: string) => {
    const colorMap = {
      'dining-out': 'violet',
      'cooking': 'teal',
      'both': 'orange'
    };
    return colorMap[foodMode] || 'blue';
  };

  // Get the actual color hex value for the underline
  const getUnderlineColor = () => {
    switch (foodMode) {
      case 'dining-out': return '#8b5cf6'; // violet-500
      case 'cooking': return '#14b8a6'; // teal-500
      case 'both': return '#f97316'; // orange-500
      default: return '#3b82f6'; // blue-500
    }
  };

  // Cuisine type filtering and selection
  const selectedCuisineObjects = cuisines.filter(c => selectedCuisines.includes(c.id));
  const popularCuisines = cuisines.filter(c => c.popular && !selectedCuisines.includes(c.id));
  const filteredCuisines = cuisines.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !selectedCuisines.includes(c.id)
  );

  // Handle adding/removing cuisines
  const handleRemoveCuisine = (id: string) => {
    setSelectedCuisines(selectedCuisines.filter(cuisineId => cuisineId !== id));
  };

  // Calculate the position and width of the underline based on the active tab
  const calculateTabLayout = () => {
    if (currentTab === 'cuisine' && cuisineTabRef.current) {
      return {
        width: cuisineTabRef.current.offsetWidth,
        left: cuisineTabRef.current.offsetLeft
      };
    } else if (currentTab === 'dietary' && dietaryTabRef.current) {
      return {
        width: dietaryTabRef.current.offsetWidth,
        left: dietaryTabRef.current.offsetLeft
      };
    }
    
    // Default values in case the refs aren't ready yet
    return {
      width: 0,
      left: 0
    };
  };

  // Initial calculation on mount
  useEffect(() => {
    // Calculate initial position after a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setTabLayout(calculateTabLayout());
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Update tab layout when current tab changes
  useEffect(() => {
    // Use setTimeout to ensure the DOM has updated
    const timer = setTimeout(() => {
      setTabLayout(calculateTabLayout());
    }, 50);
    return () => clearTimeout(timer);
  }, [currentTab]);

  // Handle tab change with recalculation
  const handleTabChange = (tab: 'cuisine' | 'dietary') => {
    setCurrentTab(tab);
    // Force immediate recalculation after tab change
    setTimeout(() => {
      setTabLayout(calculateTabLayout());
    }, 10);
  };
  
  // Animation variants for tab content
  const tabContentVariants = {
    hidden: { 
      opacity: 0,
      y: 10,
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  };

  // Animation variants for active tab indicator
  const activeTabVariants = {
    inactive: { 
      scale: 1,
    },
    active: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 300
      }
    }
  };

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSelectedCuisinesModal) {
        setShowSelectedCuisinesModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSelectedCuisinesModal]);

  // Handle clicking outside for modal close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && showSelectedCuisinesModal) {
        setShowSelectedCuisinesModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSelectedCuisinesModal]);

  // Handle clearing all cuisines
  const handleClearAll = () => {
    setSelectedCuisines([]);
    // Close the modal after clearing - use immediate transition
    setTimeout(() => {
      setShowSelectedCuisinesModal(false);
    }, 50); // Small timeout for smoother animation sequence
  };

  // Handle done button click
  const handleDone = () => {
    setShowSelectedCuisinesModal(false);
  };

  return (
    <div className="bg-white rounded-lg p-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6 relative">
        {/* Cuisine Types Tab */}
        <div ref={cuisineTabRef}>
          <motion.button 
            onClick={() => handleTabChange('cuisine')}
            className={`py-3 px-5 text-sm font-medium ${
              currentTab === 'cuisine' 
                ? `text-${getColor()}-600` 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            variants={activeTabVariants}
            initial="inactive"
            animate={currentTab === 'cuisine' ? 'active' : 'inactive'}
          >
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Cuisine Types</span>
            </div>
          </motion.button>
        </div>

        {/* Dietary Restrictions Tab */}
        <div ref={dietaryTabRef}>
          <motion.button 
            onClick={() => handleTabChange('dietary')}
            className={`py-3 px-5 text-sm font-medium ${
              currentTab === 'dietary' 
                ? `text-${getColor()}-600` 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            variants={activeTabVariants}
            initial="inactive"
            animate={currentTab === 'dietary' ? 'active' : 'inactive'}
          >
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4" />
              <span>Dietary Restrictions</span>
              {dietaryRestrictions.length > 0 && (
                <span className={`inline-flex items-center justify-center rounded-full bg-${getColor()}-500 w-5 h-5 text-[10px] text-white font-bold`}>
                  {dietaryRestrictions.length}
                </span>
              )}
            </div>
          </motion.button>
        </div>
        
        {/* Animated Underline - Using inline style for better color control */}
        <motion.div 
          className="absolute bottom-0 h-1 shadow-sm rounded-t"
          style={{ 
            backgroundColor: getUnderlineColor(),
          }}
          initial={false}
          animate={{
            width: tabLayout.width,
            left: tabLayout.left
          }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 40 
          }}
        />
      </div>

      {/* Tab Content with AnimatePresence for smooth transitions */}
      <div className="relative min-h-[450px]">
        <AnimatePresence mode="wait">
          {currentTab === 'cuisine' && (
            <motion.div
              key="cuisine-tab"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabContentVariants}
              className="absolute w-full h-full"
            >
              {/* Cuisine Tab Content with fixed padding at bottom to accommodate the button */}
              <div className="flex flex-col space-y-4 h-full overflow-y-auto">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search cuisine types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`block w-full rounded-xl border-gray-200 pl-10 py-3 focus:border-${getColor()}-300 focus:ring-${getColor()}-200`}
                    disabled={isLoading}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Selected Cuisines - Fixed height container with limited display */}
                <div className="h-[95px]">
                  {selectedCuisines.length > 0 ? (
                    <div className="bg-white rounded-xl p-3 pb-4 border border-gray-100 shadow-sm h-full">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className={`text-sm font-medium text-${getColor()}-600`}>
                          Selected Cuisine(s) ({selectedCuisines.length})
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCuisines([])}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Clear
                          </button>
                        </div>
                      </div>
                      {/* Set a fixed height div to maintain consistent size */}
                      <div className="h-[45px] relative">
                        <motion.div 
                          className="flex flex-wrap gap-2 overflow-hidden absolute inset-0"
                          layoutId="selectedCuisines"
                          transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 200,
                            duration: 0.2
                          }}
                        >
                          <AnimatePresence>
                            {selectedCuisineObjects.slice(0, 4).map((cuisine) => (
                              <motion.div
                                key={cuisine.id}
                                className={`bg-${getColor()}-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-${getColor()}-100 min-w-[100px] justify-center`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{
                                  type: "tween",
                                  duration: 0.15
                                }}
                              >
                                <span className="text-lg">{cuisine.emoji}</span>
                                <span className={`font-medium text-${getColor()}-700`}>{cuisine.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCuisine(cuisine.id)}
                                  className={`ml-1 rounded-full p-0.5 text-${getColor()}-400 hover:text-${getColor()}-600 hover:bg-${getColor()}-200/70`}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </motion.div>
                            ))}
                            {selectedCuisines.length > 4 && (
                              <motion.button
                                key="more-button"
                                type="button"
                                onClick={() => {
                                  setSelectedCuisinesPage(0);
                                  setShowSelectedCuisinesModal(true);
                                }}
                                className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-${getColor()}-600 bg-${getColor()}-50 border border-${getColor()}-100 text-sm font-medium hover:bg-${getColor()}-100`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                +{selectedCuisines.length - 4} more
                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 shadow-sm h-full flex items-center justify-center">
                      <p className="text-sm text-gray-500">No cuisines selected yet</p>
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto">
                  {searchTerm ? (
                    // Search Results
                    filteredCuisines.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-gray-400" />
                          Search Results
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto">
                          {filteredCuisines.map((cuisine) => (
                            <button
                              key={cuisine.id}
                              onClick={() => setSelectedCuisines([...selectedCuisines, cuisine.id])}
                              disabled={isLoading}
                              className={`bg-white px-3 py-2 rounded-xl border border-gray-200 flex items-center gap-2 hover:bg-${getColor()}-50 shadow-sm transition-all`}
                            >
                              <span className="text-xl">{cuisine.emoji}</span>
                              <span className="font-medium text-gray-700">{cuisine.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-2">🔍</div>
                        <p className="text-gray-500">
                          No cuisines found matching "{searchTerm}"
                        </p>
                      </div>
                    )
                  ) : (
                    // Popular Cuisines section followed directly by View All button
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-400" />
                          Popular Cuisines
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {cuisines
                            .filter(c => c.popular)
                            .slice(0, 6)
                            .map((cuisine) => {
                              const isSelected = selectedCuisines.includes(cuisine.id);
                              return (
                                <button
                                  key={cuisine.id}
                                  onClick={() => {
                                    if (!isSelected) {
                                      setSelectedCuisines([...selectedCuisines, cuisine.id]);
                                    }
                                  }}
                                  disabled={isLoading || isSelected}
                                  className={`relative overflow-hidden ${
                                    isSelected ? 'opacity-50' : ''
                                  } bg-white px-3 py-2.5 rounded-xl border border-gray-200 flex items-center gap-2 hover:bg-${getColor()}-50 shadow-sm`}
                                >
                                  <span className="text-xl">{cuisine.emoji}</span>
                                  <span className="font-medium text-gray-700">{cuisine.name}</span>
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                      <Check className={`w-5 h-5 text-${getColor()}-500`} />
                                    </div>
                                  )}
                                  <div className="absolute top-0 right-0">
                                    <div className="w-5 h-5 transform rotate-45 translate-x-2 -translate-y-2 bg-amber-400">
                                      <div className="absolute inset-0 flex items-center justify-center transform -rotate-45 -translate-x-2 translate-y-2">
                                        <Star className="w-2 h-2 text-white" />
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                      
                      {/* View All Cuisine Types button - Now directly below Popular Cuisines */}
                      <div className="mt-4">
                        <button
                          type="button"
                          className={`w-full py-3 px-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center gap-2 text-sm font-medium text-${getColor()}-600 hover:bg-${getColor()}-50 bg-white`}
                          onClick={() => setShowAllCuisinesModal(true)}
                        >
                          <Plus className="w-4 h-4" />
                          View All Cuisine Types
                        </button>
                      </div>
                      
                      {/* Warning Message */}
                      {selectedCuisines.length === 0 && (
                        <div className={`mt-4 px-4 py-2 bg-${getColor()}-50 border border-${getColor()}-200 rounded-lg text-${getColor()}-600 text-sm font-medium flex items-center gap-2`}>
                          <AlertTriangle className="w-4 h-4" />
                          Please select at least one cuisine to continue
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentTab === 'dietary' && (
            <motion.div
              key="dietary-tab"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabContentVariants}
              className="absolute w-full"
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {DIETARY_RESTRICTIONS.map((restriction) => {
                  const isSelected = dietaryRestrictions.includes(restriction.id);
                  return (
                    <button
                      key={restriction.id}
                      onClick={() => {
                        if (isSelected) {
                          setDietaryRestrictions(dietaryRestrictions.filter(id => id !== restriction.id));
                        } else {
                          setDietaryRestrictions([...dietaryRestrictions, restriction.id]);
                        }
                      }}
                      className={`relative py-3 px-4 rounded-xl border ${
                        isSelected
                          ? `border-${getColor()}-300 bg-${getColor()}-50`
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      } flex items-center justify-between ${
                        // Add a subtle animation when initially loaded from profile
                        isSelected && dietaryRestrictions.length > 0 ? 'transition-all duration-300' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{restriction.emoji}</span>
                        <span className={`font-medium ${
                          isSelected ? `text-${getColor()}-700` : 'text-gray-700'
                        }`}>{restriction.name}</span>
                      </div>
                      
                      {isSelected && (
                        <div className={`rounded-full p-1 bg-${getColor()}-200 text-${getColor()}-700`}>
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {dietaryRestrictions.length > 0 && (
                <div className="mt-4 flex justify-between items-center bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Info className="w-4 h-4 text-gray-400" />
                    <div>
                      <span>{dietaryRestrictions.length} dietary restriction{dietaryRestrictions.length !== 1 ? 's' : ''} selected</span>
                      <span className="text-xs ml-1 text-gray-400">(from your profile)</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCurrentTab('cuisine');
                      }}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg text-${getColor()}-600 border border-${getColor()}-200 hover:bg-${getColor()}-50`}
                    >
                      View Cuisines
                    </button>
                    <button
                      onClick={() => setDietaryRestrictions([])}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg text-${getColor()}-600 bg-${getColor()}-50 hover:bg-${getColor()}-100 flex items-center gap-1`}
                    >
                      <X className="w-3 h-3" />
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* All Cuisines Modal */}
      <AllCuisinesModal 
        isOpen={showAllCuisinesModal}
        onClose={() => setShowAllCuisinesModal(false)}
        cuisines={cuisines}
        selectedCuisines={selectedCuisines}
        setSelectedCuisines={setSelectedCuisines}
        foodMode={foodMode}
      />

      {/* Selected Cuisines Modal with AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {showSelectedCuisinesModal && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <motion.div 
              ref={modalRef}
              className="bg-white rounded-xl p-5 shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col m-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                type: "tween", 
                duration: 0.15,
                ease: "easeOut"
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold text-${getColor()}-600`}>
                  Selected Cuisines ({selectedCuisines.length})
                </h3>
                <button
                  type="button"
                  onClick={handleDone}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1">
                {selectedCuisineObjects.length > 0 ? (
                  <div className="p-1">
                    {/* Fixed height container to maintain consistent size */}
                    <div className="h-[140px] min-h-[140px]">
                      <div className="grid grid-cols-2 gap-2 h-full relative">
                        {/* Pre-render grid layout with placeholders */}
                        {[...Array(6)].map((_, index) => (
                          <div 
                            key={`grid-cell-${index}`} 
                            className="h-[40px] rounded-xl"
                          />
                        ))}
                        
                        {/* Absolutely position the cuisine items for smoother animation */}
                        <AnimatePresence>
                          {/* Calculate current page items once */}
                          {(() => {
                            const currentPageItems = selectedCuisineObjects.slice(
                              selectedCuisinesPage * 6, 
                              (selectedCuisinesPage * 6) + 6
                            );
                            
                            return currentPageItems.map((cuisine, index) => {
                              // Calculate grid position
                              const row = Math.floor(index / 2);
                              const col = index % 2;
                              
                              return (
                                <motion.div
                                  key={cuisine.id}
                                  className={`bg-${getColor()}-50 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-${getColor()}-100 h-[40px] absolute`}
                                  style={{
                                    top: `${row * (40 + 8)}px`, // height + gap
                                    left: col === 0 ? 0 : 'calc(50% + 4px)', // Left or right column
                                    right: col === 1 ? 0 : 'auto', // Set right for right column
                                    width: 'calc(50% - 4px)' // Half width minus half the gap
                                  }}
                                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  transition={{
                                    type: "spring",
                                    damping: 20,
                                    stiffness: 300,
                                    duration: 0.2
                                  }}
                                >
                                  <span className="text-lg">{cuisine.emoji}</span>
                                  <span className={`font-medium text-${getColor()}-700 flex-1 truncate`}>{cuisine.name}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent event bubbling
                                      handleRemoveCuisine(cuisine.id);
                                    }}
                                    className={`ml-1 rounded-full p-1 text-${getColor()}-400 hover:text-${getColor()}-600 hover:bg-${getColor()}-200/70 flex-shrink-0`}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </motion.div>
                              );
                            });
                          })()}
                          
                          {/* Add placeholder items with fixed positions */}
                          {(() => {
                            const currentPageLength = selectedCuisineObjects.slice(
                              selectedCuisinesPage * 6, 
                              (selectedCuisinesPage * 6) + 6
                            ).length;
                            
                            return Array.from({
                              length: Math.max(0, 6 - currentPageLength)
                            }).map((_, index) => {
                              const position = currentPageLength + index;
                              const row = Math.floor(position / 2);
                              const col = position % 2;
                              
                              return (
                                <motion.div 
                                  key={`placeholder-${index}`}
                                  className="h-[40px] rounded-xl border border-gray-100 bg-gray-50/50 absolute"
                                  style={{
                                    top: `${row * (40 + 8)}px`, // height + gap
                                    left: col === 0 ? 0 : 'calc(50% + 4px)',
                                    right: col === 1 ? 0 : 'auto',
                                    width: 'calc(50% - 4px)'
                                  }}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                />
                              );
                            });
                          })()}
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    {/* Pagination controls */}
                    {selectedCuisineObjects.length > 6 && (
                      <div className="flex justify-between items-center mt-4">
                        <button
                          type="button"
                          onClick={() => setSelectedCuisinesPage(prev => Math.max(0, prev - 1))}
                          disabled={selectedCuisinesPage === 0}
                          className={`p-1.5 rounded-full ${selectedCuisinesPage === 0 ? 'text-gray-300' : `text-${getColor()}-500 hover:bg-${getColor()}-50`}`}
                        >
                          <ChevronRight className="w-5 h-5 transform rotate-180" />
                        </button>
                        <div className="text-sm text-gray-500">
                          Page {selectedCuisinesPage + 1} of {Math.ceil(selectedCuisineObjects.length / 6)}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCuisinesPage(prev => Math.min(Math.ceil(selectedCuisineObjects.length / 6) - 1, prev + 1))}
                          disabled={selectedCuisinesPage >= Math.ceil(selectedCuisineObjects.length / 6) - 1}
                          className={`p-1.5 rounded-full ${selectedCuisinesPage >= Math.ceil(selectedCuisineObjects.length / 6) - 1 ? 'text-gray-300' : `text-${getColor()}-500 hover:bg-${getColor()}-50`}`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[140px] text-gray-500">
                    No cuisines selected
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className={`px-3 py-1.5 mr-2 rounded-lg text-${getColor()}-600 bg-${getColor()}-50 hover:bg-${getColor()}-100 text-sm font-medium flex items-center gap-1.5`}
                >
                  <X className="w-3.5 h-3.5" />
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={handleDone}
                  className={`px-4 py-2 rounded-lg bg-${getColor()}-500 text-white hover:bg-${getColor()}-600 text-sm font-medium`}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 