import { clearExistingAnimations } from './animationUtils';
import { triggerBurstAnimation } from './burstAnimation';
import { triggerCozyAnimation } from './cozyAnimation';
import { triggerSurpriseMeAnimation } from './cozyAnimation';

/**
 * Trigger the appropriate animation based on theme index
 */
export const triggerAnimation = (
  e?: React.MouseEvent,
  themeCardElement?: HTMLElement,
  themeIndex?: number,
  selectedTheme: number = 0
): void => {
  // Clear any existing animations first before determining position
  clearExistingAnimations();
  
  // Get position
  let x, y;
  
  // If a theme card element is provided, use its position and dimensions
  if (themeCardElement) {
    const rect = themeCardElement.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  } else if (e) {
    // If an event is provided, use click position
    x = e.clientX;
    y = e.clientY;
  } else {
    // Default fallback to center of screen
    x = window.innerWidth / 2;
    y = window.innerHeight / 2;
  }

  // Use the provided theme index if available, otherwise use the selected theme from state
  const themeToUse = typeof themeIndex === 'number' ? themeIndex : selectedTheme;

  // Select animation based on theme
  if (themeToUse === 0) {
    // Food Fiesta - Burst Animation
    triggerBurstAnimation(x, y);
  } else if (themeToUse === 1) {
    // Cozy Gathering - Snowflake/Stars Animation
    triggerCozyAnimation(x, y);
  } else {
    // Surprise Me - Food-themed Animation
    triggerSurpriseMeAnimation(x, y);
  }
};

/**
 * Special animation for the create button
 */
export const triggerCreateAnimation = (selectedTheme: number): void => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Get all theme buttons to find the selected one
  const themeButtons = document.querySelectorAll('.theme-button');
  const selectedButton = themeButtons[selectedTheme] as HTMLElement;
  
  // If we have a selected button element, use its position
  if (selectedButton) {
    const rect = selectedButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // First animation at the theme card center
    triggerAnimation(undefined, selectedButton, undefined, selectedTheme);
    
    // Additional animations around the theme
    setTimeout(() => {
      if (selectedTheme === 0) {
        triggerBurstAnimation(centerX - rect.width/2, centerY - rect.height/2);
      } else if (selectedTheme === 1) {
        triggerCozyAnimation(centerX - rect.width/2, centerY - rect.height/2);
      } else {
        triggerSurpriseMeAnimation(centerX - rect.width/2, centerY - rect.height/2);
      }
    }, 150);
    
    setTimeout(() => {
      if (selectedTheme === 0) {
        triggerBurstAnimation(centerX + rect.width/2, centerY - rect.height/2);
      } else if (selectedTheme === 1) {
        triggerCozyAnimation(centerX + rect.width/2, centerY - rect.height/2);
      } else {
        triggerSurpriseMeAnimation(centerX + rect.width/2, centerY - rect.height/2);
      }
    }, 200);
    
    setTimeout(() => {
      if (selectedTheme === 0) {
        triggerBurstAnimation(centerX - rect.width/2, centerY + rect.height/2);
      } else if (selectedTheme === 1) {
        triggerCozyAnimation(centerX - rect.width/2, centerY + rect.height/2);
      } else {
        triggerSurpriseMeAnimation(centerX - rect.width/2, centerY + rect.height/2);
      }
    }, 250);
    
    setTimeout(() => {
      if (selectedTheme === 0) {
        triggerBurstAnimation(centerX + rect.width/2, centerY + rect.height/2);
      } else if (selectedTheme === 1) {
        triggerCozyAnimation(centerX + rect.width/2, centerY + rect.height/2);
      } else {
        triggerSurpriseMeAnimation(centerX + rect.width/2, centerY + rect.height/2);
      }
    }, 300);
  } else {
    // Fallback to old behavior if we can't find the button
    triggerAnimation(undefined, undefined, selectedTheme, selectedTheme);
    
    setTimeout(() => {
      if (selectedTheme === 0) {
        triggerBurstAnimation(width * 0.25, height * 0.25);
      } else if (selectedTheme === 1) {
        triggerCozyAnimation(width * 0.25, height * 0.25);
      } else {
        triggerSurpriseMeAnimation(width * 0.25, height * 0.25);
      }
    }, 150);
    
    setTimeout(() => {
      if (selectedTheme === 0) {
        triggerBurstAnimation(width * 0.75, height * 0.25);
      } else if (selectedTheme === 1) {
        triggerCozyAnimation(width * 0.75, height * 0.25);
      } else {
        triggerSurpriseMeAnimation(width * 0.75, height * 0.25);
      }
    }, 200);
    
    setTimeout(() => {
      if (selectedTheme === 0) {
        triggerBurstAnimation(width * 0.25, height * 0.75);
      } else if (selectedTheme === 1) {
        triggerCozyAnimation(width * 0.25, height * 0.75);
      } else {
        triggerSurpriseMeAnimation(width * 0.25, height * 0.75);
      }
    }, 250);
    
    setTimeout(() => {
      if (selectedTheme === 0) {
        triggerBurstAnimation(width * 0.75, height * 0.75);
      } else if (selectedTheme === 1) {
        triggerCozyAnimation(width * 0.75, height * 0.75);
      } else {
        triggerSurpriseMeAnimation(width * 0.75, height * 0.75);
      }
    }, 300);
  }
};

export { clearExistingAnimations, triggerBurstAnimation, triggerCozyAnimation, triggerSurpriseMeAnimation }; 