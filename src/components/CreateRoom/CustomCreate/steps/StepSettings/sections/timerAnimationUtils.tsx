import React from 'react';
import { motion, Variants } from 'framer-motion';

// Animation configurations for the 15-minute (Speed Round) card
export const speedRoundAnimationConfig = {
  iconAnimate: {
    scale: [1, 1.15, 1],
  },
  iconTransition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut",
    repeatType: "reverse" as const,
  },
  auraEffect: {
    animate: {
      boxShadow: [
        '0 0 0 0 rgba(251, 191, 36, 0)',
        '0 0 0 6px rgba(251, 191, 36, 0.15)',
        '0 0 0 0 rgba(251, 191, 36, 0)'
      ],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
      repeatType: "reverse" as const,
    },
  },
  glowEffect: (
    <motion.div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%)',
        filter: 'blur(1px)'
      }}
    />
  ) as JSX.Element,
  selectedOverlay: (
    <motion.div
      className="absolute inset-0 rounded-2xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `
            radial-gradient(circle at 25% 30%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 60%, rgba(255, 235, 59, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 50% 80%, rgba(251, 191, 36, 0.05) 0%, transparent 60%)
          `,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Food delivery icons */}
      {(() => {
        const foodEmojis = ['🍕', '🍔', '🍟', '🌮', '🍜', '🍰', '🥗', '🍱', '🍝', '🥙'];
        const maxIcons = 10;
        const icons = [];
        for (let i = 0; i < maxIcons; i++) {
          const emoji = foodEmojis[i % foodEmojis.length];
          // More varied spawn positions: top, bottom, left, right, and corners
          const spawnTypes = ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
          const spawnType = spawnTypes[Math.floor(Math.random() * spawnTypes.length)];
          const baseDelay = i * 0.4;
          const frequencyMultiplier = 1 + (i * 0.2);
          let startPosition, endPosition;
          
          // More spread out spawn positions
          switch (spawnType) {
            case 'top':
              startPosition = { left: `${10 + Math.random() * 80}%`, top: '-15%' };
              endPosition = { x: (Math.random() - 0.5) * 60, y: 130 + Math.random() * 20 };
              break;
            case 'bottom':
              startPosition = { left: `${10 + Math.random() * 80}%`, top: '115%' };
              endPosition = { x: (Math.random() - 0.5) * 60, y: -130 - Math.random() * 20 };
              break;
            case 'left':
              startPosition = { left: '-15%', top: `${10 + Math.random() * 80}%` };
              endPosition = { x: 130 + Math.random() * 20, y: (Math.random() - 0.5) * 60 };
              break;
            case 'right':
              startPosition = { left: '115%', top: `${10 + Math.random() * 80}%` };
              endPosition = { x: -130 - Math.random() * 20, y: (Math.random() - 0.5) * 60 };
              break;
            case 'top-left':
              startPosition = { left: '-15%', top: '-15%' };
              endPosition = { x: 120 + Math.random() * 30, y: 120 + Math.random() * 30 };
              break;
            case 'top-right':
              startPosition = { left: '115%', top: '-15%' };
              endPosition = { x: -120 - Math.random() * 30, y: 120 + Math.random() * 30 };
              break;
            case 'bottom-left':
              startPosition = { left: '-15%', top: '115%' };
              endPosition = { x: 120 + Math.random() * 30, y: -120 - Math.random() * 30 };
              break;
            case 'bottom-right':
              startPosition = { left: '115%', top: '115%' };
              endPosition = { x: -120 - Math.random() * 30, y: -120 - Math.random() * 30 };
              break;
            default:
              startPosition = { left: `${20 + Math.random() * 60}%`, top: '-15%' };
              endPosition = { x: (Math.random() - 0.5) * 60, y: 130 };
          }
          
          icons.push(
            <motion.div
              key={`food-icon-${i}`}
              className="absolute text-2xl select-none pointer-events-none"
              style={{ ...startPosition, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))', zIndex: 1 }}
              initial={{ opacity: 0, scale: 0.8 + Math.random() * 0.4, rotate: Math.random() * 20 - 10 }}
              animate={{
                opacity: [0, 0.6 + Math.random() * 0.2, 0.6 + Math.random() * 0.2, 0],
                x: [0, endPosition.x * 0.3, endPosition.x * 0.7, endPosition.x],
                y: [0, -15 - Math.random() * 10, -8 - Math.random() * 5, endPosition.y],
                rotate: [Math.random() * 20 - 10, Math.random() * 30 - 15, Math.random() * 20 - 10],
                scale: [0.8 + Math.random() * 0.4, 0.9 + Math.random() * 0.3, 0.8 + Math.random() * 0.4],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: baseDelay,
                repeatDelay: 2 / frequencyMultiplier,
                ease: "easeOut",
                times: [0, 0.3, 0.7, 1],
              }}
            >
              {emoji}
            </motion.div>
          );
        }
        return icons;
      })()}
      {/* Speed lines effect */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`speed-line-${i}`}
          className="absolute bg-gradient-to-r from-transparent via-amber-300/20 to-transparent"
          style={{ left: `${10 + i * 15}%`, top: `${30 + (i % 2) * 40}%`, width: '30px', height: '2px', transform: 'rotate(-15deg)' }}
          animate={{ x: [-50, 150], opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, repeatDelay: 1, ease: "easeOut" }}
        />
      ))}
      {/* Quick order notifications */}
      {[...Array(3)].map((_, i) => {
        const positions = [{ left: '20%', top: '15%' }, { left: '10%', top: '75%' }, { left: '80%', top: '40%' }];
        return (
          <motion.div
            key={`notification-${i}`}
            className="absolute text-xs font-semibold text-amber-600/70"
            style={positions[i]}
            animate={{ opacity: [0, 1, 1, 0], y: [0, -10, -15, -25], scale: [0.8, 1, 1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.7, repeatDelay: 1.5, ease: "easeOut" }}
          >
            {i === 0 ? 'Order!' : i === 1 ? 'Quick!' : 'Fast!'}
          </motion.div>
        );
      })}
    </motion.div>
  ),
};

// Animation configurations for the 30-minute (Standard) card
export const standardCardAnimationConfig = {
  iconAnimate: (isSelected: boolean) => ({
    rotate: isSelected ? 360 : 0,
  }),
  iconTransition: (isSelected: boolean) => ({
    duration: isSelected ? 12 : 0.3, // 12 seconds for a full rotation (like a clock second hand) when selected
    repeat: isSelected ? Infinity : 0,
    ease: isSelected ? "linear" : "easeOut" as any, // Smooth, consistent rotation like a clock when selected
    repeatType: isSelected ? "loop" as const : undefined,
  }),
  glowEffect: (
    <motion.div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
        filter: 'blur(1px)'
      }}
    />
  ) as JSX.Element,
  selectedOverlay: (
    <motion.div
      className="absolute inset-0 rounded-2xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div className="absolute text-blue-600/80 font-semibold text-xs" style={{ left: '6%', top: '8%' }} animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>Menu</motion.div>
      <motion.div className="absolute text-blue-600/80 font-semibold text-xs" style={{ right: '6%', top: '8%' }} animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>Dessert Menu</motion.div>
      {[...Array(4)].map((_, i) => {
        const prices = ['$$', '$$$', '$', '$$$$'];
        const foodEmojis = ['🍝', '🥗', '🍖', '🍤'];
        return (
          <React.Fragment key={`menu-group-left-${i}`}>
            <motion.div className="absolute bg-blue-400/60 rounded-sm shadow-sm" style={{ left: '6%', top: '15%', width: '30%', height: '2px' }} animate={{ y: [0, 85], opacity: [0, 0.9, 0.9, 0.5, 0] }} transition={{ duration: 8, repeat: Infinity, delay: i * 2, ease: "linear", times: [0, 0.2, 0.6, 0.9, 1] }} />
            <motion.div className="absolute text-blue-500/70 font-medium text-xs" style={{ left: '26%', top: '20%' }} animate={{ y: [0, 85], opacity: [0, 0.8, 0.8, 0.4, 0] }} transition={{ duration: 8, repeat: Infinity, delay: i * 2 + 0.2, ease: "linear", times: [0, 0.2, 0.6, 0.9, 1] }}><span>{prices[i]}</span></motion.div>
            <motion.div className="absolute text-blue-500/70 font-medium text-xs" style={{ left: '8%', top: '18%' }} animate={{ y: [0, 85], opacity: [0, 0.8, 0.8, 0.4, 0] }} transition={{ duration: 8, repeat: Infinity, delay: i * 2 + 0.2, ease: "linear", times: [0, 0.2, 0.6, 0.9, 1] }}><span>{foodEmojis[i]}</span></motion.div>
          </React.Fragment>
        );
      })}
      {[...Array(4)].map((_, i) => {
        const prices = ['$', '$$', '$$$', '$$'];
        const dessertEmojis = ['🍰', '🍨', '🧁', '🍮'];
        return (
          <React.Fragment key={`menu-group-right-${i}`}>
            <motion.div className="absolute bg-blue-400/60 rounded-sm shadow-sm" style={{ right: '6%', top: '15%', width: '30%', height: '2px' }} animate={{ y: [0, 85], opacity: [0, 0.9, 0.9, 0.5, 0] }} transition={{ duration: 8, repeat: Infinity, delay: i * 2 + 4, ease: "linear", times: [0, 0.2, 0.6, 0.9, 1] }} />
            <motion.div className="absolute text-blue-500/70 font-medium text-xs" style={{ right: '8%', top: '20%' }} animate={{ y: [0, 85], opacity: [0, 0.8, 0.8, 0.4, 0] }} transition={{ duration: 8, repeat: Infinity, delay: i * 2 + 4.2, ease: "linear", times: [0, 0.2, 0.6, 0.9, 1] }}><span>{prices[i]}</span></motion.div>
            <motion.div className="absolute text-blue-500/70 font-medium text-xs" style={{ right: '30%', top: '18%' }} animate={{ y: [0, 85], opacity: [0, 0.8, 0.8, 0.4, 0] }} transition={{ duration: 8, repeat: Infinity, delay: i * 2 + 4.2, ease: "linear", times: [0, 0.2, 0.6, 0.9, 1] }}><span>{dessertEmojis[i]}</span></motion.div>
          </React.Fragment>
        );
      })}
    </motion.div>
  ),
};

// Animation configurations for the 60-minute (Take Your Time) card
export const takeYourTimeAnimationConfig = {
  iconAnimate: (isSelected: boolean) => ({
    rotateY: isSelected ? 3600 : 0,
  }),
  iconTransition: (isSelected: boolean) => ({
    duration: isSelected ? 120 : 0.5,
    repeat: isSelected ? Infinity : 0,
    ease: isSelected ? "linear" : "easeOut" as any,
    repeatType: isSelected ? "loop" as const : undefined,
  }),
  cardAnimate: (isSelected: boolean) => ({
    scale: isSelected ? [1.0, 1.008, 1.0] : 1,
    boxShadow: isSelected
      ? [
          "0 8px 25px -5px rgba(16, 185, 129, 0.15)",
          "0 10px 30px -5px rgba(16, 185, 129, 0.22)",
          "0 8px 25px -5px rgba(16, 185, 129, 0.15)",
        ]
      : "0 4px 15px -3px rgba(0, 0, 0, 0.1)",
  }),
  cardTransition: (isSelected: boolean) => ({
    scale: isSelected ? { duration: 6, repeat: Infinity, ease: [0.4, 0.0, 0.6, 1.0], times: [0, 0.5, 1] } : { duration: 0.3 },
    boxShadow: isSelected ? { duration: 6, repeat: Infinity, ease: [0.4, 0.0, 0.6, 1.0] } : { duration: 0.3 },
  }),
  glowEffect: null as JSX.Element | null,
  selectedOverlay: (
    <motion.div
      className="absolute inset-0 rounded-2xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {[...Array(4)].map((_, i) => (
        <motion.div 
          key={`cloud-large-${i}`}
          className="absolute rounded-full"
          style={{ width: `${60 + i * 20}px`, height: `${30 + i * 10}px`, left: `${-30 - i * 10}%`, top: `${20 + i * 15}%`, background: `radial-gradient(ellipse at center, rgba(16, 185, 129, ${0.12 + i * 0.03}) 0%, rgba(5, 150, 105, ${0.08 + i * 0.02}) 40%, transparent 70%)`, filter: 'blur(2px)', borderRadius: '50% 40% 60% 30%' }}
          animate={{ x: [0, 300, 450], y: [0, -10, 5, -5, 0], scale: [1, 1.1, 0.9, 1], rotate: [0, 5, -3, 2, 0], borderRadius: ['50% 40% 60% 30%', '40% 60% 30% 50%', '60% 30% 50% 40%', '50% 40% 60% 30%'] }}
          transition={{ duration: 25 + i * 5, repeat: Infinity, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 3 }}
        />
      ))}
      {[...Array(6)].map((_, i) => (
        <motion.div 
          key={`cloud-medium-${i}`}
          className="absolute rounded-full"
          style={{ width: `${30 + i * 8}px`, height: `${15 + i * 4}px`, left: `${-25 - i * 5}%`, top: `${10 + i * 12}%`, background: `radial-gradient(ellipse at center, rgba(16, 185, 129, ${0.08 + i * 0.02}) 0%, rgba(5, 150, 105, ${0.04 + i * 0.01}) 50%, transparent 70%)`, filter: 'blur(1.5px)', borderRadius: '60% 40% 50% 35%' }}
          animate={{ x: [0, 250, 380], y: [0, 8, -5, 3, 0], scale: [0.8, 1.2, 0.9, 1.1, 0.8], opacity: [0.6, 0.9, 0.7, 1, 0.6], borderRadius: ['60% 40% 50% 35%', '45% 55% 35% 50%', '55% 35% 45% 60%', '60% 40% 50% 35%'] }}
          transition={{ duration: 20 + i * 3, repeat: Infinity, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 2.5 + 1 }}
        />
      ))}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`cloud-small-${i}`}
          className="absolute rounded-full"
          style={{ width: `${15 + i * 3}px`, height: `${8 + i * 2}px`, left: `${-20 - i * 3}%`, top: `${5 + i * 10}%`, background: `radial-gradient(ellipse at center, rgba(16, 185, 129, ${0.06 + i * 0.01}) 0%, rgba(5, 150, 105, ${0.03 + i * 0.005}) 40%, transparent 60%)`, filter: 'blur(1px)', borderRadius: '70% 30% 40% 60%' }}
          animate={{ x: [0, 200, 320], y: [0, -3, 2, -1, 0], scale: [0.6, 1, 0.8, 1.1, 0.6], opacity: [0.5, 0.8, 0.6, 0.9, 0.5], rotate: [0, 10, -5, 8, 0] }}
          transition={{ duration: 15 + i * 2, repeat: Infinity, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 1.8 }}
        />
      ))}
    </motion.div>
  ),
};