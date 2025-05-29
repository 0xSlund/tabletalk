import React from 'react';
import { motion } from 'framer-motion';
import { itemVariants } from '../types';
import { THEMES } from '../constants';
import { triggerAnimation } from '../animations';

interface ThemeSelectorProps {
  selectedTheme: number;
  setSelectedTheme: (themeIndex: number) => void;
  isCreating: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  setSelectedTheme,
  isCreating
}) => {
  return (
    <motion.div variants={itemVariants}>
      <h3 className="text-lg font-bold text-gray-800 mb-3">
        Pick a Fun Theme
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {THEMES.map((theme, index) => {
          const Icon = theme.icon;
          return (
            <motion.button
              key={index}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                // Get the actual button element to center animation on it
                const themeButton = e.currentTarget;
                
                // First trigger the animation (before updating state)
                triggerAnimation(e, themeButton, index, selectedTheme);
                
                // Then update the selected theme state
                setSelectedTheme(index);
              }}
              disabled={isCreating}
              className={`relative flex flex-col items-center justify-center py-5 px-2 rounded-xl transition-all overflow-hidden theme-button ${
                selectedTheme === index 
                  ? `bg-gradient-to-br ${theme.color} text-white shadow-md` 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {selectedTheme === index && (
                <motion.div
                  className="absolute inset-0 bg-white opacity-10"
                  initial={{ scale: 0, borderRadius: "100%" }}
                  animate={{ scale: 2, borderRadius: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              )}
              {/* Theme icon with pulsing animation when selected */}
              <motion.div
                animate={selectedTheme === index ? {
                  scale: [1, 1.15, 1],
                  filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
                } : {}}
                transition={selectedTheme === index ? {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                  times: [0, 0.5, 1]
                } : {}}
                className="relative z-10"
              >
                <Icon className={`w-7 h-7 mb-2 ${selectedTheme === index ? 'text-white' : 'text-orange-500'}`} />
              </motion.div>
              <span className="font-medium text-center">{theme.name}</span>
              {selectedTheme === index && (
                <motion.div
                  className="absolute inset-0 border-2 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.8, 0],
                    scale: [0.8, 1.1, 0.8],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                  style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}; 