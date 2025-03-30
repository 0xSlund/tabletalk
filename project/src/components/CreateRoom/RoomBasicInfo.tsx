import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Check, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface PriceRange {
  value: string;
  label: string;
  amount: string;
  icon: string;
}

const priceRanges: PriceRange[] = [
  { value: '$', label: 'Budget', amount: 'Under $15', icon: '$' },
  { value: '$$', label: 'Moderate', amount: '$15-30', icon: '$$' },
  { value: '$$$', label: 'Expensive', amount: '$31-60', icon: '$$$' },
  { value: '$$$$', label: 'Very Expensive', amount: 'Over $60', icon: '$$$$' },
];

const cuisines = [
  { id: 'italian', name: 'Italian', emoji: '🍝', popular: true },
  { id: 'japanese', name: 'Japanese', emoji: '🍱', popular: true },
  { id: 'mexican', name: 'Mexican', emoji: '🌮', popular: true },
  { id: 'chinese', name: 'Chinese', emoji: '🥡', popular: true },
  { id: 'indian', name: 'Indian', emoji: '🍛', popular: true },
  { id: 'american', name: 'American', emoji: '🍔' },
  { id: 'thai', name: 'Thai', emoji: '🍜' },
  { id: 'mediterranean', name: 'Mediterranean', emoji: '🥙' },
  { id: 'vietnamese', name: 'Vietnamese', emoji: '🍜' },
  { id: 'korean', name: 'Korean', emoji: '🍖' },
  { id: 'french', name: 'French', emoji: '🥐' },
  { id: 'greek', name: 'Greek', emoji: '🥗' },
];

interface RoomBasicInfoProps {
  roomName: string;
  setRoomName: (name: string) => void;
  selectedCuisines: string[];
  setSelectedCuisines: (cuisines: string[]) => void;
  priceRange: string[];
  setPriceRange: (range: string[]) => void;
  radius: number;
  setRadius: (radius: number) => void;
  isLoading: boolean;
}

export function RoomBasicInfo({
  roomName,
  setRoomName,
  selectedCuisines,
  setSelectedCuisines,
  priceRange,
  setPriceRange,
  radius,
  setRadius,
  isLoading
}: RoomBasicInfoProps) {
  const [showCuisineModal, setShowCuisineModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Generate smart suggestions based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let timeBasedSuggestions: string[] = [];

    if (hour >= 6 && hour < 11) {
      timeBasedSuggestions = ["Breakfast with the Team", "Morning Coffee Meetup", "Brunch Club"];
    } else if (hour >= 11 && hour < 14) {
      timeBasedSuggestions = ["Lunch Break", "Quick Lunch Meetup", "Team Lunch"];
    } else if (hour >= 14 && hour < 17) {
      timeBasedSuggestions = ["Afternoon Snack Run", "Coffee & Dessert", "Tea Time"];
    } else if (hour >= 17 && hour < 22) {
      timeBasedSuggestions = ["Dinner Plans", "Evening Meetup", "After Work Dinner"];
    } else {
      timeBasedSuggestions = ["Late Night Eats", "Midnight Snack", "Night Out"];
    }

    setSuggestions(timeBasedSuggestions);
  }, []);

  // Separate selected and unselected cuisines
  const selectedCuisineObjects = cuisines.filter(c => selectedCuisines.includes(c.id));
  const unselectedPopularCuisines = cuisines.filter(c => 
    c.popular && !selectedCuisines.includes(c.id)
  );

  const filteredCuisines = cuisines.filter(cuisine => 
    cuisine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Room Name */}
      <div className="space-y-2">
        <label htmlFor="roomName" className="block text-lg font-medium text-gray-900">
          Room Name
        </label>
        <div className="relative">
          <motion.div
            className={cn(
              "absolute -inset-px rounded-xl transition-all",
              isFocused ? "ring-2 ring-orange-500 ring-offset-2" : "ring-1 ring-gray-200"
            )}
            animate={{ scale: isFocused ? 1.02 : 1 }}
            transition={{ duration: 0.2 }}
          />
          <input
            type="text"
            id="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="e.g., Lunch with Friends"
            className="w-full px-4 py-3 rounded-xl bg-transparent relative z-10 border-none focus:ring-0 focus:outline-none"
            required
            disabled={isLoading}
            maxLength={30}
          />
          {roomName.length > 0 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {roomName.length}/30
            </div>
          )}
        </div>

        {/* Smart Suggestions */}
        <AnimatePresence>
          {isFocused && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap gap-2 mt-2"
            >
              {suggestions.map((suggestion) => (
                <motion.button
                  key={suggestion}
                  type="button"
                  onClick={() => setRoomName(suggestion)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cuisine Preferences */}
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-4">
          Cuisine Preferences
        </label>
        
        {/* Selected Cuisines */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4"
        >
          {selectedCuisineObjects.map((cuisine) => (
            <motion.button
              key={cuisine.id}
              variants={itemVariants}
              type="button"
              onClick={() => setSelectedCuisines(prev => prev.filter(id => id !== cuisine.id))}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-3 rounded-xl bg-orange-100 border border-orange-300 text-orange-800 text-sm font-medium transition-all"
            >
              <div className="flex items-center gap-2 justify-center">
                <span className="text-xl">{cuisine.emoji}</span>
                <span>{cuisine.name}</span>
                <Check className="w-4 h-4" />
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Popular Unselected Cuisines */}
        {unselectedPopularCuisines.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {unselectedPopularCuisines.map((cuisine) => (
              <motion.button
                key={cuisine.id}
                variants={itemVariants}
                type="button"
                onClick={() => setSelectedCuisines(prev => [...prev, cuisine.id])}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-all"
              >
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-xl">{cuisine.emoji}</span>
                  <span>{cuisine.name}</span>
                </div>
              </motion.button>
            ))}
            
            <motion.button
              variants={itemVariants}
              type="button"
              onClick={() => setShowCuisineModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-3 rounded-xl border border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              + More Options
            </motion.button>
          </motion.div>
        )}

        {selectedCuisines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-gray-600"
          >
            {selectedCuisines.length} selected
          </motion.div>
        )}

        {/* Cuisine Modal */}
        <AnimatePresence>
          {showCuisineModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">All Cuisines</h3>
                  <button
                    type="button"
                    onClick={() => setShowCuisineModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search cuisines..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Cuisine List */}
                <div className="flex-1 overflow-y-auto">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 gap-3"
                  >
                    {filteredCuisines.map((cuisine) => (
                      <motion.button
                        key={cuisine.id}
                        variants={itemVariants}
                        type="button"
                        onClick={() => setSelectedCuisines(prev => 
                          prev.includes(cuisine.id)
                            ? prev.filter(c => c !== cuisine.id)
                            : [...prev, cuisine.id]
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                          selectedCuisines.includes(cuisine.id)
                            ? "bg-orange-100 border-orange-300 text-orange-800"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-2 justify-center">
                          <span className="text-xl">{cuisine.emoji}</span>
                          <span>{cuisine.name}</span>
                          {selectedCuisines.includes(cuisine.id) && (
                            <Check className="w-4 h-4" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                </div>

                {/* Confirm Button */}
                <motion.button
                  type="button"
                  onClick={() => setShowCuisineModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  Confirm Selection
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-4">
          Price Range
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {priceRanges.map((range) => (
            <motion.button
              key={range.value}
              type="button"
              onClick={() => setPriceRange([range.value])}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                priceRange.includes(range.value)
                  ? "bg-green-100 border-green-300 text-green-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="text-2xl font-medium">{range.icon}</div>
              <div className="text-sm font-medium">{range.label}</div>
              <div className="text-xs text-gray-500">{range.amount}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Location Radius */}
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-2">
          Location Radius
        </label>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">Current Location</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="25"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:bg-orange-500
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:duration-150
                [&::-webkit-slider-thumb]:ease-in-out
                [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <span className="text-gray-900 font-medium w-20 text-right">
              {radius} miles
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}