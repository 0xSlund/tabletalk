import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepBasicInfo } from './steps/BasicInfo/index';
import { StepSettings } from './steps/StepSettings/index';
import { StepInvite } from './steps/StepInvite';

interface StepContentProps {
  currentStep: number;
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
  direction?: number;
  foodMode?: string | null;
  setFoodMode?: (mode: string | null) => void;
  completedSections?: {
    foodMode: boolean;
    diningOptions: boolean;
    cuisineTypes: boolean;
    cookingOptions: boolean;
  };
  setCompletedSections?: (sections: {
    foodMode: boolean;
    diningOptions: boolean;
    cuisineTypes: boolean;
    cookingOptions: boolean;
  }) => void;
  accessControl?: boolean | null;
  setAccessControl?: (control: boolean | null) => void;
  selectedMeals?: any;
  setSelectedMeals?: (meals: any) => void;
  onSectionsCompletionChange?: (completion: {
    participantAccess: boolean;
    decisionTimer: boolean;
    deadlineNotifications: boolean;
  }) => void;
  onNavigateToStep?: (step: number) => void;
}

export function StepContent({
  currentStep,
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
  direction = 0,
  foodMode,
  setFoodMode,
  completedSections,
  setCompletedSections,
  accessControl,
  setAccessControl,
  selectedMeals,
  setSelectedMeals,
  onSectionsCompletionChange,
  onNavigateToStep
}: StepContentProps) {
  // Animation variants with smoother transition
  const pageVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? '5%' : '-5%',
      opacity: 0,
      scale: 0.98,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { type: 'spring', stiffness: 400, damping: 35 }
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-5%' : '5%',
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }
    })
  };

  // Determine content based on step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepBasicInfo
            roomName={roomName}
            setRoomName={setRoomName}
            selectedCuisines={selectedCuisines}
            setSelectedCuisines={setSelectedCuisines}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            radius={radius}
            setRadius={setRadius}
            isLoading={loading}
            foodMode={foodMode as any}
            setFoodMode={setFoodMode}
            completedSections={completedSections || {
              foodMode: false,
              diningOptions: false,
              cuisineTypes: false,
              cookingOptions: false
            }}
            setCompletedSections={setCompletedSections}
          />
        );
      case 2:
        return (
          <StepSettings
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
            isLoading={loading}
            accessControl={accessControl}
            setAccessControl={setAccessControl}
            selectedMeals={selectedMeals}
            setSelectedMeals={setSelectedMeals}
            onSectionsCompletionChange={onSectionsCompletionChange}
          />
        );
      case 3:
        return (
          <StepInvite
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
            participantLimit={participantLimit}
            deadline={deadline}
            timerOption={timerOption}
            customDuration={customDuration}
            durationUnit={durationUnit}
            reminders={reminders}
            roomName={roomName}
            selectedCuisines={selectedCuisines}
            foodMode={foodMode}
            onNavigateToStep={onNavigateToStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden min-h-[500px]">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentStep}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 