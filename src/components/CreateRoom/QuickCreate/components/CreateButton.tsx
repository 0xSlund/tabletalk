import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, XCircle, Wifi } from 'lucide-react';
import { itemVariants } from '../types';

interface CreateButtonProps {
  onCreateRoom: () => void;
  isCreating: boolean;
  selectedTheme: number;
  error?: string;
}

export const CreateButton: React.FC<CreateButtonProps> = ({
  onCreateRoom,
  isCreating,
  selectedTheme,
  error
}) => {
  const getThemeGradient = (themeIndex: number) => {
    switch (themeIndex) {
      case 0: return 'from-orange-500 to-red-500';
      case 1: return 'from-blue-500 to-purple-500';
      case 2: return 'from-green-500 to-teal-500';
      default: return 'from-orange-500 to-red-500';
    }
  };
  
  // Determine error type and select appropriate styling
  const getErrorDetails = () => {
    if (!error) return null;
    
    if (error.includes('Network') || error.includes('connection')) {
      return {
        icon: <Wifi className="w-4 h-4" />,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-200'
      };
    } else if (error.includes('Authentication') || error.includes('sign in')) {
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-200'
      };
    } else {
      return {
        icon: <XCircle className="w-4 h-4" />,
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        borderColor: 'border-red-200'
      };
    }
  };
  
  const errorDetails = getErrorDetails();

  return (
    <motion.div variants={itemVariants} className="space-y-2">
      <button
        onClick={onCreateRoom}
        disabled={isCreating}
        className={`w-full py-3 px-4 rounded-xl bg-gradient-to-br ${getThemeGradient(selectedTheme)} text-white font-bold shadow-md hover:shadow-lg active:shadow-md transition-all duration-200 flex items-center justify-center ${isCreating ? 'opacity-90' : 'hover:scale-[1.01]'}`}
      >
        {isCreating ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Creating...</span>
          </div>
        ) : (
          'Create Room'
        )}
      </button>
      
      {/* Error message */}
      {error && errorDetails && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 ${errorDetails.textColor} text-sm p-2 ${errorDetails.bgColor} rounded-lg border ${errorDetails.borderColor}`}
        >
          {errorDetails.icon}
          <span>{error}</span>
        </motion.div>
      )}
    </motion.div>
  );
}; 