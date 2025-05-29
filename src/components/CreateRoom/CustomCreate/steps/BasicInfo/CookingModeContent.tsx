import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Clock, Info, Gauge, AlertCircle } from 'lucide-react';
import { FoodMode, FOOD_MODE_THEMES } from './constants';

interface CookingModeContentProps {
  recipeDifficulty: 'easy' | 'medium' | 'challenging' | '';
  setRecipeDifficulty: (difficulty: 'easy' | 'medium' | 'challenging' | '') => void;
  cookingTime: number;
  setCookingTime: (time: number) => void;
  isLoading: boolean;
  foodMode?: FoodMode;
}

export function CookingModeContent({
  recipeDifficulty,
  setRecipeDifficulty,
  cookingTime,
  setCookingTime,
  isLoading,
  foodMode = 'cooking'
}: CookingModeContentProps) {
  const [difficultyAnimation, setDifficultyAnimation] = useState<string | null>(null);
  const [timeAnimation, setTimeAnimation] = useState<number | null>(null);

  const isModified = recipeDifficulty !== '' || cookingTime !== 30;
  const isSectionComplete = recipeDifficulty !== '';

  // Handle clicking on the same difficulty level to reset to default
  const handleDifficultyClick = (difficulty: 'easy' | 'medium' | 'challenging') => {
    if (recipeDifficulty === difficulty) {
      // If already selected, deselect it
        setDifficultyAnimation(difficulty);
        setTimeout(() => setDifficultyAnimation(null), 300);
        
      // Reset to empty
      setRecipeDifficulty('');
    } else {
      // Normal change to new difficulty
      setRecipeDifficulty(difficulty);
    }
  };

  // Function to determine the slider track background based on value
  const getSliderBackground = () => {
    const percentage = ((cookingTime - 5) / (120 - 5)) * 100;
    return `linear-gradient(to right, #0d9488 0%, #0d9488 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
  };

  // Handle preset time selection
  const handleTimePresetClick = (time: number) => {
    setCookingTime(time);
        setTimeAnimation(time);
        setTimeout(() => setTimeAnimation(null), 300);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Recipe Difficulty */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className={`${FOOD_MODE_THEMES[foodMode].bgLight} p-2 rounded-lg`}>
              <Gauge className={`w-5 h-5 ${FOOD_MODE_THEMES[foodMode].primaryColor}`} />
            </span>
            Recipe Difficulty
          </label>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden min-h-[240px]">
          <motion.div 
            className={`absolute inset-0 rounded-xl bg-gradient-to-r from-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'amber'}-50 via-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'amber'}-100/30 to-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'amber'}-50 opacity-0`}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.3 }}
          />
          <div className="flex flex-col items-center justify-center h-full relative z-10">
            <div className="w-full max-w-[95%] mx-auto space-y-5">
              {[
                { value: 'easy', label: 'Easy', emoji: '🥗', desc: 'Simple, quick recipes' },
                { value: 'medium', label: 'Medium', emoji: '🍲', desc: 'Balanced complexity' },
                { value: 'challenging', label: 'Advanced', emoji: '🍱', desc: 'Expert techniques' }
              ].map((level) => {
                const isSelected = recipeDifficulty === level.value as 'easy' | 'medium' | 'challenging';
                return (
                  <motion.button
                    key={level.value}
                    whileHover={{ x: 5, boxShadow: '0 8px 16px rgba(8, 145, 178, 0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    animate={difficultyAnimation === level.value 
                      ? { scale: [1, 0.96, 1.04, 1] } 
                      : {
                          x: isSelected ? 12 : 0,
                          scale: isSelected ? 1.03 : 1,
                          boxShadow: isSelected ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }
                    }
                    onClick={() => handleDifficultyClick(level.value as 'easy' | 'medium' | 'challenging')}
                    disabled={isLoading}
                    className={`relative overflow-hidden rounded-xl flex items-center w-full transition-all h-16 ${
                      isSelected 
                        ? `bg-gradient-to-r ${FOOD_MODE_THEMES[foodMode].gradientFrom} ${FOOD_MODE_THEMES[foodMode].gradientTo} text-white shadow-lg ring-2 ring-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'amber'}-300` 
                        : `bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:border-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'amber'}-200 shadow-sm`
                    }`}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-white/5"></div>
                    )}
                    {isSelected && (
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                          initial={{ x: '-100%', opacity: 0.1 }}
                          animate={{ x: '100%' }}
                        transition={{ 
                          repeat: Infinity, 
                            duration: 1.5, 
                          ease: "linear",
                          repeatDelay: 0.5
                        }}
                      />
                    )}
                    <div className="flex items-center gap-3 pl-3">
                      <span className="text-lg">{level.emoji}</span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{level.label}</span>
                        <span className="text-xs opacity-80">{level.desc}</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Cooking Time */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`${FOOD_MODE_THEMES[foodMode].bgLight} p-2 rounded-lg`}>
              <Clock className={`w-5 h-5 ${FOOD_MODE_THEMES[foodMode].primaryColor}`} />
            </span>
            <span className="text-lg font-semibold text-gray-800">Cooking Time</span>
          </div>
          <div 
            className={`text-lg font-semibold ${FOOD_MODE_THEMES[foodMode].bgLight} px-3 py-1 rounded-full text-gray-800 min-w-[5rem] text-center`}
          >
            {cookingTime} min
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden min-h-[240px]">
          <motion.div 
            className={`absolute inset-0 rounded-xl bg-gradient-to-r from-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'amber'}-50 via-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'amber'}-100/30 to-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'amber'}-50 opacity-0`}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.3 }}
          />
          
          <div className="flex flex-col justify-between h-full relative z-10">
            <div className="mb-3 pt-1">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={cookingTime}
                onChange={(e) => setCookingTime(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                  style={{
                  background: getSliderBackground()
                }}
                disabled={isLoading}
              />
              
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>5 min</span>
                <span>120 min</span>
              </div>
            </div>

            <div className="mt-1">
              <div className="text-center mb-2">
                <span className="text-base text-gray-700 font-medium">
                  {cookingTime < 30 
                    ? 'Quick & Easy' 
                    : cookingTime < 60 
                      ? 'Moderate Prep Time' 
                      : cookingTime < 90
                        ? 'More Involved Cooking'
                      : 'Longer Preparation'}
                </span>
              </div>
              
              {/* Preset Time Buttons */}
              <div className="flex gap-2 mb-3 justify-center">
                {[15, 30, 60, 120].map((time) => (
                  <motion.button
                    key={time}
                    onClick={() => handleTimePresetClick(time)}
                    animate={timeAnimation === time ? { scale: [1, 0.92, 1.04, 1] } : {}}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      cookingTime === time 
                        ? `bg-green-500 text-white` 
                        : `bg-gray-100 text-gray-700 hover:bg-gray-200`
                    }`}
                    disabled={isLoading}
                  >
                    {time} min
                  </motion.button>
                ))}
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium">Time commitment: </span>
                    {cookingTime <= 15 && "Perfect for quick meals when you're short on time"}
                    {cookingTime > 15 && cookingTime <= 30 && "Good for weeknight cooking after a long day at work"}
                    {cookingTime > 30 && cookingTime <= 60 && "Ideal for recipes requiring extra attention"}
                    {cookingTime > 60 && cookingTime <= 90 && "Best when you have time to spare"}
                    {cookingTime > 90 && "Great for weekend cooking projects"}
                  </div>
                </div>
              </div>
              
              {/* Adjusted padding to middle-ground height */}
              <div className="py-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 