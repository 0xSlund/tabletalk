import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Loader2, Info, ChevronLeft, ChevronRight, CheckCircle2, ArrowLeft, Heart, UserCog, UserRoundPlus } from 'lucide-react';
import { fadeVariants } from '../../PageTransition';
import BackButton from '../../BackButton';
import { StepContent } from './StepContent';
import { steps } from './constants';
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
}

// Helper function to validate each step
const validateStep = (
  step: number, 
  { roomName, selectedCuisines, priceRange, foodMode, completedSections }: { 
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
      // Settings validation
      return true;
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
  onBack
}: CustomCreateProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [animateError, setAnimateError] = useState(false);
  const [direction, setDirection] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [foodMode, setFoodMode] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState({
    foodMode: false,
    diningOptions: false,
    cuisineTypes: false,
    cookingOptions: false
  });

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
        completedSections
      }
    );
  }, [currentStep, roomName, selectedCuisines, priceRange, foodMode, completedSections]);

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
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    } else if (onBack) {
      // If we're at the first step and onBack is provided, call it
      onBack();
    }
  };

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
        <div className="relative mb-8">
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
                <div 
                  key={index} 
                  className={cn(
                    "flex flex-col items-center",
                    status === 'completed' && activeColor,
                    status === 'current' && "text-gray-900",
                    status === 'upcoming' && "text-gray-400"
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
                </div>
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePreviousStep}
              className={`px-6 py-3 text-white font-medium rounded-xl flex items-center gap-2 transition-colors shadow-lg ${
                foodMode === 'dining-out' 
                  ? 'bg-violet-500 hover:bg-violet-600' 
                  : foodMode === 'cooking' 
                  ? 'bg-teal-500 hover:bg-teal-600' 
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>
          </div>
          <div className="flex gap-3">
            {currentStep < steps.length ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNextStep}
                disabled={!isCurrentStepValid}
                className={`px-6 py-3 text-white font-medium rounded-xl flex items-center gap-2 transition-colors shadow-lg ${
                  !isCurrentStepValid ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  foodMode === 'dining-out' 
                    ? 'bg-violet-500 hover:bg-violet-600' 
                    : foodMode === 'cooking' 
                    ? 'bg-teal-500 hover:bg-teal-600' 
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                Continue to {steps[currentStep].title}
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreateRoom}
                disabled={loading}
                className={`px-6 py-3 text-white font-medium rounded-xl flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg ${
                  foodMode === 'dining-out' 
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600' 
                    : foodMode === 'cooking' 
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Room
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 