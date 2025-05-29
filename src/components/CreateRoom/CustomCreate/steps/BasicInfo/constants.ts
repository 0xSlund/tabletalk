import { ChefHat, MessageSquare, Utensils } from 'lucide-react';

// Food Mode type definition
export type FoodMode = 'dining-out' | 'cooking' | 'both' | 'neutral';

// Theme colors for each mode
export const FOOD_MODE_THEMES = {
  'cooking': {
    primaryColor: 'text-teal-600',
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-emerald-600',
    bgLight: 'bg-teal-100',
    bgHover: 'hover:bg-teal-50',
    ring: 'ring-teal-300',
    icon: ChefHat,
    title: 'Cooking',
    description: 'Share recipes & homemade meals',
    colorFrom: '#14b8a6',
    colorTo: '#059669',
    borderColor: '#5eead4'
  },
  'dining-out': {
    primaryColor: 'text-violet-600',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-purple-600',
    bgLight: 'bg-violet-100',
    bgHover: 'hover:bg-violet-50',
    ring: 'ring-violet-300',
    icon: Utensils,
    title: 'Dining Out',
    description: 'Find & vote on restaurants',
    colorFrom: '#8b5cf6',
    colorTo: '#7c3aed',
    borderColor: '#ddd6fe'
  },
  'both': {
    primaryColor: 'text-orange-600',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-500',
    bgLight: 'bg-orange-100',
    bgHover: 'hover:bg-orange-50',
    ring: 'ring-orange-300',
    icon: MessageSquare, // Will be replaced with animated icons
    title: 'Both',
    description: 'Cook at home or eat out together',
    colorFrom: '#f97316',
    colorTo: '#ef4444',
    borderColor: '#fed7aa'
  },
  'neutral': {
    primaryColor: 'text-blue-600',
    gradientFrom: 'from-blue-200',
    gradientTo: 'to-blue-300',
    bgLight: 'bg-blue-50',
    bgHover: 'hover:bg-blue-50',
    ring: 'ring-blue-200',
    icon: MessageSquare,
    title: 'Neutral',
    description: 'Select a dining mode',
    colorFrom: '#bfdbfe',
    colorTo: '#93c5fd',
    borderColor: '#bfdbfe'
  }
};

// Price range interface and data
export interface PriceRange {
  value: string;
  label: string;
  amount: string;
  icon: string;
  color: string;
  hoverColor: string;
  isLuxury?: boolean;
}

export const priceRanges: PriceRange[] = [
  { 
    value: '$', 
    label: 'Budget', 
    amount: 'Under $10', 
    icon: '$',
    color: 'from-gray-400 to-gray-500',
    hoverColor: 'bg-gray-200'
  },
  { 
    value: '$$', 
    label: 'Moderate', 
    amount: '$10-25', 
    icon: '$$',
    color: 'from-green-400 to-emerald-500',
    hoverColor: 'bg-green-100'
  },
  { 
    value: '$$$', 
    label: 'Expensive', 
    amount: '$25-50', 
    icon: '$$$',
    color: 'from-blue-400 to-indigo-500',
    hoverColor: 'bg-blue-100'
  },
  { 
    value: '$$$$', 
    label: 'Luxury', 
    amount: 'Over $50', 
    icon: '$$$$',
    color: 'from-amber-400 to-yellow-500',
    hoverColor: 'bg-amber-100',
    isLuxury: true
  },
];

// Cuisine type data
export const cuisines = [
  { id: 'italian', name: 'Italian', emoji: '🍝', popular: true },
  { id: 'japanese', name: 'Japanese', emoji: '🍱', popular: true },
  { id: 'mexican', name: 'Mexican', emoji: '🌮', popular: true },
  { id: 'chinese', name: 'Chinese', emoji: '🥡', popular: true },
  { id: 'indian', name: 'Indian', emoji: '🍛', popular: true },
  { id: 'american', name: 'American', emoji: '🍔', popular: true },
  { id: 'thai', name: 'Thai', emoji: '🍜' },
  { id: 'mediterranean', name: 'Mediterranean', emoji: '🥙' },
  { id: 'vietnamese', name: 'Vietnamese', emoji: '🍜' },
  { id: 'korean', name: 'Korean', emoji: '🍖' },
  { id: 'french', name: 'French', emoji: '🥐' },
  { id: 'greek', name: 'Greek', emoji: '🥗' },
];

// Distance presets
export const distancePresets = [
  { value: 2, label: 'Nearby', description: 'Walking distance' },
  { value: 10, label: 'Local', description: 'Short drive' },
  { value: 25, label: 'Citywide', description: 'Across town' },
  { value: 50, label: 'Regional', description: 'Wider area' }
];

// Dietary restrictions
export const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', name: 'Vegetarian', emoji: '🥦' },
  { id: 'vegan', name: 'Vegan', emoji: '🌱' },
  { id: 'gluten-free', name: 'Gluten-Free', emoji: '🌾' },
  { id: 'dairy-free', name: 'Dairy-Free', emoji: '🥛' },
  { id: 'nut-free', name: 'Nut-Free', emoji: '🥜' },
  { id: 'keto', name: 'Keto', emoji: '🥑' },
  { id: 'paleo', name: 'Paleo', emoji: '🍖' },
  { id: 'low-carb', name: 'Low-Carb', emoji: '🍽️' }
];

// Add scale-pulse animation CSS
export const scaleAnimationStyle = `
  @keyframes scalePulse {
    0% { transform: scale(1); }
    50% { transform: scale(0.99); }
    100% { transform: scale(1); }
  }
  
  .scale-pulse {
    animation: scalePulse 0.2s ease-in-out;
  }
`;

// Placeholder examples for room names
export const PLACEHOLDER_EXAMPLES = [
  "Lunch with Parents",
  "Friday Night Dinner",
  "Birthday Celebration",
  "Game Night Food",
  "Team Lunch Meetup",
  "Weekend Brunch Ideas",
  "Date Night Dining",
  "Friends Hangout Food"
];

// Suggestion banks for room names based on time
export const SUGGESTION_BANK = [
  // Morning-specific suggestions (5am-11am)
  {
    category: 'morning',
    suggestions: [
      "Morning Breakfast Club",
      "Sunrise Bites",
      "Morning Coffee Meetup",
      "Early Bird Eats",
      "AM Food Run",
      "Breakfast with Friends",
      "Morning Fuel-Up",
      "Dawn Dining",
      "Brunch Bunch",
      "Wake & Dine"
    ]
  },
  // Lunch-specific suggestions (11am-2pm)
  {
    category: 'lunch',
    suggestions: [
      "Lunch Break Escape",
      "Midday Meetup",
      "Lunch Squad",
      "Quick Lunch Group",
      "Lunch & Learn",
      "Team Lunch",
      "Noon Food Club",
      "Lunch Hour Hangout",
      "Midday Meal Crew",
      "Lunch Date"
    ]
  },
  // Afternoon-specific suggestions (2pm-5pm)
  {
    category: 'afternoon',
    suggestions: [
      "Afternoon Snack Run",
      "Coffee & Dessert",
      "Tea Time",
      "Afternoon Bites",
      "Snack Break",
      "Afternoon Treat",
      "Coffee Meetup",
      "Sweet Tooth Club",
      "Afternoon Pick-Me-Up",
      "Dessert Run"
    ]
  },
  // Evening-specific suggestions (5pm-9pm)
  {
    category: 'evening',
    suggestions: [
      "Dinner Plans",
      "Evening Eats",
      "Dinner Squad",
      "Night Out Food",
      "Dinner & Drinks",
      "After Work Dinner",
      "Evening Dining",
      "Dinner Circle",
      "Supper Club",
      "Dinner Gathering"
    ]
  },
  // Late night suggestions (9pm-5am)
  {
    category: 'latenight',
    suggestions: [
      "Late Night Eats",
      "Midnight Snack",
      "Night Owl Bites",
      "After Hours Food",
      "Late Dining",
      "Night Cravings",
      "Midnight Munchies",
      "Late Supper",
      "Night Food Run",
      "Late Night Hangout"
    ]
  },
  // Weekend-specific suggestions
  {
    category: 'weekend',
    suggestions: [
      "Weekend Food Adventure",
      "Weekend Dining",
      "Saturday Eats",
      "Sunday Feast",
      "Weekend Food Tour",
      "Weekend Brunch",
      "Weekend Dinner Club",
      "Weekend Food Finds",
      "Weekend Culinary Trip",
      "Weekend Feast"
    ]
  },
  // Occasion-based suggestions (always relevant)
  {
    category: 'occasion',
    suggestions: [
      "Birthday Dinner",
      "Celebration Meal",
      "Special Occasion Dining",
      "Anniversary Dinner",
      "Reunion Dinner",
      "Farewell Lunch",
      "Promotion Celebration",
      "Welcome Dinner",
      "Graduation Feast",
      "Holiday Dinner"
    ]
  }
];

// Animation variants for components
export const MODE_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  duration: 0.4
};

// Animation variants for the food mode cards
export const MODE_CARD_VARIANTS = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { scale: 0.95, opacity: 0 },
  hover: { scale: 1.03, transition: { type: 'spring', stiffness: 500, damping: 15 } },
  tap: { scale: 0.98 }
};

// Animation variants for placeholder text
export const placeholderVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 15 : -15,
    opacity: 0
  }),
  center: {
    y: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -15 : 15,
    opacity: 0
  })
};

// Checkmark animation variants
export const checkmarkVariants = {
  hidden: { 
    scale: 0,
    opacity: 0,
    rotate: -45, 
    x: 10
  },
  visible: { 
    scale: 1,
    opacity: 1,
    rotate: 0,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
      duration: 0.4
    }
  }
};

// Enhanced suggestions animation variants
export const suggestionsContainerVariants = {
  hidden: { opacity: 0, y: -10, height: 0 },
  visible: { 
    opacity: 1, 
    y: 0,
    height: 'auto',
    transition: {
      duration: 0.2,
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    height: 0,
    transition: { 
      duration: 0.2 
    }
  }
};

export const suggestionItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

// Animation variants for price range
export const priceRangeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.05,
      duration: 0.3,
      ease: "easeOut"
    }
  }),
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.98
  }
};

// Enhanced Slider Animation
export const sliderThumbVariants = {
  initial: { scale: 0.8 },
  hover: { scale: 1.1, backgroundColor: "#f97316" },
  drag: { scale: 1.2, backgroundColor: "#ea580c" }
};

// Animation variants for the icons in food mode cards
export const iconAnimationVariants = {
  cooking: {
    rotate: [0, -10, 10, -5, 5, 0],
    transition: { 
      duration: 1, 
      repeat: Infinity, 
      repeatDelay: 2
    }
  },
  diningOut: {
    y: [0, -3, 0, -3, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatDelay: 2
    }
  },
  both: {
    opacity: [1, 0.5, 1],
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 1
    }
  }
};

// Animation variants for cuisine chips
export const cuisineChipVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 10,
    scale: 0.9,
    transition: {
      delay: i * 0.05,
    }
  }),
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }),
  hover: {
    y: -3,
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 20
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 10
    }
  }
};

// Helper function to get time period greeting
export const getTimePeriodGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Evening';
  } else {
    return 'Night';
  }
};

// Get appropriate distance label based on radius
export const getDistanceLabel = (radius: number): string => {
  if (radius <= 2) return "Nearby";
  if (radius <= 10) return "Local";
  if (radius <= 25) return "Citywide";
  return "Regional";
}; 