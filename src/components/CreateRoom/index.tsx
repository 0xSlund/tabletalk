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
}

export default function CreateRoomScreen({ initialView }: CreateRoomScreenProps) {
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

  // Room Basic Info state
  const [roomName, setRoomName] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [radius, setRadius] = useState(5);
  
  // Room Settings state
  const [participantLimit, setParticipantLimit] = useState<number | null>(null);
  const [timerOption, setTimerOption] = useState('');
  const [customDuration, setCustomDuration] = useState('30');
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');
  const [deadline, setDeadline] = useState('');
  const [reminders, setReminders] = useState(true);
  
  // Room Invite state
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
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

  const handleCreateFromTemplate = async (templateName: string, timerDuration: number, locationRadius: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Update UI state with template values
      setRoomName(templateName);
      setTimerOption(timerDuration.toString());
      setRadius(locationRadius);
      
      // Create the room
      const result = await createRoom(templateName, timerDuration);
      
      // If room creation failed, throw an error
      if (!result || !result.roomId || !result.roomCode) {
        throw new Error('Failed to create room');
      }
      
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
      
      return result;
    } catch (error) {
      console.error('Error creating room from template:', error);
      setError('An unexpected error occurred. Please try again.');
      
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
      console.log('Calling createRoom function with:', { roomName, time });
      const result = await createRoom(roomName, time);
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
      
      // Create the room
      const result = await createRoom(roomName, minutes);
      
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
    
    // Use direct navigation to the active-room path - with a slight delay
    setTimeout(() => {
      navigate('/active-room');
    }, 100);
  };

  const filteredContacts = mockContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
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
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}