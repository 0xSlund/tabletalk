import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, MapPin, Info, AlertTriangle, CheckCircle, UtensilsCrossed } from 'lucide-react';
import { FoodMode, FOOD_MODE_THEMES, priceRanges, distancePresets } from './constants';

interface DiningModeContentProps {
  priceRange: string[];
  setPriceRange: (range: string[]) => void;
  radius: number;
  setRadius: (radius: number) => void;
  foodMode: FoodMode;
  isLoading: boolean;
}

export function DiningModeContent({
  priceRange,
  setPriceRange,
  radius,
  setRadius,
  foodMode,
  isLoading
}: DiningModeContentProps) {
  const [showHelpTooltip, setShowHelpTooltip] = useState<string | null>(null);
  const [animatingOption, setAnimatingOption] = useState<string | null>(null);

  // Handle price range selection with animation
  const handlePriceRangeSelect = (value: string) => {
    // Get current price ranges
    const currentRanges = [...priceRange];
    
    // Toggle the selected value
    if (currentRanges.includes(value)) {
      // Always allow unselecting any option
      setPriceRange(currentRanges.filter(range => range !== value));
    } else {
      setPriceRange([...currentRanges, value]);
    }

    // Add a subtle haptic-like feedback animation to the container
    const container = document.querySelector('.price-range-container');
    if (container) {
      container.classList.add('scale-pulse');
      setTimeout(() => {
        container.classList.remove('scale-pulse');
      }, 200);
    }
  };

  // Function to determine the slider track background based on value
  const getSliderBackground = () => {
    const percentage = (radius / 50) * 100;
    // Use violet color for dining-out mode or amber for both mode
    const color = foodMode === 'dining-out' ? '#8b5cf6' : '#f97316';
    return `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className={`${FOOD_MODE_THEMES[foodMode].bgLight} p-2 rounded-lg`}>
              <DollarSign className={`w-5 h-5 ${FOOD_MODE_THEMES[foodMode].primaryColor}`} />
            </span>
            Price Range
            <span className={`ml-2 text-sm font-medium px-2.5 py-0.5 rounded-full bg-${foodMode === 'dining-out' ? 'violet' : foodMode === 'cooking' ? 'teal' : 'orange'}-50 ${FOOD_MODE_THEMES[foodMode].primaryColor.replace('-600', '-700')} border ${FOOD_MODE_THEMES[foodMode].ring}`}>per person</span>
          </label>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            onMouseEnter={() => setShowHelpTooltip('priceRange')}
            onMouseLeave={() => setShowHelpTooltip(null)}
          >
            <Info className="w-5 h-5" />
            <AnimatePresence>
              {showHelpTooltip === 'priceRange' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-10 bg-gray-900 text-white text-sm rounded-lg py-2 px-4 max-w-xs right-0 mt-2 shadow-lg"
                >
                  Select one or more price categories for your dining options
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
        <div className="price-range-container bg-white rounded-xl p-4 border border-gray-200 relative overflow-hidden">
          <motion.div 
            className={`absolute inset-0 rounded-xl bg-white`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs font-medium text-gray-500">Budget</div>
              <div className="text-xs font-medium text-gray-500">Luxury</div>
            </div>
            
            {/* 2x2 grid for price range options */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {priceRanges.map((price, index) => (
                <div key={price.value} className="flex flex-col">
                  <div className="relative">
                    {priceRange.includes(price.value) && price.isLuxury && (
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 rounded-xl blur-sm opacity-70"></div>
                    )}
                    <motion.button
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      animate={animatingOption === price.value ? { scale: [1, 0.95, 1.02, 1] } : {}}
                      onClick={() => handlePriceRangeSelect(price.value)}
                      disabled={isLoading}
                      className={`relative w-full py-3 px-2 rounded-xl font-medium text-center transition-all duration-200 overflow-hidden ${
                        priceRange.includes(price.value)
                          ? `bg-gradient-to-r ${price.color} text-white shadow-md ${price.isLuxury ? 'ring-2 ring-yellow-300' : ''}`
                          : `bg-gray-100 text-gray-600 hover:${price.hoverColor}`
                      } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {priceRange.includes(price.value) && price.isLuxury && (
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
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold">{price.icon}</span>
                        <span className="text-xs mt-1">{price.label}</span>
                      </div>
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">{price.amount}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 mb-1">
              {/* Use fixed height to maintain consistent card size */}
              <div className="h-[62px] overflow-hidden">
                {priceRange.length === 0 ? (
                  <div
                    className={`flex items-center gap-3 p-2.5 rounded-lg border border-${foodMode === 'dining-out' ? 'violet' : 'orange'}-200 bg-gradient-to-r from-${foodMode === 'dining-out' ? 'violet' : 'orange'}-50 to-${foodMode === 'dining-out' ? 'violet' : 'orange'}-100/30 backdrop-blur-sm shadow-sm`}
                  >
                    <div className={`p-1.5 rounded-full bg-${foodMode === 'dining-out' ? 'violet' : 'orange'}-100/80 text-${foodMode === 'dining-out' ? 'violet' : 'orange'}-600`}>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium text-${foodMode === 'dining-out' ? 'violet' : 'orange'}-700`}>
                        Select a price range
                      </p>
                      <p className={`text-xs text-${foodMode === 'dining-out' ? 'violet' : 'orange'}-600/80`}>
                        This helps match restaurants that fit your budget
                      </p>
                    </div>
                  </div>
                ) : priceRange.length === 1 ? (
                  <div
                    className="text-gray-500 text-xs flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <Info className="w-3 h-3 flex-shrink-0" />
                    <span>You can select multiple price ranges if needed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-green-100/30 backdrop-blur-sm shadow-sm">
                    <div className="p-1.5 rounded-full bg-green-100/80 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700">
                        Price ranges selected
                      </p>
                      <p className="text-xs text-green-600/80">
                        {priceRange.length} options will be used for recommendations
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Radius */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`${FOOD_MODE_THEMES[foodMode].bgLight} p-2 rounded-lg`}>
              <MapPin className={`w-5 h-5 ${FOOD_MODE_THEMES[foodMode].primaryColor}`} />
            </span>
            <span className="text-lg font-semibold text-gray-800">Search Radius</span>
          </div>
          <div 
            className={`text-lg font-semibold ${FOOD_MODE_THEMES[foodMode].bgLight} px-3 py-1 rounded-full text-gray-800 min-w-[5rem] text-center`}
          >
            {radius} {radius === 1 ? 'mile' : 'miles'}
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden min-h-[240px]">
          <motion.div 
            className={`absolute inset-0 rounded-xl bg-white`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          />
        
          <div className="flex flex-col justify-between h-full relative z-10">
            <div className="mb-6">
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-green-200 to-emerald-400 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: getSliderBackground()
                }}
                disabled={isLoading}
              />
            
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>1 mile</span>
                <span>50 miles</span>
              </div>
            </div>
          
            <div className="grid grid-cols-2 gap-2 mb-2">
              {distancePresets.map((preset) => (
                <motion.button
                  key={preset.value}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRadius(preset.value)}
                  disabled={isLoading}
                  className={`py-2 px-3 rounded-lg border flex flex-col items-center ${
                    radius === preset.value 
                      ? `border-${foodMode === 'dining-out' ? 'rose' : 'amber'}-300 bg-${foodMode === 'dining-out' ? 'rose' : 'amber'}-50 text-${foodMode === 'dining-out' ? 'rose' : 'amber'}-700` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-sm">{preset.label}</span>
                  <span className="text-[10px] mt-0.5 text-gray-500">{preset.description}</span>
                </motion.button>
              ))}
            </div>

            <div className="mt-3">
              {/* Display range description based on selected radius */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium">Current range: </span>
                    {radius <= 5 && "Nearby locations only - walking or short drive"}
                    {radius > 5 && radius <= 15 && "Local area - convenient driving distance"}
                    {radius > 15 && radius <= 30 && "Wider area - more options available"}
                    {radius > 30 && "Extended search - willing to travel for great food"}
                  </div>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 