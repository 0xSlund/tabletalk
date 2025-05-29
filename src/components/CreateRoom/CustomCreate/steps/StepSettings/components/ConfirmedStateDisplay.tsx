import React from 'react';
import { motion } from 'framer-motion';

interface ConfirmedStateDisplayProps {
  isConfirmed: boolean;
  getTotalTimeDisplay: () => { displayText: string };
}

export const ConfirmedStateDisplay: React.FC<ConfirmedStateDisplayProps> = ({
  isConfirmed,
  getTotalTimeDisplay
}) => {
  if (!isConfirmed) return null;

  return (
    <motion.div 
      className="w-full max-w-sm"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1 
      }}
    >
      <motion.div 
        className="relative w-full mx-auto" 
        initial={{ opacity: 0, y: 20, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ 
          duration: 0.7, 
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.1
        }}
      >
        <motion.div 
          className="relative bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl border border-purple-100/80 rounded-3xl p-8 shadow-2xl overflow-hidden"
          initial={{ boxShadow: "0 0 0 0 rgba(168, 85, 247, 0)" }}
          animate={{ 
            boxShadow: [
              "0 25px 50px -12px rgba(168, 85, 247, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)", 
              "0 35px 65px -12px rgba(168, 85, 247, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)", 
              "0 25px 50px -12px rgba(168, 85, 247, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)"
            ]
          }}
          transition={{ 
            boxShadow: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2
          }}
        >
          <motion.div 
            className="absolute inset-0 opacity-20"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.2,
              background: [
                "radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(229, 128, 255, 0.15) 0%, transparent 40%)", 
                "radial-gradient(circle at 60% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(229, 128, 255, 0.15) 0%, transparent 40%)", 
                "radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(229, 128, 255, 0.15) 0%, transparent 40%)"
              ]
            }}
            transition={{ 
              opacity: { duration: 0.5, delay: 0.3 },
              background: { duration: 7, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <div className="relative z-10 text-center">
            <motion.h3 
              className="text-xs font-semibold text-purple-500 tracking-[0.2em] uppercase mb-4" 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0.7, 1, 0.7] }} 
              transition={{ 
                opacity: { duration: 3, repeat: Infinity },
                y: { duration: 0.4, delay: 0.4 }
              }}
            >
              Timer Set To
            </motion.h3>
            <motion.div 
              className="text-5xl font-extrabold bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 bg-clip-text text-transparent mb-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1,
                scale: 1,
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }} 
              transition={{ 
                opacity: { duration: 0.5, delay: 0.5 },
                scale: { duration: 0.5, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
                backgroundPosition: { duration: 4, repeat: Infinity, ease: "linear" }
              }}
              style={{ backgroundSize: "250% 250%", fontFeatureSettings: "'tnum'", fontVariantNumeric: "tabular-nums" }}
            >
              {(() => { 
                const { displayText } = getTotalTimeDisplay();
                return displayText;
              })()}
            </motion.div>
            <motion.p 
              className="text-xs text-purple-500/80 font-medium" 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0.8, 1, 0.8] }} 
              transition={{ 
                opacity: { duration: 2, repeat: Infinity },
                y: { duration: 0.4, delay: 0.6 }
              }}
            >
              Time for each decision
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 