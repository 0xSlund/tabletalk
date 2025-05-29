import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { useAppStore } from './store';
import { debounce, throttle } from './utils';

// Window Size Hook
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 250);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Previous Value Hook
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// Intersection Observer Hook
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [elementRef, options]);

  return isVisible;
}

// Local Storage Hook with Type Safety
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

// Debounced Value Hook
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Real-time Room Subscription Hook
export function useRoomSubscription(roomId: string | null) {
  const { currentRoom, updateRoom } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    setError(null);

    // Subscribe to room changes
    const roomSubscription = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'suggestions',
        filter: `room_id=eq.${roomId}`
      }, async () => {
        try {
          // Refresh room data
          const { data: suggestions, error: suggestionsError } = await supabase
            .from('suggestions')
            .select(`
              id, text, created_at, 
              profiles:profiles(id, username),
              suggestion_options:suggestion_options(
                id, text, 
                votes:votes(id, profile_id)
              )
            `)
            .eq('room_id', roomId);
            
          if (suggestionsError) throw suggestionsError;
          
          if (suggestions) {
            const formattedSuggestions = suggestions.map(s => ({
              id: s.id,
              text: s.text,
              votes: s.suggestion_options.reduce((sum, o) => sum + o.votes.length, 0),
              author: s.profiles.username,
              timestamp: new Date(s.created_at).toISOString(),
              options: s.suggestion_options.map(o => ({
                id: o.id,
                text: o.text,
                votes: o.votes.length,
                voters: o.votes.map(v => v.profile_id)
              }))
            }));
            
            updateRoom({
              ...currentRoom,
              suggestions: formattedSuggestions
            });
          }
        } catch (err) {
          console.error('Error refreshing suggestions:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      })
      .subscribe();

    return () => {
      roomSubscription.unsubscribe();
    };
  }, [roomId, currentRoom, updateRoom]);

  return { loading, error };
}

// Form Field Hook
export function useFormField<T>(
  initialValue: T,
  validate?: (value: T) => string | null
) {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const onChange = useCallback((newValue: T) => {
    setValue(newValue);
    setTouched(true);
    if (validate) {
      const validationError = validate(newValue);
      setError(validationError);
    }
  }, [validate]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    onChange,
    reset,
    setError
  };
}

// Click Outside Hook
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Keyboard Shortcut Hook
export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  node: HTMLElement | null = null
) {
  useEffect(() => {
    const target = node || document;
    
    const pressedKeys = new Set();
    
    const handleKeyDown = (event: KeyboardEvent) => {
      pressedKeys.add(event.key.toLowerCase());
      
      const allKeysPressed = keys.every(key => 
        pressedKeys.has(key.toLowerCase())
      );
      
      if (allKeysPressed) {
        event.preventDefault();
        callback();
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.key.toLowerCase());
    };
    
    target.addEventListener('keydown', handleKeyDown);
    target.addEventListener('keyup', handleKeyUp);
    
    return () => {
      target.removeEventListener('keydown', handleKeyDown);
      target.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys, callback, node]);
}

// Network Status Hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}