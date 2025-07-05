import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for user's preferred color scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // Load dark mode setting from localStorage if available
    const savedDarkMode = localStorage.getItem('tableTalk-darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('tableTalk-darkMode', newValue.toString());
  };

  return { darkMode, toggleDarkMode };
} 