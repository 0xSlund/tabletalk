import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Loader2, Info, ChevronLeft, ChevronRight, CheckCircle2, ArrowLeft, Heart, UserCog, UserRoundPlus, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fadeVariants } from '../../PageTransition';
import BackButton from '../../BackButton';
import { StepContent } from './StepContent';
import { steps, getStepByUrlSegment, getUrlSegmentByStepNumber } from './constants';
import { cn } from '../../../lib/utils';

interface CustomCreateProps {
  roomName: string;
  setRoomName: (name: string) => void;
  selectedCuisines: string[];
  setSelectedCuisines: (cuisines: string[]) => void;
  priceRange: string[];
  setPriceRange: (range: string[]) => void;
  radius: number;
  setRadius: (radius: number) => void;
  participantLimit: number | null;
  setParticipantLimit: (limit: number | null) => void;
  timerOption: string;
  handleTimerOptionChange: (value: string) => void;
  customDuration: string;
  setCustomDuration: (duration: string) => void;
  durationUnit: 'minutes' | 'hours';
  setDurationUnit: (unit: 'minutes' | 'hours') => void;
  deadline: string;
  setDeadline: (deadline: string) => void;
  reminders: boolean;
  setReminders: (enabled: boolean) => void;
  selectedContacts: string[];
  toggleContact: (contactId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showContactSearch: boolean;
  setShowContactSearch: (show: boolean) => void;
  filteredContacts: any[];
  saveAsTemplate: boolean;
  setSaveAsTemplate: (save: boolean) => void;
  templateName: string;
  setTemplateName: (name: string) => void;
  loading: boolean;
  handleCreateRoom: (e: React.FormEvent) => Promise<any | null>;
  onBack?: () => void;
  foodMode: string | null;
  setFoodMode: (mode: string | null) => void;
  initialStep?: 'basic-info' | 'settings' | 'summary';
}

// Helper function to validate each step
const validateStep = (
  step: number, 
  { roomName, selectedCuisines, priceRange, foodMode, completedSections, settingsCompletion }: { 
    roomName: string;
    selectedCuisines: string[];
    priceRange: string[];
    foodMode: string | null;
    completedSections: {
      foodMode: boolean;
      diningOptions: boolean;
      cuisineTypes: boolean;
      cookingOptions: boolean;
    };
    settingsCompletion: {
      participantAccess: boolean;
      decisionTimer: boolean;
      deadlineNotifications: boolean;
    };
  }
) => {
  switch (step) {
    case 1:
      // Basic info validation
      // Require room name
      if (!roomName.trim()) return false;
      
      // Require food mode
      if (!foodMode) return false;
      
      // For cooking mode, require cooking options to be completed
      if (foodMode === 'cooking' && !completedSections.cookingOptions) return false;
      
      // For dining-out mode, require dining options and cuisine types to be completed
      if (foodMode === 'dining-out' && (!completedSections.diningOptions || !completedSections.cuisineTypes)) return false;
      
      // For both mode, require all sections to be completed
      if (foodMode === 'both' && (!completedSections.diningOptions || !completedSections.cuisineTypes || !completedSections.cookingOptions)) return false;
      
      return true;
    case 2:
      // Settings validation - require all three sections to be completed
      return settingsCompletion.participantAccess && 
             settingsCompletion.decisionTimer && 
             settingsCompletion.deadlineNotifications;
    case 3:
      // Invite validation
      return true;
    default:
      return false;
  }
};

// Helper function to check if a step is complete
const isStepComplete = (
  step: number,
  { roomName, selectedCuisines, priceRange }: {
    roomName: string;
    selectedCuisines: string[];
    priceRange: string[];
  }
) => {
  switch (step) {
    case 1:
      return roomName.trim().length > 0;
    case 2:
      return true; // Timer settings always have defaults
    case 3:
      return true; // Contacts are optional
    default:
      return false;
  }
};

export function CustomCreate({
  roomName,
  setRoomName,
  selectedCuisines,
  setSelectedCuisines,
  priceRange,
  setPriceRange,
  radius,
  setRadius,
  participantLimit,
  setParticipantLimit,
  timerOption,
  handleTimerOptionChange,
  customDuration,
  setCustomDuration,
  durationUnit,
  setDurationUnit,
  deadline,
  setDeadline,
  reminders,
  setReminders,
  selectedContacts,
  toggleContact,
  searchTerm,
  setSearchTerm,
  showContactSearch,
  setShowContactSearch,
  filteredContacts,
  saveAsTemplate,
  setSaveAsTemplate,
  templateName,
  setTemplateName,
  loading,
  handleCreateRoom,
  onBack,
  foodMode: parentFoodMode,
  setFoodMode: setParentFoodMode,
  initialStep
}: CustomCreateProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Helper function to convert step number to URL segment
  const stepToUrlSegment = (step: number): string => {
    return getUrlSegmentByStepNumber(step);
  };

  // Helper function to convert URL segment to step number
  const urlSegmentToStep = (segment: string): number => {
    const step = getStepByUrlSegment(segment);
    return step ? steps.indexOf(step) + 1 : 1;
  };

  // Initialize current step based on URL or initialStep prop
  const getInitialStep = (): number => {
    if (initialStep) {
      return urlSegmentToStep(initialStep);
    }
    
    // Check current URL path
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    if (['basic-info', 'settings', 'summary'].includes(lastSegment)) {
      return urlSegmentToStep(lastSegment);
    }
    
    return 1; // Default to basic-info
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep());
  const [showTooltip, setShowTooltip] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [animateError, setAnimateError] = useState(false);
  const [direction, setDirection] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [foodMode, setFoodMode] = useState<string | null>(() => {
    // Initialize with parent value if available, otherwise null
    return parentFoodMode || null;
  });
  const [hasReachedSummary, setHasReachedSummary] = useState(false);
  const [completedSections, setCompletedSections] = useState({
    foodMode: false,
    diningOptions: false,
    cuisineTypes: false,
    cookingOptions: false
  });

  // Track settings step completion status
  const [settingsCompletion, setSettingsCompletion] = useState({
    participantAccess: false,
    decisionTimer: false,
    deadlineNotifications: false
  });

  // Access control state for participant settings
  const [accessControl, setAccessControl] = useState<boolean | null>(null);

  // Selected meals state for deadline presets
  const [selectedMeals, setSelectedMeals] = useState<any>(null);

  // Handle settings completion updates from StepSettings
  const handleSettingsCompletionChange = (completion: {
    participantAccess: boolean;
    decisionTimer: boolean;
    deadlineNotifications: boolean;
  }) => {
    setSettingsCompletion(completion);
  };

  // Handle URL synchronization on mount and when URL changes externally (browser back/forward)
  useEffect(() => {
    // Handle base URL redirect on mount
    if (location.pathname === '/create/custom') {
      navigate('/create/custom/basic-info', { replace: true });
      return;
    }

    // Handle invalid step URLs
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    if (location.pathname.includes('/create/custom/') && 
        !['basic-info', 'settings', 'summary'].includes(lastSegment)) {
      navigate('/create/custom/basic-info', { replace: true });
      return;
    }

    // Sync step with URL only for external navigation (browser back/forward)
    if (['basic-info', 'settings', 'summary'].includes(lastSegment)) {
      const urlStep = urlSegmentToStep(lastSegment);
      if (urlStep !== currentStep && urlStep >= 1 && urlStep <= steps.length) {
        setDirection(urlStep < currentStep ? -1 : 1);
        setCurrentStep(urlStep);
        
        // Track if user has reached the summary step
        if (urlStep === 3) {
          setHasReachedSummary(true);
        }
      }
    }
  }, [location.pathname]); // Only respond to URL changes

  // Sync local foodMode with parent foodMode - avoid circular updates with debounce
  useEffect(() => {
    // Only sync from parent to local if they're truly different
    // Use strict comparison and handle null/undefined cases
    const normalizedParent = parentFoodMode || null;
    const normalizedLocal = foodMode || null;
    
    if (normalizedParent !== normalizedLocal) {
      // Use a timeout to debounce rapid changes
      const timeoutId = setTimeout(() => {
        setFoodMode(normalizedParent);
      }, 10); // Very short delay to debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [parentFoodMode]); // Don't include foodMode in deps to avoid circular updates

  useEffect(() => {
    // Only sync from local to parent if they're truly different and we have a setter
    const normalizedParent = parentFoodMode || null;
    const normalizedLocal = foodMode || null;
    
    if (normalizedLocal !== normalizedParent && setParentFoodMode) {
      // Use a timeout to debounce rapid changes
      const timeoutId = setTimeout(() => {
        setParentFoodMode(normalizedLocal);
      }, 10); // Very short delay to debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [foodMode]); // Don't include parentFoodMode in deps to avoid circular updates

  // Add bottom padding to the body to prevent navbar overlap
  useEffect(() => {
    // Add padding bottom to the body
    document.body.classList.add('pb-24');
    
    // Clean up when component unmounts
    return () => {
      document.body.classList.remove('pb-24');
    };
  }, []);

  // Check if the current step is valid
  const isCurrentStepValid = useMemo(() => {
    return validateStep(
      currentStep, 
      { 
        roomName,
        selectedCuisines,
        priceRange,
        foodMode,
        completedSections,
        settingsCompletion
      }
    );
  }, [currentStep, roomName, selectedCuisines, priceRange, foodMode, completedSections, settingsCompletion]);

  // Replace the useEffect that updates completedSteps with a safer version
  useEffect(() => {
    // Compute new completed steps from scratch
    const newCompletedSteps: number[] = [];
    for (let stepNum = 1; stepNum <= steps.length; stepNum++) {
      if (isStepComplete(stepNum, { roomName, selectedCuisines, priceRange })) {
        newCompletedSteps.push(stepNum);
      }
    }
    // Only update state if the value actually changes
    setCompletedSteps(prev => {
      if (prev.length === newCompletedSteps.length && prev.every((v, i) => v === newCompletedSteps[i])) {
        return prev;
      }
      return newCompletedSteps;
    });
  }, [roomName, selectedCuisines, priceRange]);

  // Reset validation error when step changes
  useEffect(() => {
    setValidationError(null);
  }, [currentStep]);

  // Form state tracking for development
  // Removed console.log to prevent excessive output and potential performance issues

  // Handle navigation to specific step
  const handleNavigateToStep = (step: number) => {
    if (step >= 1 && step <= steps.length) {
      // Allow navigation to step 1 (basic info) at any time
      // Allow navigation to other steps if user has reached the summary or if going to a completed step
      const canNavigate = step === 1 || hasReachedSummary || completedSteps.includes(step) || step <= currentStep;
      
      if (canNavigate) {
        setDirection(step < currentStep ? -1 : 1);
        
        // Update URL immediately for navigation
        const urlSegment = stepToUrlSegment(step);
        navigate(`/create/custom/${urlSegment}`, { replace: true });
        
        // Set step (this will be handled by URL sync effect)
        setCurrentStep(step);
        
        // Track if user has reached the summary step
        if (step === 3) {
          setHasReachedSummary(true);
        }
      }
    }
  };

  // Handle next step with validation
  const handleNextStep = () => {
    if (!isCurrentStepValid) {
      if (currentStep === 1 && !roomName.trim()) {
        setValidationError("Please enter a room name");
        setAnimateError(true);
        setTimeout(() => setAnimateError(false), 500);
        return;
      }
    }
    
    if (currentStep < steps.length) {
      const newStep = currentStep + 1;
      setDirection(1);
      
      // Update URL immediately
      const urlSegment = stepToUrlSegment(newStep);
      navigate(`/create/custom/${urlSegment}`, { replace: true });
      
      // Set step
      setCurrentStep(newStep);
      
      // Track if user has reached the summary step
      if (newStep === 3) {
        setHasReachedSummary(true);
      }
      
      // Scroll to top of the page smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setDirection(-1);
      
      // Update URL immediately
      const urlSegment = stepToUrlSegment(newStep);
      navigate(`/create/custom/${urlSegment}`, { replace: true });
      
      // Set step
      setCurrentStep(newStep);
      
      // Scroll to top of the page smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onBack) {
      // If we're at the first step and onBack is provided, call it
      onBack();
    }
  };

  // Scroll to top when step changes (backup for any other step changes)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Update document title based on current step
  useEffect(() => {
    const stepInfo = steps[currentStep - 1];
    if (stepInfo) {
      document.title = `Create Room - ${stepInfo.title} | TableTalk`;
    }
    
    // Cleanup: Reset title when component unmounts
    return () => {
      document.title = 'TableTalk';
    };
  }, [currentStep]);

  // Get step completion status for progress indicator
  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex) && stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  // Progress indicators
  const calculateProgress = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  // Get the appropriate icon for each step
  const getStepIcon = (stepIndex: number) => {
    switch (stepIndex) {
      case 1: return <Heart className="w-5 h-5" />;
      case 2: return <UserCog className="w-5 h-5" />;
      case 3: return <UserRoundPlus className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-6xl mx-auto px-4 py-6 pb-20 min-h-screen flex flex-col"
    >
      {/* Header with App Title */}
      <header className="bg-white backdrop-blur-md shadow-lg sticky top-0 z-20 rounded-2xl mb-6">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ 
                  rotate: [0, -10, 10, -5, 5, 0],
                  transition: { 
                    duration: 0.6, 
                    ease: "easeInOut",
                    delay: 0.5
                  }
                }}
                className="hidden sm:flex"
              >
                <UtensilsCrossed className="w-7 h-7 text-orange-500" />
              </motion.div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">
                Create Your Room
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Progress Indicator */}
        <div className="relative mb-8" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={steps.length} aria-label={`Step ${currentStep} of ${steps.length}: ${steps[currentStep - 1]?.title}`}>
          {/* Progress Background Bar */}
          <div className="w-full bg-gray-100 h-3 rounded-full mb-4 overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${
                foodMode === 'dining-out' 
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600' 
                  : foodMode === 'cooking' 
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-orange-500 to-red-500'
              }`}
              initial={{ width: `${calculateProgress()}%` }}
              animate={{ width: `${calculateProgress()}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Step Labels */}
          <div className="flex items-center justify-between text-center px-2">
            {steps.map((step, index) => {
              const status = getStepStatus(index + 1);
              const activeColor = 
                foodMode === 'dining-out' ? 'text-violet-500' : 
                foodMode === 'cooking' ? 'text-teal-500' : 
                'text-orange-500';
              
              const borderColor = 
                foodMode === 'dining-out' ? 'border-violet-500' : 
                foodMode === 'cooking' ? 'border-teal-500' : 
                'border-orange-500';
              
              const bgColor = 
                foodMode === 'dining-out' ? 'bg-violet-500' : 
                foodMode === 'cooking' ? 'bg-teal-500' : 
                'bg-orange-500';
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    // Allow navigation to completed steps and current step
                    if (status === 'completed' || status === 'current') {
                      handleNavigateToStep(index + 1);
                    }
                  }}
                  disabled={status === 'upcoming'}
                  className={cn(
                    "flex flex-col items-center transition-all duration-200",
                    status === 'completed' && `${activeColor} hover:scale-105`,
                    status === 'current' && "text-gray-900",
                    status === 'upcoming' && "text-gray-400 cursor-not-allowed",
                    (status === 'completed' || status === 'current') && "cursor-pointer hover:opacity-80"
                  )}
                >
                  <motion.div
                    animate={{ 
                      scale: status === 'current' ? 1.1 : 1,
                      y: status === 'current' ? -2 : 0 
                    }}
                    className="mb-1"
                  >
                    <div 
                      className={cn(
                        "rounded-full flex items-center justify-center transition-all",
                        status === 'completed' ? `${bgColor} text-white` : 
                        status === 'current' ? `bg-white border-2 ${borderColor} ${activeColor}` :
                        "bg-white border border-gray-300 text-gray-400"
                      )}
                      style={{ width: "32px", height: "32px" }}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        getStepIcon(index + 1)
                      )}
                    </div>
                  </motion.div>
                  <span className={cn(
                    "font-medium text-sm",
                    status === 'completed' && activeColor,
                    status === 'current' && "text-gray-900",
                    status === 'upcoming' && "text-gray-400"
                  )}>
                    Step {index + 1}: {step.title}
                  </span>
                  <span className="text-xs mt-0.5 hidden sm:block max-w-[150px]">
                    {step.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 mb-16">
          <StepContent
            currentStep={currentStep}
            roomName={roomName}
            setRoomName={setRoomName}
            selectedCuisines={selectedCuisines}
            setSelectedCuisines={setSelectedCuisines}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            radius={radius}
            setRadius={setRadius}
            participantLimit={participantLimit}
            setParticipantLimit={setParticipantLimit}
            timerOption={timerOption}
            handleTimerOptionChange={handleTimerOptionChange}
            customDuration={customDuration}
            setCustomDuration={setCustomDuration}
            durationUnit={durationUnit}
            setDurationUnit={setDurationUnit}
            deadline={deadline}
            setDeadline={setDeadline}
            reminders={reminders}
            setReminders={setReminders}
            selectedContacts={selectedContacts}
            toggleContact={toggleContact}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showContactSearch={showContactSearch}
            setShowContactSearch={setShowContactSearch}
            filteredContacts={filteredContacts}
            saveAsTemplate={saveAsTemplate}
            setSaveAsTemplate={setSaveAsTemplate}
            templateName={templateName}
            setTemplateName={setTemplateName}
            loading={loading}
            direction={direction}
            foodMode={foodMode}
            setFoodMode={setFoodMode}
            completedSections={completedSections}
            setCompletedSections={setCompletedSections}
            accessControl={accessControl}
            setAccessControl={setAccessControl}
            selectedMeals={selectedMeals}
            setSelectedMeals={setSelectedMeals}
            onSectionsCompletionChange={handleSettingsCompletionChange}
            onNavigateToStep={handleNavigateToStep}
          />
        </div>

        {/* Validation Error */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                x: animateError ? [-5, 5, -5, 5, 0] : 0
              }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.2,
                x: { duration: 0.4 }
              }}
              className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
            >
              <Info className="w-5 h-5" />
              {validationError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Navigation Buttons */}
        <div className="flex justify-between items-center bg-white shadow-xl p-4 border-t border-gray-100 rounded-xl sticky bottom-8 left-0 right-0 mt-auto z-20 mb-12">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ 
                scale: 1.05,
                y: -2,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              whileTap={{ 
                scale: 0.95,
                y: 0,
                transition: { duration: 0.1 }
              }}
              onClick={handlePreviousStep}
              className={`px-6 py-3 text-white font-medium rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-2xl relative overflow-hidden group ${
                foodMode === 'dining-out' 
                  ? 'bg-violet-500 hover:bg-violet-600' 
                  : foodMode === 'cooking' 
                  ? 'bg-teal-500 hover:bg-teal-600' 
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {/* Animated background gradient on hover */}
              <motion.div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  foodMode === 'dining-out' 
                    ? 'bg-gradient-to-r from-violet-600 to-purple-700' 
                    : foodMode === 'cooking' 
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-700' 
                    : 'bg-gradient-to-r from-orange-600 to-red-600'
                }`}
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
              
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                initial={{ x: '-100%', skewX: -15 }}
                whileHover={{ 
                  x: '200%',
                  transition: { duration: 0.6, ease: "easeInOut" }
                }}
              />
              
              <motion.div
                className="relative z-10"
                whileHover={{ x: -2 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.div>
              <span className="relative z-10">Back</span>
            </motion.button>
          </div>
          <div className="flex gap-3">
            {/* Show Summary Card only if user has completed all steps and gone back to edit */}
            {hasReachedSummary && currentStep < 3 && (
              <motion.button
                whileHover={{ 
                  scale: 1.08,
                  y: -3,
                  rotateY: 5,
                  transition: { duration: 0.25, ease: "easeOut" }
                }}
                whileTap={{ 
                  scale: 0.92,
                  y: 0,
                  rotateY: 0,
                  transition: { duration: 0.15 }
                }}
                onClick={() => handleNavigateToStep(3)}
                className="px-7 py-3.5 text-white font-semibold rounded-2xl flex items-center gap-2.5 transition-all duration-300 relative overflow-hidden group bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl border border-white/20"
                style={{
                  boxShadow: '0 8px 32px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                {/* Animated background glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-90"
                  initial={{ scale: 0.8, rotate: 0 }}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 180,
                    transition: { duration: 0.4, ease: "easeInOut" }
                  }}
                />
                
                {/* Pulse ring effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-white/30"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 0.3, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Multiple shimmer effects */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%', skewX: -20 }}
                  whileHover={{ 
                    x: '200%',
                    transition: { duration: 0.8, ease: "easeInOut" }
                  }}
                />
                
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%', skewX: 15 }}
                  whileHover={{ 
                    x: '200%',
                    transition: { duration: 1, delay: 0.2, ease: "easeInOut" }
                  }}
                />
                
                {/* Sparkles icon with enhanced animation */}
                <motion.div
                  className="relative z-10"
                  animate={{ 
                    rotate: [0, 15, -15, 8, -8, 0],
                    scale: [1, 1.1, 1, 1.05, 1],
                    transition: { 
                      duration: 3, 
                      repeat: Infinity,
                      repeatDelay: 2
                    }
                  }}
                  whileHover={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    transition: { duration: 0.6, ease: "easeInOut" }
                  }}
                >
                  <Sparkles className="w-5 h-5 drop-shadow-sm" />
                </motion.div>
                
                {/* Text with enhanced styling */}
                <motion.span 
                  className="relative z-10 tracking-wide drop-shadow-sm"
                  whileHover={{
                    textShadow: "0 0 8px rgba(255, 255, 255, 0.8)"
                  }}
                >
                  Go to Summary
                </motion.span>
                
                {/* Floating particles effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white/60 rounded-full"
                      style={{
                        left: `${20 + i * 10}%`,
                        top: `${30 + (i % 2) * 40}%`,
                      }}
                      animate={{
                        y: [-10, -20, -10],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </motion.div>
              </motion.button>
            )}
            {currentStep < steps.length ? (
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  y: -2,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                whileTap={{ 
                  scale: 0.95,
                  y: 0,
                  transition: { duration: 0.1 }
                }}
                onClick={handleNextStep}
                disabled={!isCurrentStepValid}
                className={`px-6 py-3 text-white font-medium rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-2xl relative overflow-hidden group ${
                  !isCurrentStepValid ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  foodMode === 'dining-out' 
                    ? 'bg-violet-500 hover:bg-violet-600' 
                    : foodMode === 'cooking' 
                    ? 'bg-teal-500 hover:bg-teal-600' 
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {/* Animated background gradient on hover */}
                <motion.div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    foodMode === 'dining-out' 
                      ? 'bg-gradient-to-r from-violet-600 to-purple-700' 
                      : foodMode === 'cooking' 
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-700' 
                      : 'bg-gradient-to-r from-orange-600 to-red-600'
                  }`}
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%', skewX: -15 }}
                  whileHover={{ 
                    x: '200%',
                    transition: { duration: 0.6, ease: "easeInOut" }
                  }}
                />
                
                <span className="relative z-10">
                  {currentStep === 2 ? 'Continue to Summary' : `Continue to ${steps[currentStep].title}`}
                </span>
                <motion.div
                  className="relative z-10"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  y: -2,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                whileTap={{ 
                  scale: 0.95,
                  y: 0,
                  transition: { duration: 0.1 }
                }}
                onClick={handleCreateRoom}
                disabled={loading}
                className={`px-6 py-3 text-white font-medium rounded-xl flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transition-all duration-200 relative overflow-hidden group ${
                  foodMode === 'dining-out' 
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700' 
                    : foodMode === 'cooking' 
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                }`}
              >
                {/* Pulse effect for create button */}
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%', skewX: -15 }}
                  whileHover={{ 
                    x: '200%',
                    transition: { duration: 0.6, ease: "easeInOut" }
                  }}
                />
                
                <div className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Room
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 