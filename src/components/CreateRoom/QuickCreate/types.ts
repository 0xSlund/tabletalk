// Type definitions for QuickCreate components

// Main QuickCreate component props
export interface QuickCreateProps {
  onCreate: (roomName: string, time: number, location: number, theme?: number) => Promise<{ roomId: string | null; roomCode: string | null }>;
  onBack: () => void;
}

// Food mode types
export type FoodMode = 'dining-out' | 'cooking' | 'both';

// Theme definition type
export interface Theme {
  name: string;
  icon: React.ComponentType;
  color: string;
  bgGradient: string;
}

// Animation variants for framer-motion
export const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25 
    },
  },
};

// Floating animation for decorations
export const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
}; 