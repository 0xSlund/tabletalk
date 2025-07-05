import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  isTransitioning?: boolean;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  darkMode: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  isTransitioning = false,
  onPageChange,
  onPreviousPage,
  onNextPage,
  darkMode
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    for (let i = 0; i < Math.min(totalPages, maxVisiblePages); i++) {
      let pageNum;
      if (totalPages <= maxVisiblePages) {
        pageNum = i;
      } else if (currentPage < 3) {
        pageNum = i;
      } else if (currentPage > totalPages - 4) {
        pageNum = totalPages - maxVisiblePages + i;
      } else {
        pageNum = currentPage - 2 + i;
      }

      pages.push(
        <motion.button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          disabled={isTransitioning}
          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
            pageNum === currentPage
              ? darkMode
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-blue-600 text-white shadow-lg'
              : darkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          whileHover={pageNum !== currentPage ? { scale: 1.1 } : {}}
          whileTap={pageNum !== currentPage ? { scale: 0.9 } : {}}
        >
          {pageNum + 1}
        </motion.button>
      );
    }

    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-8 pt-6 border-t-2 ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-center">
        {/* Center - Page numbers */}
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <motion.button
            onClick={onPreviousPage}
            disabled={currentPage === 0 || isTransitioning}
            className={`p-2 rounded-lg transition-all ${
              currentPage === 0 || isTransitioning
                ? darkMode 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-300 cursor-not-allowed'
                : darkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            whileHover={currentPage > 0 && !isTransitioning ? { scale: 1.1 } : {}}
            whileTap={currentPage > 0 && !isTransitioning ? { scale: 0.9 } : {}}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {renderPageNumbers()}
          </div>

          {/* Next button */}
          <motion.button
            onClick={onNextPage}
            disabled={currentPage === totalPages - 1 || isTransitioning}
            className={`p-2 rounded-lg transition-all ${
              currentPage === totalPages - 1 || isTransitioning
                ? darkMode 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-300 cursor-not-allowed'
                : darkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            whileHover={currentPage < totalPages - 1 && !isTransitioning ? { scale: 1.1 } : {}}
            whileTap={currentPage < totalPages - 1 && !isTransitioning ? { scale: 0.9 } : {}}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`mt-4 h-1 rounded-full overflow-hidden ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
} 