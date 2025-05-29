import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { itemVariants } from '../types';
import { PRICE_RANGES } from '../constants';
import { FoodMode } from '../types';

interface PriceRangeSelectorProps {
  foodMode: FoodMode;
  priceRange: string;
  setPriceRange: (range: string) => void;
  isCreating: boolean;
}

export const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
  foodMode,
  priceRange,
  setPriceRange,
  isCreating
}) => {
  // Only show for dining out or both
  const shouldShow = foodMode === 'dining-out' || foodMode === 'both';

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div 
          variants={itemVariants}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-orange-500" />
            <span className="text-lg font-bold text-gray-800">Price Range <span className="text-sm font-medium text-gray-600">(per person)</span></span>
          </div>
          <div className="flex space-x-3">
            {PRICE_RANGES.map((price) => (
              <div key={price.symbol} className="flex-1 flex flex-col">
                <div className="relative">
                  {priceRange === price.symbol && price.isLuxury && (
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 rounded-xl blur-sm opacity-70"></div>
                  )}
                  <motion.button
                    whileHover={{ y: -3, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPriceRange(price.symbol)}
                    disabled={isCreating}
                    className={`relative w-full py-3 px-2 rounded-xl font-medium text-center transition-all duration-200 overflow-hidden ${
                      priceRange === price.symbol
                        ? `bg-gradient-to-r ${price.color} text-white shadow-md ${price.isLuxury ? 'ring-2 ring-yellow-300' : ''}`
                        : `bg-gray-100 text-gray-600 hover:${price.hoverColor}`
                    } ${isCreating ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {priceRange === price.symbol && price.isLuxury && (
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
                    {price.symbol}
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">{price.average}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Budget</span>
            <span>Luxury</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 