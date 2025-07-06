import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Clock, Settings, Bookmark, ArrowLeft } from 'lucide-react';
import { fadeVariants } from '../PageTransition';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface CreateRoomOptionsProps {
  onQuickCreate: () => void;
  onCustomCreate: () => void;
  onSavedTemplates: () => void;
}

export const CreateRoomOptions: React.FC<CreateRoomOptionsProps> = ({
  onQuickCreate,
  onCustomCreate,
  onSavedTemplates,
}) => {
  const navigate = useNavigate();

  // Simple card animation variants
  const cardVariants = {
    initial: { 
      scale: 1,
      y: 0,
    },
    hover: { 
      scale: 1.02,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    tap: { 
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  // Stagger animation for cards
  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const options = [
    {
      icon: Clock,
      title: "Quick Create",
      subtitle: "Create a room with default settings for spontaneous decisions",
      gradient: "bg-gradient-to-br from-[#FFF9E6] to-[#FFF0C9]",
      iconColor: "text-[#F3C677]",
      iconBg: "bg-[#F3C677]/15",
      onClick: onQuickCreate,
      ariaLabel: "Create a quick room"
    },
    {
      icon: Settings,
      title: "Custom Create",
      subtitle: "Create a room with custom settings and preferences",
      gradient: "bg-gradient-to-br from-[#EBF5F7] to-[#D9EDF2]",
      iconColor: "text-[#457B9D]",
      iconBg: "bg-[#457B9D]/15",
      onClick: onCustomCreate,
      ariaLabel: "Create a custom room"
    },
    {
      icon: Bookmark,
      title: "Saved Templates",
      subtitle: "Use one of your previously saved room templates",
      gradient: "bg-gradient-to-br from-[#EEFAF2] to-[#D8F2E3]",
      iconColor: "text-[#2A9D8F]",
      iconBg: "bg-[#2A9D8F]/15",
      onClick: onSavedTemplates,
      ariaLabel: "Use a saved template"
    }
  ];

  const handleBack = () => {
    navigate('/');
  };

  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]"
    >
        {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
          </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-500">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create a Room</h1>
            </div>
            <div className="w-4" />
          </div>
        </div>
      </header>
        
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.p 
          className="text-center text-gray-600 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Choose how you want to set up your dining experience
        </motion.p>

        {/* Options */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
          {options.map((option, idx) => (
            <motion.button
                key={option.title}
              variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
              onClick={option.onClick}
              aria-label={option.ariaLabel}
                      className={cn(
                `flex flex-col items-center text-center p-8 rounded-2xl shadow-md hover:shadow-lg transition-all`,
                option.gradient
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-lg flex items-center justify-center mb-4",
                        option.iconBg
              )}>
                <option.icon className={cn("w-7 h-7", option.iconColor)} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {option.title}
                      </h3>
              <p className="text-sm text-gray-700">
                        {option.subtitle}
                      </p>
            </motion.button>
            ))}
          </motion.div>

        <motion.p 
          className="text-center text-xs text-gray-500 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          All room types support real-time voting and decision making
        </motion.p>
      </main>
    </motion.div>
  );
};

export default CreateRoomOptions; 