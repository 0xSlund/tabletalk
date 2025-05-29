import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Utensils } from 'lucide-react';
import { FoodMode, FOOD_MODE_THEMES } from './constants';
import { BothModeAnimatedIcon } from './BothModeAnimatedIcon';

interface FoodModeSelectorProps {
  foodMode: FoodMode | null;
  handleFoodModeChange: (mode: FoodMode | null) => void;
  isLoading: boolean;
}

export function FoodModeSelector({ foodMode, handleFoodModeChange, isLoading }: FoodModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Cooking Mode Card */}
      <ModeCard
        mode="cooking"
        isSelected={foodMode === "cooking"}
        onChange={() => handleFoodModeChange(foodMode === "cooking" ? null : "cooking")}
        isLoading={isLoading}
        title="Cooking"
        description="Make meals at home"
        icon={<ChefHat className="w-6 h-6" />}
      />
      
      {/* Dining Out Mode Card */}
      <ModeCard
        mode="dining-out"
        isSelected={foodMode === "dining-out"}
        onChange={() => handleFoodModeChange(foodMode === "dining-out" ? null : "dining-out")}
        isLoading={isLoading}
        title="Dining Out"
        description="Find restaurants"
        icon={<Utensils className="w-6 h-6" />}
      />
      
      {/* Both Mode Card */}
      <ModeCard
        mode="both"
        isSelected={foodMode === "both"}
        onChange={() => handleFoodModeChange(foodMode === "both" ? null : "both")}
        isLoading={isLoading}
        title="Both"
        description="Cook or dine out"
        icon={foodMode === "both" ? <BothModeAnimatedIcon /> : <ChefHat className="w-6 h-6" />}
      />
    </div>
  );
}

interface ModeCardProps {
  mode: FoodMode;
  isSelected: boolean;
  onChange: () => void;
  isLoading: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function ModeCard({ mode, isSelected, onChange, isLoading, title, description, icon }: ModeCardProps) {
  const theme = FOOD_MODE_THEMES[mode];
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 320, 
        damping: 28, 
        delay: mode === 'cooking' ? 0.1 : mode === 'dining-out' ? 0.2 : 0.3 
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onChange}
      disabled={isLoading}
      className={`relative overflow-hidden flex flex-col p-5 rounded-xl transition-all h-44 w-full border ${
        isSelected 
          ? `bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} text-white shadow-md border-transparent` 
          : `bg-white border-gray-200 text-gray-700 hover:border-blue-200 hover:shadow-sm ${theme.bgHover}`
      }`}
    >
      {/* Icon - fixed height for consistent alignment */}
      <div className="z-10 h-10 flex items-center">
        <span className={`inline-flex items-center justify-center p-2.5 rounded-full ${
          isSelected ? 'bg-white/20' : theme.bgLight
        }`}>
          {icon}
        </span>
      </div>
      
      {/* Content - Fixed bottom positioning */}
      <div className="z-10 w-full mt-auto">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
            {title}
          </h4>
          
          {/* Selected badge */}
          {isSelected && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            >
              <motion.div 
                className="w-3 h-3 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 10 }}
              >
                ✓
              </motion.div>
              Selected
            </motion.span>
          )}
        </div>
        
        <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-600'}`}> 
          {description}
        </p>
      </div>
    </motion.button>
  );
} 