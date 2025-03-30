import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransitionVariants } from '../lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transitionKey: string;
  direction?: 'left' | 'right';
}

export function PageTransition({ 
  children, 
  className = '', 
  transitionKey,
  direction = 'right'
}: PageTransitionProps) {
  const variants = {
    ...pageTransitionVariants,
    initial: { 
      opacity: 0,
      x: direction === 'right' ? -20 : 20
    },
    exit: { 
      opacity: 0,
      x: direction === 'right' ? 20 : -20,
      transition: { duration: 0.32, ease: "easeIn" }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={variants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export const slideVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    x: -100,
    transition: {
      duration: 0.32,
      ease: "easeInOut"
    }
  }
};

export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.32
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.32
    }
  }
};

export const popVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: {
      duration: 0.2
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};

export const foodCardVariants = {
  hidden: { opacity: 0, y: 50, rotateZ: -2 },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateZ: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    y: -50, 
    rotateZ: 2,
    transition: {
      duration: 0.32
    }
  },
  hover: {
    y: -10,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    y: -5,
    transition: {
      duration: 0.12,
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  }
};