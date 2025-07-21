import React from 'react';
import { X, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuggestionCard } from './SuggestionCard';
import { SuggestionScreenProps } from './types';

export const SuggestionScreen: React.FC<SuggestionScreenProps> = ({
  suggestion,
  onVote,
  onSave
}) => {
  const [showQuickTip, setShowQuickTip] = React.useState(true);
  const [dragPosition, setDragPosition] = React.useState({ x: 0, y: 0 });

  // Calculate initial position - more to the right to avoid blocking meal card
  const getInitialPosition = () => {
    if (window.innerWidth > 1024) {
      // Desktop: Position to the right side, further from the center
      return {
        right: 'calc(50vw - 500px)', // Moved further right
        top: '50%',
        bottom: 'auto',
        transform: 'translateY(-50%)'
      };
    } else {
      // Mobile: Bottom right corner
      return {
        right: '1rem',
        top: 'auto', 
        bottom: '6rem',
        transform: 'none'
      };
    }
  };

  return (
    <>
      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Suggestion Card - Centered */}
        <div className="max-w-md mx-auto">
          <SuggestionCard
            suggestion={suggestion}
            onVote={onVote}
            onSave={onSave}
          />
        </div>
      </div>

      {/* Draggable Quick Tip Popup */}
      <AnimatePresence>
        {showQuickTip && (
          <motion.div 
            className="lg:block rounded-xl p-5 w-64 z-50 cursor-move select-none"
            style={{ 
              position: 'fixed',
              ...getInitialPosition(),
              backgroundColor: '#F8F6FB', 
              border: '1px solid #D4C4E0',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              x: dragPosition.x, 
              y: dragPosition.y,
              scale: 1 
            }}
            transition={{ delay: 0.5, duration: 0.3, ease: "easeOut" }}
            exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
            drag
            dragMomentum={false}
            dragElastic={0.1}
            onDrag={(event, info) => {
              setDragPosition({
                x: info.offset.x,
                y: info.offset.y
              });
            }}
            whileDrag={{ 
              scale: 1.05,
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
              cursor: 'grabbing'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowQuickTip(false)}
              className="absolute top-2 left-2 p-1 rounded-full hover:bg-gray-200 transition-colors z-10"
              aria-label="Dismiss tip"
            >
              <X className="w-4 h-4" style={{ color: '#7D6B8A' }} />
            </button>
            
            {/* Drag indicator */}
            <div className="absolute top-2 right-2 opacity-30">
              <div className="flex flex-col gap-0.5">
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <h5 className="font-semibold mb-4 flex items-center justify-center gap-2 pt-2" style={{ color: '#7D6B8A' }}>
              <span style={{ color: '#E6D16B' }}>💡</span> Quick Tip
            </h5>
                        <div className="space-y-3" style={{ color: '#4A4A4A' }}>
              {/* Mobile Instructions */}
              <div className="block lg:hidden">
                <div className="flex items-start gap-2 text-sm mb-3">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Mobile</span>
                </div>
                <div className="flex items-start gap-2 text-sm mb-3">
                  <ThumbsUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div><strong>Swipe right</strong> to like</div>
                </div>
                <div className="flex items-start gap-2 text-sm mb-3">
                  <ThumbsDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div><strong>Swipe left</strong> to pass</div>
                </div>
              </div>
              
              {/* Desktop Instructions - Without the Desktop label */}
              <div className="hidden lg:block">
                <div className="flex items-start gap-2 text-sm mb-3">
                  <ThumbsUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div><strong>Double-tap right side of image</strong> to like</div>
                </div>
                <div className="flex items-start gap-2 text-sm mb-3">
                  <ThumbsDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div><strong>Double-tap left side of image</strong> to pass</div>
                </div>
              </div>
              
              {/* Universal Instructions */}
              <div className="flex items-start gap-2 text-sm">
                <Heart className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                <div>
                  Use the <strong>heart button</strong> to save favorites
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 