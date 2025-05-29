import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({ label = 'Back', className = '' }: BackButtonProps) {
  return (
    <Link to="/" className={`inline-flex items-center ${className}`}>
      <motion.div
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.97 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </motion.div>
    </Link>
  );
}

// Add default export to make the component easier to import
export default BackButton; 