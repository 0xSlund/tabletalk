import { Flame, Home, Gift } from 'lucide-react';
import { Theme } from './types';

// Room name placeholder examples
export const PLACEHOLDER_EXAMPLES = [
  "e.g., Lunch with Parents",
  "e.g., Friday Night Dinner",
  "e.g., Birthday Celebration",
  "e.g., Game Night Food",
  "e.g., Team Lunch Meetup",
  "e.g., Weekend Brunch Ideas",
  "e.g., Date Night Dining",
  "e.g., Friends Hangout Food"
];

// Fun themes for the room with icons and colors
export const THEMES: Theme[] = [
  { 
    name: "Food Fiesta", 
    icon: Flame, 
    color: "from-orange-500 to-red-500", 
    bgGradient: "from-orange-50 via-orange-100/30 to-red-50" 
  },
  { 
    name: "Cozy Gathering", 
    icon: Home, 
    color: "from-blue-500 to-purple-500", 
    bgGradient: "from-blue-50 via-purple-100/30 to-indigo-50" 
  },
  { 
    name: "Surprise Me", 
    icon: Gift, 
    color: "from-green-500 to-teal-500", 
    bgGradient: "from-green-50 via-teal-100/30 to-emerald-50" 
  },
];

// Price range options
export const PRICE_RANGES = [
  { symbol: '$', color: 'from-gray-400 to-gray-500', hoverColor: 'bg-gray-200', average: '$8-15' },
  { symbol: '$$', color: 'from-green-400 to-emerald-500', hoverColor: 'bg-green-100', average: '$15-25' },
  { symbol: '$$$', color: 'from-blue-400 to-indigo-500', hoverColor: 'bg-blue-100', average: '$25-45' },
  { symbol: '$$$$', color: 'from-amber-400 to-yellow-500', hoverColor: 'bg-amber-100', average: '$45+', isLuxury: true }
];

// Helper functions for formatting
export const formatTimeDisplay = (minutes: number) => `${minutes} min`;
export const formatLocationDisplay = (miles: number) => `${miles} mile${miles !== 1 ? 's' : ''}`;