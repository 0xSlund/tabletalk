import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  type?: 'card' | 'recipe' | 'profile';
  count?: number;
  className?: string;
}

export function SkeletonLoader({ type = 'card', count = 1, className = '' }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'recipe':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-card overflow-hidden">
            {/* Food image placeholder */}
            <div className="relative h-48 mb-4 rounded-xl bg-gray-200 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                animate={{
                  x: ['0%', '100%', '0%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              {/* Plate shape */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gray-300" />
            </div>
            
            {/* Title placeholder */}
            <div className="h-8 w-3/4 bg-gray-200 rounded-lg mb-3">
              <motion.div
                className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                animate={{
                  x: ['0%', '100%', '0%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
            
            {/* Description lines */}
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-4 bg-gray-200 rounded ${i === 2 ? 'w-2/3' : 'w-full'}`}>
                  <motion.div
                    className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                    animate={{
                      x: ['0%', '100%', '0%']
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'profile':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-card">
            {/* Avatar placeholder */}
            <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
              <motion.div
                className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                animate={{
                  x: ['0%', '100%', '0%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
            
            {/* Name placeholder */}
            <div className="h-6 w-1/2 bg-gray-200 rounded mx-auto mb-3">
              <motion.div
                className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                animate={{
                  x: ['0%', '100%', '0%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
            
            {/* Bio placeholder */}
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full">
                  <motion.div
                    className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                    animate={{
                      x: ['0%', '100%', '0%']
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
        
      default: // Card skeleton
        return (
          <div className="bg-white rounded-2xl p-6 shadow-card">
            {/* Icon placeholder */}
            <div className="w-12 h-12 rounded-xl bg-gray-200 mb-4 overflow-hidden">
              <motion.div
                className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                animate={{
                  x: ['0%', '100%', '0%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
            
            {/* Title placeholder */}
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-3">
              <motion.div
                className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                animate={{
                  x: ['0%', '100%', '0%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
            
            {/* Description placeholder */}
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full">
                  <motion.div
                    className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                    animate={{
                      x: ['0%', '100%', '0%']
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`grid gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}