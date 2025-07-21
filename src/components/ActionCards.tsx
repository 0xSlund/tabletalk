import React, { useRef, RefObject } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Bot, Globe, Star, ArrowRight, MessageSquare, Brain, Sparkles, ChefHat, Compass, CircleDot } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface ActionCardsProps {
  darkMode?: boolean;
}

// Simple Robot Icon - matches the style of other Lucide icons
const RobotHeadIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Robot head */}
    <rect x="6" y="6" width="12" height="10" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    
    {/* Antenna */}
    <path d="M12 6V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="3" r="1" fill="currentColor"/>
    
    {/* Eyes */}
    <circle cx="9" cy="10" r="1" fill="currentColor"/>
    <circle cx="15" cy="10" r="1" fill="currentColor"/>
    
    {/* Mouth */}
    <path d="M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    
    {/* Body indicator */}
    <path d="M8 16v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 16v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 16v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Custom User with Plus Icon for joining
const UserPlusIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* User head */}
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
    
    {/* User body */}
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
    
    {/* Plus sign */}
    <line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" strokeWidth="2"/>
    <line x1="16" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// Custom component for Create a Room with stacking message effect
const CreateRoomIcon = ({ isHovered }: { isHovered: boolean }) => {
  // First message - from left user
  const messageVariants = {
    initial: { 
      opacity: 0, 
      y: 0,
      scale: 0.6,
    },
    animate: { 
      opacity: [0, 1, 1, 0],
      y: [0, -4, -8, -12],
      scale: [0.6, 1, 1, 0.8],
      transition: {
        duration: 1.2,
        times: [0, 0.25, 0.75, 1],
        ease: "easeOut",
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };

  // Second message - from right user (delayed to simulate conversation)
  const messageVariants2 = {
    initial: { 
      opacity: 0, 
      y: 0,
      scale: 0.6,
    },
    animate: { 
      opacity: [0, 1, 1, 0],
      y: [0, -5, -9, -13],
      scale: [0.6, 1, 1, 0.8],
      transition: {
        duration: 1.2,
        times: [0, 0.25, 0.75, 1],
        ease: "easeOut",
        repeat: Infinity,
        repeatType: "loop" as const,
        delay: 0.6
      }
    }
  };

  return (
    <div className="relative w-6 h-6">
      {/* Static group icon - using soft green color for growth and hosting energy */}
      <Users className="w-6 h-6 text-green-600" />
      
      {/* Animated message icons that appear above the users to simulate conversation */}
      {isHovered && (
        <>
          {/* First message bubble - coming from left user */}
          <motion.div
            className="absolute -top-3 left-0"
            variants={messageVariants}
            initial="initial"
            animate="animate"
          >
            <MessageSquare className="w-3 h-3 text-green-500 fill-green-100" />
          </motion.div>
          
          {/* Second message bubble - coming from right user */}
          <motion.div
            className="absolute -top-4 right-0"
            variants={messageVariants2}
            initial="initial"
            animate="animate"
          >
            <MessageSquare className="w-3.5 h-3.5 text-green-400 fill-green-50" />
          </motion.div>
        </>
      )}
    </div>
  );
};

export function ActionCards({ darkMode = false }: ActionCardsProps) {
  // State to track which card is being hovered
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);

  // Enhanced animation variants for the hero CTA
  const heroCardVariants = {
    initial: { 
      scale: 1,
      y: 0,
    },
    hover: { 
      scale: 1.02,
      y: -8,
      boxShadow: "0 32px 64px -12px rgba(34, 197, 94, 0.3), 0 0 0 2px rgba(34, 197, 94, 0.2)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    tap: { 
      scale: 0.98,
      y: -4,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.1
      }
    }
  };

  // Standard card animation variants with themed glow shadows for each card
  const getStandardCardVariants = (isDark: boolean, cardTitle: string) => ({
    initial: { 
      scale: 1,
      y: 0,
    },
    hover: { 
      scale: 1.05,
      y: -6,
      boxShadow: cardTitle === "Join a Room" 
        ? "0 25px 50px -12px rgba(59, 130, 246, 0.25), 0 0 20px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)"
        : cardTitle === "AI Food Assistant" 
          ? "0 25px 50px -12px rgba(168, 85, 247, 0.25), 0 0 20px rgba(168, 85, 247, 0.15), 0 0 0 1px rgba(168, 85, 247, 0.1)"
          : cardTitle === "Explore Cuisines"
            ? "0 25px 50px -12px rgba(249, 115, 22, 0.25), 0 0 20px rgba(249, 115, 22, 0.15), 0 0 0 1px rgba(249, 115, 22, 0.1)"
            : isDark 
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)"
              : "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    tap: { 
      scale: 0.98,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.1
      }
    }
  });

  // Custom icon animation variants for each card type
  const getIconVariants = (cardTitle: string) => {
    switch (cardTitle) {
      case "Create a Room":
        // Static icon - animation handled by custom component
        return {
          initial: { 
            scale: 1
          },
          hover: { 
            scale: 1
          },
          exit: {
            scale: 1
          }
        };

      case "Join a Room":
        // Continuous glow bounce animation when inactive, enhanced glow on hover
        return {
          initial: { 
            scale: [1, 1.02, 1],
            filter: [
              "brightness(1) drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))",
              "brightness(1.05) drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))",
              "brightness(1) drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))"
            ],
            transition: {
              duration: 2.5,
              times: [0, 0.5, 1],
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop" as const
            }
          },
          hover: { 
            scale: [1.05, 1.08, 1.05],
            filter: [
              "brightness(1.1) drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))",
              "brightness(1.2) drop-shadow(0 0 15px rgba(59, 130, 246, 1))",
              "brightness(1.1) drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))"
            ],
            transition: { 
              duration: 1.5,
              times: [0, 0.5, 1],
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop" as const
            }
          },
          exit: {
            scale: [1, 1.02, 1],
            filter: [
              "brightness(1) drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))",
              "brightness(1.05) drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))",
              "brightness(1) drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))"
            ],
            transition: {
              duration: 2.5,
              times: [0, 0.5, 1],
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop" as const
            }
          }
        };
      
      case "AI Food Assistant":
        // AI processing animation with purple glow and pulse effect
        return {
          initial: { 
            scale: 1, 
            rotate: 0, 
            filter: "brightness(1) drop-shadow(0 0 0px rgba(168, 85, 247, 0))",
            transformOrigin: "center"
          },
          hover: { 
            scale: [1, 1.08, 1.04, 1.12, 1.06, 1.15, 1.08, 1],
            rotate: [0, 3, -2, 5, -3, 2, -1, 0],
            filter: [
              "brightness(1) drop-shadow(0 0 0px rgba(168, 85, 247, 0))",
              "brightness(1.1) drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))",
              "brightness(1.05) drop-shadow(0 0 4px rgba(168, 85, 247, 0.4))",
              "brightness(1.15) drop-shadow(0 0 12px rgba(168, 85, 247, 0.8))",
              "brightness(1.08) drop-shadow(0 0 6px rgba(168, 85, 247, 0.5))",
              "brightness(1.2) drop-shadow(0 0 16px rgba(168, 85, 247, 1))",
              "brightness(1.1) drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))",
              "brightness(1) drop-shadow(0 0 0px rgba(168, 85, 247, 0))"
            ],
            transition: { 
              duration: 2.0,
              times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop" as const
            }
          },
          exit: {
            scale: 1,
            rotate: 0,
            filter: "brightness(1) drop-shadow(0 0 0px rgba(168, 85, 247, 0))",
            transition: {
              duration: 0.4,
              ease: "easeOut"
            }
          }
        };
      
      case "Explore Cuisines":
        // Subtle warm-toned animation emphasizing adventure and cultural discovery
        return {
          initial: { 
            scale: 1, 
            rotateY: 0, 
            rotateX: 0,
            rotateZ: 0,
            perspective: 1000,
            transformStyle: "preserve-3d" as const,
            filter: "brightness(1) drop-shadow(0 0 0px rgba(249, 115, 22, 0))"
          },
          hover: { 
            scale: 1.08,
            rotateY: [0, 180], // Gentle flip like turning pages of a world cookbook
            rotateX: [0, 8, -4, 2, 0], // Subtle tilt like examining spices
            rotateZ: [0, -2, 2, -1, 0], // Gentle sway
            filter: [
              "brightness(1) drop-shadow(0 0 0px rgba(249, 115, 22, 0))",
              "brightness(1.05) drop-shadow(0 0 4px rgba(249, 115, 22, 0.3))",
              "brightness(1.08) drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))",
              "brightness(1.05) drop-shadow(0 0 4px rgba(249, 115, 22, 0.3))",
              "brightness(1) drop-shadow(0 0 0px rgba(249, 115, 22, 0))"
            ],
            transition: { 
              scale: { 
                duration: 0.4, 
                ease: "easeOut" 
              },
              rotateY: { 
                duration: 3, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop" as const
              },
              rotateX: {
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop" as const
              },
              rotateZ: {
                duration: 5,
                ease: "easeInOut", 
                repeat: Infinity,
                repeatType: "loop" as const
              },
              filter: {
                duration: 2,
                times: [0, 0.25, 0.5, 0.75, 1],
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop" as const
              }
            }
          },
          exit: {
            scale: 1,
            rotateY: 0,
            rotateX: 0,
            rotateZ: 0,
            filter: "brightness(1) drop-shadow(0 0 0px rgba(249, 115, 22, 0))",
            transition: {
              duration: 0.5,
              ease: "easeOut"
            }
          }
        };
      
      default:
        // Default animation
        return {
          initial: { 
            scale: 1, 
            rotate: 0,
            y: 0,
            filter: "brightness(1) drop-shadow(0 0 0px rgba(34, 197, 94, 0))"
          },
          hover: { 
            scale: [1, 1.1, 1.05, 1.12, 1.08],
            rotate: [0, -2, 2, -1, 0],
            y: [0, -1, -3, -2, -4],
            filter: [
              "brightness(1) drop-shadow(0 0 0px rgba(34, 197, 94, 0))",
              "brightness(1.05) drop-shadow(0 0 3px rgba(34, 197, 94, 0.3))",
              "brightness(1.1) drop-shadow(0 0 6px rgba(34, 197, 94, 0.5))",
              "brightness(1.08) drop-shadow(0 0 4px rgba(34, 197, 94, 0.4))",
              "brightness(1.12) drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))"
            ],
            transition: { 
              duration: 1.5,
              times: [0, 0.25, 0.5, 0.75, 1],
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop" as const
            }
          },
          exit: {
            scale: 1,
            rotate: 0,
            y: 0,
            filter: "brightness(1) drop-shadow(0 0 0px rgba(34, 197, 94, 0))",
            transition: {
              duration: 0.4,
              ease: "easeOut"
            }
          }
        };
    }
  };

  // Hero Create Room Card with soft sage green colors
  const createRoomCard = {
    icon: Users,
    title: "Create a Room",
    subtitle: "Start a new voting session with friends",
    description: "Gather your friends and let everyone vote on where to eat. Perfect for group decisions!",
    gradient: "bg-gradient-to-br from-green-400 to-green-500", // Soft sage green (#A7C4A0 to #8FBC8F)
    textColor: "text-white",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    path: "/create",
    ariaLabel: "Create a new room",
    isPrimary: true,
    badge: "Recommended"
  };

  // Secondary action cards with updated 2025 color strategy
  const actionCards = [
    {
      icon: UserPlusIcon, // User with plus sign for joining
      title: "Join a Room",
      subtitle: "Use a code or link to hop into someone else's room.",
      gradient: "bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50",
      borderGradient: "from-blue-400 via-blue-500 to-indigo-400",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-100",
      iconBgHover: "bg-blue-200",
      titleColor: "text-blue-600",
      subtitleColor: "text-gray-600",
      glowColor: "rgba(168, 200, 225, 0.3)",
      path: "/join",
      ariaLabel: "Join an existing room",
      isPrimary: false,
      isCustomIcon: true
    },
    {
      icon: Bot, // Bot icon used inside rooms
      title: "AI Food Assistant",
      subtitle: "Let AI analyze your preferences and suggest perfect meals!",
      gradient: "bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50",
      borderGradient: "from-purple-400 via-purple-500 to-pink-400",
      iconColor: "text-purple-500",
      iconBg: "bg-purple-100",
      iconBgHover: "bg-purple-200",
      titleColor: "text-purple-600",
      subtitleColor: "text-gray-600",
      glowColor: "rgba(200, 181, 224, 0.3)",
      path: "/ai-food-assistant",
      ariaLabel: "Get AI-powered food suggestions",
      isPrimary: false,
      isCustomIcon: false
    },
    {
      icon: Globe, // Globe for world cuisines
      title: "Explore Cuisines",
      subtitle: "Discover global flavors and cultural dining experiences.",
      gradient: "bg-gradient-to-br from-orange-50 via-orange-50 to-red-50",
      borderGradient: "from-orange-400 via-orange-500 to-red-400",
      iconColor: "text-orange-500",
      iconBg: "bg-orange-100",
      iconBgHover: "bg-orange-200",
      titleColor: "text-orange-600",
      subtitleColor: "text-gray-600",
      glowColor: "rgba(244, 194, 161, 0.3)",
      path: "/explore",
      ariaLabel: "Explore global cuisine options",
      isPrimary: false,
      isCustomIcon: false
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
  const heroRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLElement>(null);
  const isHeroVisible = useOnScreen(heroRef);
  const isCardsVisible = useOnScreen(cardsRef);

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
    <div className="space-y-12 mb-16">
      {/* Hero Create Room CTA */}
      <section ref={heroRef} aria-labelledby="hero-cta">
        <h2 id="hero-cta" className="sr-only">Primary Action</h2>
        
        {isHeroVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Link 
              to={createRoomCard.path}
              className="block"
              aria-label={createRoomCard.ariaLabel}
            >
              <motion.div
                variants={heroCardVariants}
                whileHover="hover"
                whileTap="tap"
                onHoverStart={() => setHoveredCard("Create a Room")}
                onHoverEnd={() => setHoveredCard(null)}
                className={`relative ${createRoomCard.gradient} rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl group cursor-pointer focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-shadow duration-200 hover:shadow-green-300/30`}
                style={{
                  boxShadow: `0 16px 64px -16px rgba(34, 197, 94, 0.4)`
                }}
              >
                {/* Floating badge */}
                <motion.div
                  className="absolute top-4 right-4"
                >
                  <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-md">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-gray-800 text-sm font-semibold">{createRoomCard.badge}</span>
                  </div>
                </motion.div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-3">
                    <div
                        className={cn(
                          "w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center shadow-inner",
                          createRoomCard.iconBg
                        )}
                      >
                      <CreateRoomIcon isHovered={hoveredCard === "Create a Room"} />
                    </div>
                      
                      <div>
                        <h3 className={cn("text-xl font-bold", createRoomCard.textColor)}>
                          {createRoomCard.title}
                        </h3>
                      <p className={cn("text-sm", 
                        darkMode ? "text-gray-300" : createRoomCard.textColor + " opacity-90"
                      )}>
                          {createRoomCard.subtitle}
                        </p>
                      </div>
                    </div>
                    
                  <p className={cn("text-sm leading-relaxed", 
                    darkMode ? "text-gray-300" : createRoomCard.textColor + " opacity-80"
                  )}>
                      {createRoomCard.description}
                    </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </section>

      {/* Secondary Actions */}
      <section ref={cardsRef} aria-labelledby="secondary-actions">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 id="secondary-actions" className={`text-2xl font-bold mb-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            More Ways to Decide
          </h2>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Explore additional features to enhance your dining experience
          </p>
        </motion.div>
        
        {isCardsVisible && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto"
          >
            {actionCards.map((card, index) => (
              <motion.div
                key={card.title}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.1 } } }}
              >
                <Link to={card.path} className="block" aria-label={card.ariaLabel}>
                  <motion.div
                    variants={getStandardCardVariants(darkMode, card.title)}
                    whileHover="hover"
                    whileTap="tap"
                    onHoverStart={() => setHoveredCard(card.title)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className={`relative rounded-2xl p-4 sm:p-6 shadow-sm transition-all focus:ring-2 focus:ring-offset-2 group h-full ${
                      card.title === "Join a Room"
                        ? `transition-shadow duration-200 ${darkMode ? 'bg-gray-800 border border-gray-700 focus:ring-gray-500 hover:bg-gray-750 hover:shadow-xl hover:shadow-blue-500/20' : 'bg-white focus:ring-blue-300 hover:shadow-xl hover:shadow-blue-500/20'}`
                        : card.title === "AI Food Assistant"
                          ? `transition-shadow duration-200 ${darkMode ? 'bg-gray-800 border border-gray-700 focus:ring-gray-500 hover:bg-gray-750 hover:shadow-xl hover:shadow-purple-500/20' : 'bg-white focus:ring-purple-300 hover:shadow-xl hover:shadow-purple-500/20'}`
                          : card.title === "Explore Cuisines"
                            ? `transition-shadow duration-200 ${darkMode ? 'bg-gray-800 border border-gray-700 focus:ring-gray-500 hover:bg-gray-750 hover:shadow-xl hover:shadow-orange-500/20' : 'bg-white focus:ring-orange-300 hover:shadow-xl hover:shadow-orange-500/20'}`
                            : darkMode 
                              ? 'bg-gray-800 border border-gray-700 focus:ring-gray-500 hover:shadow-lg' 
                              : 'bg-white focus:ring-gray-300 hover:shadow-lg'
                    }`}
                  >
                    <div className="relative z-10 flex flex-col items-start">
                      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", card.iconBg)}>
                        <motion.div
                          variants={getIconVariants(card.title)}
                          initial="initial"
                          animate={hoveredCard === card.title ? "hover" : "initial"}
                        >
                          {card.isCustomIcon ? (
                            <card.icon className={cn("w-6 h-6", card.iconColor)} />
                          ) : (
                            <card.icon className={cn("w-6 h-6", card.iconColor)} />
                          )}
                        </motion.div>
                      </div>
                      <h3 className={cn("text-lg font-semibold mb-2", 
                        darkMode ? "text-white" : card.titleColor
                      )}>{card.title}</h3>
                      <p className={cn("text-sm leading-relaxed", 
                        darkMode ? "text-gray-300" : card.subtitleColor
                      )}>{card.subtitle}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
} 