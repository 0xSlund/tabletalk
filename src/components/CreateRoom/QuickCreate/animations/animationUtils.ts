/**
 * Clear existing animations by removing the particle container and any stray elements
 */
export const clearExistingAnimations = (): void => {
  // Find and clear the particle container
  const container = document.getElementById('particle-container');
  if (container) {
    // Remove all child elements
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Also remove the container itself to ensure a fresh start for new animations
    container.remove();
  }
  
  // Look for any stray animation elements that might not be in the container
  const allAnimationElements = document.querySelectorAll('.animation-element');
  allAnimationElements.forEach(element => {
    element.remove();
  });
};

/**
 * Get or create the animation particle container
 */
export const getOrCreateAnimationContainer = (): HTMLElement => {
  // Create particles container if it doesn't exist
  let container = document.getElementById('particle-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'particle-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '100';
    document.body.appendChild(container);
  }
  return container;
}; 