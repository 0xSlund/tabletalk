import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { fadeVariants } from '../../PageTransition';
import { THEMES } from './constants';
import { formVariants, floatAnimation, QuickCreateProps, FoodMode } from './types';
import { triggerCreateAnimation, clearExistingAnimations } from './animations';
import { Link } from 'react-router-dom';

import {
  RoomNameInput,
  FoodModeSelector,
  PriceRangeSelector,
  ThemeSelector,
  TimeSlider,
  LocationSlider,
  CreateButton
} from './components';

export const QuickCreate: React.FC<QuickCreateProps> = ({
  onCreate,
  onBack,
}) => {
  // State
  const [roomName, setRoomName] = useState('');
  const [time, setTime] = useState(15);
  const [location, setLocation] = useState(5);
  const [priceRange, setPriceRange] = useState('$$');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [foodMode, setFoodMode] = useState<FoodMode>('dining-out');
  const [selectedTheme, setSelectedTheme] = useState<number>(0);

  // Get the background gradient based on the selected theme
  const getBackgroundGradient = () => {
    return THEMES[selectedTheme]?.bgGradient || "from-orange-50 via-orange-100/30 to-red-50";
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }
    
    if (isCreating) return;
    
    setIsCreating(true);
    setError('');
    
    try {
      // Add the food mode to the room name if not already included
      let finalRoomName = roomName;
      if (foodMode === 'cooking' && !roomName.toLowerCase().includes('cooking')) {
        finalRoomName = `${roomName} (Cooking)`;
      } else if (foodMode === 'both' && !roomName.toLowerCase().includes('cooking & dining')) {
        finalRoomName = `${roomName} (Cooking & Dining)`;
      }
      
      console.log(`Quick creating room with timer: ${time} minutes, mode: ${foodMode}, theme: ${selectedTheme}`);
      
      // Call the onCreate function and await its result
      const result = await onCreate(finalRoomName, time, location, selectedTheme);
      
      // If the result is falsy or doesn't have roomId/roomCode, show a more user-friendly error
      if (!result || !result.roomId || !result.roomCode) {
        console.log('Room creation failed with result:', result);
        
        // Check localStorage for auth token to see if authentication might be the issue
        const hasAuth = localStorage.getItem('supabase.auth.token') || 
                        localStorage.getItem('tabletalk-auth-token');
                        
        if (!hasAuth) {
          setError('Authentication error. Please sign in again before creating a room.');
        } else {
          setError('Unable to create room. Please try again or check your connection.');
        }
        
        setIsCreating(false);
        return;
      }
      
      console.log('Room created successfully:', result);
      // Clear all animations when room is successfully created
      clearExistingAnimations();
      // We don't need to reset isCreating here since the component will unmount on success
    } catch (err: any) {
      console.error('Error creating room:', err);
      
      // More user-friendly error message
      if (err.message?.includes('Failed to fetch') || err.message?.includes('Network')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.message?.includes('auth') || err.message?.includes('token') || err.message?.includes('permission')) {
        setError('Authentication error. Please sign in again.');
      } else {
        setError('Unable to create room. Please try again later.');
      }
      
      // Always reset the loading state on error
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} relative overflow-hidden transition-colors duration-1000`}
    >
      {/* Fun decorative elements */}
      <motion.div 
        className={`absolute top-40 right-10 w-20 h-20 rounded-full ${selectedTheme === 0 ? 'bg-orange-300' : selectedTheme === 1 ? 'bg-blue-300' : 'bg-green-300'} opacity-30 blur-xl`}
        {...floatAnimation}
      />
      <motion.div 
        className={`absolute bottom-40 left-10 w-24 h-24 rounded-full ${selectedTheme === 0 ? 'bg-red-300' : selectedTheme === 1 ? 'bg-purple-300' : 'bg-teal-300'} opacity-30 blur-xl`}
        animate={{
          scale: [1, 1.2, 1],
          transition: { duration: 4, repeat: Infinity }
        }}
      />
      <motion.div 
        className={`absolute top-1/3 left-1/4 w-8 h-8 rounded-full ${selectedTheme === 0 ? 'bg-yellow-300' : selectedTheme === 1 ? 'bg-indigo-300' : 'bg-emerald-300'} opacity-20`}
        animate={{
          y: [0, -30, 0],
          x: [0, 10, 0],
          transition: { duration: 5, repeat: Infinity }
        }}
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              to="/create"
              className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors ${isCreating ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <motion.div 
                className="relative"
                whileHover={{ rotate: 20 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`absolute -inset-1.5 bg-gradient-to-r ${selectedTheme === 0 ? 'from-orange-400 to-pink-500' : selectedTheme === 1 ? 'from-blue-400 to-purple-500' : 'from-green-400 to-teal-500'} rounded-full blur-sm opacity-70`}></div>
                <Sparkles className="relative w-6 h-6 text-white" />
              </motion.div>
              <h1 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${selectedTheme === 0 ? 'from-orange-600 to-red-600' : selectedTheme === 1 ? 'from-blue-600 to-purple-600' : 'from-green-600 to-teal-600'}`}>
                Quick Create
              </h1>
            </div>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 relative">
        <motion.p 
          className="text-center text-gray-700 mb-6 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Create a fun food decision room in seconds! ✨
        </motion.p>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100 relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '24px 24px' }}></div>
          </div>

          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 relative z-10"
          >
            {/* Room Name */}
            <RoomNameInput 
              roomName={roomName}
              setRoomName={setRoomName}
              error={error}
              setError={setError}
              isCreating={isCreating}
            />

            {/* Food Mode Selection */}
            <FoodModeSelector
              foodMode={foodMode}
              setFoodMode={setFoodMode}
              isCreating={isCreating}
              selectedTheme={selectedTheme}
              roomName={roomName}
            />

            {/* Price Range - Only show for dining out or both */}
            <PriceRangeSelector
              foodMode={foodMode}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              isCreating={isCreating}
            />

            {/* Fun Theme Selection */}
            <ThemeSelector
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
              isCreating={isCreating}
            />

            {/* Time Slider */}
            <TimeSlider
              time={time}
              setTime={setTime}
              isCreating={isCreating}
              selectedTheme={selectedTheme}
            />

            {/* Location Slider - Only show for dining out or both */}
            <LocationSlider
              location={location}
              setLocation={setLocation}
              isCreating={isCreating}
              selectedTheme={selectedTheme}
              foodMode={foodMode}
            />

            {/* Create Button */}
            <CreateButton
              onCreateRoom={handleCreateRoom}
              isCreating={isCreating}
              selectedTheme={selectedTheme}
              error={error}
            />
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}; 