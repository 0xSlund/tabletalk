import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { filterOptions } from './constants';
import { FilterPanelProps } from './types';

export const FilterPanel: React.FC<FilterPanelProps> = ({
  showFilters,
  selectedFilter,
  onClose,
  onFilterChange,
  onApplyFilters
}) => (
  <AnimatePresence>
    {showFilters && (
      <>
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-30 overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: '#4A3B5C' }}>Filter Options</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: '#7D6B8A' }} />
              </button>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: '#7D6B8A' }}>Meal Type</h3>
              <div className="grid grid-cols-1 gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFilterChange(option.value)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                      selectedFilter === option.value
                        ? "bg-white border-gray-200 hover:bg-gray-50"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    )}
                    style={selectedFilter === option.value 
                      ? { 
                          backgroundColor: 'rgba(184, 169, 209, 0.1)', 
                          borderColor: 'rgba(184, 169, 209, 0.3)', 
                          color: '#B8A9D1' 
                        }
                      : { color: '#4A4A4A' }
                    }
                  >
                    <div className="p-2 rounded-lg bg-gray-100">
                      {option.icon}
                    </div>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm opacity-70">{option.description}</p>
                    </div>
                    {selectedFilter === option.value && (
                      <Check className="w-5 h-5 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
              
              <button
                onClick={onApplyFilters}
                className="w-full text-white py-3 rounded-xl font-medium transition-all"
                style={{ 
                  background: 'linear-gradient(to right, #B8A9D1, #7D6B8A)',
                  boxShadow: '0 4px 6px -1px rgba(184, 169, 209, 0.3)'
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
); 