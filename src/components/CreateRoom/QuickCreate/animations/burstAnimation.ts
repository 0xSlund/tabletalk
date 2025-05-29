import { clearExistingAnimations, getOrCreateAnimationContainer } from './animationUtils';

/**
 * Create a custom burst animation for the Food Fiesta theme
 */
export const triggerBurstAnimation = (x: number, y: number, color: string = '#FF8A65'): void => {
  // Clear any existing animations first
  clearExistingAnimations();

  // Get or create animation container
  const container = getOrCreateAnimationContainer();

  // Create initial burst effect
  const createInitialBurst = (x: number, y: number) => {
    // Create expanding circles without the white flash
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const circle = document.createElement('div');
        circle.classList.add('animation-element');
        circle.style.position = 'absolute';
        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;
        circle.style.width = '20px';
        circle.style.height = '20px';
        circle.style.borderRadius = '50%';
        circle.style.border = '2px solid #FF5722';
        circle.style.transform = 'translate(-50%, -50%) scale(0.5)';
        circle.style.opacity = '0.8';
        circle.style.transition = 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)';
        circle.style.zIndex = '25';
        container.appendChild(circle);
        
        // Animate the circle
        setTimeout(() => {
          circle.style.transform = 'translate(-50%, -50%) scale(10)';
          circle.style.opacity = '0';
          circle.style.border = '1px solid rgba(255, 87, 34, 0.3)';
        }, 10);
        
        // Remove the circle
        setTimeout(() => {
          circle.remove();
        }, 600);
      }, i * 150);
    }

    // Create an initial non-white burst effect
    const burstFlash = document.createElement('div');
    burstFlash.classList.add('animation-element');
    burstFlash.style.position = 'absolute';
    burstFlash.style.left = `${x}px`;
    burstFlash.style.top = `${y}px`;
    burstFlash.style.width = '40px';
    burstFlash.style.height = '40px';
    burstFlash.style.borderRadius = '50%';
    burstFlash.style.background = 'radial-gradient(circle, rgba(255,152,0,0.9) 0%, rgba(255,87,34,0.8) 50%, rgba(244,67,54,0) 80%)';
    burstFlash.style.transform = 'translate(-50%, -50%) scale(0)';
    burstFlash.style.opacity = '1';
    burstFlash.style.transition = 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)';
    burstFlash.style.zIndex = '30';
    container.appendChild(burstFlash);
    
    // Animate the burst
    setTimeout(() => {
      burstFlash.style.transform = 'translate(-50%, -50%) scale(5)';
      burstFlash.style.opacity = '0';
    }, 10);
    
    // Remove the burst
    setTimeout(() => {
      burstFlash.remove();
    }, 500);
  };
  
  // Create flying food ingredient
  const createFoodItem = (x: number, y: number, emoji: string, delay: number = 0, distance: number = 150) => {
    const angle = Math.random() * Math.PI * 2;
    const randomDistance = distance * (0.7 + Math.random() * 0.6); // Vary distance by 70%-130%
    
    const item = document.createElement('div');
    item.classList.add('animation-element');
    item.style.position = 'absolute';
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    item.style.fontSize = `${24 + Math.random() * 16}px`;
    item.style.transform = 'translate(-50%, -50%) scale(0) rotate(0deg)';
    item.style.opacity = '0';
    item.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    item.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))';
    item.style.zIndex = '50';
    item.textContent = emoji;
    container.appendChild(item);
    
    // Calculate final position
    const endX = x + Math.cos(angle) * randomDistance;
    const endY = y + Math.sin(angle) * randomDistance;
    const rotation = Math.random() * 720 - 360; // Random rotation between -360 and 360 degrees
    
    // Animate with delay
    setTimeout(() => {
      item.style.transform = `translate(-50%, -50%) scale(1) rotate(${rotation}deg)`;
      item.style.opacity = '1';
      item.style.left = `${endX}px`;
      item.style.top = `${endY}px`;
    }, delay);
    
    // Fade out
    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transform = `translate(-50%, -50%) scale(0.5) rotate(${rotation + 90}deg)`;
    }, delay + 700);
    
    // Remove
    setTimeout(() => {
      item.remove();
    }, delay + 1000);
  };
  
  // Create colorful spark/spice particle
  const createSparkParticle = (x: number, y: number, delay: number = 0) => {
    // Vibrant fiesta colors
    const colors = [
      '#FF5722', // Fiery Orange
      '#FF9800', // Bright Orange
      '#FFEB3B', // Yellow
      '#4CAF50', // Green
      '#E91E63', // Pink
      '#9C27B0', // Purple
      '#2196F3', // Blue
      '#F44336'  // Red
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 120;
    
    const particle = document.createElement('div');
    particle.classList.add('animation-element');
    particle.style.position = 'absolute';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${3 + Math.random() * 5}px`;
    particle.style.height = `${3 + Math.random() * 5}px`;
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = color;
    particle.style.boxShadow = `0 0 6px ${color}`;
    particle.style.transform = 'translate(-50%, -50%) scale(0)';
    particle.style.opacity = '0.9';
    particle.style.transition = 'all 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)';
    particle.style.zIndex = '35';
    container.appendChild(particle);

    // Calculate final position
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance;
    
    // Animate with delay
    setTimeout(() => {
      particle.style.transform = 'translate(-50%, -50%) scale(1)';
      particle.style.left = `${endX}px`;
      particle.style.top = `${endY}px`;
    }, delay);
    
    // Fade out
    setTimeout(() => {
      particle.style.opacity = '0';
    }, delay + 500);

    // Remove
    setTimeout(() => {
      particle.remove();
    }, delay + 700);
  };

  // Create text splash effect
  const createTextSplash = (x: number, y: number, angle: number, distance: number, text: string) => {
    const splash = document.createElement('div');
    splash.classList.add('animation-element');
    splash.style.position = 'absolute';
    splash.style.left = `${x}px`;
    splash.style.top = `${y}px`;
    splash.style.fontFamily = 'Arial, sans-serif';
    splash.style.fontSize = `${16 + Math.random() * 12}px`;
    splash.style.fontWeight = 'bold';
    splash.style.color = '#FFFFFF'; // White text
    splash.style.backgroundColor = 'rgba(50, 50, 50, 0.7)'; // Semi-transparent dark background
    splash.style.padding = '4px 8px';
    splash.style.borderRadius = '4px';
    splash.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.8)'; // Dark text shadow
    splash.style.transform = 'translate(-50%, -50%) scale(0) rotate(0deg)';
    splash.style.opacity = '0';
    splash.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    splash.style.zIndex = '60';
    splash.textContent = text;
    container.appendChild(splash);
    
    // Use provided angle and distance for end position
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance;
    const rotation = (Math.random() - 0.5) * 30; // Small random rotation
    
    // Animate
    setTimeout(() => {
      splash.style.transform = `translate(-50%, -50%) scale(1) rotate(${rotation}deg)`;
      splash.style.opacity = '1';
      splash.style.left = `${endX}px`;
      splash.style.top = `${endY}px`;
    }, Math.random() * 300);

    // Fade out
    setTimeout(() => {
      splash.style.opacity = '0';
      splash.style.transform = `translate(-50%, -50%) scale(1.2) rotate(${rotation}deg)`;
    }, 800 + Math.random() * 200);
    
    // Remove
    setTimeout(() => {
      splash.remove();
    }, 1200);
  };

  // Create the sequential food burst animation
  
  // 1. Initial burst effect - without white flash
  createInitialBurst(x, y);
  
  // 2. Main foods - organize in rings for better spacing
  const foodGroups = {
    // First ring - smaller items, close to center
    inner: ['🍅', '🧄', '🧅', '🥕', '🌶️', '🥬', '🍇', '🍓', '🥑'],
    // Second ring - medium items
    middle: ['🌮', '🍕', '🍔', '🥪', '🌯', '🍦', '🍩', '🍪', '🥐', '🍤'],
    // Outer ring - larger items, travel further
    outer: ['🍲', '🍱', '🥘', '🍛', '🥗', '🍖', '🍗', '🍰', '🍝', '🍹', '🥂']
  };
  
  // Create rings of food with increasing distances and delays
  // Inner ring (small ingredients)
  for (let i = 0; i < 12; i++) {
    const food = foodGroups.inner[Math.floor(Math.random() * foodGroups.inner.length)];
    createFoodItem(x, y, food, 100 + i * 30, 80);
  }
  
  // Middle ring (prepared foods)
  for (let i = 0; i < 15; i++) {
    const food = foodGroups.middle[Math.floor(Math.random() * foodGroups.middle.length)];
    createFoodItem(x, y, food, 200 + i * 30, 150);
  }
  
  // Outer ring (complete dishes)
  for (let i = 0; i < 10; i++) {
    const food = foodGroups.outer[Math.floor(Math.random() * foodGroups.outer.length)];
    createFoodItem(x, y, food, 300 + i * 40, 220);
  }
  
  // 3. Create colorful spark particles
  for (let i = 0; i < 50; i++) {
    createSparkParticle(x, y, 50 + i * 10);
  }
  
  // 4. Add text splashes with improved contrast
  const splashCount = 5;
  const splashArc = Math.PI * 1.2; // 216 degrees
  const splashStart = -Math.PI / 2 - splashArc / 2; // Centered upward
  const splashRadius = 80; // Distance from center
  const texts = ['Delicious!', 'Yum!', 'Tasty!', 'So good!', 'Amazing!', 'Fiesta!', 'Party!'];
  // Shuffle texts and pick unique ones
  const shuffledTexts = texts.sort(() => Math.random() - 0.5).slice(0, splashCount);
  for (let i = 0; i < splashCount; i++) {
    const angle = splashStart + (i / (splashCount - 1)) * splashArc;
    setTimeout(() => {
      createTextSplash(x, y, angle, splashRadius + Math.random() * 20, shuffledTexts[i]);
    }, 300 + i * 150);
  }

  // 5. Final sparkle effect
    setTimeout(() => {
    // Create sparkles around the edges to frame the explosion
    for (let i = 0; i < 12; i++) {
      const sparkleAngle = (i / 12) * Math.PI * 2;
      const sparkleDistance = 120 + Math.random() * 60;
      const sparkleX = x + Math.cos(sparkleAngle) * sparkleDistance;
      const sparkleY = y + Math.sin(sparkleAngle) * sparkleDistance;
      
      const sparkle = document.createElement('div');
      sparkle.classList.add('animation-element');
      sparkle.style.position = 'absolute';
      sparkle.style.left = `${sparkleX}px`;
      sparkle.style.top = `${sparkleY}px`;
      sparkle.style.width = '8px';
      sparkle.style.height = '8px';
      sparkle.style.borderRadius = '50%';
      sparkle.style.backgroundColor = '#FFEB3B';
      sparkle.style.boxShadow = '0 0 10px 5px rgba(255, 235, 59, 0.7)';
      sparkle.style.transform = 'translate(-50%, -50%) scale(0)';
      sparkle.style.opacity = '0';
      sparkle.style.transition = 'all 0.5s ease-out';
      sparkle.style.zIndex = '40';
      container.appendChild(sparkle);
  
      // Animate with pulsing effect
      setTimeout(() => {
        sparkle.style.transform = 'translate(-50%, -50%) scale(1)';
        sparkle.style.opacity = '1';
      }, i * 50);
      
      // Pulse animation
      setTimeout(() => {
        sparkle.style.transform = 'translate(-50%, -50%) scale(1.3)';
        sparkle.style.opacity = '0.7';
      }, 300 + i * 50);
      
      setTimeout(() => {
        sparkle.style.transform = 'translate(-50%, -50%) scale(1)';
        sparkle.style.opacity = '1';
      }, 500 + i * 50);
      
      // Fade out
      setTimeout(() => {
        sparkle.style.transform = 'translate(-50%, -50%) scale(0)';
        sparkle.style.opacity = '0';
      }, 800 + i * 50);
      
      // Remove
      setTimeout(() => {
        sparkle.remove();
      }, 1300 + i * 50);
    }
  }, 600);
}; 