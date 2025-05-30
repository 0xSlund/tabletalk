import React from 'react';
import { Clock, ZapIcon, Hourglass, Settings } from 'lucide-react';
import { cn } from '../../../../../../lib/utils';
import { TimerSettingsSectionProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { PresetTimerCard } from './PresetTimerCard';
import { 
  speedRoundAnimationConfig,
  standardCardAnimationConfig,
  takeYourTimeAnimationConfig 
} from './timerAnimationUtils';
import { CustomTimeInputGroup } from '../components/CustomTimeInputGroup';
import { TimeDivider } from '../components/TimeDivider';
import { UnitSelector } from '../components/UnitSelector';
import { LimitMessage } from '../components/LimitMessage';
import { ConfirmedStateDisplay } from '../components/ConfirmedStateDisplay';

export const TimerSettingsSection: React.FC<TimerSettingsSectionProps> = ({
  timerOption,
  handleTimerOptionChange,
  customDuration,
  setCustomDuration,
  durationUnit,
  setDurationUnit,
}) => {
  const [isAtLimit, setIsAtLimit] = React.useState(false);
  const [isHolding, setIsHolding] = React.useState<
    'increment' | 'decrement' | 'increment_hours' | 'decrement_hours' | 'increment_minutes' | 'decrement_minutes' | null
  >(null);
  const [typedLimitExceeded, setTypedLimitExceeded] = React.useState(false);
  const [isCustomDetailOpen, setIsCustomDetailOpen] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [tempDuration, setTempDuration] = React.useState(customDuration);
  const [tempUnit, setTempUnit] = React.useState(durationUnit);
  const [tempHours, setTempHours] = React.useState('0');
  const [tempMinutes, setTempMinutes] = React.useState('0');
  const holdTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const holdDurationRef = React.useRef(0); 
  const customDurationRef = React.useRef(customDuration);

  // Refs for holding the latest callbacks to avoid stale closures
  const handleIncrementRef = React.useRef((typeInput?: 'hours' | 'minutes') => {
    console.log('handleIncrementRef called but not initialized');
  }); 
  const handleDecrementRef = React.useRef((typeInput?: 'hours' | 'minutes') => {
    console.log('handleDecrementRef called but not initialized');
  });

  React.useEffect(() => {
    customDurationRef.current = customDuration;
  }, [customDuration]);

  React.useEffect(() => {
    if (timerOption === 'custom') {
      setTempUnit(durationUnit);
      if (durationUnit === 'hours') {
        const totalMinutes = parseInt(customDuration) || 0;
        setTempHours(Math.floor(totalMinutes / 60).toString());
        setTempMinutes((totalMinutes % 60).toString());
        setTempDuration(customDuration); 
      } else {
        setTempDuration(customDuration);
        setTempHours('0');
        setTempMinutes('0');
      }
    } else {
      setIsCustomDetailOpen(false);
    }
  }, [timerOption, customDuration, durationUnit]);

  const handleIncrement = React.useCallback((typeInput?: 'hours' | 'minutes') => {
    console.log('handleIncrement called with:', typeInput);
    const unitToUse = isConfirmed ? durationUnit : tempUnit;
    const setDurFn = isConfirmed ? setCustomDuration : setTempDuration;
    const setHoursFn = setTempHours;
    const setMinutesFn = setTempMinutes;
    
    const type = unitToUse === 'hours' ? (typeInput || 'minutes') : 'minutes';
    console.log('handleIncrement - unitToUse:', unitToUse, 'type:', type);

    if (unitToUse === 'hours') {
      let currentHours = parseInt(tempHours) || 0;
      let currentMinutes = parseInt(tempMinutes) || 0;
      console.log('handleIncrement - current values:', { currentHours, currentMinutes });
      const maxHours = 24;
      const maxMinutes = 59;
      
      if (currentHours === 24 && currentMinutes === 0) {
        setIsAtLimit(true);
        setTypedLimitExceeded(true);
        setTimeout(() => {
          setIsAtLimit(false);
          setTypedLimitExceeded(false);
        }, 2000);
        return;
      }
      
      let updatedHours = currentHours;
      let updatedMinutes = currentMinutes;

      if (type === 'hours') {
        if (currentHours >= maxHours) { 
          setIsAtLimit(true);
          setTypedLimitExceeded(true);
          setTimeout(() => {
            setIsAtLimit(false);
            setTypedLimitExceeded(false);
          }, 2000);
          return;
        } else {
          updatedHours = currentHours + 1;
          if (updatedHours === maxHours) {
            updatedMinutes = 0;
          }
        }
      } else {
        if (currentHours >= maxHours) { 
          setIsAtLimit(true);
          setTypedLimitExceeded(true);
          setTimeout(() => {
            setIsAtLimit(false);
            setTypedLimitExceeded(false);
          }, 2000);
          return;
        } else if (currentMinutes >= maxMinutes) {
          if (currentHours < maxHours - 1) {
            updatedHours = currentHours + 1;
            updatedMinutes = 0;
          } else if (currentHours === maxHours - 1) {
            updatedHours = maxHours;
            updatedMinutes = 0;
          } else {
            setIsAtLimit(true);
            setTypedLimitExceeded(true);
            setTimeout(() => {
              setIsAtLimit(false);
              setTypedLimitExceeded(false);
            }, 2000);
            return;
          }
        } else {
          updatedMinutes = currentMinutes + 1;
        }
      }
      console.log('handleIncrement - updated values:', { updatedHours, updatedMinutes });
      setHoursFn(updatedHours.toString());
      setMinutesFn(updatedMinutes.toString());
      setDurFn((updatedHours * 60 + updatedMinutes).toString());

    } else {
      const currentValStr = isConfirmed ? customDurationRef.current : tempDuration;
      let currentValue = parseInt(currentValStr) || 0;
      console.log('handleIncrement - minutes mode, currentValue:', currentValue);
      const maxValue = 59;
      
      if (currentValue >= maxValue) {
        setTempUnit('hours');
        setTempHours('1');
        setTempMinutes('0');
        setDurFn('60');
        console.log('handleIncrement - rolled over to 1 hour');
        return;
      }
      const newValue = Math.min(maxValue, currentValue + 1);
      console.log('handleIncrement - minutes mode, newValue:', newValue);
      setDurFn(newValue.toString());
    }
  }, [isConfirmed, tempDuration, durationUnit, tempUnit, tempHours, tempMinutes, setCustomDuration, setTempDuration, setTempHours, setTempMinutes, customDurationRef, setIsAtLimit, setTypedLimitExceeded, setTempUnit]);

  const handleDecrement = React.useCallback((typeInput?: 'hours' | 'minutes') => {
    const unitToUse = isConfirmed ? durationUnit : tempUnit;
    const setDurFn = isConfirmed ? setCustomDuration : setTempDuration;
    const setHoursFn = setTempHours;
    const setMinutesFn = setTempMinutes;
    
    const type = unitToUse === 'hours' ? (typeInput || 'minutes') : 'minutes';

    if (unitToUse === 'hours') {
      let currentHours = parseInt(tempHours) || 0;
      let currentMinutes = parseInt(tempMinutes) || 0;

      let updatedHours = currentHours;
      let updatedMinutes = currentMinutes;

      if (type === 'hours') {
        if (currentHours <= 0) {
          updatedHours = 0;
          updatedMinutes = Math.max(1, currentMinutes);
        } else {
          updatedHours = currentHours - 1;
        }
      } else {
        if (currentMinutes <= 0) {
          if (currentHours > 1) {
            updatedHours = currentHours - 1;
            updatedMinutes = 59;
          } else if (currentHours === 1) {
            setTempUnit('minutes');
            setTempDuration('59');
            setTempHours('0');
            setTempMinutes('0');
            console.log('handleDecrement - rolled back to 59 minutes mode');
            return;
          } else {
            updatedHours = 0;
            updatedMinutes = 1;
          }
        } else {
          updatedMinutes = currentMinutes - 1;
        }
      }
      
      let totalNewMinutes = updatedHours * 60 + updatedMinutes;
      
      if (totalNewMinutes < 1) {
        updatedHours = 0;
        updatedMinutes = 1; 
        totalNewMinutes = 1;
      }
      setHoursFn(updatedHours.toString());
      setMinutesFn(updatedMinutes.toString());
      setDurFn(totalNewMinutes.toString());

    } else {
      const currentValStr = isConfirmed ? customDurationRef.current : tempDuration;
      let currentValue = parseInt(currentValStr) || 1;
      const newValue = Math.max(1, currentValue - 1);
      setDurFn(newValue.toString());
    }
  }, [isConfirmed, tempDuration, durationUnit, tempUnit, tempHours, tempMinutes, setCustomDuration, setTempDuration, setTempHours, setTempMinutes, customDurationRef, setTempUnit]);

  React.useEffect(() => {
    console.log('Updating handleIncrementRef');
    handleIncrementRef.current = handleIncrement;
  }, [handleIncrement]);

  React.useEffect(() => {
    console.log('Updating handleDecrementRef');
    handleDecrementRef.current = handleDecrement;
  }, [handleDecrement]);

  const startHolding = React.useCallback((action: 'increment' | 'decrement' | 'increment_hours' | 'decrement_hours' | 'increment_minutes' | 'decrement_minutes') => {
    setIsHolding(action);
    holdDurationRef.current = 0; 
    
    const callType = action.includes('hours') ? 'hours' : action.includes('minutes') ? 'minutes' : undefined;
        
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    
    holdTimeoutRef.current = setTimeout(() => {
      console.log('Hold timeout triggered, performing initial action for:', action);
      if (action.startsWith('increment')) handleIncrementRef.current(callType);
      else if (action.startsWith('decrement')) handleDecrementRef.current(callType);

      holdIntervalRef.current = setInterval(() => {
        holdDurationRef.current += 100;
        console.log('Hold interval triggered for:', action, 'duration:', holdDurationRef.current);
        if (action.startsWith('increment')) handleIncrementRef.current(callType);
        else if (action.startsWith('decrement')) handleDecrementRef.current(callType);
        
        if (holdDurationRef.current > 2800) {
          clearInterval(holdIntervalRef.current!);
          holdIntervalRef.current = setInterval(() => {
            console.log('Very fast hold interval for:', action);
            if (action.startsWith('increment')) handleIncrementRef.current(callType);
            else if (action.startsWith('decrement')) handleDecrementRef.current(callType);
          }, 50);
        } else if (holdDurationRef.current > 1300) {
          clearInterval(holdIntervalRef.current!);
          holdIntervalRef.current = setInterval(() => {
            console.log('Fast hold interval for:', action);
            if (action.startsWith('increment')) handleIncrementRef.current(callType);
            else if (action.startsWith('decrement')) handleDecrementRef.current(callType);
          }, 100);
        }
      }, 200);
    }, 500);
  }, [handleIncrement, handleDecrement]);

  const stopHolding = React.useCallback(() => {
    console.log('stopHolding called');
    setIsHolding(null);
    holdDurationRef.current = 0; 
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdTimeoutRef.current = null;
    holdIntervalRef.current = null;
  }, []);

  React.useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  const handleUnitChange = React.useCallback((newUnit: 'minutes' | 'hours') => {
    const currentTotalMinutes = parseInt(isConfirmed ? customDuration : tempDuration) || 0;
    const setDurFn = isConfirmed ? setCustomDuration : setTempDuration;
    const setUnitFn = isConfirmed ? setDurationUnit : setTempUnit;

    setUnitFn(newUnit);

    if (newUnit === 'hours') {
      const hours = Math.floor(currentTotalMinutes / 60);
      const minutes = currentTotalMinutes % 60;
      setTempHours(Math.min(24, hours).toString());
      setTempMinutes(Math.min(59, minutes).toString());
      const newTotalMinutes = Math.min(24, hours) * 60 + Math.min(59, minutes);
      setDurFn(newTotalMinutes.toString()); 
      if (isConfirmed) setCustomDuration(newTotalMinutes.toString());

    } else {
      setTempHours('0');
      setTempMinutes('0');
      const minutes = Math.min(59, currentTotalMinutes);
      setDurFn(minutes.toString());
      if (isConfirmed) setCustomDuration(minutes.toString());
    }
    
  }, [isConfirmed, customDuration, tempDuration, setCustomDuration, setTempDuration, setDurationUnit, setTempUnit, setTempHours, setTempMinutes]);

  const handleConfirm = React.useCallback(() => {
    let durationToConfirm;
    if (tempUnit === 'hours') {
      let h = parseInt(tempHours) || 0;
      let m = parseInt(tempMinutes) || 0;
      h = Math.max(0, Math.min(24, h));
      m = Math.max(0, Math.min(59, m));
      if (h === 0 && m === 0) m = 1;
      if (h === 24 && m > 0) m = 0;
      durationToConfirm = h * 60 + m;
    } else {
      durationToConfirm = parseInt(tempDuration) || 1;
      const maxValue = 59;
      if (durationToConfirm < 1) durationToConfirm = 1;
      if (durationToConfirm > maxValue) durationToConfirm = maxValue;
    }

    setCustomDuration(durationToConfirm.toString());
    setDurationUnit(tempUnit);
    setIsConfirmed(true);
  }, [tempDuration, tempUnit, tempHours, tempMinutes, setCustomDuration, setDurationUnit]);

  const handleEdit = React.useCallback(() => {
    setTempDuration(customDuration);
    setTempUnit(durationUnit);
    if (durationUnit === 'hours') {
      const totalMinutes = parseInt(customDuration) || 0;
      setTempHours(Math.floor(totalMinutes / 60).toString());
      setTempMinutes((totalMinutes % 60).toString());
    }
    setIsConfirmed(false);
  }, [customDuration, durationUnit, setTempDuration, setTempUnit, setTempHours, setTempMinutes, setIsConfirmed]);

  const getTotalTimeDisplay = React.useCallback(() => {
    const value = parseInt(customDuration) || 0;
    const totalMinutesToDisplay = value;
    const hours = Math.floor(totalMinutesToDisplay / 60);
    const minutes = totalMinutesToDisplay % 60;
    
    let displayText = '';
    if (durationUnit === 'hours') {
      if (hours === 0) {
        displayText = `${minutes}m`;
      } else if (minutes === 0) {
        displayText = `${hours}h`;
      } else {
        displayText = `${hours}h ${minutes}m`;
      }
    } else {
      displayText = `${totalMinutesToDisplay}m`;
    }
    
    return { hours, minutes, totalMinutes: totalMinutesToDisplay, displayText };
  }, [customDuration, durationUnit]);

  const memoizedHandleTimerOptionChange = React.useCallback((value: string) => {
    handleTimerOptionChange(value);
    if (value !== 'custom') {
      setIsCustomDetailOpen(false);
    }
  }, [handleTimerOptionChange]);

  const handleCustomToggle = React.useCallback(() => {
    if (timerOption === 'custom') {
      setIsCustomDetailOpen(prev => !prev);
    } else {
      memoizedHandleTimerOptionChange('custom');
      setIsCustomDetailOpen(true);
    }
  }, [timerOption, memoizedHandleTimerOptionChange]);

  const handleTempDurationChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'hours' | 'minutes') => {
    const typedValue = e.target.value.replace(/[^0-9]/g, '');
    if (typedValue.length <= 2) {
      if (tempUnit === 'hours') {
        if (type === 'hours') setTempHours(typedValue);
        else setTempMinutes(typedValue);
      } else {
        setTempDuration(typedValue);
      }
      setTypedLimitExceeded(false);
      setIsAtLimit(false);
    }
  }, [setTempDuration, setTempHours, setTempMinutes, tempUnit, setIsAtLimit, setTypedLimitExceeded]);

  const handleTempDurationBlur = React.useCallback((type: 'hours' | 'minutes') => {
    if (tempUnit === 'hours') {
      const maxVal = type === 'hours' ? 24 : 59;
      let h = parseInt(tempHours) || 0;
      let m = parseInt(tempMinutes) || 0;
      let limitExceeded = false;

      if (type === 'hours') {
        if (h < 0) h = 0;
        if (h > maxVal) { h = maxVal; limitExceeded = true; }
        setTempHours(h.toString());
        
        if (h === 24) {
          setTempMinutes('0');
          m = 0;
        }
      } else {
        if (m < 0) m = 0;
        if (m > maxVal) { m = maxVal; limitExceeded = true; }
        
        if (parseInt(tempHours) === 24 && m > 0) {
          m = 0;
          limitExceeded = true;
        }
        setTempMinutes(m.toString());
      }
      
      if (parseInt(tempHours) === 24 && type === 'minutes' && m > 0) {
        setTempMinutes('0');
        m = 0;
        limitExceeded = true;
      }
      
      if (parseInt(tempHours) === 0 && parseInt(tempMinutes) === 0 && (type === 'hours' || type ==='minutes')) {
        setTempMinutes('1');
        m = 1;
      }

      const finalH = parseInt(tempHours) || 0;
      const finalM = parseInt(type === 'minutes' ? m.toString() : (parseInt(tempMinutes) || 0).toString()) || 0;
      setTempDuration((finalH * 60 + finalM).toString());

      if (limitExceeded) {
        setIsAtLimit(true);
        setTypedLimitExceeded(true);
        setTimeout(() => {
          setIsAtLimit(false);
          setTypedLimitExceeded(false);
        }, 2000);
      }

    } else {
      const maxValue = 59;
      let value = parseInt(tempDuration) || 1;
      let limitExceeded = false;

      if (value < 1) value = 1;
      if (value > maxValue) {
        value = maxValue;
        limitExceeded = true;
      }
      setTempDuration(value.toString());
      if (limitExceeded) {
        setIsAtLimit(true);
        setTypedLimitExceeded(true);
        setTimeout(() => {
          setIsAtLimit(false);
          setTypedLimitExceeded(false);
        }, 2000);
      }
    }
  }, [tempDuration, tempUnit, tempHours, tempMinutes, setTempDuration, setTempHours, setTempMinutes, setIsAtLimit, setTypedLimitExceeded]);

  return (
    <div className="space-y-5">
      <label className="text-base font-medium text-gray-700 block">Time per decision</label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PresetTimerCard
          id="15-min"
          icon={<ZapIcon />}
          title="15 min"
          description="Speed Round"
          value="15"
          isSelected={timerOption === '15'}
          onSelect={memoizedHandleTimerOptionChange}
          baseBgGradient="bg-gray-50/50"
          selectedBgGradient="bg-gradient-to-br from-amber-50/80 to-orange-50/80"
          borderColor={timerOption === '15' ? "border-amber-200/60" : "border-gray-200/60"}
          hoverBorderColor="hover:border-amber-200/40"
          hoverBgColor="hover:bg-amber-50/20"
          iconSelectedBgColor="bg-amber-100/80"
          iconSelectedTextColor="text-amber-600"
          iconHoverBgColor="group-hover:bg-amber-50"
          iconHoverTextColor="group-hover:text-amber-500"
          textSelectedColor="text-amber-800"
          textHoverColor="group-hover:text-amber-700"
          descriptionSelectedColor="text-amber-700"
          descriptionHoverColor="group-hover:text-amber-600"
          animationConfig={speedRoundAnimationConfig}
        />

        <PresetTimerCard
          id="30-min"
          icon={<Clock />}
          title="30 min"
          description="Standard"
          value="30"
          isSelected={timerOption === '30'}
          onSelect={memoizedHandleTimerOptionChange}
          baseBgGradient="bg-gray-50/50"
          selectedBgGradient="bg-gradient-to-br from-blue-50/80 to-indigo-50/80"
          borderColor={timerOption === '30' ? "border-blue-200/60" : "border-gray-200/60"}
          hoverBorderColor="hover:border-blue-200/40"
          hoverBgColor="hover:bg-blue-50/20"
          iconSelectedBgColor="bg-blue-100/80"
          iconSelectedTextColor="text-blue-600"
          iconHoverBgColor="group-hover:bg-blue-50"
          iconHoverTextColor="group-hover:text-blue-500"
          textSelectedColor="text-blue-800"
          textHoverColor="group-hover:text-blue-700"
          descriptionSelectedColor="text-blue-700"
          descriptionHoverColor="group-hover:text-blue-600"
          animationConfig={standardCardAnimationConfig}
        />

        <PresetTimerCard
          id="60-min"
          icon={<Hourglass />}
          title="1 hour"
          description="Take Your Time"
          value="60"
          isSelected={timerOption === '60'}
          onSelect={memoizedHandleTimerOptionChange}
          baseBgGradient="bg-gray-50/50"
          selectedBgGradient="bg-gradient-to-br from-emerald-50/90 to-green-50/90"
          borderColor={timerOption === '60' ? "border-emerald-200/70" : "border-gray-200/60"}
          hoverBorderColor="hover:border-emerald-200/50"
          hoverBgColor="hover:bg-emerald-50/30"
          iconSelectedBgColor="bg-gradient-to-br from-emerald-100/95 via-emerald-50/90 to-emerald-100/95"
          iconSelectedTextColor="text-emerald-600"
          iconHoverBgColor="group-hover:bg-emerald-50"
          iconHoverTextColor="group-hover:text-emerald-500"
          textSelectedColor="text-emerald-800"
          textHoverColor="group-hover:text-gray-800"
          descriptionSelectedColor="text-emerald-700"
          descriptionHoverColor="group-hover:text-gray-600"
          animationConfig={takeYourTimeAnimationConfig}
        />
      </div>
      
      {/* Custom option */}
      <motion.div 
        className={cn(
          "mt-4 rounded-2xl overflow-hidden transition-all relative",
          timerOption === 'custom' 
            ? "bg-gradient-to-br from-purple-50/80 to-violet-50/80 border border-purple-200/60" 
            : "bg-gray-50/50 border border-gray-200/60 hover:border-purple-200/40 hover:bg-purple-50/20"
        )}
        whileHover={{ 
          scale: timerOption !== 'custom' ? 1.01 : 1, 
          y: timerOption !== 'custom' ? -2 : 0,
          boxShadow: timerOption !== 'custom' ? "0 8px 20px -5px rgba(0, 0, 0, 0.1)" : undefined,
          transition: { duration: 0.2 }
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
            filter: 'blur(1px)'
          }}
        />
        
        <button
          type="button"
          onClick={handleCustomToggle}
          className="w-full text-left relative overflow-hidden group"
        >
          <AnimatePresence>
            {timerOption === 'custom' && isCustomDetailOpen && (
              <motion.div 
                className="absolute inset-0 z-0 rounded-2xl overflow-hidden pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.06) 0%, transparent 40%),
                      linear-gradient(45deg, rgba(168, 85, 247, 0.03) 0%, rgba(147, 51, 234, 0.05) 100%)
                    `
                  }}
                  animate={{
                    background: [
                      `radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
                       radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.06) 0%, transparent 40%),
                       linear-gradient(45deg, rgba(168, 85, 247, 0.03) 0%, rgba(147, 51, 234, 0.05) 100%)`,
                      `radial-gradient(circle at 75% 25%, rgba(168, 85, 247, 0.06) 0%, transparent 50%),
                       radial-gradient(circle at 25% 75%, rgba(147, 51, 234, 0.08) 0%, transparent 40%),
                       linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(147, 51, 234, 0.03) 100%)`,
                      `radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
                       radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.06) 0%, transparent 40%),
                       linear-gradient(45deg, rgba(168, 85, 247, 0.03) 0%, rgba(147, 51, 234, 0.05) 100%)`
                    ]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={`shape-${i}`}
                    className="absolute pointer-events-none"
                    style={{
                      width: `${8 + i * 4}px`,
                      height: `${8 + i * 4}px`,
                      left: `${15 + i * 15}%`,
                      top: `${20 + i * 10}%`,
                      background: `rgba(168, 85, 247, ${0.15 - i * 0.02})`,
                      borderRadius: i % 2 === 0 ? '50%' : '20%',
                      filter: 'blur(0.5px)'
                    }}
                    animate={{ y: [0, -15, 0], x: [0, 10, 0], rotate: [0, 180, 360], scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 6 + i * 2, repeat: Infinity, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.8 }}
                  />
                ))}
                <motion.div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{ backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={`dot-${i}`}
                    className="absolute w-2 h-2 rounded-full pointer-events-none"
                    style={{ background: 'rgba(168, 85, 247, 0.4)', left: `${25 + i * 20}%`, top: `${30 + (i % 2) * 40}%`, filter: 'blur(0.5px)' }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="p-5 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <motion.div
                className={cn(
                  "rounded-2xl p-3 transition-all duration-300 relative z-10",
                  timerOption === 'custom' 
                    ? "bg-purple-100/80 text-purple-600" 
                    : "bg-gray-100/80 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-500"
                )}
                animate={timerOption === 'custom' ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Settings className="w-6 h-6" />
              </motion.div>
              <div className="flex flex-col">
                <motion.span 
                  className={cn(
                    "font-bold text-lg transition-colors duration-300",
                    timerOption === 'custom' ? "text-purple-800" : "text-gray-700 group-hover:text-purple-700"
                  )}
                  animate={{ y: timerOption === 'custom' ? -1 : 0, scale: timerOption === 'custom' ? 1.02 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Custom
                </motion.span>
                <span className={cn("text-sm font-medium transition-colors duration-300", timerOption === 'custom' ? "text-purple-700" : "text-gray-500 group-hover:text-purple-600")}>
                  Thoughtful consideration for complex choices
                </span>
              </div>
            </div>
            {timerOption === 'custom' ? (
              <motion.div className="flex items-center" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <span className="text-purple-700 text-sm font-medium">Configure</span>
              </motion.div>
            ) : (
              <motion.div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300/60 group-hover:border-purple-300/60" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}/>
            )}
          </div>
        </button>
        
        <AnimatePresence>
          {timerOption === 'custom' && isCustomDetailOpen && (
            <motion.div
              className="bg-gradient-to-b from-purple-50/40 to-white/80 border-t border-purple-200/40 relative z-10 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '380px', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className="p-5 flex flex-col items-center gap-6 relative z-10 h-full">
                
                <UnitSelector 
                  tempUnit={tempUnit}
                  handleUnitChange={handleUnitChange}
                  isConfirmed={isConfirmed}
                />

                <div className="relative w-full flex justify-center h-32">
                  <AnimatePresence mode="wait">
                    {!isConfirmed && tempUnit === 'hours' && (
                      <motion.div 
                        key="hours-mode"
                        className="flex items-center justify-center gap-3 w-full bg-gradient-to-b from-purple-50/80 to-white/90 rounded-xl p-4 border border-purple-100/60 shadow-lg max-w-md mx-auto h-full"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ 
                          duration: 0.2, 
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                      >
                        <motion.div
                          className="flex-shrink-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15, delay: 0.05 }}
                        >
                          <CustomTimeInputGroup
                            label="Hours"
                            value={tempHours}
                            onIncrement={() => {
                              console.log('Hours onIncrement called');
                              handleIncrementRef.current('hours');
                            }}
                            onDecrement={() => {
                              console.log('Hours onDecrement called');
                              handleDecrementRef.current('hours');
                            }}
                            onChange={(e) => handleTempDurationChange(e, 'hours')}
                            onBlur={() => handleTempDurationBlur('hours')}
                            startHolding={startHolding}
                            stopHolding={stopHolding}
                            isAtLimit={false}
                            typedLimitExceeded={false}
                            maxLength={2}
                            isHours={true}
                            hoursValue={tempHours}
                            minutesValue={tempMinutes}
                            isConfirmed={isConfirmed}
                          />
                        </motion.div>
                        
                        <TimeDivider />
                        
                        <motion.div
                          className="flex-shrink-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15, delay: 0.05 }}
                        >
                          <CustomTimeInputGroup
                            label="Minutes"
                            value={tempMinutes}
                            onIncrement={() => handleIncrementRef.current('minutes')}
                            onDecrement={() => handleDecrementRef.current('minutes')}
                            onChange={(e) => handleTempDurationChange(e, 'minutes')}
                            onBlur={() => handleTempDurationBlur('minutes')}
                            startHolding={startHolding}
                            stopHolding={stopHolding}
                            isAtLimit={false}
                            typedLimitExceeded={false}
                            maxLength={2}
                            isHours={false}
                            hoursValue={tempHours}
                            minutesValue={tempMinutes}
                            isConfirmed={isConfirmed}
                          />
                        </motion.div>
                      </motion.div>
                    )}

                    {!isConfirmed && tempUnit === 'minutes' && (
                      <motion.div 
                        key="minutes-mode"
                        className="flex flex-col items-center justify-center bg-gradient-to-b from-purple-50/80 to-white/90 rounded-xl p-6 border border-purple-100/60 shadow-lg max-w-md mx-auto h-full"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ 
                          duration: 0.2, 
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                      >
                        <CustomTimeInputGroup
                          label="Minutes"
                          value={tempDuration}
                          onIncrement={() => handleIncrementRef.current()}
                          onDecrement={() => handleDecrementRef.current()}
                          onChange={(e) => handleTempDurationChange(e, 'minutes')}
                          onBlur={() => handleTempDurationBlur('minutes')}
                          startHolding={startHolding}
                          stopHolding={stopHolding}
                          isAtLimit={false}
                          typedLimitExceeded={false}
                          maxLength={2}
                          isHours={false}
                          hoursValue="0"
                          minutesValue={tempDuration}
                          isConfirmed={isConfirmed}
                        />
                      </motion.div>
                    )}

                    {isConfirmed && (
                      <motion.div 
                        key="confirmed-mode"
                        className="flex items-center justify-center w-full max-w-md mx-auto h-full"
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ 
                          duration: 0.25, 
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                      >
                        <div className="mt-32">
                          <ConfirmedStateDisplay
                            isConfirmed={isConfirmed}
                            getTotalTimeDisplay={getTotalTimeDisplay}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <LimitMessage
                    isAtLimit={isAtLimit}
                    typedLimitExceeded={typedLimitExceeded}
                    isConfirmed={isConfirmed}
                    tempUnit={tempUnit}
                    isHolding={isHolding}
                    tempHours={tempHours}
                    tempMinutes={tempMinutes}
                  />
                </div>

                <div className="flex flex-col items-center w-full flex-1 justify-end pb-2">
                  <div className="flex gap-3">
                    {!isConfirmed ? (
                      <motion.button
                        type="button"
                        onClick={handleConfirm}
                        className="px-8 py-3.5 bg-purple-600 text-white text-base font-semibold rounded-xl hover:bg-purple-700 transition-all duration-200 z-10 relative cursor-pointer shadow-lg hover:shadow-xl min-w-[140px]"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ 
                          scale: 1.05,
                          y: -2,
                          boxShadow: "0 20px 40px -12px rgba(168, 85, 247, 0.4)"
                        }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                      >
                        Confirm Timer
                      </motion.button>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={handleEdit}
                        className="px-8 py-3.5 bg-purple-100 text-purple-700 text-base font-semibold rounded-xl hover:bg-purple-200 transition-all duration-200 z-10 relative cursor-pointer shadow-md hover:shadow-lg min-w-[140px]"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ 
                          scale: 1.05,
                          y: -2,
                          boxShadow: "0 15px 30px -8px rgba(168, 85, 247, 0.25)"
                        }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                      >
                        Edit Timer
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
    </div>
  );
};