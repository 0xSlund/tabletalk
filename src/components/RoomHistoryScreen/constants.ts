import { Grid3X3, Play, Trophy, Clock } from 'lucide-react';

export const ROOMS_PER_PAGE_GRID = 9;
export const ROOMS_PER_PAGE_LIST = 6;

export const STATUS_FILTERS = [
  { 
    key: 'all' as const, 
    label: 'All', 
    icon: Grid3X3,
    colors: {
      active: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25',
      inactiveDark: 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 border border-gray-600',
      inactiveLight: 'bg-white/80 text-gray-600 hover:bg-white border border-gray-200 hover:shadow-md'
    }
  },
  { 
    key: 'active' as const, 
    label: 'Active', 
    icon: Play,
    colors: {
      active: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 animate-pulse',
      inactiveDark: 'bg-gray-700/50 text-gray-300 hover:bg-green-900/30 hover:text-green-400 border border-gray-600',
      inactiveLight: 'bg-white/80 text-gray-600 hover:bg-green-50 hover:text-green-700 border border-gray-200 hover:shadow-md'
    }
  },
  { 
    key: 'completed' as const, 
    label: 'Done', 
    icon: Trophy,
    colors: {
      active: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/25',
      inactiveDark: 'bg-gray-700/50 text-gray-300 hover:bg-yellow-900/30 hover:text-yellow-400 border border-gray-600',
      inactiveLight: 'bg-white/80 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700 border border-gray-200 hover:shadow-md'
    }
  },
  { 
    key: 'expired' as const, 
    label: 'Expired', 
    icon: Clock,
    colors: {
      active: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25',
      inactiveDark: 'bg-gray-700/50 text-gray-300 hover:bg-red-900/30 hover:text-red-400 border border-gray-600',
      inactiveLight: 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-700 border border-gray-200 hover:shadow-md'
    }
  }
];

export const GLOW_EFFECTS = {
  all: 'linear-gradient(45deg, #f97316, #ea580c)',
  active: 'linear-gradient(45deg, #10b981, #059669)',
  completed: 'linear-gradient(45deg, #eab308, #d97706)',
  expired: 'linear-gradient(45deg, #ef4444, #dc2626)'
};

export const CARD_STYLES = {
  grid: {
    container: 'h-52',
    content: 'p-4 h-full flex flex-col',
    header: 'mb-2 pt-3 flex-shrink-0',
    title: 'text-base font-bold mb-1.5 line-clamp-2 pr-16 leading-tight',
    footer: 'flex items-center justify-between flex-shrink-0 mt-auto'
  },
  list: {
    container: 'h-20',
    content: 'p-3 h-full flex items-center',
    header: 'flex-1 min-w-0',
    title: 'text-lg font-bold line-clamp-1 pr-16',
    footer: 'flex items-center gap-4'
  }
}; 