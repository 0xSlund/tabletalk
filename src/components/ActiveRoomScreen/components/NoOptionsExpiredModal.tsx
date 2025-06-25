import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, X } from 'lucide-react';

interface NoOptionsExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
}

export const NoOptionsExpiredModal: React.FC<NoOptionsExpiredModalProps> = ({ isOpen, onClose, roomName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
            <div className="mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full h-20 w-20 flex items-center justify-center shadow-inner">
                <XCircle size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-2">No Options Added</h2>
            <p className="text-gray-600 mb-6">
              The room "{roomName}" has ended, but no food options were suggested before time ran out.
            </p>
            <button
                onClick={onClose}
                className="w-full bg-gray-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
            >
                Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 