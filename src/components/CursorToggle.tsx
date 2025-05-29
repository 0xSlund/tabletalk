import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MousePointer } from 'lucide-react';

interface CursorToggleProps {
  className?: string;
}

export default function CursorToggle({ className }: CursorToggleProps) {
  const [customCursor, setCustomCursor] = useState(false);
  
  useEffect(() => {
    // Load custom cursor setting from localStorage if available
    const savedCursorSetting = localStorage.getItem('tableTalk-customCursor');
    if (savedCursorSetting !== null) {
      setCustomCursor(savedCursorSetting === 'true');
      updateCursorClass(savedCursorSetting === 'true');
    }
  }, []);
  
  const toggleCursor = () => {
    const newSetting = !customCursor;
    setCustomCursor(newSetting);
    localStorage.setItem('tableTalk-customCursor', newSetting.toString());
    updateCursorClass(newSetting);
  };
  
  const updateCursorClass = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('custom-cursor');
    } else {
      document.documentElement.classList.remove('custom-cursor');
    }
  };
  
  return (
    <motion.button
      onClick={toggleCursor}
      className={`p-3 rounded-full shadow-lg bg-white text-gray-800 border border-gray-200 ${className || ''}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={customCursor ? 'Disable custom cursor' : 'Enable custom cursor'}
    >
      <MousePointer size={20} />
    </motion.button>
  );
} 