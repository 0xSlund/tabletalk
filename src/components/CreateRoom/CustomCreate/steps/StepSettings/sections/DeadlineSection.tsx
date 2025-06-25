import React, { useState, useRef, useEffect } from 'react';
import { CalendarClock, AlertTriangle, ChevronLeft, ChevronRight, Clock, X, Moon, Sunrise, CalendarDays, Sun, Sunset, RefreshCw, Coffee, Utensils, Pizza, Sandwich, Soup, Wine, Beer, CupSoda, Croissant, Apple, Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeadlineSectionProps } from '../types';

// Helper to format Date to YYYY-MM-DDTHH:MM (local)
const formatLocalDateToInputString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const DeadlineSection: React.FC<DeadlineSectionProps> = ({
  deadline,
  setDeadline,
  minDate,
  showHelpTooltip,
  setShowHelpTooltip,
  selectedMeals,
  setSelectedMeals
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(deadline ? new Date(deadline) : null);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState('07');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');
  const [use24HourFormat, setUse24HourFormat] = useState(false);
  const [isUserChangingTime, setIsUserChangingTime] = useState(false); // Track if user is actively changing time
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // Track which meal is being rerolled for animation
  const [rerollingMeal, setRerollingMeal] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);
  
  // Meal variations bank
  const mealVariations = {
    breakfast: [
      { name: 'Breakfast', icon: Coffee, color: 'orange', minHour: 7, maxHour: 9 },
      { name: 'Brunch', icon: Croissant, color: 'amber', minHour: 10, maxHour: 11 },
      { name: 'Morning Coffee', icon: CupSoda, color: 'yellow', minHour: 6, maxHour: 8 },
      { name: 'Early Bite', icon: Apple, color: 'lime', minHour: 6, maxHour: 8 },
      { name: 'Continental', icon: Sandwich, color: 'orange', minHour: 8, maxHour: 10 }
    ],
    lunch: [
      { name: 'Lunch', icon: Utensils, color: 'amber', minHour: 12, maxHour: 13 },
      { name: 'Power Lunch', icon: Sandwich, color: 'orange', minHour: 12, maxHour: 13 },
      { name: 'Late Lunch', icon: Pizza, color: 'red', minHour: 14, maxHour: 15 },
      { name: 'Light Lunch', icon: Soup, color: 'sky', minHour: 11, maxHour: 13 },
      { name: 'Lunch Break', icon: Apple, color: 'lime', minHour: 12, maxHour: 14 }
    ],
    dinner: [
      { name: 'Dinner', icon: Moon, color: 'purple', minHour: 18, maxHour: 20 },
      { name: 'Early Dinner', icon: Sunset, color: 'orange', minHour: 17, maxHour: 18 },
      { name: 'Late Dinner', icon: Wine, color: 'rose', minHour: 20, maxHour: 21 },
      { name: 'Happy Hour', icon: Beer, color: 'amber', minHour: 17, maxHour: 19 },
      { name: 'Supper', icon: Soup, color: 'indigo', minHour: 19, maxHour: 21 },
      { name: 'Evening Meal', icon: Pizza, color: 'red', minHour: 18, maxHour: 20 }
    ]
  };
  
  // Use props for selected meals state management, with fallback for local state
  const [localSelectedMeals, setLocalSelectedMeals] = useState({
    breakfast: { ...mealVariations.breakfast[0], hour: 9, minute: 0 },
    lunch: { ...mealVariations.lunch[0], hour: 13, minute: 0 },
    dinner: { ...mealVariations.dinner[0], hour: 19, minute: 0 }
  });

  // Use provided selectedMeals from props or local state
  const currentSelectedMeals = selectedMeals || localSelectedMeals;
  const setCurrentSelectedMeals = setSelectedMeals || setLocalSelectedMeals;
  
  // Function to generate random meal variation with time
  const generateMealVariation = (mealType: 'breakfast' | 'lunch' | 'dinner', existingColors: string[] = []) => {
    const variations = mealVariations[mealType];
    
    // Filter out variations with colors already in use
    const availableVariations = variations.filter(v => !existingColors.includes(v.color));
    
    // If all colors are taken (shouldn't happen with our variety), fall back to all variations
    const variationsToChoose = availableVariations.length > 0 ? availableVariations : variations;
    
    const randomIndex = Math.floor(Math.random() * variationsToChoose.length);
    const variation = variationsToChoose[randomIndex];
    
    // Ensure we don't get the same variation name (for rerolls)
    const currentVariation = currentSelectedMeals ? currentSelectedMeals[mealType] : null;
    if (currentVariation && variationsToChoose.length > 1 && variation.name === currentVariation.name) {
      return generateMealVariation(mealType, existingColors); // Recursively try again
    }
    
    const hour = variation.minHour + Math.floor(Math.random() * (variation.maxHour - variation.minHour + 1));
    const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
    
    return { ...variation, hour, minute };
  };
  
  // Initialize meal variations on mount
  useEffect(() => {
    // Only initialize if we don't have selectedMeals from props
    if (!selectedMeals) {
      const breakfast = generateMealVariation('breakfast', []);
      const lunch = generateMealVariation('lunch', [breakfast.color]);
      const dinner = generateMealVariation('dinner', [breakfast.color, lunch.color]);
      
      setLocalSelectedMeals({
        breakfast,
        lunch,
        dinner
      });
    }
  }, [selectedMeals]);

  const isPresetActive = (presetType: 'breakfast' | 'lunch' | 'dinner' | 'weekend'): boolean => {
    if (!selectedDate || !deadline || !currentSelectedMeals) return false;

    const selectedDateTime = new Date(deadline);
    // Zero out milliseconds for comparison
    selectedDateTime.setMilliseconds(0);
    
    switch (presetType) {
      case 'breakfast':
        if (!currentSelectedMeals.breakfast || typeof currentSelectedMeals.breakfast.hour === 'undefined') return false;
        const breakfastDate = new Date();
        breakfastDate.setHours(currentSelectedMeals.breakfast.hour, currentSelectedMeals.breakfast.minute, 0, 0);
        
        // If breakfast time has passed, check for tomorrow
        const now = new Date();
        if (breakfastDate.getTime() <= now.getTime()) {
          breakfastDate.setDate(breakfastDate.getDate() + 1);
        }
        
        return selectedDateTime.getTime() === breakfastDate.getTime();
        
      case 'lunch':
        if (!currentSelectedMeals.lunch || typeof currentSelectedMeals.lunch.hour === 'undefined') return false;
        const lunchDate = new Date();
        lunchDate.setHours(currentSelectedMeals.lunch.hour, currentSelectedMeals.lunch.minute, 0, 0);
        
        // If lunch time has passed, check for tomorrow
        if (lunchDate.getTime() <= new Date().getTime()) {
          lunchDate.setDate(lunchDate.getDate() + 1);
        }
        
        return selectedDateTime.getTime() === lunchDate.getTime();
        
      case 'dinner':
        if (!currentSelectedMeals.dinner || typeof currentSelectedMeals.dinner.hour === 'undefined') return false;
        const dinnerDate = new Date();
        dinnerDate.setHours(currentSelectedMeals.dinner.hour, currentSelectedMeals.dinner.minute, 0, 0);
        
        // If dinner time has passed, check for tomorrow
        if (dinnerDate.getTime() <= new Date().getTime()) {
          dinnerDate.setDate(dinnerDate.getDate() + 1);
        }
        
        return selectedDateTime.getTime() === dinnerDate.getTime();
        
      case 'weekend':
        const today = new Date();
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
        const saturday = new Date();
        saturday.setDate(today.getDate() + daysUntilSaturday);
        saturday.setHours(12, 0, 0, 0);
        
        return selectedDateTime.getTime() === saturday.getTime();
        
      default:
        return false;
    }
  };

  // Initialize time from existing deadline - only run when deadline changes from external source
  useEffect(() => {
    // Don't override user changes or preset selections
    if (isUserChangingTime) return;
    
    if (deadline) {
      const date = new Date(deadline);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      

      
      // Check if this deadline matches any preset - if so, don't reinitialize
      const isMealPreset = (() => {
        if (!currentSelectedMeals) return false;
        
        // Check breakfast
        if (currentSelectedMeals.breakfast && typeof currentSelectedMeals.breakfast.hour !== 'undefined') {
          const breakfastDate = new Date();
          breakfastDate.setHours(currentSelectedMeals.breakfast.hour, currentSelectedMeals.breakfast.minute, 0, 0);
          if (breakfastDate.getTime() <= new Date().getTime()) {
            breakfastDate.setDate(breakfastDate.getDate() + 1);
          }
          if (date.getTime() === breakfastDate.getTime()) return true;
        }
        
        // Check lunch
        if (currentSelectedMeals.lunch && typeof currentSelectedMeals.lunch.hour !== 'undefined') {
          const lunchDate = new Date();
          lunchDate.setHours(currentSelectedMeals.lunch.hour, currentSelectedMeals.lunch.minute, 0, 0);
          if (lunchDate.getTime() <= new Date().getTime()) {
            lunchDate.setDate(lunchDate.getDate() + 1);
          }
          if (date.getTime() === lunchDate.getTime()) return true;
        }
        
        // Check dinner
        if (currentSelectedMeals.dinner && typeof currentSelectedMeals.dinner.hour !== 'undefined') {
          const dinnerDate = new Date();
          dinnerDate.setHours(currentSelectedMeals.dinner.hour, currentSelectedMeals.dinner.minute, 0, 0);
          if (dinnerDate.getTime() <= new Date().getTime()) {
            dinnerDate.setDate(dinnerDate.getDate() + 1);
          }
          if (date.getTime() === dinnerDate.getTime()) return true;
        }
        
        return false;
      })();
      
      const isWeekendPreset = (() => {
        const today = new Date();
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
        const saturday = new Date();
        saturday.setDate(today.getDate() + daysUntilSaturday);
        return date.getDate() === saturday.getDate() && 
               date.getMonth() === saturday.getMonth() && 
               date.getFullYear() === saturday.getFullYear() &&
               hours === 12 && minutes === 0;
      })();
      
      // If this deadline matches a preset, don't reinitialize the time picker
      if (isMealPreset || isWeekendPreset) {
        return;
      }
      
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
  }, [deadline, use24HourFormat, isUserChangingTime, currentSelectedMeals]);

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
    setIsUserChangingTime(true);
    
    // Only proceed if we have a date selected, don't default to today
    if (!selectedDate) {
      // Just update the time state without creating a deadline
      setTimeout(() => {
        setIsUserChangingTime(false);
      }, 100);
      return;
    }
    
    let time24: string;
    if (use24HourFormat) {
      time24 = `${hour}:${minute}`;
    } else {
      const actualPeriod = period || selectedPeriod;
      time24 = convertTo24Hour(hour, minute, actualPeriod);
    }
    
    const [hours, minutes] = time24.split(':').map(Number);
    
    // Create new date preserving the existing date but updating time
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    
    setSelectedDate(newDate);
    setDeadline(formatLocalDateToInputString(newDate));
    
    // Reset the flag after a short delay to allow external updates
    setTimeout(() => {
      setIsUserChangingTime(false);
    }, 100);
  };

  // Handle hour change with immediate state update
  const handleHourChange = (newHour: string) => {
    setSelectedHour(newHour);
    
    // Only update deadline if we have a selected date
    if (selectedDate) {
      updateTimeWithValues(newHour, selectedMinute, selectedPeriod);
    } else {
      // Just mark as user changing time without updating deadline
      setIsUserChangingTime(true);
      setTimeout(() => setIsUserChangingTime(false), 100);
    }
  };

  // Handle minute change with immediate state update  
  const handleMinuteChange = (newMinute: string) => {
    setSelectedMinute(newMinute);
    
    // Only update deadline if we have a selected date
    if (selectedDate) {
      updateTimeWithValues(selectedHour, newMinute, selectedPeriod);
    } else {
      // Just mark as user changing time without updating deadline
      setIsUserChangingTime(true);
      setTimeout(() => setIsUserChangingTime(false), 100);
    }
  };

  // Handle period change with immediate state update
  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    setSelectedPeriod(newPeriod);
    
    // Only update deadline if we have a selected date
    if (selectedDate) {
      updateTimeWithValues(selectedHour, selectedMinute, newPeriod);
    } else {
      // Just mark as user changing time without updating deadline
      setIsUserChangingTime(true);
      setTimeout(() => setIsUserChangingTime(false), 100);
    }
  };

  // Check if selected time is in the past
  const isTimeInPast = () => {
    if (!selectedDate) return false;
    const now = new Date();
    return selectedDate.getTime() <= now.getTime();
  };

  // Get time validation message
  const getTimeValidationMessage = () => {
    if (!selectedDate) return null;
    
    const now = new Date();
    const timeDiff = selectedDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return {
        type: 'error' as const,
        message: 'Selected time has already passed. Please choose a future time.'
      };
    }
    
    // If deadline is less than 10 minutes from now, show warning
    if (timeDiff < 10 * 60 * 1000) {
      const minutesLeft = Math.ceil(timeDiff / (60 * 1000));
      return {
        type: 'warning' as const,
        message: `Deadline is only ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''} away.`
      };
    }
    
    return null;
  };

  // Update time and deadline
  const updateTimeSelection = () => {
    updateTimeWithValues(selectedHour, selectedMinute, selectedPeriod);
  };

  // Quick selection options
  const handleBreakfastPreset = () => {
    if (!currentSelectedMeals?.breakfast || typeof currentSelectedMeals.breakfast.hour === 'undefined') return;
    
    setIsUserChangingTime(true);
    
    const now = new Date();
    const breakfastDate = new Date();
    breakfastDate.setHours(currentSelectedMeals.breakfast.hour, currentSelectedMeals.breakfast.minute, 0, 0);
    
    // If breakfast time has already passed, set it for tomorrow
    if (breakfastDate.getTime() <= now.getTime()) {
      breakfastDate.setDate(breakfastDate.getDate() + 1);
    }
    
    // Update time picker UI state
    if (use24HourFormat) {
      setSelectedHour(currentSelectedMeals.breakfast.hour.toString().padStart(2, '0'));
      setSelectedMinute(currentSelectedMeals.breakfast.minute.toString().padStart(2, '0'));
    } else {
      const period = currentSelectedMeals.breakfast.hour >= 12 ? 'PM' : 'AM';
      let hour12 = currentSelectedMeals.breakfast.hour % 12;
      if (hour12 === 0) hour12 = 12;
      setSelectedHour(hour12.toString().padStart(2, '0'));
      setSelectedMinute(currentSelectedMeals.breakfast.minute.toString().padStart(2, '0'));
      setSelectedPeriod(period);
    }
    
    setSelectedDate(breakfastDate);
    setDeadline(formatLocalDateToInputString(breakfastDate));
    setTimeout(() => {
      setIsUserChangingTime(false);
    }, 500);
  };

  const handleLunchPreset = () => {
    if (!currentSelectedMeals?.lunch || typeof currentSelectedMeals.lunch.hour === 'undefined') return;
    
    setIsUserChangingTime(true);
    
    const now = new Date();
    const lunchDate = new Date();
    lunchDate.setHours(currentSelectedMeals.lunch.hour, currentSelectedMeals.lunch.minute, 0, 0);
    
    // If lunch time has already passed, set it for tomorrow
    if (lunchDate.getTime() <= now.getTime()) {
      lunchDate.setDate(lunchDate.getDate() + 1);
    }
    
    // Update time picker UI state
    if (use24HourFormat) {
      setSelectedHour(currentSelectedMeals.lunch.hour.toString().padStart(2, '0'));
      setSelectedMinute(currentSelectedMeals.lunch.minute.toString().padStart(2, '0'));
    } else {
      const period = currentSelectedMeals.lunch.hour >= 12 ? 'PM' : 'AM';
      let hour12 = currentSelectedMeals.lunch.hour % 12;
      if (hour12 === 0) hour12 = 12;
      setSelectedHour(hour12.toString().padStart(2, '0'));
      setSelectedMinute(currentSelectedMeals.lunch.minute.toString().padStart(2, '0'));
      setSelectedPeriod(period);
    }
    
    setSelectedDate(lunchDate);
    setDeadline(formatLocalDateToInputString(lunchDate));
    setTimeout(() => {
      setIsUserChangingTime(false);
    }, 500);
  };

  const handleDinnerPreset = () => {
    if (!currentSelectedMeals?.dinner || typeof currentSelectedMeals.dinner.hour === 'undefined') return;
    
    setIsUserChangingTime(true);
    
    const now = new Date();
    const dinnerDate = new Date();
    dinnerDate.setHours(currentSelectedMeals.dinner.hour, currentSelectedMeals.dinner.minute, 0, 0);
    
    // If dinner time has already passed, set it for tomorrow
    if (dinnerDate.getTime() <= now.getTime()) {
      dinnerDate.setDate(dinnerDate.getDate() + 1);
    }
    
    // Update time picker UI state
    if (use24HourFormat) {
      setSelectedHour(currentSelectedMeals.dinner.hour.toString().padStart(2, '0'));
      setSelectedMinute(currentSelectedMeals.dinner.minute.toString().padStart(2, '0'));
    } else {
      const period = currentSelectedMeals.dinner.hour >= 12 ? 'PM' : 'AM';
      let hour12 = currentSelectedMeals.dinner.hour % 12;
      if (hour12 === 0) hour12 = 12;
      setSelectedHour(hour12.toString().padStart(2, '0'));
      setSelectedMinute(currentSelectedMeals.dinner.minute.toString().padStart(2, '0'));
      setSelectedPeriod(period);
    }
    
    setSelectedDate(dinnerDate);
    setDeadline(formatLocalDateToInputString(dinnerDate));
    setTimeout(() => {
      setIsUserChangingTime(false);
    }, 500);
  };
  
  // Reroll function for meal times
  const rerollMealTime = (meal: 'breakfast' | 'lunch' | 'dinner', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent button click
    
    // Set rerolling state for animation
    setRerollingMeal(meal);
    
    // Add a small delay for the animation effect
    setTimeout(() => {
      // Get colors of other meals (ensure currentSelectedMeals exists)
      const otherColors = currentSelectedMeals ? Object.entries(currentSelectedMeals)
        .filter(([key]) => key !== meal)
        .map(([, value]) => value.color) : [];
      
      const newMeal = generateMealVariation(meal, otherColors);
      setCurrentSelectedMeals(prev => ({
        ...prev,
        [meal]: newMeal
      }));
      
      // Clear rerolling state after animation
      setTimeout(() => setRerollingMeal(null), 300);
    }, 150);
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
    setIsUserChangingTime(true);
    
    const dateUserClickedOnCalendar = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    let finalDateToSet: Date;
    let targetHours: number;
    let targetMinutes: number;

    const today = new Date();
    if (
      dateUserClickedOnCalendar.getFullYear() === today.getFullYear() &&
      dateUserClickedOnCalendar.getMonth() === today.getMonth() &&
      dateUserClickedOnCalendar.getDate() === today.getDate()
    ) {
      // It's today, set time to 30 minutes from now
      const thirtyMinutesFromNow = new Date(); // Current date and time
      thirtyMinutesFromNow.setMinutes(thirtyMinutesFromNow.getMinutes() + 30);
      
      finalDateToSet = new Date(thirtyMinutesFromNow); // Use this for both date and time

      targetHours = finalDateToSet.getHours();
      targetMinutes = finalDateToSet.getMinutes();

      // Update the time picker UI state to reflect the new default time
      setSelectedMinute(targetMinutes.toString().padStart(2, '0'));
      if (use24HourFormat) {
        setSelectedHour(targetHours.toString().padStart(2, '0'));
      } else {
        const period = targetHours >= 12 ? 'PM' : 'AM';
        let hour12 = targetHours % 12;
        if (hour12 === 0) hour12 = 12; 
        setSelectedHour(hour12.toString().padStart(2, '0'));
        setSelectedPeriod(period);
      }
    } else {
      // Not today, use currently selected time from picker for the dateUserClickedOnCalendar
      const time24 = use24HourFormat 
        ? `${selectedHour}:${selectedMinute}`
        : convertTo24Hour(selectedHour, selectedMinute, selectedPeriod);
      const [h, m] = time24.split(':').map(Number);
      targetHours = h;
      targetMinutes = m;

      finalDateToSet = new Date(dateUserClickedOnCalendar);
      finalDateToSet.setHours(targetHours, targetMinutes, 0, 0);
    }
    
    setSelectedDate(finalDateToSet);
    setDeadline(formatLocalDateToInputString(finalDateToSet));

    // If the final date is in a different month/year than current view, update view
    if (finalDateToSet.getMonth() !== viewDate.getMonth() || finalDateToSet.getFullYear() !== viewDate.getFullYear()) {
      const newViewDate = new Date(finalDateToSet.getFullYear(), finalDateToSet.getMonth(), 1);
      setViewDate(newViewDate);
    }

    setTimeout(() => setIsUserChangingTime(false), 100);
  };

  const confirmSelection = () => {
    if (!isTimeInPast()) {
      updateTimeSelection();
    }
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

  // Common styles for preset buttons
  const presetButtonBaseClasses = "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 shadow-sm hover:shadow-md active:shadow-inner";
  const presetButtonActiveClasses = "bg-green-50 border-green-500 text-green-700 shadow-md scale-[1.02]";

  // Color mapping for dynamic classes
  const getColorClasses = (color: string, isActive: boolean) => {
    if (isActive) return presetButtonActiveClasses;
    
    const colorMap: { [key: string]: string } = {
      orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:border-orange-300',
      amber: 'bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-300',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:border-yellow-300',
      lime: 'bg-lime-50 border-lime-200 text-lime-700 hover:border-lime-300',
      sky: 'bg-sky-50 border-sky-200 text-sky-700 hover:border-sky-300',
      red: 'bg-red-50 border-red-200 text-red-700 hover:border-red-300',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-300',
      rose: 'bg-rose-50 border-rose-200 text-rose-700 hover:border-rose-300',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:border-indigo-300'
    };
    
    return colorMap[color] || colorMap.orange;
  };
  
  const getIconColor = (color: string, isActive: boolean) => {
    if (isActive) return 'text-green-500';
    
    const iconColorMap: { [key: string]: string } = {
      orange: 'text-orange-500',
      amber: 'text-amber-500',
      yellow: 'text-yellow-500',
      lime: 'text-lime-500',
      sky: 'text-sky-500',
      red: 'text-red-500',
      purple: 'text-purple-500',
      rose: 'text-rose-500',
      indigo: 'text-indigo-500'
    };
    
    return iconColorMap[color] || iconColorMap.orange;
  };

  // Format time for display
  const formatTimeDisplay = (hour: number, minute: number) => {
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="space-y-4">
      <label className="text-base font-medium text-gray-700 block">Set Deadline</label>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Breakfast Button */}
        {currentSelectedMeals?.breakfast && (
        <motion.button
          type="button"
          onClick={handleBreakfastPreset}
          className={`${presetButtonBaseClasses} ${isPresetActive('breakfast') ? presetButtonActiveClasses : getColorClasses(currentSelectedMeals.breakfast.color, isPresetActive('breakfast'))} relative`}
          whileHover={{ scale: isPresetActive('breakfast') ? 1.02 : 1.03, y: isPresetActive('breakfast') ? 0 : -3 }}
          whileTap={{ scale: 0.97 }}
          animate={rerollingMeal === 'breakfast' ? { rotateY: 180 } : { rotateY: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            onClick={(e) => rerollMealTime('breakfast', e)}
            className="absolute top-1 right-1 p-1 rounded-md hover:bg-white/50 transition-colors cursor-pointer"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <RefreshCw className="w-3 h-3 text-gray-600" />
          </motion.div>
          <motion.div
            animate={rerollingMeal === 'breakfast' ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {React.createElement(currentSelectedMeals.breakfast.icon, {
              className: `w-7 h-7 mb-1.5 ${getIconColor(currentSelectedMeals.breakfast.color, isPresetActive('breakfast'))}`
            })}
          </motion.div>
          <motion.span 
            className="text-sm font-medium"
            animate={rerollingMeal === 'breakfast' ? { opacity: 0, y: 5 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {currentSelectedMeals.breakfast.name}
          </motion.span>
          <motion.span 
            className="text-xs text-gray-500"
            animate={rerollingMeal === 'breakfast' ? { opacity: 0, y: 5 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            ({formatTimeDisplay(currentSelectedMeals.breakfast.hour, currentSelectedMeals.breakfast.minute)})
          </motion.span>
        </motion.button>
        )}

        {/* Lunch Button */}
        {currentSelectedMeals?.lunch && (
        <motion.button
          type="button"
          onClick={handleLunchPreset}
          className={`${presetButtonBaseClasses} ${isPresetActive('lunch') ? presetButtonActiveClasses : getColorClasses(currentSelectedMeals.lunch.color, isPresetActive('lunch'))} relative`}
          whileHover={{ scale: isPresetActive('lunch') ? 1.02 : 1.03, y: isPresetActive('lunch') ? 0 : -3 }}
          whileTap={{ scale: 0.97 }}
          animate={rerollingMeal === 'lunch' ? { rotateY: 180 } : { rotateY: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            onClick={(e) => rerollMealTime('lunch', e)}
            className="absolute top-1 right-1 p-1 rounded-md hover:bg-white/50 transition-colors cursor-pointer"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <RefreshCw className="w-3 h-3 text-gray-600" />
          </motion.div>
          <motion.div
            animate={rerollingMeal === 'lunch' ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {React.createElement(currentSelectedMeals.lunch.icon, {
              className: `w-7 h-7 mb-1.5 ${getIconColor(currentSelectedMeals.lunch.color, isPresetActive('lunch'))}`
            })}
          </motion.div>
          <motion.span 
            className="text-sm font-medium"
            animate={rerollingMeal === 'lunch' ? { opacity: 0, y: 5 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {currentSelectedMeals.lunch.name}
          </motion.span>
          <motion.span 
            className="text-xs text-gray-500"
            animate={rerollingMeal === 'lunch' ? { opacity: 0, y: 5 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            ({formatTimeDisplay(currentSelectedMeals.lunch.hour, currentSelectedMeals.lunch.minute)})
          </motion.span>
        </motion.button>
        )}

        {/* Dinner Button */}
        {currentSelectedMeals?.dinner && (
        <motion.button
          type="button"
          onClick={handleDinnerPreset}
          className={`${presetButtonBaseClasses} ${isPresetActive('dinner') ? presetButtonActiveClasses : getColorClasses(currentSelectedMeals.dinner.color, isPresetActive('dinner'))} relative`}
          whileHover={{ scale: isPresetActive('dinner') ? 1.02 : 1.03, y: isPresetActive('dinner') ? 0 : -3 }}
          whileTap={{ scale: 0.97 }}
          animate={rerollingMeal === 'dinner' ? { rotateY: 180 } : { rotateY: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            onClick={(e) => rerollMealTime('dinner', e)}
            className="absolute top-1 right-1 p-1 rounded-md hover:bg-white/50 transition-colors cursor-pointer"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <RefreshCw className="w-3 h-3 text-gray-600" />
          </motion.div>
          <motion.div
            animate={rerollingMeal === 'dinner' ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {React.createElement(currentSelectedMeals.dinner.icon, {
              className: `w-7 h-7 mb-1.5 ${getIconColor(currentSelectedMeals.dinner.color, isPresetActive('dinner'))}`
            })}
          </motion.div>
          <motion.span 
            className="text-sm font-medium"
            animate={rerollingMeal === 'dinner' ? { opacity: 0, y: 5 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {currentSelectedMeals.dinner.name}
          </motion.span>
          <motion.span 
            className="text-xs text-gray-500"
            animate={rerollingMeal === 'dinner' ? { opacity: 0, y: 5 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            ({formatTimeDisplay(currentSelectedMeals.dinner.hour, currentSelectedMeals.dinner.minute)})
          </motion.span>
        </motion.button>
        )}
        
        {/* Pick Date Button */}
        <motion.button
          type="button"
          onClick={() => setShowDatePicker(true)}
          className="flex flex-col items-center justify-center p-3 rounded-lg border bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 shadow-sm hover:shadow-md active:shadow-inner col-span-2 sm:col-span-1"
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <CalendarClock className="w-7 h-7 mb-1.5 text-gray-500" />
          <span className="text-sm font-medium">Pick Date</span>
          <span className="text-xs text-gray-500">& Time</span>
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
                              h-10 w-10 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-emerald-500
                              ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                              ${disabled ? 'text-gray-300 cursor-not-allowed' : ''}
                              ${selected ? 'bg-emerald-500 text-white ring-2 ring-emerald-200 shadow-lg' : ''}
                              ${today && !selected ? 'bg-emerald-100 text-emerald-700' : ''}
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
                                handleHourChange(newHour);
                              }}
                              className="appearance-none bg-white border-gray-300 rounded-md shadow-sm pl-4 pr-10 py-2.5 text-center font-mono text-base font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 focus:border-rose-500 hover:border-gray-400 transition-all duration-150 ease-in-out min-w-[75px]"
                            >
                              {use24HourFormat 
                                ? Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i.toString().padStart(2, '0')}>
                                      {i.toString().padStart(2, '0')}
                                    </option>
                                  ))
                                : Array.from({ length: 12 }, (_, i) => {
                                    const hour = i + 1;
                                    const hourValue = hour.toString();
                                    return (
                                      <option key={hour} value={hourValue.padStart(2, '0')}>
                                        {hour}
                                      </option>
                                    );
                                  })
                              }
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <ChevronRight className="w-4 h-4 text-gray-500 rotate-90" />
                            </div>
                          </div>
                        </div>

                        {/* Separator */}
                        <div className="text-2xl font-bold text-gray-400 mt-7 mx-1">:</div>

                        {/* Minute Selector */}
                        <div className="flex flex-col items-center">
                          <label className="text-xs font-medium text-gray-500 mb-2">Minute</label>
                          <div className="relative">
                            <select
                              value={selectedMinute}
                              onChange={(e) => {
                                const newMinute = e.target.value;
                                handleMinuteChange(newMinute);
                              }}
                              className="appearance-none bg-white border-gray-300 rounded-md shadow-sm pl-4 pr-10 py-2.5 text-center font-mono text-base font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 focus:border-rose-500 hover:border-gray-400 transition-all duration-150 ease-in-out min-w-[75px]"
                            >
                              {Array.from({ length: 60 }, (_, i) => (
                                <option key={i} value={i.toString().padStart(2, '0')}>
                                  {i.toString().padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <ChevronRight className="w-4 h-4 text-gray-500 rotate-90" />
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
                                  handlePeriodChange(newPeriod);
                                }}
                                className="appearance-none bg-white border-gray-300 rounded-md shadow-sm pl-4 pr-10 py-2.5 text-center font-mono text-base font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 focus:border-rose-500 hover:border-gray-400 transition-all duration-150 ease-in-out min-w-[85px]"
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <ChevronRight className="w-4 h-4 text-gray-500 rotate-90" />
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
                              : `${parseInt(selectedHour)}:${selectedMinute} ${selectedPeriod}`
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

                      {/* Time Validation Messages */}
                      {(() => {
                        const validation = getTimeValidationMessage();
                        if (!validation) {
                          // Show helpful message when time is set but no date is selected
                          if (!selectedDate && (selectedHour !== '07' || selectedMinute !== '00' || selectedPeriod !== 'PM')) {
                            return (
                              <motion.div 
                                className="mt-3 p-3 rounded-lg flex items-center gap-2 text-sm bg-blue-50 border border-blue-200 text-blue-700"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>Time set to {use24HourFormat ? `${selectedHour}:${selectedMinute}` : `${parseInt(selectedHour)}:${selectedMinute} ${selectedPeriod}`}. Select a date above to complete your deadline.</span>
                              </motion.div>
                            );
                          }
                          return null;
                        }
                        
                        return (
                          <motion.div 
                            className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-sm ${
                              validation.type === 'error' 
                                ? 'bg-red-50 border border-red-200 text-red-700' 
                                : 'bg-amber-50 border border-amber-200 text-amber-700'
                            }`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertTriangle className={`w-4 h-4 ${
                              validation.type === 'error' ? 'text-red-500' : 'text-amber-500'
                            }`} />
                            <span>{validation.message}</span>
                          </motion.div>
                        );
                      })()}

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
                                    onClick={(e) => {
                                      setSelectedHour(h);
                                      setSelectedMinute(m);
                                      // Only update deadline if we have a date
                                      if (selectedDate) {
                                        updateTimeWithValues(h, m);
                                      } else {
                                        setIsUserChangingTime(true);
                                        setTimeout(() => setIsUserChangingTime(false), 100);
                                      }
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
                                const isSelected = selectedHour === h.padStart(2, '0') && selectedMinute === m && selectedPeriod === period;
                                const displayHour = parseInt(h);
                                return (
                                  <button
                                    key={`${time}-${period}`}
                                    onClick={(e) => {
                                      const hourPadded = h.padStart(2, '0');
                                      setSelectedHour(hourPadded);
                                      setSelectedMinute(m);
                                      setSelectedPeriod(period as 'AM' | 'PM');
                                      // Only update deadline if we have a date
                                      if (selectedDate) {
                                        updateTimeWithValues(hourPadded, m, period as 'AM' | 'PM');
                                      } else {
                                        setIsUserChangingTime(true);
                                        setTimeout(() => setIsUserChangingTime(false), 100);
                                      }
                                    }}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                      isSelected 
                                        ? 'bg-rose-600 text-white' 
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                  >
                                    {displayHour}:{m} {period}
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
                      disabled={!selectedDate || isTimeInPast()}
                      className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium shadow-lg"
                    >
                      {isTimeInPast() ? 'Time Has Passed' : 'Set Deadline'}
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