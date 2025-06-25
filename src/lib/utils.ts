import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// UI Helpers
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Animation Variants
export const cardVariants = {
  initial: { 
    scale: 1,
    y: 0,
    filter: 'saturate(1) brightness(1)',
    fontWeight: 400,
    rotateX: 0,
    rotateY: 0,
    perspective: 1000
  },
  hover: { 
    scale: 1.025,
    y: -2,
    filter: 'saturate(1.05) brightness(1.02)',
    transition: {
      duration: 0.28,
      ease: [0.2, 0, 0.2, 1]
    }
  },
  tap: {
    scale: 0.98,
    y: 1,
    transition: {
      duration: 0.12,
      ease: [0.2, 0, 0.2, 1]
    }
  }
};

export const buttonVariants = {
  initial: { y: 0 },
  tap: { 
    y: 3,
    transition: { duration: 0.12, type: "spring", stiffness: 500 }
  }
};

export const pageTransitionVariants = {
  initial: { 
    opacity: 0,
    x: -10,
    scale: 0.98
  },
  enter: { 
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { 
      duration: 0.4, 
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    x: 10,
    scale: 0.98,
    transition: { 
      duration: 0.3, 
      ease: [0.55, 0.055, 0.675, 0.19]
    }
  }
};

export const confettiConfig = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#E8856B", "#2D7D8A", "#A9D9C6", "#F3CA40", "#C1614F"]
};

// Date & Time Formatting
export function formatDate(date: string | Date): string {
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

export function formatTime(date: string | Date): string {
  try {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
}

export function formatDateTime(date: string | Date): string {
  try {
    const d = new Date(date);
    return `${formatDate(d)} at ${formatTime(d)}`;
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return 'Invalid date/time';
  }
}

// Time Remaining Calculation
export function formatTimeRemaining(expiresAt: string): string {
  try {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffMs = expiration.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Expired';
    }
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffMinutes < 10) {
      const remainingSeconds = diffSeconds % 60;
      return `${diffMinutes}m ${remainingSeconds}s left`;
    }
    
    if (diffMinutes >= 60) {
      const remainingMinutes = diffMinutes % 60;
      if (remainingMinutes === 0) {
        return `${diffHours}h left`;
      }
      return `${diffHours}h ${remainingMinutes}m left`;
    }
    
    return `${diffMinutes}m left`;
  } catch (error) {
    console.error("Error formatting time remaining:", error);
    return "Time remaining unavailable";
  }
}

// Security Helpers
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { 
  isValid: boolean; 
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}