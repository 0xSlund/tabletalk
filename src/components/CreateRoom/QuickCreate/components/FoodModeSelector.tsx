import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Utensils } from 'lucide-react';
import { itemVariants } from '../types';
import { FoodMode } from '../types';

interface FoodModeSelectorProps {
  foodMode: FoodMode;
  setFoodMode: (mode: FoodMode) => void;
  isCreating: boolean;
  selectedTheme: number;
  roomName?: string;
}

export const FoodModeSelector: React.FC<FoodModeSelectorProps> = ({
  foodMode,
  setFoodMode,
  isCreating,
  selectedTheme,
  roomName
}) => {
  const getThemeGradient = (themeIndex: number) => {
    switch (themeIndex) {
      case 0: return 'from-orange-500 to-red-500';
      case 1: return 'from-blue-500 to-purple-500';
      case 2: return 'from-green-500 to-teal-500';
      default: return 'from-orange-500 to-red-500';
    }
  };

  const getThemeColor = (themeIndex: number) => {
    switch (themeIndex) {
      case 0: return 'text-orange-500';
      case 1: return 'text-blue-500';
      case 2: return 'text-green-500';
      default: return 'text-orange-500';
    }
  };

  const getRingColor = (themeIndex: number) => {
    switch (themeIndex) {
      case 0: return 'ring-orange-300';
      case 1: return 'ring-blue-300';
      case 2: return 'ring-green-300';
      default: return 'ring-orange-300';
    }
  };

  return (
    <motion.div variants={itemVariants}>
      {/* Only show the question when room name exists and is not empty */}
      {roomName && roomName.trim() !== '' && (
        <h3 className="text-lg font-bold text-white mb-3">
          What are you deciding on?
        </h3>
      )}
      <div className="grid grid-cols-3 gap-3">
        <motion.button
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFoodMode('cooking')}
          disabled={isCreating}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
            foodMode === 'cooking' 
              ? `bg-gradient-to-br ${getThemeGradient(selectedTheme)} text-white shadow-md ring-2 ${getRingColor(selectedTheme)}` 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ChefHat className={`w-7 h-7 mb-2 ${foodMode === 'cooking' ? 'text-white' : getThemeColor(selectedTheme)}`} />
          <span className="font-medium text-center">Cooking</span>
        </motion.button>
        
        <motion.button
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFoodMode('dining-out')}
          disabled={isCreating}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
            foodMode === 'dining-out' 
              ? `bg-gradient-to-br ${getThemeGradient(selectedTheme)} text-white shadow-md ring-2 ${getRingColor(selectedTheme)}` 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Utensils className={`w-7 h-7 mb-2 ${foodMode === 'dining-out' ? 'text-white' : getThemeColor(selectedTheme)}`} />
          <span className="font-medium text-center">Dining Out</span>
        </motion.button>
        
        <motion.button
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFoodMode('both')}
          disabled={isCreating}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
            foodMode === 'both' 
              ? `bg-gradient-to-br ${getThemeGradient(selectedTheme)} text-white shadow-md ring-2 ${getRingColor(selectedTheme)}` 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="relative flex items-center justify-center mb-2">
            <ChefHat className={`w-6 h-6 mr-1 ${foodMode === 'both' ? 'text-white' : getThemeColor(selectedTheme)}`} />
            <span className={`mx-1 font-bold ${foodMode === 'both' ? 'text-white' : getThemeColor(selectedTheme)}`}>+</span>
            <Utensils className={`w-6 h-6 ml-1 ${foodMode === 'both' ? 'text-white' : getThemeColor(selectedTheme)}`} />
          </div>
          <span className="font-medium text-center">Both</span>
        </motion.button>
      </div>
    </motion.div>
  );
}; 