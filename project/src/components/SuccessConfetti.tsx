import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { confettiConfig } from '../lib/utils';

interface SuccessConfettiProps {
  message?: string;
  duration?: number;
  onComplete?: () => void;
}

export function SuccessConfetti({ 
  message = "Success!", 
  duration = 3000,
  onComplete
}: SuccessConfettiProps) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [duration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-50"
    >
      {isVisible && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            {...confettiConfig}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-white/90 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg">
              <p className="text-2xl font-clash font-medium text-text-heading">
                {message}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}