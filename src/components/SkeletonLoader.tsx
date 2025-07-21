import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'default' | 'card' | 'grid' | 'list' | 'cuisine' | 'recipe';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  variant = 'default',
  count = 1 
}) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { 
      x: '100%',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear'
      }
    }
  };

  const Shimmer = () => (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      variants={shimmerVariants}
      initial="initial"
      animate="animate"
    />
  );

  const DefaultSkeleton = () => (
    <div className={`bg-gray-200 rounded overflow-hidden relative ${className}`}>
      <Shimmer />
    </div>
  );

  const CardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="h-3 bg-gray-200 rounded w-1/2 relative overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="h-3 bg-gray-200 rounded w-5/6 relative overflow-hidden">
          <Shimmer />
        </div>
      </div>
    </div>
  );

  const GridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <CardSkeleton />
        </motion.div>
      ))}
    </div>
  );

  const ListSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="w-16 h-16 bg-gray-200 rounded-lg relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 relative overflow-hidden">
              <Shimmer />
            </div>
            <div className="h-3 bg-gray-200 rounded w-1/2 relative overflow-hidden">
              <Shimmer />
            </div>
            <div className="h-3 bg-gray-200 rounded w-2/3 relative overflow-hidden">
              <Shimmer />
            </div>
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded relative overflow-hidden">
            <Shimmer />
          </div>
        </motion.div>
      ))}
    </div>
  );

  const CuisineSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="aspect-video bg-gray-200 relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="p-4 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4 relative overflow-hidden">
              <Shimmer />
            </div>
            <div className="h-3 bg-gray-200 rounded w-full relative overflow-hidden">
              <Shimmer />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const RecipeSkeleton = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
        <Shimmer />
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4 relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="h-4 bg-gray-200 rounded w-full relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="h-4 bg-gray-200 rounded w-2/3 relative overflow-hidden">
            <Shimmer />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="h-4 bg-gray-200 rounded w-20 relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="h-4 bg-gray-200 rounded w-12 relative overflow-hidden">
            <Shimmer />
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-20 relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="h-8 bg-gray-200 rounded w-24 relative overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return <CardSkeleton />;
      case 'grid':
        return <GridSkeleton />;
      case 'list':
        return <ListSkeleton />;
      case 'cuisine':
        return <CuisineSkeleton />;
      case 'recipe':
        return <RecipeSkeleton />;
      default:
        return <DefaultSkeleton />;
    }
  };

  return renderSkeleton();
};

export default SkeletonLoader;

interface CardSkeletonProps {
  hasImage?: boolean;
  lines?: number;
  hasFooter?: boolean;
}

export function CardSkeleton({ hasImage = true, lines = 3, hasFooter = true }: CardSkeletonProps) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
      {hasImage && <SkeletonLoader variant="image" className="mb-4 rounded-lg" />}
      <SkeletonLoader variant="text" className="w-3/4 mb-2" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader key={i} variant="text" className={cn("w-full mb-2", i === lines - 1 && "w-1/2")} />
      ))}
      {hasFooter && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <SkeletonLoader variant="text" className="w-1/4" />
          <SkeletonLoader variant="button" />
        </div>
      )}
    </div>
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-md">
      <div className="flex justify-between mb-3">
        <SkeletonLoader variant="text" className="w-1/2" />
        <SkeletonLoader variant="circle" className="h-6 w-6" />
      </div>
      <SkeletonLoader variant="text" className="w-1/3 mb-4" />
      <div className="py-2 mb-2">
        <SkeletonLoader variant="text" className="w-2/3" />
      </div>
      <div className="flex justify-end mt-4">
        <SkeletonLoader variant="button" className="w-1/3 h-8" />
      </div>
    </div>
  );
}

export function HomeScreenSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Recent Rooms Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <SkeletonLoader variant="text" className="w-32" />
          <SkeletonLoader variant="text" className="w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PulseDotProps {
  delay?: number;
  color?: string;
  size?: string;
}

export function PulseDot({ delay = 0, color = "bg-primary", size = "h-3 w-3" }: PulseDotProps) {
  return (
    <motion.div
      className={cn("rounded-full", color, size)}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.3, 1, 0.3]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay
      }}
    />
  );
}

export function LoadingDots() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <PulseDot delay={0} />
      <PulseDot delay={0.2} />
      <PulseDot delay={0.4} />
    </div>
  );
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  secondaryAction,
  secondaryActionLabel,
  suggestions = [],
  theme = 'light'
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  actionLabel?: string; 
  onAction?: () => void;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
  suggestions?: Array<{text: string, action: () => void}>;
  theme?: 'light' | 'dark';
}) {
  return (
    <div className={`rounded-xl p-8 shadow-lg transition-all relative overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gray-800 bg-opacity-95 text-white' 
        : 'bg-white bg-opacity-95'
    }`}>
      {/* Background pattern */}
      <div className={`absolute inset-0 opacity-5 pointer-events-none ${
        theme === 'dark' ? 'pattern-dots-dark' : 'pattern-dots'
      }`} aria-hidden="true">
        <div 
          className="absolute top-0 right-0 w-full h-full opacity-10" 
          style={{
            backgroundImage: theme === 'dark'
              ? 'radial-gradient(circle at 25px 25px, var(--color-primary) 2px, transparent 0)'
              : 'radial-gradient(circle at 25px 25px, var(--color-primary) 2px, transparent 0)',
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>
      
      <div className="flex flex-col items-center relative z-10">
        {/* Animated icon container */}
        <motion.div 
          className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 overflow-hidden
            ${theme === 'dark' ? 'bg-primary bg-opacity-20' : 'bg-primary bg-opacity-10'}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 0.5,
            y: { 
              repeat: Infinity,
              repeatType: "reverse",
              duration: 2,
              ease: "easeInOut"
            }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={Icon.name || 'default-icon'} // Use stable key instead of Math.random()
              initial={{ scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 30, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.3 
              }}
            >
              <Icon className={`w-12 h-12 text-primary ${theme === 'dark' ? 'text-opacity-90' : ''}`} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        
        {/* Title with improved typography */}
        <motion.h3 
          className={`text-xl font-semibold mb-2.5 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h3>
        
        {/* Description with better readability */}
        <motion.p 
          className={`text-center mb-6 max-w-md leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {description}
        </motion.p>
        
        {/* Primary and secondary action buttons */}
        <motion.div 
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {actionLabel && onAction && (
            <motion.button
              onClick={onAction}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all
                ${theme === 'dark' 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-primary text-white shadow-md'
                }`}
              style={theme === 'dark' ? { boxShadow: '0 10px 15px -3px rgba(var(--primary-rgb), 0.3)' } : {}}
            >
              {actionLabel}
            </motion.button>
          )}
          
          {secondaryActionLabel && secondaryAction && (
            <motion.button
              onClick={secondaryAction}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all
                ${theme === 'dark'
                  ? 'bg-gray-700 text-white border border-gray-600'
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
            >
              {secondaryActionLabel}
            </motion.button>
          )}
        </motion.div>
        
        {/* Contextual suggestions */}
        {suggestions.length > 0 && (
          <motion.div 
            className="mt-8 w-full max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className={`text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              You might want to try:
            </h4>
            <div className={`rounded-lg overflow-hidden border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={suggestion.action}
                  className={`w-full text-left px-4 py-3 flex items-center ${
                    index !== suggestions.length - 1 
                      ? theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'
                      : ''
                  } ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                  }`}
                  whileHover={{ x: 5 }}
                >
                  <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                    {suggestion.text}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}