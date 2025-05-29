import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UtensilsCrossed, X, Check, Star } from 'lucide-react';
import { FoodMode, FOOD_MODE_THEMES } from './constants';

interface AllCuisinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  cuisines: Array<{ id: string; name: string; emoji: string; popular?: boolean }>;
  selectedCuisines: string[];
  setSelectedCuisines: (cuisines: string[]) => void;
  foodMode: FoodMode;
}

export function AllCuisinesModal({
  isOpen,
  onClose,
  cuisines,
  selectedCuisines,
  setSelectedCuisines,
  foodMode
}: AllCuisinesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Group cuisines by first letter
  const groupedCuisines = useMemo(() => {
    if (!cuisines || cuisines.length === 0) {
      return {};
    }
    
    const filtered = searchTerm 
      ? cuisines.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : cuisines;
      
    return filtered.reduce((acc, cuisine) => {
      const firstLetter = cuisine.name[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(cuisine);
      return acc;
    }, {} as Record<string, typeof cuisines>);
  }, [cuisines, searchTerm]);
  
  // Extract and sort categories
  useEffect(() => {
    const cats = Object.keys(groupedCuisines).sort();
    setCategories(cats);
  }, [groupedCuisines]);
  
  // Handle cuisine selection
  const toggleCuisine = (id: string) => {
    if (selectedCuisines.includes(id)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== id));
    } else {
      setSelectedCuisines([...selectedCuisines, id]);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl"
      >
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className={`w-5 h-5 ${FOOD_MODE_THEMES[foodMode].primaryColor}`} />
            All Cuisine Types
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          {/* Search input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search cuisines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-${FOOD_MODE_THEMES[foodMode].primaryColor.replace('text-', '')}`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Selected cuisines */}
          {selectedCuisines.length > 0 && cuisines && cuisines.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className={`text-sm font-medium ${FOOD_MODE_THEMES[foodMode].primaryColor}`}>
                  Selected ({selectedCuisines.length})
                </h4>
                <button
                  onClick={() => setSelectedCuisines([])}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cuisines
                  .filter(c => selectedCuisines.includes(c.id))
                  .map((cuisine) => (
                    <motion.button
                      key={cuisine.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleCuisine(cuisine.id)}
                      className={`bg-gradient-to-r ${FOOD_MODE_THEMES[foodMode].gradientFrom} ${FOOD_MODE_THEMES[foodMode].gradientTo} text-white px-3 py-1.5 rounded-full flex items-center gap-1.5`}
                    >
                      <span className="text-lg">{cuisine.emoji}</span>
                      <span className="font-medium">{cuisine.name}</span>
                      <X className="w-3.5 h-3.5 ml-1" />
                    </motion.button>
                  ))}
              </div>
            </div>
          )}
          
          {/* Cuisines by category */}
          <div className="overflow-y-auto max-h-[400px] pr-2 -mr-2">
            {categories.length > 0 ? (
              categories.map(category => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="text-sm font-medium text-gray-500 mb-3 sticky top-0 bg-white py-1">
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {groupedCuisines[category].map(cuisine => {
                      const isSelected = selectedCuisines.includes(cuisine.id);
                      return (
                        <motion.button
                          key={cuisine.id}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleCuisine(cuisine.id)}
                          className={`relative overflow-hidden px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                            isSelected 
                              ? `bg-gradient-to-r ${FOOD_MODE_THEMES[foodMode].gradientFrom} ${FOOD_MODE_THEMES[foodMode].gradientTo} text-white shadow-md` 
                              : 'bg-white border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xl">{cuisine.emoji}</span>
                          <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                            {cuisine.name}
                          </span>
                          {cuisine.popular && !isSelected && (
                            <div className="absolute top-0 right-0">
                              <div className={`w-5 h-5 transform rotate-45 translate-x-2 -translate-y-2 bg-amber-400`}>
                                <div className="absolute inset-0 flex items-center justify-center transform -rotate-45 -translate-x-2 translate-y-2">
                                  <Star className="w-2 h-2 text-white" />
                                </div>
                              </div>
                            </div>
                          )}
                          {isSelected && (
                            <Check className="w-4 h-4 ml-auto" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <motion.div
                  initial={{ y: 10 }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-4xl mb-4"
                >
                  🔍
                </motion.div>
                <p className="text-gray-500 mb-1">No cuisines found matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className={`text-sm ${FOOD_MODE_THEMES[foodMode].primaryColor} font-medium`}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-white rounded-lg bg-gradient-to-r ${FOOD_MODE_THEMES[foodMode].gradientFrom} ${FOOD_MODE_THEMES[foodMode].gradientTo}`}
          >
            Apply ({selectedCuisines.length})
          </button>
        </div>
      </motion.div>
    </div>
  );
} 