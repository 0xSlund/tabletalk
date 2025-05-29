import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface AppHeaderProps {
  darkMode?: boolean;
}

export function AppHeader({ darkMode = false }: AppHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-col items-center text-center space-y-3 mb-2 sm:mb-4 mt-1 sm:mt-2">
        <div className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-primary'}`}>
          <UtensilsCrossed className="h-8 w-8" />
          <h1 className="text-3xl font-bold">TableTalk</h1>
        </div>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-md mx-auto`}>
          The easiest way to decide where to eat with friends and family
        </p>
      </div>
      <div 
        className="h-1 w-24 mx-auto rounded-full mb-8"
        style={{
          background: darkMode 
            ? 'linear-gradient(to right, rgba(var(--primary-rgb), 0.6), rgba(var(--primary-rgb), 0.8))'
            : 'linear-gradient(to right, rgba(var(--primary-rgb), 0.8), rgba(var(--primary-rgb), 1))'
        }}
      ></div>
    </header>
  );
} 