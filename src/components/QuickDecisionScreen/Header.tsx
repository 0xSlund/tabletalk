import React from 'react';
import { UtensilsCrossed, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import BackButton from '../BackButton';

interface HeaderProps {
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const Header: React.FC<HeaderProps> = ({ showFilters, onToggleFilters }) => (
  <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6" style={{ color: '#B8A9D1' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#4A3B5C' }}>TableTalk</h1>
        </div>
        <button
          onClick={onToggleFilters}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
            showFilters 
              ? "text-white" 
              : "hover:bg-gray-100"
          )}
          style={showFilters 
            ? { backgroundColor: 'rgba(184, 169, 209, 0.1)', color: '#B8A9D1' }
            : { color: '#7D6B8A' }
          }
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Filters</span>
        </button>
      </div>
    </div>
  </header>
); 