import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, Share2, Copy, Check, X, Loader2 } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import Confetti from 'react-confetti';
import { fadeVariants, popVariants } from '../PageTransition';
import { RoomBasicInfo } from './RoomBasicInfo';
import { RoomSettings } from './RoomSettings';
import { RoomInvite } from './RoomInvite';
import { ProgressBar } from './ProgressBar';

// Mock contacts data - in real app would come from user's contacts
const mockContacts = [
  { 
    id: '1', 
    name: 'Alice Smith', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    favorite: true,
    recent: true
  },
  { 
    id: '2', 
    name: 'Bob Johnson', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    recent: true
  },
  { 
    id: '3', 
    name: 'Carol Williams', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
    favorite: true
  },
  { 
    id: '4', 
    name: 'David Brown', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    recent: true
  },
];

const steps = [
  {
    title: 'Basic Info',
    description: 'Room details & preferences'
  },
  {
    title: 'Settings',
    description: 'Timer & voting rules'
  },
  {
    title: 'Invite',
    description: 'Add participants'
  }
];

export default function CreateRoomScreen() {
  const { setActiveTab, createRoom } = useAppStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [roomName, setRoomName] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  
  // Room Basic Info state
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string[]>(['$$']);
  const [radius, setRadius] = useState(5);
  
  // Room Settings state
  const [participantLimit, setParticipantLimit] = useState<number | null>(null);
  const [timerOption, setTimerOption] = useState('30');
  const [customDuration, setCustomDuration] = useState('30');
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');
  const [deadline, setDeadline] = useState('');
  const [reminders, setReminders] = useState(true);
  
  // Room Invite state
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    
    setIsLoading(true);
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
      
      // Create the room
      const roomId = await createRoom(roomName, minutes);
      
      if (roomId) {
        // Show success animation
        setShowSuccess(true);
        setShowConfetti(true);
        
        // Get the room code from the store
        const { currentRoom } = useAppStore.getState();
        setRoomCode(currentRoom.code || '');

        // Hide success and show share modal after delay
        setTimeout(() => {
          setShowSuccess(false);
          setShowConfetti(false);
          setShowShareModal(true);

          // After showing the share modal, wait a bit and then transition to the active room
          setTimeout(() => {
            setShowShareModal(false);
            handleNavigate('active-room');
          }, 2000);
        }, 2000);
      } else {
        setError('Failed to create room. Please try again.');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://tabletalk.app/join/${roomCode}`);
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

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 1 },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <RoomBasicInfo
            roomName={roomName}
            setRoomName={setRoomName}
            selectedCuisines={selectedCuisines}
            setSelectedCuisines={setSelectedCuisines}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            radius={radius}
            setRadius={setRadius}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <RoomSettings
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
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <RoomInvite
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50"
      initial="initial"
      exit="exit"
      variants={pageVariants}
      animate={isExiting ? "exit" : "initial"}
    >
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#f97316', '#7A9B76', '#0ea5e9', '#8b5cf6']}
        />
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Create Room</h1>
            </div>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content - Added pb-24 for bottom spacing and max-h-[calc(100vh-8rem)] for scrolling */}
      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 overflow-y-auto relative"
        >
          {/* Progress Bar */}
          <ProgressBar currentStep={currentStep} steps={steps} />

          <form onSubmit={handleCreateRoom} className="space-y-8">
            {/* Step Content */}
            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons - Fixed at bottom of card */}
            <div className="sticky bottom-0 bg-white pt-4 mt-8 border-t border-gray-100">
              <div className="flex justify-between gap-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Previous
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={isLoading || !roomName.trim()}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className={`flex-1 bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 ${
                      (isLoading || !roomName.trim()) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Room...
                      </>
                    ) : (
                      'Create Room'
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </main>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-24 flex justify-center z-50"
          >
            <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
              <Check className="w-6 h-6" />
              <span className="text-lg font-medium">
                Room "{roomName}" Created Successfully!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              variants={popVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-orange-500" />
                  <h3 className="text-xl font-semibold">Share Room</h3>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Share this link with your friends to invite them to the room:
              </p>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={`https://tabletalk.app/join/${roomCode}`}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-50 rounded-lg text-gray-800 font-mono text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Room Code: <span className="font-mono font-bold">{roomCode}</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}