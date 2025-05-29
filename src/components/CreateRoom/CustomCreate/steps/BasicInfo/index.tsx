import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageSquare, DollarSign, MapPin, UtensilsCrossed, ChefHat, Clock, AlertTriangle, Info } from 'lucide-react';
import { RoomNameInput } from './RoomNameInput';
import { FoodModeSelector } from './FoodModeSelector';
import { CuisineSelector } from './CuisineSelector';
import { DiningModeContent } from './DiningModeContent';
import { CookingModeContent } from './CookingModeContent';
import { FoodMode } from './constants';
import { StepBasicInfoProps } from './types';
import { SectionCard } from './SectionCard';
import { useAppStore } from '../../../../../lib/store';
import { supabase } from '../../../../../lib/supabase';

export function StepBasicInfo({
  roomName,
  setRoomName,
  selectedCuisines,
  setSelectedCuisines,
  priceRange,
  setPriceRange,
  radius,
  setRadius,
  isLoading,
  foodMode: externalFoodMode,
  setFoodMode: setExternalFoodMode,
  completedSections: externalCompletedSections,
  setCompletedSections: setExternalCompletedSections
}: StepBasicInfoProps) {
  // Use internal or external food mode state - start with no selection
  const [internalFoodMode, setInternalFoodMode] = useState<FoodMode | null>(null);
  const [isModeChanging, setIsModeChanging] = useState(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [recipeDifficulty, setRecipeDifficulty] = useState<'easy' | 'medium' | 'challenging' | ''>('');
  const [cookingTime, setCookingTime] = useState<number>(30);
  const { auth } = useAppStore();
  
  // Track completion status for each section - use external state if provided, otherwise use internal state
  const [internalCompletedSections, setInternalCompletedSections] = useState<{
    foodMode: boolean;
    diningOptions: boolean;
    cuisineTypes: boolean;
    cookingOptions: boolean;
  }>({
    foodMode: false,
    diningOptions: false,
    cuisineTypes: false,
    cookingOptions: false
  });
  
  // Control which sections are open - Defined here BEFORE any useEffect that might reference it
  const [openSections, setOpenSections] = useState<{
    foodMode: boolean;
    diningOptions: boolean;
    cuisineTypes: boolean;
    cookingOptions: boolean;
  }>({
    foodMode: false,
    diningOptions: false,
    cuisineTypes: false,
    cookingOptions: false
  });
  
  // Setup a flag to track if we should trigger the dietary tab switch
  const shouldTriggerDietaryTabRef = useRef(false);
  // Track previous values to prevent unnecessary state updates
  const prevPriceRangeRef = useRef(priceRange);
  const prevSelectedCuisinesRef = useRef(selectedCuisines);
  const prevRecipeDifficultyRef = useRef(recipeDifficulty);

  // Load user's dietary preferences when component mounts
  useEffect(() => {
    const loadUserDietaryPreferences = async () => {
      if (!auth.user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('dietary_preferences')
          .eq('id', auth.user.id)
          .single();
          
        if (error) {
          console.error('Error loading dietary preferences:', error);
          return;
        }
        
        if (data && data.dietary_preferences && data.dietary_preferences.diets) {
          // Map profile dietary preferences to match the format used in this component
          const userDietaryRestrictions = data.dietary_preferences.diets || [];
          
          // Only set if there are actually preferences to load
          if (userDietaryRestrictions.length > 0) {
            setDietaryRestrictions(userDietaryRestrictions);
            console.log('Loaded user dietary preferences:', userDietaryRestrictions);
            // Set flag to trigger tab switch after openSections is established
            shouldTriggerDietaryTabRef.current = true;
          }
        }
      } catch (err) {
        console.error('Error loading user dietary preferences:', err);
      }
    };
    
    loadUserDietaryPreferences();
  }, [auth.user]);

  // Use either external or internal completion state
  const completedSections = externalCompletedSections || internalCompletedSections;
  
  // Combined setter for completion status - updates both internal and external state
  const updateCompletedSections = useCallback((updatedSections: typeof completedSections) => {
    setInternalCompletedSections(updatedSections);
    if (setExternalCompletedSections) {
      setExternalCompletedSections(updatedSections);
    }
  }, [setExternalCompletedSections]);
  
  // Determine which foodMode to use (internal or external)
  const foodMode = externalFoodMode || internalFoodMode;
  
  // Check if room name is valid to enable food mode section
  const isRoomNameValid = roomName.trim().length >= 3;

  // Safe effect for tab switching after everything is initialized
  useEffect(() => {
    // Check if we need to trigger tab switch and if the cuisine section is open
    if (shouldTriggerDietaryTabRef.current && 
        dietaryRestrictions.length > 0 && 
        openSections.cuisineTypes) {
      // Reset flag
      shouldTriggerDietaryTabRef.current = false;
      
      // Send event to switch tabs
      setTimeout(() => {
        const event = new CustomEvent('tabletalk:navigateToDietaryTab');
        window.dispatchEvent(event);
      }, 300);
    }
  }, [dietaryRestrictions.length, openSections.cuisineTypes]);
  
  // Auto-open food mode selection when room name is valid
  useEffect(() => {
    if (isRoomNameValid && !openSections.foodMode && !foodMode) {
      setOpenSections(prev => ({
        ...prev,
        foodMode: true
      }));
    }
  }, [isRoomNameValid, openSections.foodMode, foodMode]);
  
  // Update both internal and external state when food mode changes
  const handleFoodModeChange = (mode: FoodMode | null) => {
    // If user selected the same mode again, unselect it
    if (mode === foodMode) {
      setInternalFoodMode(null);
      if (setExternalFoodMode) {
        setExternalFoodMode(null);
      }
      
      // Mark food mode section as incomplete
      updateCompletedSections({
        ...completedSections,
        foodMode: false,
        // Also mark dependent sections as incomplete
        diningOptions: false,
        cuisineTypes: false,
        cookingOptions: false
      });
      
      return;
    }
    
    setIsModeChanging(true);
    
    // Always update the mode first for immediate feedback
    setInternalFoodMode(mode);
    if (setExternalFoodMode) {
      setExternalFoodMode(mode);
    }
    
    // Mark food mode section as completed
    updateCompletedSections({
      ...completedSections,
      foodMode: !!mode
    });
    
    // Close food mode section and open appropriate section based on selected mode
    setTimeout(() => {
      setOpenSections(prev => {
        // Start with all sections closed
        let updatedSections = {
          foodMode: false,
          diningOptions: false,
          cuisineTypes: false,
          cookingOptions: false
        };
        
        // Open specific section based on the mode
        if (mode === 'dining-out') {
          updatedSections.diningOptions = true;
        } else if (mode === 'cooking') {
          updatedSections.cookingOptions = true;
        } else if (mode === 'both') {
          updatedSections.diningOptions = true;
        }
        
        return updatedSections;
      });
      
      setIsModeChanging(false);
    }, 500);
  };
  
  // Update completion status when dining options are set
  useEffect(() => {
    // Skip if the price range hasn't changed
    if (prevPriceRangeRef.current === priceRange) return;
    prevPriceRangeRef.current = priceRange;
    
    // Mark dining options as complete only when price range is selected
    // AND a food mode is selected that requires dining options
    const isDiningOptionsComplete = priceRange.length > 0 && 
      (foodMode === 'dining-out' || foodMode === 'both');
    
    updateCompletedSections(prev => ({
      ...prev,
      diningOptions: isDiningOptionsComplete
    }));
    
    // After a delay, open the cuisine section if dining options are complete
    if (isDiningOptionsComplete && !openSections.cuisineTypes && (foodMode === 'dining-out' || foodMode === 'both')) {
      setTimeout(() => {
        setOpenSections(prev => ({
          ...prev,
          cuisineTypes: true
        }));
      }, 500);
    }
  }, [priceRange, foodMode, openSections.cuisineTypes, updateCompletedSections]);
  
  // Update completion status when cuisines are selected
  useEffect(() => {
    // Skip if the selected cuisines haven't changed
    if (prevSelectedCuisinesRef.current === selectedCuisines) return;
    prevSelectedCuisinesRef.current = selectedCuisines;
    
    const isCuisineComplete = selectedCuisines.length > 0;
    
    updateCompletedSections(prev => ({
      ...prev,
      cuisineTypes: isCuisineComplete
    }));
    
    // If cooking options section should be next (only for "both" mode), open it after cuisines are selected
    if (isCuisineComplete && foodMode === 'both' && !openSections.cookingOptions) {
      setTimeout(() => {
        setOpenSections(prev => ({
          ...prev,
          cookingOptions: true
        }));
      }, 500);
    }
  }, [selectedCuisines, foodMode, openSections.cookingOptions, updateCompletedSections]);
  
  // Update completion status when cooking options are changed
  useEffect(() => {
    // Skip if recipe difficulty hasn't changed
    if (prevRecipeDifficultyRef.current === recipeDifficulty) return;
    prevRecipeDifficultyRef.current = recipeDifficulty;
    
    // Only consider recipe difficulty for completion status 
    // (any difficulty selection = complete, no selection = incomplete)
    const isCookingOptionsComplete = recipeDifficulty !== '';
    
    updateCompletedSections(prev => ({
      ...prev,
      cookingOptions: isCookingOptionsComplete
    }));
  }, [recipeDifficulty, updateCompletedSections]);

  // Check if a section should be disabled based on food mode and completion status
  const isSectionDisabled = (sectionName: string): boolean => {
    if (!foodMode) return sectionName !== 'foodMode';
    
    switch (sectionName) {
      case 'foodMode':
        return !isRoomNameValid; // Disable food mode if room name is not valid
      case 'diningOptions':
        return !(foodMode === 'dining-out' || foodMode === 'both'); // Only for dining-out or both modes
      case 'cuisineTypes':
        return !(foodMode === 'dining-out' || foodMode === 'both'); // Only for dining-out or both modes, no need to complete dining options first
      case 'cookingOptions':
        return !(foodMode === 'cooking' || foodMode === 'both'); // Only for cooking or both modes
      default:
        return false;
    }
  };

  // Check if a section should be highlighted
  const isSectionHighlighted = (sectionName: string): boolean => {
    if (!foodMode) return sectionName === 'foodMode' && isRoomNameValid;
    
    switch (sectionName) {
      case 'foodMode':
        return !completedSections.foodMode;
      case 'diningOptions':
        return completedSections.foodMode && !completedSections.diningOptions && 
               (foodMode === 'dining-out' || foodMode === 'both');
      case 'cuisineTypes':
        // Only highlight cuisines if dining options are complete
        return completedSections.foodMode && completedSections.diningOptions && 
               !completedSections.cuisineTypes && (foodMode === 'dining-out' || foodMode === 'both');
      case 'cookingOptions':
        return ((foodMode === 'cooking' && completedSections.foodMode) || 
               (foodMode === 'both' && completedSections.cuisineTypes)) && 
               !completedSections.cookingOptions;
      default:
        return false;
    }
  };

  // Check if a section needs warning message displayed
  const showSectionWarning = (sectionName: string): boolean => {
    // Only show warning for sections that are open, relevant to current mode, and incomplete
    if (!openSections[sectionName as keyof typeof openSections]) return false;
    
    switch (sectionName) {
      case 'foodMode':
        return !isRoomNameValid ? false : !foodMode && openSections.foodMode;
      case 'diningOptions':
        return (foodMode === 'dining-out' || foodMode === 'both') && 
               !completedSections.diningOptions && openSections.diningOptions;
      case 'cuisineTypes':
        return completedSections.diningOptions && !completedSections.cuisineTypes && 
               (foodMode === 'dining-out' || foodMode === 'both') && openSections.cuisineTypes;
      case 'cookingOptions':
        return ((foodMode === 'cooking' && completedSections.foodMode) || 
                (foodMode === 'both' && completedSections.cuisineTypes)) && 
                !completedSections.cookingOptions && openSections.cookingOptions;
      default:
        return false;
    }
  };

  // Memoize onToggle handlers to prevent infinite update loop
  const handleFoodModeToggle = useCallback((isOpen) => setOpenSections(prev => ({ ...prev, foodMode: isOpen })), []);
  const handleDiningOptionsToggle = useCallback((isOpen) => setOpenSections(prev => ({ ...prev, diningOptions: isOpen })), []);
  const handleCuisineTypesToggle = useCallback((isOpen) => setOpenSections(prev => ({ ...prev, cuisineTypes: isOpen })), []);
  const handleCookingOptionsToggle = useCallback((isOpen) => setOpenSections(prev => ({ ...prev, cookingOptions: isOpen })), []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Room Name Input (Always visible, not collapsible) */}
      <RoomNameInput 
        roomName={roomName}
        setRoomName={setRoomName}
        foodMode={foodMode || 'neutral'} 
        isLoading={isLoading}
      />

      {/* Food Mode Selection Section - Only show when room name is valid */}
      {isRoomNameValid && (
        <SectionCard 
          title="What are you deciding on?" 
          icon={<MessageSquare />} 
          foodMode={foodMode || 'neutral'}
          defaultOpen={openSections.foodMode}
          highlighted={isRoomNameValid && isSectionHighlighted('foodMode')}
          completed={completedSections.foodMode}
          disabled={isSectionDisabled('foodMode')}
          onToggle={handleFoodModeToggle}
          titleColor="text-white" // White text for better contrast when open
        >
          <FoodModeSelector 
            foodMode={foodMode}
            handleFoodModeChange={handleFoodModeChange}
            isLoading={isLoading}
          />
          {isRoomNameValid && showSectionWarning('foodMode') && (
            <div className="mt-4 flex justify-center">
              <div className={`flex items-center gap-3 p-3.5 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/30 backdrop-blur-sm shadow-sm w-full max-w-md`}>
                <div className={`p-1.5 rounded-full bg-blue-100/80 text-blue-600`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium text-blue-700`}>
                    Select your dining experience
                  </p>
                  <p className={`text-xs text-blue-600/80`}>
                    Choose how you'd like to enjoy your meal
                  </p>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* Only show a message when room name is not valid */}
      {!isRoomNameValid && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-3 p-3.5 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/30 backdrop-blur-sm shadow-sm w-full max-w-md">
            <div className="p-1.5 rounded-full bg-slate-100/80 text-slate-600">
              <Info className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">
                Name your room first
              </p>
              <p className="text-xs text-slate-600/80">
                Enter a room name to get started
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Only show the additional sections if a food mode is selected */}
      {foodMode && (
        <>
          {/* Cooking Options Section - Only show for cooking and both modes */}
          {(foodMode === 'cooking' || foodMode === 'both') && (
            <SectionCard 
              key="cooking-options-card"
              title="Cooking Options" 
              icon={<ChefHat />} 
              foodMode={foodMode}
              defaultOpen={openSections.cookingOptions}
              completed={completedSections.cookingOptions}
              highlighted={isSectionHighlighted('cookingOptions')}
              disabled={isSectionDisabled('cookingOptions')}
              className="mt-6"
              onToggle={handleCookingOptionsToggle}
              titleColor="text-white" // White text for better contrast when open
            >
              <CookingModeContent
                recipeDifficulty={recipeDifficulty}
                setRecipeDifficulty={setRecipeDifficulty}
                cookingTime={cookingTime}
                setCookingTime={setCookingTime}
                isLoading={isLoading}
                foodMode={foodMode}
              />
            </SectionCard>
          )}

          {/* Dining Mode Section: Price Range & Search Radius - Show for dining-out and both modes */}
          {(foodMode === 'dining-out' || foodMode === 'both') && (
            <SectionCard 
              key="dining-options-card"
              title="Dining Options" 
              icon={<UtensilsCrossed />} 
              foodMode={foodMode}
              defaultOpen={openSections.diningOptions}
              completed={completedSections.diningOptions}
              highlighted={isSectionHighlighted('diningOptions')}
              disabled={isSectionDisabled('diningOptions')}
              className="mt-6"
              onToggle={handleDiningOptionsToggle}
              titleColor="text-white" // White text for better contrast when open
            >
              <DiningModeContent
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                radius={radius}
                setRadius={setRadius}
                foodMode={foodMode}
                isLoading={isLoading}
              />
            </SectionCard>
          )}
          
          {/* Restaurant Cuisine Types Section - Only show for dining-out and both modes */}
          {(foodMode === 'dining-out' || foodMode === 'both') && (
            <SectionCard 
              key="cuisine-card-dining"
              title="Restaurant Cuisine Types" 
              icon={<UtensilsCrossed />} 
              foodMode={foodMode}
              defaultOpen={openSections.cuisineTypes}
              completed={completedSections.cuisineTypes}
              highlighted={isSectionHighlighted('cuisineTypes')}
              disabled={isSectionDisabled('cuisineTypes')}
              className="mt-6"
              onToggle={handleCuisineTypesToggle}
              titleColor="text-white" // White text for better contrast when open
            >
              <CuisineSelector 
                selectedCuisines={selectedCuisines}
                setSelectedCuisines={setSelectedCuisines}
                foodMode={foodMode}
                isLoading={isLoading}
                dietaryRestrictions={dietaryRestrictions}
                setDietaryRestrictions={setDietaryRestrictions}
              />
              {showSectionWarning('cuisineTypes') && (
                <div className="mt-4 flex justify-center">
                  <div className={`flex items-center gap-3 p-3.5 rounded-lg border border-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-200 bg-gradient-to-r from-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-50 to-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-100/30 backdrop-blur-sm shadow-sm w-full max-w-md`}>
                    <div className={`p-1.5 rounded-full bg-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-100/80 text-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-600`}>
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium text-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-700`}>
                        Cuisine selection needed
                      </p>
                      <p className={`text-xs text-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-600/80`}>
                        Select at least one cuisine type to proceed
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
} 