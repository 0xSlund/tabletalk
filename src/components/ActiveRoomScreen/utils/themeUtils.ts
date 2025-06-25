// Theme utility functions for ActiveRoomScreen based on food mode

export const getThemeColors = (foodMode?: string | null) => {
  switch (foodMode) {
    case 'cooking':
      return {
        // Background gradients - consistent with main page
        bgGradient: 'from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]',
        bgGradientFallback: 'from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]',
        
        // Header icon
        headerIcon: 'text-teal-500',
        
        // Buttons
        buttonBg: 'from-teal-500 to-emerald-500',
        buttonBgHover: 'hover:from-teal-600 hover:to-emerald-600',
        buttonBgDisabled: 'hover:from-teal-500 hover:to-emerald-500',
        
        // Text colors
        titleGradient: 'from-teal-600 to-emerald-600',
        
        // Icon colors
        iconColor: 'text-teal-300',
        iconColorHover: 'text-teal-400',
        
        // Loading state
        loadingIcon: 'text-teal-400'
      };
    
    case 'dining-out':
      return {
        // Background gradients - consistent with main page
        bgGradient: 'from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]',
        bgGradientFallback: 'from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]',
        
        // Header icon
        headerIcon: 'text-violet-500',
        
        // Buttons
        buttonBg: 'from-violet-500 to-purple-500',
        buttonBgHover: 'hover:from-violet-600 hover:to-purple-600',
        buttonBgDisabled: 'hover:from-violet-500 hover:to-purple-500',
        
        // Text colors
        titleGradient: 'from-violet-600 to-purple-600',
        
        // Icon colors
        iconColor: 'text-violet-300',
        iconColorHover: 'text-violet-400',
        
        // Loading state
        loadingIcon: 'text-violet-400'
      };
    
    case 'both':
      return {
        // Background gradients - consistent with main page
        bgGradient: 'from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]',
        bgGradientFallback: 'from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]',
        
        // Header icon
        headerIcon: 'text-orange-500',
        
        // Buttons
        buttonBg: 'from-orange-500 to-red-500',
        buttonBgHover: 'hover:from-orange-600 hover:to-red-600',
        buttonBgDisabled: 'hover:from-orange-500 hover:to-red-500',
        
        // Text colors
        titleGradient: 'from-orange-600 to-red-600',
        
        // Icon colors
        iconColor: 'text-orange-300',
        iconColorHover: 'text-orange-400',
        
        // Loading state
        loadingIcon: 'text-orange-400'
      };
    
    default:
      // Default - consistent with main page
      return {
        // Background gradients - consistent with main page
        bgGradient: 'from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]',
        bgGradientFallback: 'from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]',
        
        // Header icon
        headerIcon: 'text-orange-500',
        
        // Buttons
        buttonBg: 'from-orange-500 to-amber-500',
        buttonBgHover: 'hover:from-orange-600 hover:to-amber-600',
        buttonBgDisabled: 'hover:from-orange-500 hover:to-amber-500',
        
        // Text colors
        titleGradient: 'from-orange-600 to-amber-600',
        
        // Icon colors
        iconColor: 'text-orange-300',
        iconColorHover: 'text-orange-400',
        
        // Loading state
        loadingIcon: 'text-orange-400'
      };
  }
};

// Helper function to get theme-specific class names
export const getThemeClass = (foodMode?: string | null, type: keyof ReturnType<typeof getThemeColors>) => {
  return getThemeColors(foodMode)[type];
}; 