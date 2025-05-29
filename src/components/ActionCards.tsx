import React, { useRef, RefObject } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Zap, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface ActionCardsProps {
  onNavigate: (tab: string) => void;
  darkMode?: boolean;
}

export function ActionCards({ onNavigate, darkMode = false }: ActionCardsProps) {
  // Optimized variants with reduced animation complexity
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

  const mainCards = [
    {
      icon: Users,
      title: "Create a Room",
      subtitle: "Start a new voting session with friends",
      gradient: "bg-gradient-to-br from-[#FCF0E4] to-[#FADEC8]",
      iconColor: "text-[#E76F51]",
      iconBg: "bg-[#E76F51]/15",
      path: "/create",
      action: () => onNavigate('create'),
      ariaLabel: "Create a new room"
    },
    {
      icon: UserPlus,
      title: "Join a Room",
      subtitle: "Enter a room code to join friends",
      gradient: "bg-gradient-to-br from-[#EBF5F7] to-[#D9EDF2]",
      iconColor: "text-[#457B9D]",
      iconBg: "bg-[#457B9D]/15",
      path: "/join",
      action: () => onNavigate('join'),
      ariaLabel: "Join an existing room"
    }
  ];

  const featureCards = [
    {
      icon: Zap,
      title: "Quick Decision",
      subtitle: "Get an instant food suggestion",
      gradient: "bg-gradient-to-br from-[#FFF9E6] to-[#FFF0C9]",
      iconColor: "text-[#F3C677]",
      iconBg: "bg-[#F3C677]/15",
      path: "/quick-decision",
      action: () => onNavigate('quick-decision'),
      ariaLabel: "Get a quick food decision"
    },
    {
      icon: Globe,
      title: "Explore Cuisines",
      subtitle: "Browse different food categories",
      gradient: "bg-gradient-to-br from-[#EEFAF2] to-[#D8F2E3]",
      iconColor: "text-[#2A9D8F]",
      iconBg: "bg-[#2A9D8F]/15",
      path: "/explore",
      action: () => onNavigate('explore-cuisines'),
      ariaLabel: "Explore cuisine options"
    }
  ];

  // Custom hook for intersection observer
  const useOnScreen = (ref: RefObject<HTMLElement>) => {
    const [isIntersecting, setIntersecting] = React.useState(false);
    
    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => setIntersecting(entry.isIntersecting)
      );
      
      if (ref.current) {
        observer.observe(ref.current);
      }
      return () => observer.disconnect();
    }, [ref]);
    
    return isIntersecting;
  };

  // References for animation optimization
  const mainCardsRef = useRef<HTMLElement>(null);
  const featureCardsRef = useRef<HTMLElement>(null);
  const isMainVisible = useOnScreen(mainCardsRef);
  const isFeatureVisible = useOnScreen(featureCardsRef);

  // Stagger animation for cards
  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-10 mb-12">
      {/* Primary actions */}
      <section ref={mainCardsRef} aria-labelledby="primary-actions">
        <h2 id="primary-actions" className="sr-only">Primary Actions</h2>
        
        {isMainVisible && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto"
          >
            {mainCards.map((card, index) => (
              <Link 
                key={card.title}
                to={card.path}
                className="block"
                aria-label={card.ariaLabel}
              >
                <motion.div
                  variants={optimizedCardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`relative ${card.gradient} rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow text-left group overflow-hidden border border-black/[0.06]`}
                  tabIndex={0}
                >
                  {/* Simplified card structure for better performance */}
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
                        card.iconBg
                      )}
                    >
                      <card.icon className={cn(
                        "w-6 h-6 sm:w-7 sm:h-7 relative z-10",
                        card.iconColor
                      )} />
                    </motion.div>
                    
                    <div className="relative z-10 flex-1 sm:flex-none">
                      <h3 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2 text-gray-800">
                        {card.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-700">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </section>

      {/* Secondary actions */}
      <section ref={featureCardsRef} aria-labelledby="feature-actions" className="border-t border-gray-100 pt-8">
        <h2 id="feature-actions" className="text-lg font-semibold mb-4 text-gray-800 px-2">
          More Options
        </h2>
        
        {isFeatureVisible && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto"
          >
            {featureCards.map((card) => (
              <Link 
                key={card.title}
                to={card.path}
                className="block"
                aria-label={card.ariaLabel}
              >
                <motion.div
                  variants={optimizedCardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`relative ${card.gradient} rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow text-left group overflow-hidden border border-black/[0.06]`}
                  tabIndex={0}
                >
                  {/* Simplified card structure */}
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
                        card.iconBg
                      )}
                    >
                      <card.icon className={cn(
                        "w-6 h-6 sm:w-7 sm:h-7 relative z-10",
                        card.iconColor,
                        card.title === "Quick Decision" && "animate-pulse"
                      )} />
                    </motion.div>
                    
                    <div className="relative z-10 flex-1 sm:flex-none">
                      <h3 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2 text-gray-800">
                        {card.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-700">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
} 