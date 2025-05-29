import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  currentStep: number;
  steps: {
    title: string;
    description: string;
  }[];
}

export function ProgressBar({ currentStep, steps }: ProgressBarProps) {
  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-5 w-full h-0.5 bg-gray-200">
          <motion.div
            className="absolute top-0 left-0 h-full bg-orange-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > index + 1;
            const isCurrent = currentStep === index + 1;
            
            return (
              <div key={step.title} className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 relative z-10",
                    isCompleted ? "bg-orange-500 border-orange-500" : 
                    isCurrent ? "bg-white border-orange-500" : 
                    "bg-white border-gray-300"
                  )}
                  initial={false}
                  animate={
                    isCompleted ? { scale: [1.2, 1], backgroundColor: "#f97316", borderColor: "#f97316" } :
                    isCurrent ? { scale: [1.2, 1], borderColor: "#f97316" } :
                    { scale: 1 }
                  }
                  transition={{ duration: 0.2 }}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span className={cn(
                      "font-medium",
                      isCurrent ? "text-orange-500" : "text-gray-400"
                    )}>
                      {index + 1}
                    </span>
                  )}
                </motion.div>
                <motion.p
                  className={cn(
                    "mt-2 font-medium text-sm",
                    isCompleted ? "text-orange-500" :
                    isCurrent ? "text-gray-900" :
                    "text-gray-400"
                  )}
                  initial={false}
                  animate={
                    isCompleted || isCurrent
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0.5, y: 0 }
                  }
                >
                  {step.title}
                </motion.p>
                <motion.p
                  className={cn(
                    "text-xs text-center",
                    isCompleted || isCurrent ? "text-gray-600" : "text-gray-400"
                  )}
                  initial={false}
                  animate={
                    isCompleted || isCurrent
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0.5, y: 0 }
                  }
                >
                  {step.description}
                </motion.p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}