import React, { useState, useRef, useEffect } from 'react';
import { CalendarClock, AlertTriangle, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeadlineSectionProps } from '../types';

export const DeadlineSection: React.FC<DeadlineSectionProps> = ({
  deadline,
  setDeadline,
  minDate,
  showHelpTooltip,
  setShowHelpTooltip
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(deadline ? new Date(deadline) : null);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState('07');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');
  const [use24HourFormat, setUse24HourFormat] = useState(false); // This would come from user profile settings
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Initialize time from existing deadline
  useEffect(() => {
    if (deadline) {
      const date = new Date(deadline);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      if (use24HourFormat) {
        setSelectedHour(hours.toString().padStart(2, '0'));
        setSelectedMinute(minutes.toString().padStart(2, '0'));
      } else {
        // Convert 24-hour to 12-hour format
        let hour12: number;
        let period: 'AM' | 'PM';
        
        if (hours === 0) {
          hour12 = 12; // 00:xx = 12:xx AM
          period = 'AM';
        } else if (hours < 12) {
          hour12 = hours; // 01:xx to 11:xx = 1:xx to 11:xx AM
          period = 'AM';
        } else if (hours === 12) {
          hour12 = 12; // 12:xx = 12:xx PM
          period = 'PM';
        } else {
          hour12 = hours - 12; // 13:xx to 23:xx = 1:xx to 11:xx PM
          period = 'PM';
        }
        
        setSelectedHour(hour12.toString().padStart(2, '0'));
        setSelectedMinute(minutes.toString().padStart(2, '0'));
        setSelectedPeriod(period);
      }
      
      setSelectedDate(date);
      setViewDate(date);
    }
  }, [deadline, use24HourFormat]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // Convert 12-hour time to 24-hour format
  const convertTo24Hour = (hour: string, minute: string, period: 'AM' | 'PM'): string => {
    let hour24 = parseInt(hour);
    
    // Handle AM times
    if (period === 'AM') {
      if (hour24 === 12) {
        hour24 = 0; // 12 AM = 00:xx
      }
      // 1-11 AM stays the same
    } 
    // Handle PM times
    else if (period === 'PM') {
      if (hour24 !== 12) {
        hour24 += 12; // 1-11 PM becomes 13-23
      }
      // 12 PM stays 12
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  // Get current time in 24-hour format
  const getCurrentTime24 = (): string => {
    if (use24HourFormat) {
      return `${selectedHour}:${selectedMinute}`;
    } else {
      return convertTo24Hour(selectedHour, selectedMinute, selectedPeriod);
    }
  };

  // Update time and deadline with specific values
  const updateTimeWithValues = (hour: string, minute: string, period?: 'AM' | 'PM') => {
    // Ensure we have a date to work with - use selected date or today
    let baseDate = selectedDate;
    if (!baseDate) {
      baseDate = new Date();
      setSelectedDate(baseDate);
    }
    
    let time24: string;
    if (use24HourFormat) {
      time24 = `${hour}:${minute}`;
    } else {
      const actualPeriod = period || selectedPeriod;
      time24 = convertTo24Hour(hour, minute, actualPeriod);
      console.log(`Converting: ${hour}:${minute} ${actualPeriod} → ${time24} (24h)`);
    }
    
    const [hours, minutes] = time24.split(':').map(Number);
    console.log(`Setting time to: ${hours}:${minutes.toString().padStart(2, '0')} (${hours} hours, ${minutes} minutes)`);
    
    const newDate = new Date(baseDate);
    newDate.setHours(hours, minutes, 0, 0);
    
    console.log(`Final datetime: ${newDate.toString()}`);
    
    setSelectedDate(newDate);
    setDeadline(newDate.toISOString().slice(0, 16));
  };

  // Update time and deadline
  const updateTimeSelection = () => {
    updateTimeWithValues(selectedHour, selectedMinute, selectedPeriod);
  };

  // Quick selection options
  const handleTonight = () => {
    const tonight = new Date();
    tonight.setHours(21, 0, 0, 0);
    setSelectedDate(tonight);
    if (use24HourFormat) {
      setSelectedHour('21');
      setSelectedMinute('00');
    } else {
      setSelectedHour('09');
      setSelectedMinute('00');
      setSelectedPeriod('PM');
    }
    setDeadline(tonight.toISOString().slice(0, 16));
  };

  const handleTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);
    setSelectedDate(tomorrow);
    if (use24HourFormat) {
      setSelectedHour('19');
      setSelectedMinute('00');
    } else {
      setSelectedHour('07');
      setSelectedMinute('00');
      setSelectedPeriod('PM');
    }
    setDeadline(tomorrow.toISOString().slice(0, 16));
  };

  const handleWeekend = () => {
    const today = new Date();
    const daysUntilSaturday = 6 - today.getDay();
    const weekend = new Date();
    weekend.setDate(today.getDate() + daysUntilSaturday);
    weekend.setHours(12, 0, 0, 0);
    setSelectedDate(weekend);
    if (use24HourFormat) {
      setSelectedHour('12');
      setSelectedMinute('00');
    } else {
      setSelectedHour('12');
      setSelectedMinute('00');
      setSelectedPeriod('PM');
    }
    setDeadline(weekend.toISOString().slice(0, 16));
  };

  // Calendar utilities
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const goToPreviousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const time24 = getCurrentTime24();
    const [hours, minutes] = time24.split(':').map(Number);
    newDate.setHours(hours, minutes, 0, 0);
    
    setSelectedDate(newDate);
    setDeadline(newDate.toISOString().slice(0, 16));
  };

  const confirmSelection = () => {
    updateTimeSelection();
    setShowDatePicker(false);
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const minDateTime = new Date(minDate);
    
    // For date comparison, we only care about the date part, not the time
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minDateOnly = new Date(minDateTime.getFullYear(), minDateTime.getMonth(), minDateTime.getDate());
    
    // If the selected date is before the minimum date, it's disabled
    if (dateOnly < minDateOnly) {
      return true;
    }
    
    // If it's the same date as minimum date, check if we have enough time left in the day
    if (dateOnly.getTime() === minDateOnly.getTime()) {
      // If it's today, allow selection since user can pick a future time
      return false;
    }
    
    return false;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      viewDate.getFullYear() === today.getFullYear() &&
      viewDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      viewDate.getFullYear() === selectedDate.getFullYear() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    );
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isNextMonth: false
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isNextMonth: false
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-4">
      <label className="text-base font-medium text-gray-700 block">Set Deadline</label>
      
      <div className="flex flex-wrap gap-2">
        <motion.button
          type="button"
          onClick={handleTonight}
          className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Tonight
        </motion.button>
        <motion.button
          type="button"
          onClick={handleTomorrow}
          className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Tomorrow
        </motion.button>
        <motion.button
          type="button"
          onClick={handleWeekend}
          className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          This Weekend
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setShowDatePicker(true)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-1 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CalendarClock className="w-4 h-4 text-gray-500" />
          Pick Date
        </motion.button>
      </div>

      {/* Date Picker Popup */}
      <AnimatePresence>
        {showDatePicker && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDatePicker(false)}
            >
              {/* Date Picker Modal */}
              <motion.div
                ref={datePickerRef}
                className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Select Deadline</h3>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h4 className="text-lg font-medium text-gray-900">
                      {formatMonth(viewDate)}
                    </h4>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="mb-6">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((dateObj, index) => {
                        const { day, isCurrentMonth } = dateObj;
                        const disabled = isCurrentMonth && isDateDisabled(day);
                        const today = isCurrentMonth && isToday(day);
                        const selected = isCurrentMonth && isSelected(day);

                        return (
                          <button
                            key={index}
                            onClick={() => isCurrentMonth && !disabled && selectDate(day)}
                            disabled={!isCurrentMonth || disabled}
                            className={`
                              h-10 w-10 rounded-lg text-sm font-medium transition-colors
                              ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                              ${disabled ? 'text-gray-300 cursor-not-allowed' : ''}
                              ${selected ? 'bg-rose-600 text-white' : ''}
                              ${today && !selected ? 'bg-rose-100 text-rose-600' : ''}
                              ${isCurrentMonth && !disabled && !selected && !today ? 'hover:bg-gray-100 text-gray-700' : ''}
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enhanced Time Selection */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                      <Clock className="w-4 h-4" />
                      Select Time
                    </label>
                    
                    {/* Time Format Toggle */}
                    <div className="flex items-center justify-center mb-4">
                      <button
                        onClick={() => setUse24HourFormat(!use24HourFormat)}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Switch to {use24HourFormat ? '12-hour' : '24-hour'} format
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-center gap-1">
                        {/* Hour Selector */}
                        <div className="flex flex-col items-center">
                          <label className="text-xs font-medium text-gray-500 mb-2">Hour</label>
                          <div className="relative">
                            <select
                              value={selectedHour}
                              onChange={(e) => {
                                const newHour = e.target.value;
                                setSelectedHour(newHour);
                                updateTimeWithValues(newHour, selectedMinute, selectedPeriod);
                              }}
                              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-center font-mono text-lg font-semibold text-gray-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 cursor-pointer hover:bg-gray-50 transition-colors min-w-[60px]"
                            >
                              {use24HourFormat 
                                ? Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i.toString().padStart(2, '0')}>
                                      {i.toString().padStart(2, '0')}
                                    </option>
                                  ))
                                : Array.from({ length: 12 }, (_, i) => {
                                    const hour = i + 1;
                                    return (
                                      <option key={hour} value={hour.toString().padStart(2, '0')}>
                                        {hour.toString().padStart(2, '0')}
                                      </option>
                                    );
                                  })
                              }
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                            </div>
                          </div>
                        </div>

                        {/* Separator */}
                        <div className="text-2xl font-bold text-gray-400 mt-6 mx-1">:</div>

                        {/* Minute Selector */}
                        <div className="flex flex-col items-center">
                          <label className="text-xs font-medium text-gray-500 mb-2">Minute</label>
                          <div className="relative">
                            <select
                              value={selectedMinute}
                              onChange={(e) => {
                                const newMinute = e.target.value;
                                setSelectedMinute(newMinute);
                                updateTimeWithValues(selectedHour, newMinute, selectedPeriod);
                              }}
                              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-center font-mono text-lg font-semibold text-gray-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 cursor-pointer hover:bg-gray-50 transition-colors min-w-[60px]"
                            >
                              {Array.from({ length: 60 }, (_, i) => (
                                <option key={i} value={i.toString().padStart(2, '0')}>
                                  {i.toString().padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                            </div>
                          </div>
                        </div>

                        {/* Period Selector (only for 12-hour format) */}
                        {!use24HourFormat && (
                          <div className="flex flex-col items-center ml-2">
                            <label className="text-xs font-medium text-gray-500 mb-2">Period</label>
                            <div className="relative">
                              <select
                                value={selectedPeriod}
                                onChange={(e) => {
                                  const newPeriod = e.target.value as 'AM' | 'PM';
                                  setSelectedPeriod(newPeriod);
                                  updateTimeWithValues(selectedHour, selectedMinute, newPeriod);
                                }}
                                className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-center font-mono text-lg font-semibold text-gray-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 cursor-pointer hover:bg-gray-50 transition-colors min-w-[70px]"
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Time Display */}
                      <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2">
                          <Clock className="w-4 h-4 text-rose-600" />
                          <span className="font-mono text-lg font-semibold text-gray-800">
                            {use24HourFormat 
                              ? `${selectedHour}:${selectedMinute}` 
                              : `${selectedHour}:${selectedMinute} ${selectedPeriod}`
                            }
                          </span>
                          {use24HourFormat && (
                            <span className="text-sm text-gray-500">
                              ({new Date(`2000-01-01T${selectedHour}:${selectedMinute}`).toLocaleTimeString([], { 
                                hour: 'numeric', 
                                minute: '2-digit', 
                                hour12: true 
                              })})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Time Presets */}
                      <div className="mt-4">
                        <div className="text-xs font-medium text-gray-500 mb-2 text-center">Quick Times</div>
                        <div className="flex gap-2 justify-center flex-wrap">
                          {use24HourFormat 
                            ? ['09:00', '12:00', '15:00', '18:00', '21:00'].map((time) => {
                                const [h, m] = time.split(':');
                                const isSelected = selectedHour === h && selectedMinute === m;
                                return (
                                  <button
                                    key={time}
                                    onClick={() => {
                                      setSelectedHour(h);
                                      setSelectedMinute(m);
                                      updateTimeWithValues(h, m);
                                    }}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                      isSelected 
                                        ? 'bg-rose-600 text-white' 
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                  >
                                    {time}
                                  </button>
                                );
                              })
                            : [
                                { time: '09:00', period: 'AM' },
                                { time: '12:00', period: 'PM' },
                                { time: '03:00', period: 'PM' },
                                { time: '06:00', period: 'PM' },
                                { time: '09:00', period: 'PM' }
                              ].map(({ time, period }) => {
                                const [h, m] = time.split(':');
                                const isSelected = selectedHour === h && selectedMinute === m && selectedPeriod === period;
                                return (
                                  <button
                                    key={`${time}-${period}`}
                                    onClick={() => {
                                      setSelectedHour(h);
                                      setSelectedMinute(m);
                                      setSelectedPeriod(period as 'AM' | 'PM');
                                      updateTimeWithValues(h, m, period as 'AM' | 'PM');
                                    }}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                      isSelected 
                                        ? 'bg-rose-600 text-white' 
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                  >
                                    {h}:{m} {period}
                                  </button>
                                );
                              })
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmSelection}
                      disabled={!selectedDate}
                      className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium shadow-lg"
                    >
                      Set Deadline
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {deadline ? (
        <motion.div 
          className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-green-600" />
            <span>
              Decision deadline set for: <span className="font-medium">{new Date(deadline).toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}</span>
            </span>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center gap-2 text-gray-500" role="alert">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="text-sm">No deadline set yet</span>
        </div>
      )}
    </div>
  );
}; 