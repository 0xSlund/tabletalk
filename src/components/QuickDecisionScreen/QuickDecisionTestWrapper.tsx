import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, Code, Sparkles } from 'lucide-react';
import { QuickDecisionScreen } from '../QuickDecisionScreen';
import { QuickDecisionScreenRefactored } from './QuickDecisionScreenRefactored';

export function QuickDecisionTestWrapper() {
  const [useRefactored, setUseRefactored] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toggle Controls */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900">
                Quick Decision Screen
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className={!useRefactored ? 'font-medium text-gray-900' : ''}>
                  Original
                </span>
                <button
                  onClick={() => setUseRefactored(!useRefactored)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {useRefactored ? (
                    <ToggleRight className="w-6 h-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <span className={useRefactored ? 'font-medium text-green-600' : ''}>
                  Refactored
                </span>
              </div>
            </div>

            {/* Version Badge */}
            <motion.div
              key={useRefactored ? 'refactored' : 'original'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                useRefactored
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {useRefactored ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Optimized Version
                </>
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  Original Version
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={useRefactored ? 'refactored' : 'original'}
        initial={{ opacity: 0, x: useRefactored ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {useRefactored ? (
          <QuickDecisionScreenRefactored />
        ) : (
          <QuickDecisionScreen />
        )}
      </motion.div>
    </div>
  );
} 