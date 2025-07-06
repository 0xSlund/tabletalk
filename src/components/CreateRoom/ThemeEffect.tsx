import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Pizza, Coffee, IceCream, Soup, Cake, Cherry } from 'lucide-react';

interface ThemeEffectProps {
  theme: number;
  show: boolean;
  width: number;
  height: number;
}

export const ThemeEffect: React.FC<ThemeEffectProps> = ({ theme, show, width, height }) => {
  // For Cozy Gathering - snowflakes/stars
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; rotation: number }>>([]);
  
  // For Surprise Me - floating food icons
  const [foodIcons, setFoodIcons] = useState<Array<{ id: number; x: number; y: number; icon: any; delay: number; size: number }>>([]);
  
  // Generate snowflakes for Cozy Gathering theme - centered near the middle of the screen
  useEffect(() => {
    if (show && theme === 1) {
      // Create elements focused in the center area of the screen
      const centerX = width / 2;
      const centerY = height / 2;
      const distributionRadius = Math.min(width, height) * 0.6; // 60% of screen size for distribution
      
      const flakes = Array.from({ length: 60 }, (_, i) => {
        // Random angle and distance from center (with more probability closer to center)
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * distributionRadius * (0.3 + Math.random() * 0.7); // More elements closer to center
        
        return {
          id: i,
          // Calculate x/y as actual pixels centered around the middle
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
          size: Math.random() * 20 + 10, // size between 10-30px
          delay: Math.random() * 8, // delay before animation starts
          rotation: Math.random() * 360 // random initial rotation
        };
      });
      
      setSnowflakes(flakes);
    } else {
      setSnowflakes([]);
    }
  }, [show, theme, width, height]);
  
  // Generate food icons for Surprise Me theme - centered near the middle of the screen
  useEffect(() => {
    if (show && theme === 2) {
      const icons = [Pizza, Coffee, IceCream, Soup, Cake, Cherry];
      
      // Create elements focused in the center area of the screen
      const centerX = width / 2;
      const centerY = height / 2;
      const distributionRadius = Math.min(width, height) * 0.7; // 70% of screen size for distribution
      
      const items = Array.from({ length: 40 }, (_, i) => {
        // Random angle and distance from center (with more probability closer to center)
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * distributionRadius * (0.4 + Math.random() * 0.6); // More elements closer to center
        
        return {
          id: i,
          // Calculate x/y as actual pixels centered around the middle
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
          icon: icons[Math.floor(Math.random() * icons.length)],
          delay: Math.random() * 8, // delay before animation starts
          size: Math.random() * 25 + 25 // size between 25-50px
        };
      });
      
      setFoodIcons(items);
    } else {
      setFoodIcons([]);
    }
  }, [show, theme, width, height]);
  
  // If not showing, return nothing
  if (!show) return null;
  
  // Food Fiesta Theme (0): Standard confetti
  if (theme === 0) {
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#FFFDF9', '#FAF8F5', '#F3ECE3', '#E7DDD1', '#D4C5B5']} // Neutral theme matching background
        />
      </div>
    );
  }
  
  // Cozy Gathering Theme (1): Snowflakes/stars
  if (theme === 1) {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Subtle radial gradient background effect - centered in the middle of the screen */}
        <motion.div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: Math.max(width, height) * 1.5,
            height: Math.max(width, height) * 1.5,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 30%, transparent 70%)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.3, 0.6, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <AnimatePresence>
          {snowflakes.map((flake) => (
            <motion.div
              key={flake.id}
              initial={{ 
                opacity: 0,
                rotate: flake.rotation,
                scale: 0,
                filter: 'blur(2px)',
                x: flake.x,
                y: flake.y
              }}
              animate={{ 
                opacity: [0, 0.8, 0.8, 0.4, 0],
                rotate: flake.rotation + 360,
                scale: [0, 1, 1.2, 1, 0],
                filter: ['blur(2px)', 'blur(0px)', 'blur(0px)', 'blur(1px)', 'blur(2px)'],
                x: flake.x + (Math.random() * 40 - 20), // slight random movement
                y: flake.y + (Math.random() * 40 - 20)  // slight random movement
              }}
              transition={{ 
                duration: Math.random() * 15 + 10, 
                delay: flake.delay,
                ease: "easeInOut" 
              }}
              className="absolute"
              style={{ 
                width: flake.size,
                height: flake.size,
                transform: 'translate(-50%, -50%)' // Center the element on its position
              }}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-300 drop-shadow-lg" fill="currentColor">
                <path d="M50 0 L60 35 L95 50 L60 65 L50 100 L40 65 L5 50 L40 35 Z" />
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }
  
  // Surprise Me Theme (2): Floating food icons
  if (theme === 2) {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Subtle radial gradient background effect - centered in the middle of the screen */}
        <motion.div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: Math.max(width, height) * 1.5,
            height: Math.max(width, height) * 1.5,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 30%, transparent 70%)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3, 0.5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <AnimatePresence>
          {foodIcons.map((item) => {
            const Icon = item.icon as any;
            return (
              <motion.div
                key={item.id}
                initial={{ 
                  opacity: 0,
                  scale: 0,
                  rotate: -30,
                  filter: 'blur(2px)',
                  x: item.x,
                  y: item.y
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0.5, 0],
                  scale: [0, 1.2, 1, 1.1, 0],
                  rotate: [-30, 15, 0, -15, -30],
                  filter: ['blur(2px)', 'blur(0px)', 'blur(0px)', 'blur(1px)', 'blur(2px)'],
                  x: item.x + (Math.random() * 60 - 30), // more random movement
                  y: item.y + (Math.random() * 60 - 30)  // more random movement
                }}
                transition={{ 
                  duration: Math.random() * 12 + 8, 
                  delay: item.delay,
                  ease: "easeInOut" 
                }}
                className="absolute"
                style={{ 
                  width: item.size,
                  height: item.size,
                  transform: 'translate(-50%, -50%)' // Center the element on its position
                }}
              >
                <Icon className="w-full h-full text-green-500 drop-shadow-lg" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }
  
  return null;
}; 