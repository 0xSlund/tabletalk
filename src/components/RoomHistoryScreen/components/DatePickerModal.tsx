import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRange, DateRangeType } from '../types';

interface DatePickerModalProps {
  show: boolean;
  dateRange: DateRange;
  darkMode: boolean;
  onClose: () => void;
  onDateRangeChange: (range: DateRange) => void;
  onSelectedDateRangeChange: (type: DateRangeType) => void;
  onApply: () => void;
}

export function DatePickerModal({
  show,
  dateRange,
  darkMode,
  onClose,
  onDateRangeChange,
  onSelectedDateRangeChange,
  onApply
}: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  
  if (!show) return null;

  const handleClose = () => {
    onClose();
    if (!dateRange.start && !dateRange.end) {
      onSelectedDateRangeChange(null);
    }
  };

  const handleClear = () => {
    onDateRangeChange({ start: '', end: '' });
    onSelectedDateRangeChange(null);
    onClose();
  };

  const handleApply = () => {
    if (dateRange.start || dateRange.end) {
      onSelectedDateRangeChange('custom');
    } else {
      onSelectedDateRangeChange(null);
    }
    onApply();
  };

  const setPresetRange = (days: number) => {
    const today = new Date();
    const pastDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    onDateRangeChange({
      start: pastDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    });
  };

  // Calendar generation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentMonth]);

  const isDateInRange = (date: Date) => {
    if (!dateRange.start || !dateRange.end) return false;
    const dateStr = date.toISOString().split('T')[0];
    return dateStr >= dateRange.start && dateStr <= dateRange.end;
  };

  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === dateRange.start || dateStr === dateRange.end;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      // Start new selection
      onDateRangeChange({ start: dateStr, end: '' });
    } else if (dateStr < dateRange.start) {
      // Clicked before start date, make it the new start
      onDateRangeChange({ start: dateStr, end: dateRange.start });
    } else {
      // Clicked after start date, make it the end
      onDateRangeChange({ start: dateRange.start, end: dateStr });
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border ${
          darkMode
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-teal-900/50' : 'bg-teal-100'
              }`}>
                <Calendar className={`w-5 h-5 ${
                  darkMode ? 'text-teal-400' : 'text-teal-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold text-lg ${
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Custom Date Range
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Select your preferred date range
                </p>
              </div>
            </div>
            <motion.button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-all ${
                darkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Quick Presets */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Quick Presets
                  </label>
                  <div className="space-y-2">
                    <motion.button
                      onClick={() => setPresetRange(7)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                        darkMode
                          ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border border-blue-800'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Clock className="w-4 h-4" />
                      Last 7 Days
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setPresetRange(30)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                        darkMode
                          ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50 border border-green-800'
                          : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Calendar className="w-4 h-4" />
                      Last 30 Days
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setPresetRange(90)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                        darkMode
                          ? 'bg-orange-900/30 text-orange-400 hover:bg-orange-900/50 border border-orange-800'
                          : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Calendar className="w-4 h-4" />
                      Last 3 Months
                    </motion.button>
                  </div>
                </div>

                {/* Selected Range Display */}
                {(dateRange.start || dateRange.end) && (
                  <div className={`p-4 rounded-xl border ${
                    darkMode
                      ? 'bg-teal-900/20 border-teal-800 text-teal-300'
                      : 'bg-teal-50 border-teal-200 text-teal-700'
                  }`}>
                    <div className="text-sm font-medium mb-2">Selected Range:</div>
                    <div className="text-xs space-y-1">
                      <div>From: {dateRange.start ? new Date(dateRange.start).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'Not selected'}</div>
                      <div>To: {dateRange.end ? new Date(dateRange.end).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'Not selected'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Calendar */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between">
                    <h4 className={`text-lg font-semibold ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h4>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => navigateMonth('prev')}
                        className={`p-2 rounded-lg transition-all ${
                          darkMode
                            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => navigateMonth('next')}
                        className={`p-2 rounded-lg transition-all ${
                          darkMode
                            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day Headers */}
                    {dayNames.map(day => (
                      <div
                        key={day}
                        className={`p-2 text-center text-xs font-medium ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar Days */}
                    {calendarDays.map((date, index) => {
                      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isSelected = isDateSelected(date);
                      const isInRange = isDateInRange(date);
                      const dateStr = date.toISOString().split('T')[0];
                      
                      return (
                        <motion.button
                          key={index}
                          onClick={() => handleDateClick(date)}
                          onMouseEnter={() => setHoveredDate(dateStr)}
                          onMouseLeave={() => setHoveredDate(null)}
                          className={`
                            relative p-2 text-sm rounded-lg transition-all duration-200
                            ${!isCurrentMonth 
                              ? darkMode 
                                ? 'text-gray-600 hover:text-gray-500' 
                                : 'text-gray-300 hover:text-gray-400'
                              : darkMode 
                                ? 'text-gray-200 hover:text-white' 
                                : 'text-gray-700 hover:text-gray-900'
                            }
                            ${isSelected
                              ? darkMode
                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                                : 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                              : isInRange
                                ? darkMode
                                  ? 'bg-teal-900/30 text-teal-300'
                                  : 'bg-teal-100 text-teal-700'
                                : darkMode
                                  ? 'hover:bg-gray-700'
                                  : 'hover:bg-gray-100'
                            }
                            ${isToday && !isSelected
                              ? darkMode
                                ? 'ring-2 ring-teal-500 ring-opacity-50'
                                : 'ring-2 ring-teal-500 ring-opacity-50'
                              : ''
                            }
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {date.getDate()}
                          {isToday && (
                            <div className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-teal-500'
                            }`} />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-600">
            <motion.button
              onClick={handleClear}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear
            </motion.button>
            
            <motion.button
              onClick={handleApply}
              disabled={!dateRange.start && !dateRange.end}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                !dateRange.start && !dateRange.end
                  ? darkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : darkMode
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/30'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/30'
              }`}
              whileHover={dateRange.start || dateRange.end ? { scale: 1.02 } : {}}
              whileTap={dateRange.start || dateRange.end ? { scale: 0.98 } : {}}
            >
              Apply Filter
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
} 