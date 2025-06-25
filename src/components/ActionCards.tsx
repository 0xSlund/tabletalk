import React, { useRef, RefObject } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Zap, Globe, Star, ArrowRight, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface ActionCardsProps {
  darkMode?: boolean;
}

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

  // Bottom left message - tilted left (mirrored position)
  const messageVariants3 = {
    initial: { 
      opacity: 0, 
      y: 0,
      x: 0,
      scale: 0.7,
      rotate: 0,
    },
    animate: { 
      opacity: [0, 1, 1, 0],
      y: [0, 2, 4, 6],
      x: [0, -3, -4, -5],
      scale: [0.7, 1, 1, 0.9],
      rotate: [0, -8, -10, -12],
      transition: {
        duration: 1.4,
        times: [0, 0.3, 0.7, 1],
        ease: "easeOut",
        repeat: Infinity,
        repeatType: "loop" as const,
        delay: 1.0
      }
    }
  };

  return (
    <div className="relative w-6 h-6">
      {/* Static group icon - using white color to be visible */}
      <Users className="w-6 h-6 text-white" />
      
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
            <MessageSquare className="w-3 h-3 text-emerald-400 fill-emerald-100" />
          </motion.div>
          
          {/* Second message bubble - coming from right user */}
          <motion.div
            className="absolute -top-4 right-0"
            variants={messageVariants2}
            initial="initial"
            animate="animate"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-300 fill-emerald-50" />
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
      boxShadow: "0 32px 64px -12px rgba(52, 211, 153, 0.3), 0 0 0 2px rgba(52, 211, 153, 0.2)",
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

  // Standard card animation variants
  const getStandardCardVariants = (isDark: boolean) => ({
    initial: { 
      scale: 1,
      y: 0,
    },
    hover: { 
      scale: 1.05,
      y: -6,
      boxShadow: isDark 
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
              repeatType: "loop"
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
              repeatType: "loop"
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
              repeatType: "loop"
            }
          }
        };
      
      case "Quick Decision":
        // Charge slowly, discharge quickly - like building electrical energy
        return {
          initial: { 
            scale: 1, 
            rotate: 0, 
            filter: "brightness(1) drop-shadow(0 0 0px rgba(245, 158, 11, 0))",
            transformOrigin: "center"
          },
          hover: { 
            scale: [1, 1.05, 1.1, 1.15, 1.25, 0.9, 1.1, 1],
            rotate: [0, 0, 0, 0, 0, -8, 4, 0],
            filter: [
              "brightness(1) drop-shadow(0 0 0px rgba(245, 158, 11, 0))",
              "brightness(1.05) drop-shadow(0 0 2px rgba(245, 158, 11, 0.3))",
              "brightness(1.1) drop-shadow(0 0 4px rgba(245, 158, 11, 0.5))",
              "brightness(1.15) drop-shadow(0 0 6px rgba(245, 158, 11, 0.7))",
              "brightness(1.3) drop-shadow(0 0 10px rgba(245, 158, 11, 1))",
              "brightness(1.4) drop-shadow(0 0 15px rgba(245, 158, 11, 1))",
              "brightness(1.1) drop-shadow(0 0 5px rgba(245, 158, 11, 0.6))",
              "brightness(1) drop-shadow(0 0 0px rgba(245, 158, 11, 0))"
            ],
            transition: { 
              duration: 1.8,
              times: [0, 0.2, 0.4, 0.6, 0.75, 0.85, 0.92, 1],
              ease: [0.4, 0, 0.2, 1], // Slow charge, quick discharge
              repeat: Infinity,
              repeatType: "loop"
            }
          },
          exit: {
            scale: 1,
            rotate: 0,
            filter: "brightness(1) drop-shadow(0 0 0px rgba(245, 158, 11, 0))",
            transition: {
              duration: 0.4,
              ease: "easeOut"
            }
          }
        };
      
      case "Explore Cuisines":
        // True 3D globe with perspective and multi-axis rotation
        return {
          initial: { 
            scale: 1, 
            rotateY: 0, 
            rotateX: 0,
            rotateZ: 0,
            perspective: 1000,
            transformStyle: "preserve-3d"
          },
          hover: { 
            scale: 1.1,
            rotateY: [0, 360], // Main rotation like Earth spinning
            rotateX: [0, 15, -10, 5, 0], // North-South wobble
            rotateZ: [0, -3, 3, -2, 0], // Slight axis tilt
            transition: { 
              scale: { 
                duration: 0.4, 
                ease: "easeOut" 
              },
              rotateY: { 
                duration: 4, 
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop"
              },
              rotateX: {
                duration: 6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop"
              },
              rotateZ: {
                duration: 8,
                ease: "easeInOut", 
                repeat: Infinity,
                repeatType: "loop"
              }
            }
          },
          exit: {
            scale: 1,
            rotateY: 0,
            rotateX: 0,
            rotateZ: 0,
            transition: {
              duration: 0.5,
              ease: "easeOut"
            }
          }
        };
      
      default:
        // Create a Room - Collaborative building animation
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
              repeatType: "loop"
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

  // Hero Create Room Card with energizing green gradient
  const createRoomCard = {
    icon: Users,
    title: "Create a Room",
    subtitle: "Start a new voting session with friends",
    description: "Gather your friends and let everyone vote on where to eat. Perfect for group decisions!",
    gradient: "bg-[#20C57D]",
    textColor: "text-white",
    iconBg: "bg-emerald-600",
    iconColor: "text-white",
    path: "/create",
    ariaLabel: "Create a new room",
    isPrimary: true,
    badge: "Recommended"
  };

  // Secondary action cards
  const actionCards = [
    {
      icon: UserPlus,
      title: "Join a Room",
      subtitle: "Use a code to hop into someone else's room",
      gradient: "bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50",
      borderGradient: "from-blue-500 via-sky-500 to-cyan-500",
      iconColor: "text-blue-600",
      iconBg: "bg-gradient-to-br from-blue-100 to-sky-100",
      iconBgHover: "bg-gradient-to-br from-blue-200 to-sky-200",
      titleColor: "bg-gradient-to-r from-blue-700 via-sky-700 to-cyan-700 bg-clip-text text-transparent",
      subtitleColor: "text-gray-600",
      glowColor: "rgba(59, 130, 246, 0.2)",
      path: "/join",
      ariaLabel: "Join an existing room",
      isPrimary: false
    },
    {
      icon: Zap,
      title: "Quick Decision",
      subtitle: "Get a random food spot in seconds",
      gradient: "bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50",
      borderGradient: "from-yellow-500 via-amber-500 to-orange-500",
      iconColor: "text-amber-600",
      iconBg: "bg-gradient-to-br from-yellow-100 to-amber-100",
      iconBgHover: "bg-gradient-to-br from-yellow-200 to-amber-200",
      titleColor: "bg-gradient-to-r from-yellow-700 via-amber-700 to-orange-700 bg-clip-text text-transparent",
      subtitleColor: "text-gray-600",
      glowColor: "rgba(245, 158, 11, 0.2)",
      path: "/quick-decision",
      ariaLabel: "Get a quick food decision",
      isPrimary: false
    },
    {
      icon: Globe,
      title: "Explore Cuisines",
      subtitle: "Filter by cravings, distance, or budget",
      gradient: "bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50",
      borderGradient: "from-violet-500 via-purple-500 to-indigo-500",
      iconColor: "text-violet-600",
      iconBg: "bg-gradient-to-br from-violet-100 to-purple-100",
      iconBgHover: "bg-gradient-to-br from-violet-200 to-purple-200",
      titleColor: "bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent",
      subtitleColor: "text-gray-600",
      glowColor: "rgba(139, 92, 246, 0.2)",
      path: "/explore",
      ariaLabel: "Explore cuisine options",
      isPrimary: false
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
                className={`relative ${createRoomCard.gradient} rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl group cursor-pointer focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
                style={{
                  boxShadow: `0 16px 64px -16px rgba(52, 211, 153, 0.4)`
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {actionCards.map((card, index) => (
              <motion.div
                key={card.title}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.1 } } }}
              >
                <Link to={card.path} className="block" aria-label={card.ariaLabel}>
                  <motion.div
                    variants={getStandardCardVariants(darkMode)}
                    whileHover="hover"
                    whileTap="tap"
                    onHoverStart={() => setHoveredCard(card.title)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className={`relative rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all focus:ring-2 focus:ring-offset-2 group h-full ${
                      darkMode 
                        ? 'bg-gray-800 border border-gray-700 focus:ring-gray-500' 
                        : 'bg-white focus:ring-gray-300'
                    }`}
                  >
                    <div className="relative z-10 flex flex-col items-start">
                      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", card.iconBg)}>
                        <motion.div
                          variants={getIconVariants(card.title)}
                          initial="initial"
                          animate={hoveredCard === card.title ? "hover" : "initial"}
                        >
                        <card.icon className={cn("w-6 h-6", card.iconColor)} />
                        </motion.div>
                      </div>
                      <h3 className={cn("text-lg font-semibold mb-2", 
                        darkMode ? "text-white" : card.titleColor
                      )}>{card.title}</h3>
                      <p className={cn("text-sm", 
                        darkMode ? "text-gray-300" : "text-gray-600"
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