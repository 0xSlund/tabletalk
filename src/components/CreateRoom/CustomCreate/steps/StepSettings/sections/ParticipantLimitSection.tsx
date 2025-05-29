import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  Info, 
  Key, 
  Lock, 
  Globe, 
  Users,
  User,
  UserRound,
  Users2,
  CircleUserRound
} from 'lucide-react';
import { cn } from '../../../../../../lib/utils';
import { ParticipantLimitSectionProps } from '../types';

export const ParticipantLimitSection: React.FC<ParticipantLimitSectionProps> = ({
  participantLimit,
  setParticipantLimit,
  showHelpTooltip,
  setShowHelpTooltip,
  accessControl,
  setAccessControl
}) => {
  // Default to 25 as the maximum limit
  const MAX_PARTICIPANTS = 25;
  // Start with 0 participants instead of MAX_PARTICIPANTS
  const [customLimit, setCustomLimit] = useState(participantLimit === null ? 0 : participantLimit);
  const [isDragging, setIsDragging] = useState(false);
  
  // Reference for the info button to calculate tooltip position
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number; placement: 'above' | 'below' }>({ x: 0, y: 0, placement: 'below' });
  
  // Generate a persistent access code
  const accessCode = useMemo(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);
  
  // Update customLimit when participantLimit changes from parent
  useEffect(() => {
    if (participantLimit !== null) {
      setCustomLimit(participantLimit);
    }
  }, [participantLimit]);

  // Calculate tooltip position when it's shown
  useEffect(() => {
    if (showHelpTooltip === 'participants' && infoButtonRef.current) {
      const buttonRect = infoButtonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const tooltipHeight = 400; // Estimated height of the tooltip
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // Calculate horizontal position (center the tooltip on the button)
      const tooltipWidth = 480;
      const buttonCenterX = buttonRect.left + buttonRect.width / 2;
      let x = buttonCenterX - tooltipWidth / 2;
      
      // Ensure tooltip doesn't go off-screen horizontally
      const margin = 16; // 1rem margin
      if (x < margin) {
        x = margin;
      } else if (x + tooltipWidth > window.innerWidth - margin) {
        x = window.innerWidth - tooltipWidth - margin;
      }
      
      // Determine vertical placement and position
      let y: number;
      let placement: 'above' | 'below';
      
      if (spaceAbove > spaceBelow && spaceBelow < tooltipHeight) {
        // Show above
        placement = 'above';
        y = buttonRect.top - tooltipHeight - 8; // 8px gap from button
      } else {
        // Show below
        placement = 'below';
        y = buttonRect.bottom + 8; // 8px gap from button
      }
      
      // Ensure tooltip doesn't go off-screen vertically
      if (y < margin) {
        y = margin;
        placement = 'below';
      } else if (y + tooltipHeight > viewportHeight - margin) {
        y = viewportHeight - tooltipHeight - margin;
        placement = 'above';
      }
      
      setTooltipPosition({ x, y, placement });
    }
  }, [showHelpTooltip]);

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    setCustomLimit(newLimit);
    setParticipantLimit(newLimit); // Always update the actual limit
  };

  // Handle mouse events for slider animation
  const handleSliderMouseDown = () => setIsDragging(true);
  const handleSliderMouseUp = () => setIsDragging(false);

  // Handle invitation type toggle
  const handleInvitationTypeToggle = (type: 'open' | 'private') => {
    const newAccessControl = type === 'private';
    if (setAccessControl) {
      setAccessControl(newAccessControl);
    }
  };

  // Use accessControl from props, fallback to null if not provided
  const requiresCode = accessControl;

  // Get the appropriate participant icon based on group size
  const getParticipantIcon = () => {
    if (customLimit === 0) {
      return (
        <div className="bg-gray-100 p-2 rounded-full">
          <Users className="w-5 h-5 text-gray-400" />
        </div>
      );
    } else if (customLimit === 1) {
      return (
        <div className="bg-indigo-100 p-2 rounded-full">
          <User className="w-5 h-5 text-indigo-600" />
        </div>
      );
    } else if (customLimit === 2) {
      return (
        <div className="bg-indigo-100 p-2 rounded-full">
          <UserRound className="w-5 h-5 text-indigo-600" />
        </div>
      );
    } else if (customLimit <= 5) {
      return (
        <div className="bg-indigo-100 p-2 rounded-full">
          <Users className="w-5 h-5 text-indigo-600" />
        </div>
      );
    } else if (customLimit <= 15) {
      return (
        <div className="bg-indigo-100 p-2 rounded-full">
          <Users2 className="w-5 h-5 text-indigo-600" />
        </div>
      );
    } else {
      // Custom icon for huge crowds with a plus indicator
      return (
        <div className="bg-indigo-100 p-2 rounded-full relative">
          <Users2 className="w-5 h-5 text-indigo-600" />
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
            +
          </div>
        </div>
      );
    }
  };

  // Generate group size description
  const getGroupSizeDescription = () => {
    if (customLimit === 0) {
      return "No participants set";
    } else if (customLimit === 1) {
      return "Individual session";
    } else if (customLimit === 2) {
      return "A couple";
    } else if (customLimit <= 5) {
      return "Small group";
    } else if (customLimit <= 10) {
      return "Medium gathering";
    } else if (customLimit <= 20) {
      return "Large gathering";
    } else {
      return "Huge crowd";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700">Maximum Participants</label>
            {getParticipantIcon()}
          </div>
    <motion.div 
            className={cn(
              "px-3 py-1 rounded-full border",
              customLimit === 0 
                ? "bg-gray-50 border-gray-200" 
                : "bg-indigo-50 border-indigo-100"
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            animate={{ backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.2)' : customLimit === 0 ? 'rgba(249, 250, 251, 0.8)' : 'rgba(238, 242, 255, 0.8)' }}
          >
            <span className={cn(
              "font-semibold",
              customLimit === 0 ? "text-gray-500" : "text-indigo-700"
            )}>
              {customLimit} {customLimit === 1 ? 'participant' : 'participants'}
            </span>
          </motion.div>
        </div>

        <div className="text-xs text-gray-500 -mt-1">
          {getGroupSizeDescription()}
        </div>
        
        {/* Enhanced Visual Slider */}
        <div className="relative pt-1 pb-14">
          {/* Custom Styled Slider */}
          <div className="relative mt-6 h-6 px-3">
            {/* Background track */}
            <div 
              className="absolute top-2 left-3 right-3 h-2 bg-gray-200 rounded-lg"
            />
            {/* Progress fill */}
            <div 
              className={cn(
                "absolute top-2 left-3 h-2 rounded-lg origin-left",
                customLimit === 0 ? "bg-gray-300" : "bg-indigo-500"
              )}
              style={{ 
                width: `${(customLimit / MAX_PARTICIPANTS) * 100}%`,
                maxWidth: 'calc(100% - 24px)',
                transition: isDragging ? 'none' : 'width 0.15s ease-out'
              }}
            />
            
            {/* Native range input */}
            <input
              type="range"
              min="0"
              max="25"
              value={customLimit}
              onChange={handleSliderChange}
              onMouseDown={handleSliderMouseDown}
              onMouseUp={handleSliderMouseUp}
              onMouseLeave={handleSliderMouseUp}
              onTouchStart={handleSliderMouseDown}
              onTouchEnd={handleSliderMouseUp}
              className="absolute left-3 right-3 top-0 bottom-0 opacity-0 cursor-pointer appearance-none bg-transparent"
              style={{
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                zIndex: 10,
                height: '100%'
              }}
              aria-label="Participant limit slider"
            />
            
            {/* Custom Thumb */}
            <motion.div 
              className={cn(
                "absolute border-2 rounded-full w-6 h-6 shadow-md flex items-center justify-center pointer-events-none",
                customLimit === 0 
                  ? "bg-white border-gray-400" 
                  : "bg-white border-indigo-500"
              )}
              style={{ 
                left: `calc(12px + min(${(customLimit / MAX_PARTICIPANTS) * 100}%, calc(100% - 24px)) - 12px)`,
                top: '0px',
                zIndex: 5
              }}
              animate={{
                scale: isDragging ? 1.15 : 1,
                borderColor: isDragging ? '#4F46E5' : customLimit === 0 ? '#9CA3AF' : '#6366F1'
              }}
              transition={{
                scale: { duration: 0.15 },
                borderColor: { duration: 0.15 }
              }}
            >
              <Users className={cn(
                "w-3 h-3",
                customLimit === 0 ? "text-gray-400" : "text-indigo-600"
              )} />
            </motion.div>
          </div>
          
          {/* Tick marks */}
          <div className="flex justify-between mt-2 px-3">
            {[0, 5, 10, 15, 20, 25].map((tick, index) => (
              <div 
                key={tick} 
                className={cn(
                  "w-1 h-1 rounded-full",
                  customLimit >= tick ? (customLimit === 0 && tick === 0 ? "bg-gray-400" : "bg-indigo-500") : "bg-gray-300"
                )}
                style={{
                  marginLeft: index === 0 ? '0px' : undefined,
                  marginRight: index === 5 ? '0px' : undefined
                }}
              />
            ))}
          </div>

          {/* Labels - Custom positioned for better alignment */}
          <div className="relative text-xs text-gray-500 mt-2 h-4" style={{ paddingLeft: '12px', paddingRight: '12px' }}>
            <span className="absolute" style={{ left: '10px' }}>0</span>
            <span className="absolute" style={{ left: 'calc(20% + 5px)' }}>5</span>
            <span className="absolute" style={{ left: 'calc(40% - 2px)' }}>10</span>
            <span className="absolute" style={{ left: 'calc(60% - 8px)' }}>15</span>
            <span className="absolute" style={{ left: 'calc(80% - 15px)' }}>20</span>
            <span className="absolute" style={{ left: 'calc(100% - 20px)' }}>25</span>
          </div>
        </div>
      </div>

      {/* Invitation Type Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Access Control</span>
          <div className="relative">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
              onMouseEnter={() => setShowHelpTooltip('participants')}
              onMouseLeave={() => setShowHelpTooltip(null)}
              aria-label="Help info for access control options"
              ref={infoButtonRef}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Portal-based Access Control Help Tooltip */}
        {showHelpTooltip === 'participants' && createPortal(
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 p-5 w-[480px] max-w-[90vw]"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
            }}
            onMouseEnter={() => setShowHelpTooltip('participants')}
            onMouseLeave={() => setShowHelpTooltip(null)}
          >
            {/* Arrow pointing to the button */}
            {infoButtonRef.current && (
              <div 
                className="absolute w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"
                style={{
                  left: `${infoButtonRef.current.getBoundingClientRect().left + infoButtonRef.current.getBoundingClientRect().width / 2 - tooltipPosition.x - 8}px`,
                  [tooltipPosition.placement === 'below' ? 'top' : 'bottom']: '-8px',
                  transform: tooltipPosition.placement === 'below' ? 'rotate(45deg)' : 'rotate(225deg)'
                }}
              />
            )}
            
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 text-base mb-1">Access Control Options</h3>
                <p className="text-sm text-gray-600">Choose how people can join your decision room</p>
              </div>
              
              {/* Horizontal layout for options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Open Invitation Info */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-800 text-sm">Open Invitation</h4>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-green-800 mb-2">Recommended for:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-xs text-green-700">Friends & family decisions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-xs text-green-700">Public polls & surveys</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-xs text-green-700">Community decisions</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Private Info */}
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <Lock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h4 className="font-semibold text-indigo-800 text-sm">Private</h4>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-indigo-800 mb-2">Recommended for:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></div>
                        <span className="text-xs text-indigo-700">Work team decisions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></div>
                        <span className="text-xs text-indigo-700">Sensitive topics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></div>
                        <span className="text-xs text-indigo-700">Exclusive groups</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  💡 You can change this setting anytime after creating the room
                </p>
              </div>
            </div>
          </motion.div>,
          document.body
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Open Invitation Option */}
          <motion.button
              whileHover={{ scale: 1.02, backgroundColor: requiresCode === false ? "rgba(236, 253, 245, 1)" : "rgba(249, 250, 251, 1)" }}
            whileTap={{ scale: 0.98 }}
              onClick={() => handleInvitationTypeToggle('open')}
            className={cn(
                "flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all relative overflow-hidden",
                requiresCode === false 
                  ? "bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-md"
                  : "bg-white border border-gray-200 hover:border-gray-300 shadow-sm"
              )}
            >
              {requiresCode === false && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-green-100/50 to-green-200/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <div className={cn(
                "p-2 rounded-full mb-3 relative z-10",
                requiresCode === false ? "bg-green-100 ring-4 ring-green-50" : "bg-gray-100"
              )}>
                <Globe className={cn(
                  "w-6 h-6",
                  requiresCode === false ? "text-green-600" : "text-gray-400"
            )} />
              </div>
              <span className={cn(
                "font-medium text-base relative z-10",
                requiresCode === false ? "text-green-800" : "text-gray-700"
              )}>Open Invitation</span>
              <span className={cn(
                "text-xs mt-1 text-center relative z-10",
                requiresCode === false ? "text-green-700" : "text-gray-500"
              )}>Anyone with the link can join</span>
          </motion.button>
          
          {/* Private Invitation Option */}
          <motion.button
              whileHover={{ scale: 1.02, backgroundColor: requiresCode === true ? "rgba(238, 242, 255, 1)" : "rgba(249, 250, 251, 1)" }}
            whileTap={{ scale: 0.98 }}
              onClick={() => handleInvitationTypeToggle('private')}
            className={cn(
                "flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all relative overflow-hidden",
                requiresCode === true 
                  ? "bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 shadow-md"
                  : "bg-white border border-gray-200 hover:border-gray-300 shadow-sm"
              )}
            >
              {requiresCode === true && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-100/50 to-indigo-200/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <div className={cn(
                "p-2 rounded-full mb-3 relative z-10",
                requiresCode === true ? "bg-indigo-100 ring-4 ring-indigo-50" : "bg-gray-100"
              )}>
                <Lock className={cn(
                  "w-6 h-6",
                  requiresCode === true ? "text-indigo-600" : "text-gray-400"
            )} />
              </div>
              <span className={cn(
                "font-medium text-base relative z-10",
                requiresCode === true ? "text-indigo-800" : "text-gray-700"
              )}>Private</span>
              <span className={cn(
                "text-xs mt-1 text-center relative z-10",
                requiresCode === true ? "text-indigo-700" : "text-gray-500"
              )}>Requires access code</span>
          </motion.button>
        </div>

        {/* Fixed-height container for disclaimers */}
        <div className="h-16 mt-3 relative">
          {/* Private Access Information */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-3 flex items-center gap-3 transition-all duration-300 shadow-sm",
              requiresCode === true ? "opacity-100 transform-none" : "opacity-0 pointer-events-none translate-y-1"
            )}
          >
            <div className="bg-indigo-100 p-2 rounded-full flex-shrink-0 ring-2 ring-indigo-50">
              <Key className="w-4 h-4 text-indigo-600" />
                </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-800">
                Access code will be generated when the room is created.
              </p>
                </div>
              </div>

          {/* Open Invitation Information */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3 flex items-center gap-3 transition-all duration-300 shadow-sm",
              requiresCode === false ? "opacity-100 transform-none" : "opacity-0 pointer-events-none translate-y-1"
            )}
          >
            <div className="bg-green-100 p-2 rounded-full flex-shrink-0 ring-2 ring-green-50">
              <Globe className="w-4 h-4 text-green-600" />
              </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Anyone with the invitation link can join.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 