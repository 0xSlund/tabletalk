import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Sparkles, Clock, Users } from 'lucide-react';

interface ModernLoaderProps {
  progress: number;
}

const ShimmerCard = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white rounded-xl p-6 shadow-lg relative overflow-hidden"
  >
    {/* Shimmer effect overlay */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
    
    {/* Card skeleton content */}
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
      
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse"></div>
      
      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
      </div>
      
      {/* Tags skeleton */}
      <div className="flex space-x-2">
        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-14"></div>
      </div>
    </div>
  </motion.div>
);

export default function ModernLoader({ progress }: ModernLoaderProps) {

  const stages = [
    { key: 'analyzing', icon: Sparkles, label: 'Analyzing preferences' },
    { key: 'searching', icon: ChefHat, label: 'Searching recipes' },
    { key: 'filtering', icon: Clock, label: 'Filtering results' },
    { key: 'preparing', icon: Users, label: 'Preparing suggestions' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Modern progress header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
          <span className="font-semibold">AI Chef Working</span>
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-gray-800"
        >
          Crafting Perfect Recipes
        </motion.h3>
      </div>

      {/* Progress bar with gradient and glow */}
      <div className="space-y-4">
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          
          {/* Floating progress text */}
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-white px-3 py-1 rounded-full shadow-lg border">
              <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {Math.round(progress)}%
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Completed steps text list */}
      <div className="space-y-3 min-h-[120px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-gray-600 font-medium">Processing Steps</p>
        </motion.div>
        
        <div className="space-y-2">
          {stages.map((stage, index) => {
            const stepProgress = (index + 1) * 25;
            const isCompleted = progress >= stepProgress;
            const wasJustCompleted = progress >= stepProgress && progress < stepProgress + 25;
            
            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isCompleted ? [0, 1, 1, 0.3] : 0,
                  x: isCompleted ? 0 : -20
                }}
                transition={{
                  duration: isCompleted ? 3 : 0.3,
                  times: isCompleted ? [0, 0.1, 0.7, 1] : undefined,
                  delay: isCompleted ? 0.2 : 0
                }}
                className="flex items-center space-x-3 text-sm"
              >
                <motion.div
                  animate={wasJustCompleted ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"
                />
                <span className="text-gray-700 font-medium">{stage.label}</span>
                {isCompleted && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="text-green-600 text-xs"
                  >
                    ✓ Complete
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Skeleton preview cards */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <p className="text-gray-600 font-medium">Preview of incoming recipes</p>
        </motion.div>
        
        <div className="grid gap-4">
          <ShimmerCard delay={1.0} />
          {progress > 50 && <ShimmerCard delay={1.2} />}
          {progress > 75 && <ShimmerCard delay={1.4} />}
        </div>
      </div>
    </motion.div>
  );
} 