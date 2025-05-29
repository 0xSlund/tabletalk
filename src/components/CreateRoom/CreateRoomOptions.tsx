import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Clock, Settings, Bookmark, ChevronRight } from 'lucide-react';
import { fadeVariants } from '../PageTransition';
import BackButton from '../BackButton';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

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
  // Optimized variants with reduced animation complexity - matched with ActionCards
  const optimizedCardVariants = {
    initial: { 
      scale: 1,
      y: 0,
    },
    hover: { 
      scale: 1.03,
      y: -4,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
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
  
  // Simplified card icon animation
  const cardIconVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };
  
  // Simple highlight for card border
  const cardHighlightVariants = {
    initial: { opacity: 0 },
    hover: {
      opacity: 1,
      transition: { duration: 0.2 }
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
      path: "/create/quick",
      ariaLabel: "Create a quick room"
    },
    {
      icon: Settings,
      title: "Custom Create",
      subtitle: "Create a room with custom settings and preferences",
      gradient: "bg-gradient-to-br from-[#EBF5F7] to-[#D9EDF2]",
      iconColor: "text-[#457B9D]",
      iconBg: "bg-[#457B9D]/15",
      path: "/create/custom",
      ariaLabel: "Create a custom room"
    },
    {
      icon: Bookmark,
      title: "Saved Templates",
      subtitle: "Use one of your previously saved room templates",
      gradient: "bg-gradient-to-br from-[#EEFAF2] to-[#D8F2E3]",
      iconColor: "text-[#2A9D8F]",
      iconBg: "bg-[#2A9D8F]/15",
      path: "/create/templates",
      ariaLabel: "Use a saved template"
    }
  ];

  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-gradient-to-br from-[#FCF0E4] via-orange-100/30 to-[#FADEC8]"
    >
      {/* Header with subtle pattern */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <BackButton />
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-orange-300 rounded-full blur-sm opacity-70"></div>
                <UtensilsCrossed className="relative w-6 h-6 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Create a Room</h1>
            </div>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-20 right-4 w-32 h-32 bg-orange-200 rounded-full opacity-20 blur-xl -z-10"></div>
        <div className="absolute bottom-20 left-4 w-24 h-24 bg-red-200 rounded-full opacity-20 blur-xl -z-10"></div>
        
        <motion.p 
          className="text-center text-lg font-medium text-gray-700 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Choose how you want to set up your dining experience
        </motion.p>

        <section aria-labelledby="room-creation-options">
          <h2 id="room-creation-options" className="sr-only">Room Creation Options</h2>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto"
          >
            {options.map((option) => (
              <Link 
                key={option.title}
                to={option.path}
                aria-label={option.ariaLabel}
                className="block"
              >
                <motion.div
                  variants={optimizedCardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`relative ${option.gradient} rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow text-left group overflow-hidden border border-black/[0.06] cursor-pointer`}
                >
                  {/* Card highlight border */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl border-2 border-primary/30"
                    initial="initial"
                    whileHover="hover"
                    variants={cardHighlightVariants}
                  />
                  
                  <div className="flex items-start sm:items-center sm:block">
                    <motion.div
                      initial="initial"
                      whileHover="hover"
                      variants={cardIconVariants}
                      className={cn(
                        "relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-0 sm:mb-4 mr-4 sm:mr-0 z-10",
                        option.iconBg
                      )}
                    >
                      <option.icon className={cn(
                        "w-6 h-6 sm:w-7 sm:h-7 relative z-10",
                        option.iconColor
                      )} />
                    </motion.div>
                    
                    <div className="relative z-10 flex-1 sm:flex-none">
                      <h3 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2 text-gray-800 flex items-center">
                        {option.title}
                        <motion.div
                          initial={{ x: -5, opacity: 0 }}
                          whileHover={{ x: 0, opacity: 1 }}
                          className="inline-block ml-2"
                        >
                          <ChevronRight className="w-5 h-5 text-orange-500" />
                        </motion.div>
                      </h3>
                      <p className="text-sm sm:text-base text-gray-700">
                        {option.subtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </section>
      </main>
    </motion.div>
  );
};

export default CreateRoomOptions; 