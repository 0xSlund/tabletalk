import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../../../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface PresetTimerCardProps {
  id: string;
  icon: React.ReactElement; // Allow passing the icon component directly
  title: string;
  description: string;
  value: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
  baseBgGradient: string; // e.g., "from-amber-50/80 to-orange-50/80"
  selectedBgGradient: string; // e.g., "from-amber-50/80 to-orange-50/80" for consistency or different
  borderColor: string; // e.g., "border-amber-200/60"
  hoverBorderColor: string; // e.g., "hover:border-amber-200/40"
  hoverBgColor: string; // e.g., "hover:bg-amber-50/20"
  iconSelectedBgColor: string; // e.g., "bg-amber-100/80"
  iconSelectedTextColor: string; // e.g., "text-amber-600"
  iconDefaultBgColor?: string; // e.g., "bg-gray-100/80"
  iconDefaultTextColor?: string; // e.g., "text-gray-500"
  iconHoverBgColor: string; // e.g., "group-hover:bg-amber-50"
  iconHoverTextColor: string; // e.g., "group-hover:text-amber-500"
  textSelectedColor: string; // e.g., "text-amber-800"
  textDefaultColor?: string; // e.g., "text-gray-700"
  textHoverColor: string; // e.g., "group-hover:text-amber-700"
  descriptionSelectedColor: string; // e.g., "text-amber-700"
  descriptionDefaultColor?: string; // e.g., "text-gray-500"
  descriptionHoverColor: string; // e.g., "group-hover:text-amber-600"
  animationConfig?: any; // This will now be structured with functions for dynamic parts
  height?: string; // Default to 140px
}

export const PresetTimerCard: React.FC<PresetTimerCardProps> = React.memo(({
  id,
  icon,
  title,
  description,
  value,
  isSelected,
  onSelect,
  baseBgGradient,
  selectedBgGradient,
  borderColor,
  hoverBorderColor,
  hoverBgColor,
  iconSelectedBgColor,
  iconSelectedTextColor,
  iconDefaultBgColor = "bg-gray-100/80",
  iconDefaultTextColor = "text-gray-500",
  iconHoverBgColor,
  iconHoverTextColor,
  textSelectedColor,
  textDefaultColor = "text-gray-700",
  textHoverColor,
  descriptionSelectedColor,
  descriptionDefaultColor = "text-gray-500",
  descriptionHoverColor,
  animationConfig,
  height = "140px",
}) => {

  const cardAnimate = animationConfig?.cardAnimate ? animationConfig.cardAnimate(isSelected) : {};
  const cardTransition = animationConfig?.cardTransition ? animationConfig.cardTransition(isSelected) : { type: "spring", stiffness: 400, damping: 25 };
  const iconAnimate = animationConfig?.iconAnimate ? (typeof animationConfig.iconAnimate === 'function' ? animationConfig.iconAnimate(isSelected) : animationConfig.iconAnimate) : {};
  const iconTransition = animationConfig?.iconTransition ? (typeof animationConfig.iconTransition === 'function' ? animationConfig.iconTransition(isSelected) : animationConfig.iconTransition) : {};
  const iconWrapperStyle = animationConfig?.iconWrapperStyle ? animationConfig.iconWrapperStyle(isSelected) : {};
  const iconItselfStyle = animationConfig?.iconItselfStyle ? animationConfig.iconItselfStyle(isSelected) : {};
  const textContentAnimate = animationConfig?.textContentAnimate ? animationConfig.textContentAnimate(isSelected) : { y: isSelected ? -2 : 0, scale: isSelected ? 1.02 : 1 };
  const textContentTransition = animationConfig?.textContentTransition ? animationConfig.textContentTransition : { duration: 0.3 };

  const glowEffectNode = animationConfig?.glowEffect;
  const selectedOverlayNode = animationConfig?.selectedOverlay;
  const iconSpecificElementsNode = animationConfig?.iconSpecificElements;

  return (
    <motion.div
      className={cn(
        "rounded-2xl overflow-hidden transition-all group cursor-pointer relative",
        isSelected
          ? `${selectedBgGradient} ${borderColor}`
          : `${baseBgGradient} ${borderColor} ${hoverBorderColor} ${hoverBgColor}`
      )}
      whileHover={!isSelected && animationConfig?.cardAnimate === undefined ? {
        scale: 1.02,
        y: -4,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.2 }
      } : {}}
      whileTap={{ scale: 0.98 }}
      animate={cardAnimate}
      transition={cardTransition}
      onClick={() => onSelect(value)}
      style={{ height: height }}
    >
      {glowEffectNode}

      <AnimatePresence>
        {isSelected && selectedOverlayNode}
      </AnimatePresence>

      <div className="relative h-full flex flex-col items-center justify-center p-6 z-20">
        <div className="mb-4 relative z-30" style={iconWrapperStyle}>
          <motion.div
            className={cn(
              "rounded-2xl p-3 transition-all duration-300 relative", // Removed z-30 from here, managed by parent
              isSelected
                ? `${iconSelectedBgColor} ${iconSelectedTextColor}`
                : `${iconDefaultBgColor} ${iconDefaultTextColor} ${iconHoverBgColor} ${iconHoverTextColor}`,
              animationConfig?.iconSpecificElements ? "overflow-hidden" : ""
            )}
            animate={iconAnimate}
            transition={iconTransition}
          >
            {/* Render additional 3D elements for icon if they exist (e.g. for 60min card) */}
            {isSelected && iconSpecificElementsNode}
            <motion.div style={iconItselfStyle}>
                {React.cloneElement(icon, { className: "w-7 h-7 relative z-10" })}
            </motion.div>
          </motion.div>
          {isSelected && animationConfig?.auraEffect && (
            <motion.div
              className="absolute inset-0 rounded-2xl z-[-1]" // Ensure aura is behind icon elements
              animate={animationConfig.auraEffect.animate}
              transition={animationConfig.auraEffect.transition}
            />
          )}
        </div>

        <motion.div
          className="text-center relative z-30"
          animate={textContentAnimate}
          transition={textContentTransition}
        >
          <div className={cn(
            "font-bold text-xl transition-colors duration-300",
            isSelected ? textSelectedColor : `${textDefaultColor} ${textHoverColor}`
          )}>
            {title}
          </div>
          <div className={cn(
            "text-sm mt-1 font-medium transition-colors duration-300",
            isSelected ? descriptionSelectedColor : `${descriptionDefaultColor} ${descriptionHoverColor}`
          )}>
            {description}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}); 