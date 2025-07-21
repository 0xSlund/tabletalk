import { useState, useEffect, useRef } from 'react';

interface UseTimerProps {
  initialTime?: number;
  onExpire?: () => void;
  autoStart?: boolean;
  expiresAt?: number | null;
}

interface UseTimerReturn {
  timeRemaining: number | null;
  isRunning: boolean;
  isExpired: boolean | null;
  start: () => void;
  pause: () => void;
  reset: (newTime?: number) => void;
  percentageRemaining: number;
}

/**
 * Custom hook for managing a countdown timer
 * Can accept either an initialTime in seconds or an expiresAt timestamp
 */
export const useTimer = (
  expiresAtTimestamp?: number | null,
  options?: Omit<UseTimerProps, 'expiresAt'>
): UseTimerReturn => {
  // If we have expiresAtTimestamp, calculate initial time from that
  const calculateInitialTime = (): number | null => {
    if (expiresAtTimestamp) {
      const now = new Date().getTime();
      return Math.max(0, Math.floor((expiresAtTimestamp - now) / 1000));
    }
    return options?.initialTime || null;
  };

  const [timeRemaining, setTimeRemaining] = useState<number | null>(calculateInitialTime());
  const [isRunning, setIsRunning] = useState(options?.autoStart || false);
  const [isExpired, setIsExpired] = useState<boolean | null>(
    timeRemaining !== null ? timeRemaining <= 0 : null
  );
  const [initialTimeValue, setInitialTimeValue] = useState<number>(
    timeRemaining !== null ? timeRemaining : 0
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to initialize timer based on expiration date
  useEffect(() => {
    const initialTime = calculateInitialTime();
    setTimeRemaining(initialTime);
    
    if (initialTime !== null) {
      setInitialTimeValue(initialTime);
      setIsExpired(initialTime <= 0);
      
      if (initialTime <= 0) {
        options?.onExpire && options.onExpire();
      } else if (options?.autoStart) {
        setIsRunning(true);
      }
    }
  }, [expiresAtTimestamp]);

  useEffect(() => {
    if (isRunning && timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            setIsExpired(true);
            options?.onExpire && options.onExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 2000); // Reduced from 1000ms to 2000ms (2 seconds) for better performance
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, options?.onExpire]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = (newTime?: number) => {
    if (newTime !== undefined) {
      setTimeRemaining(newTime);
      setInitialTimeValue(newTime);
    } else if (expiresAtTimestamp) {
      const recalculated = calculateInitialTime();
      setTimeRemaining(recalculated);
      if (recalculated !== null) {
        setInitialTimeValue(recalculated);
      }
    }
    setIsRunning(false);
    setIsExpired(false);
  };

  const percentageRemaining = timeRemaining !== null && initialTimeValue > 0
    ? Math.max(0, Math.min(100, (timeRemaining / initialTimeValue) * 100))
    : 0;

  return {
    timeRemaining,
    isRunning,
    isExpired,
    start,
    pause,
    reset,
    percentageRemaining
  };
}; 