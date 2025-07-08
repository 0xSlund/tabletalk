import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { ErrorScreenProps } from './types';

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRetry }) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      // Reset retrying state after a delay
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  return (
    <motion.div 
      className="text-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-red-50 border border-red-200 rounded-xl p-6"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      >
        {/* Error Icon */}
        <motion.div
          className="flex justify-center mb-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </motion.div>

        {/* Error Title */}
        <motion.h3 
          className="text-lg font-semibold text-red-800 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Oops! Something went wrong
        </motion.h3>

        {/* Error Message */}
        <motion.p 
          className="text-red-600 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {error}
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Retry Button */}
          <motion.button
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-red-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={!isRetrying ? { scale: 1.05 } : {}}
            whileTap={!isRetrying ? { scale: 0.95 } : {}}
          >
            <motion.div
              animate={isRetrying ? { rotate: 360 } : {}}
              transition={isRetrying ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </motion.button>

          {/* Go Back Button */}
          <motion.button
            onClick={() => window.history.back()}
            className="bg-gray-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </motion.button>
        </motion.div>

        {/* Help Text */}
        <motion.div 
          className="mt-4 text-sm text-red-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>If the problem persists, try:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-left">
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              Checking your internet connection
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              Adjusting your filter settings
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              Refreshing the page
            </motion.li>
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 