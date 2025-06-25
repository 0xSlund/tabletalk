import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../lib/store';
import { CreateRoomOptions } from './CreateRoomOptions';
import { QuickCreate } from './QuickCreateWrapper';
import RoomCreatedModal from './RoomCreatedModal';
import SavedTemplatesScreen from './SavedTemplatesScreen';
import { useNavigate } from 'react-router-dom';
import { CustomCreate } from './CustomCreate';
import { mockContacts } from './CustomCreate/constants';
import { ThemeEffect } from './ThemeEffect';

interface CreateRoomScreenProps {
  initialView?: 'quick' | 'custom' | 'templates';
  initialStep?: 'basic-info' | 'settings' | 'summary';
}

export default function CreateRoomScreen({ initialView, initialStep }: CreateRoomScreenProps) {
  const { setActiveTab, createRoom } = useAppStore();
  const navigate = useNavigate();
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomLink, setRoomLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [foodMode, setFoodMode] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tabletalk-create-food-mode') || null;
    }
    return null;
  });

  // Room Basic Info state with localStorage persistence
  const [roomName, setRoomName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tabletalk-create-room-name') || '';
    }
    return '';
  });
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tabletalk-create-selected-cuisines');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [priceRange, setPriceRange] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tabletalk-create-price-range');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [radius, setRadius] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tabletalk-create-radius');
      return saved ? parseInt(saved) : 5;
    }
    return 5;
  });
  
  // Room Settings state with localStorage persistence
  const [participantLimit, setParticipantLimit] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tabletalk-create-participant-limit');
      return saved ? parseInt(saved) : null;
    }
    return null;
  });
  const [timerOption, setTimerOption] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tabletalk-create-timer-option') || '';
    }
    return '';
  });
  const [customDuration, setCustomDuration] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tabletalk-create-custom-duration') || '30';
    }
    return '30';
  });
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tabletalk-create-duration-unit');
      return (saved as 'minutes' | 'hours') || 'minutes';
    }
    return 'minutes';
  });
  const [deadline, setDeadline] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tabletalk-create-deadline') || '';
    }
    return '';
  });
  const [reminders, setReminders] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tabletalk-create-reminders');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });
  
  // Room Invite state with localStorage persistence
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tabletalk-create-save-as-template');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [templateName, setTemplateName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tabletalk-create-template-name') || '';
    }
    return '';
  });
  
  // UI state
  const [showOptions, setShowOptions] = useState(!initialView);
  const [showQuickCreate, setShowQuickCreate] = useState(initialView === 'quick');
  const [showSavedTemplates, setShowSavedTemplates] = useState(initialView === 'templates');
  const [showCustomCreate, setShowCustomCreate] = useState(initialView === 'custom');
  const [showRoomCreatedModal, setShowRoomCreatedModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  // Persist form state to localStorage
  useEffect(() => {
    localStorage.setItem('tabletalk-create-room-name', roomName);
  }, [roomName]);

  useEffect(() => {
    localStorage.setItem('tabletalk-create-selected-cuisines', JSON.stringify(selectedCuisines));
  }, [selectedCuisines]);

  useEffect(() => {
    localStorage.setItem('tabletalk-create-price-range', JSON.stringify(priceRange));
  }, [priceRange]);

  useEffect(() => {
    localStorage.setItem('tabletalk-create-radius', radius.toString());
  }, [radius]);

  useEffect(() => {
    localStorage.setItem('tabletalk-create-participant-limit', participantLimit?.toString() || '');
  }, [participantLimit]);

  useEffect(() => {
    localStorage.setItem('tabletalk-create-timer-option', timerOption);
  }, [timerOption]);

  useEffect(() => {
    localStorage.setItem('tabletalk-create-custom-duration', customDuration);
  }, [customDuration]);

  useEffect(() => {
    localStorage.setItem('tabletalk-create-duration-unit', durationUnit);
  }, [durationUnit]);

  useEffect(() => {
    localStorage.setItem('tabletalk-create-deadline', deadline);
  }, [deadline]);

  useEffect(() => {
    localStorage.setItem('tabletalk-create-reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('tabletalk-create-save-as-template', JSON.stringify(saveAsTemplate));
  }, [saveAsTemplate]);

  useEffect(() => {
    localStorage.setItem('tabletalk-create-template-name', templateName);
  }, [templateName]);

  useEffect(() => {
    if (foodMode) {
      localStorage.setItem('tabletalk-create-food-mode', foodMode);
    } else {
      localStorage.removeItem('tabletalk-create-food-mode');
    }
  }, [foodMode]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleQuickCreate = () => {
    navigate('/create/quick');
    setShowOptions(false);
    setShowQuickCreate(true);
    setShowCustomCreate(false);
    setShowSavedTemplates(false);
  };

  const handleQuickCreateBack = () => {
    navigate('/create');
    setShowQuickCreate(false);
    setShowOptions(true);
    setShowCustomCreate(false);
    setShowSavedTemplates(false);
  };

  const handleSavedTemplates = () => {
    navigate('/create/templates');
    setShowOptions(false);
    setShowSavedTemplates(true);
    setShowQuickCreate(false);
    setShowCustomCreate(false);
  };

  const handleSavedTemplatesBack = () => {
    navigate('/create');
    setShowSavedTemplates(false);
    setShowOptions(true);
    setShowQuickCreate(false);
    setShowCustomCreate(false);
  };

  const handleCreateFromTemplate = async (template: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate timer in minutes
      let timerMinutes = 30; // Default
      if (template.timer_option === 'custom') {
        timerMinutes = parseInt(template.custom_duration || '30');
        if (template.duration_unit === 'hours') {
          timerMinutes *= 60;
        }
      } else {
        timerMinutes = parseInt(template.timer_option || '30');
      }
      
      console.log(`Creating room from template: ${template.name}, timer: ${timerMinutes} minutes`);
      
      // Apply template settings to current state
      setRoomName(template.room_name);
      setSelectedTheme(template.food_mode);
      setFoodMode(template.food_mode);
      setSelectedCuisines(template.selected_cuisines || []);
      setPriceRange(template.price_range || []);
      setRadius(template.radius || 5);
      setParticipantLimit(template.participant_limit);
      setTimerOption(template.timer_option || '30');
      setCustomDuration(template.custom_duration || '30');
      setDurationUnit(template.duration_unit || 'minutes');
      setDeadline(template.deadline || '');
      setReminders(template.reminders || false);
      setSelectedContacts(template.selected_contacts || []);
      
      // Create the room with the template settings
      const result = await createRoom(template.room_name, timerMinutes, template.food_mode);
      
      // If room creation failed, throw an error
      if (!result || !result.roomId || !result.roomCode) {
        throw new Error('Failed to create room from template');
      }
      
      console.log(`Template room created successfully with ID: ${result.roomId} and code: ${result.roomCode}`);
      
      // Room was created successfully - update UI
      setRoomLink(result.roomCode);
      setCreatedRoomId(result.roomId);
      setRoomCreated(true);
      
      // Show success UI
      setShowConfetti(true);
      setShowRoomCreatedModal(true);
      
      // Reset loading state
      setLoading(false);
      
      // Store room ID in localStorage for navigation
      localStorage.setItem('tabletalk-last-room-id', result.roomId);
      
      // Clear form state from localStorage since room was created successfully
      clearFormLocalStorage();
      
      // Close templates view and go to room created state
      setShowSavedTemplates(false);
      
      return result;
    } catch (error) {
      console.error('Error creating room from template:', error);
      setError('Failed to create room from template. Please try again.');
      
      // Reset UI states
      setLoading(false);
      setShowSavedTemplates(false);
      setShowOptions(true);
      
      return null;
    }
  };

  const handleQuickCreateSubmit = async (roomName: string, time: number, location: number, theme: number = 0) => {
    // Set initial state
    setLoading(true);
    setError(null);
    setSelectedTheme(theme);
    
    // Map QuickCreate theme to food mode
    // 0: Food Fiesta -> 'both' (cooking + dining out)
    // 1: Cozy Gathering -> 'cooking' (home cooking vibes) 
    // 2: Surprise Me -> 'dining-out' (adventure, going out)
    const themeFoodModeMap = ['both', 'cooking', 'dining-out'];
    const themeFoodMode = themeFoodModeMap[theme] || 'both';
    
    try {
      console.log(`Quick creating room "${roomName}" with timer: ${time} minutes, theme: ${theme}`);
      
      // Update UI state with the provided values
      setRoomName(roomName);
      setTimerOption(time.toString());
      setRadius(location);
      setParticipantLimit(null); // Open invitation
      setSelectedCuisines([]); // All cuisines
      setPriceRange(['$$']); // Moderate
      setReminders(false); // Disabled
      
      // Create the room
      console.log('Calling createRoom function with:', { roomName, time, foodMode: themeFoodMode });
      const result = await createRoom(roomName, time, themeFoodMode);
      console.log('CreateRoom result:', result);
      
      // If room creation failed, throw an error
      if (!result || !result.roomId || !result.roomCode) {
        console.error('Room creation failed! Result:', result);
        throw new Error('Failed to create room: Invalid result returned');
      }
      
      console.log(`Room created successfully with ID: ${result.roomId} and code: ${result.roomCode}`);
      
      // Room was created successfully - update UI
      setRoomLink(result.roomCode);
      setCreatedRoomId(result.roomId);
      setRoomCreated(true);
      
      // Show success UI
      setShowConfetti(true);
      setShowRoomCreatedModal(true);
      
      // Reset loading state
      setLoading(false);
      
      // Store room ID in localStorage for navigation
      localStorage.setItem('tabletalk-last-room-id', result.roomId);
      
      // Clear form state from localStorage since room was created successfully
      clearFormLocalStorage();
      
      // Return the result for the calling component
      return result;
    } catch (error) {
      // Handle any errors
      console.error('Error creating room:', error);
      console.error('Error details:', { 
        message: error.message, 
        stack: error.stack,
        name: error.name
      });
      
      // Update error state
      setError('An unexpected error occurred. Please try again.');
      
      // Reset UI states
      setLoading(false);
      setShowQuickCreate(false);
      setShowOptions(true);
      
      // Return null to indicate failure
      return null;
    }
  };

  const handleCustomCreate = () => {
    navigate('/create/custom');
    setShowOptions(false);
    setShowCustomCreate(true);
    setShowQuickCreate(false);
    setShowSavedTemplates(false);
  };

  const handleCustomCreateBack = () => {
    navigate('/create');
    setShowCustomCreate(false);
    setShowOptions(true);
    setShowQuickCreate(false);
    setShowSavedTemplates(false);
    
    // Don't clear localStorage here - let users keep their progress
    // Form will only be cleared when room is successfully created
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Calculate timer duration in minutes
      let minutes = 30; // Default
      if (timerOption === 'custom') {
        minutes = parseInt(customDuration);
        if (durationUnit === 'hours') {
          minutes *= 60;
        }
      } else {
        minutes = parseInt(timerOption);
      }
      
      console.log(`Creating room with timer duration: ${minutes} minutes, option: ${timerOption}`);
      
      // Save as template if requested (before creating room)
      if (saveAsTemplate && templateName.trim()) {
        try {
                      const { TemplateService } = await import('../../lib/templateService');
          
          const templateData = {
            name: templateName.trim(),
            roomName: roomName,
            foodMode: selectedTheme, // Use selectedTheme which corresponds to foodMode
            selectedCuisines: selectedCuisines,
            priceRange: priceRange,
            radius: radius,
            participantLimit: participantLimit,
            timerOption: timerOption,
            customDuration: customDuration,
            durationUnit: durationUnit,
            deadline: deadline,
            reminders: reminders,
            selectedContacts: selectedContacts,
            description: `Template created from room: ${roomName}`,
            isPublic: false // Keep templates private by default
          };
          
          const templateResult = await TemplateService.saveTemplate(templateData);
          
          if (templateResult.success) {
            console.log('Template saved successfully:', templateResult.template);
            // You could show a toast notification here
          } else {
            console.error('Failed to save template:', templateResult.error);
            // Show warning but don't prevent room creation
          }
        } catch (templateError) {
          console.error('Error saving template:', templateError);
          // Continue with room creation even if template saving fails
        }
      }
      
      // Create the room
      const result = await createRoom(roomName, minutes, foodMode);
      
      // If room creation failed, throw an error
      if (!result || !result.roomId || !result.roomCode) {
        throw new Error('Failed to create room');
      }
      
      console.log(`Room created successfully with ID: ${result.roomId} and code: ${result.roomCode}`);
      
      // Room was created successfully - update UI
      setRoomLink(result.roomCode);
      setCreatedRoomId(result.roomId);
      setRoomCreated(true);
      
      // Show success UI
      setShowConfetti(true);
      setShowRoomCreatedModal(true);
      
      // Reset loading state
      setLoading(false);
      
      // Store room ID in localStorage for navigation
      localStorage.setItem('tabletalk-last-room-id', result.roomId);
      
      // Clear form state from localStorage since room was created successfully
      clearFormLocalStorage();
      
      return result;
    } catch (error) {
      console.error('Error creating room:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
      
      return null;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://tabletalk.app/join/${roomLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTimerOptionChange = (value: string) => {
    setTimerOption(value);
    if (value !== 'custom') {
      setCustomDuration('30');
    }
  };

  const handleNavigate = (tab: string) => {
    setIsExiting(true);
    setTimeout(() => {
      setActiveTab(tab as any);
    }, 300);
  };

  const closeRoomCreatedModal = () => {
    setShowRoomCreatedModal(false);
    // Navigate back to main menu
    setRoomCreated(false);
    setShowConfetti(false);
    
    // Navigate to home screen
    setIsExiting(true);
    setTimeout(() => {
      navigate('/');
    }, 300);
  };
  
  const navigateToRoom = () => {
    // Close the modal
    setShowRoomCreatedModal(false);
    
    // Make sure we have a created room
    if (!createdRoomId || !roomLink) {
      console.error('Cannot navigate to room: Missing room information');
      return;
    }
    
    console.log(`Navigating to room with ID: ${createdRoomId} and code: ${roomLink}`);
    
    // Store room ID in localStorage for navigation
    localStorage.setItem('tabletalk-last-room-id', createdRoomId);
    
    // Set the active tab to active-room for state consistency
    setActiveTab('active-room');
    
    // Use direct navigation to the room code path - with a slight delay
    setTimeout(() => {
      navigate(`/active-room/${roomLink}`);
    }, 100);
  };

    const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to clear form data from localStorage
  const clearFormLocalStorage = () => {
    const keys = [
      'tabletalk-create-room-name',
      'tabletalk-create-selected-cuisines',
      'tabletalk-create-price-range',
      'tabletalk-create-radius',
      'tabletalk-create-participant-limit',
      'tabletalk-create-timer-option',
      'tabletalk-create-custom-duration',
      'tabletalk-create-duration-unit',
      'tabletalk-create-deadline',
      'tabletalk-create-reminders',
      'tabletalk-create-save-as-template',
      'tabletalk-create-template-name',
      'tabletalk-create-food-mode'
    ];
    keys.forEach(key => localStorage.removeItem(key));
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]">
      {/* Theme-specific effect - replaced standard Confetti */}
      <ThemeEffect
        theme={selectedTheme}
        show={showConfetti}
        width={windowSize.width}
        height={windowSize.height}
      />

      {/* Room Created Modal - Render on top of everything */}
      <RoomCreatedModal
        roomName={roomName}
        roomCode={roomLink}
        isOpen={showRoomCreatedModal}
        onClose={closeRoomCreatedModal}
        onNavigateToRoom={navigateToRoom}
        autoNavigateDelay={5000}
        theme={selectedTheme}
        foodMode={foodMode}
      />

      <AnimatePresence mode="wait">
        {showOptions ? (
          <CreateRoomOptions
            onQuickCreate={handleQuickCreate}
            onCustomCreate={handleCustomCreate}
            onSavedTemplates={handleSavedTemplates}
          />
        ) : showQuickCreate ? (
          <QuickCreate
            onCreate={handleQuickCreateSubmit}
            onBack={handleQuickCreateBack}
          />
        ) : showSavedTemplates ? (
          <SavedTemplatesScreen 
            onBack={handleSavedTemplatesBack}
            onCreateFromTemplate={handleCreateFromTemplate}
          />
        ) : showCustomCreate ? (
          <CustomCreate 
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
            handleCreateRoom={handleCreateRoom}
            onBack={handleCustomCreateBack}
            foodMode={foodMode}
            setFoodMode={setFoodMode}
            initialStep={initialStep}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}