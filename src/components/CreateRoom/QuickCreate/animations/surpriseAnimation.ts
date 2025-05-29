import { clearExistingAnimations, getOrCreateAnimationContainer } from './animationUtils';

/**
 * Create a surprise magic/confetti animation for the "Surprise Me" theme
 */
export const triggerSurpriseAnimation = (x: number, y: number): void => {
  // Clear any existing animations first
  clearExistingAnimations();

  // Get or create animation container
  const container = getOrCreateAnimationContainer();

  // Create a magic sparkle
  const createSparkle = (x: number, y: number) => {
    const colors = ['#81C784', '#4DB6AC', '#66BB6A', '#AED581'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const sparkle = document.createElement('div');
    sparkle.classList.add('animation-element');
    sparkle.style.position = 'absolute';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.width = `${4 + Math.random() * 6}px`;
    sparkle.style.height = `${4 + Math.random() * 6}px`;
    sparkle.style.backgroundColor = 'white';
    sparkle.style.borderRadius = '50%';
    sparkle.style.boxShadow = `0 0 10px 2px ${color}`;
    sparkle.style.transform = 'translate(-50%, -50%) scale(0)';
    sparkle.style.opacity = '1';
    sparkle.style.transition = 'all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
    container.appendChild(sparkle);

    // Animate with random delay
    const delay = Math.random() * 0.3;
    const scale = 0.5 + Math.random() * 1;
    
    setTimeout(() => {
      sparkle.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }, delay * 1000);
    
    // Fade out animation
    setTimeout(() => {
      sparkle.style.opacity = '0';
    }, (delay + 0.4) * 1000);

    // Remove the sparkle after animation
    setTimeout(() => {
      sparkle.remove();
    }, (delay + 0.8) * 1000);
  };

  // Create swirling ribbons
  const createRibbon = (x: number, y: number) => {
    const colors = ['#81C784', '#4DB6AC', '#66BB6A', '#AED581'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const ribbon = document.createElement('div');
    ribbon.classList.add('animation-element');
    ribbon.style.position = 'absolute';
    ribbon.style.left = `${x}px`;
    ribbon.style.top = `${y}px`;
    ribbon.style.width = '5px';
    ribbon.style.height = '15px';
    ribbon.style.backgroundColor = color;
    ribbon.style.borderRadius = '3px';
    ribbon.style.transform = 'translate(-50%, -50%)';
    ribbon.style.opacity = '0.8';
    ribbon.style.transition = 'all 1.2s cubic-bezier(0.1, 0.8, 0.3, 1)';
    container.appendChild(ribbon);

    // Animate with a swirling pattern
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 150;
    const endAngle = angle + (Math.PI * 1.5 * (Math.random() > 0.5 ? 1 : -1));
    
    setTimeout(() => {
      ribbon.style.transform = `
        translate(
          calc(-50% + ${Math.cos(endAngle) * distance}px), 
          calc(-50% + ${Math.sin(endAngle) * distance}px)
        ) 
        rotate(${endAngle + Math.PI/2}rad)
        scale(0.5)
      `;
      ribbon.style.opacity = '0';
    }, 10);

    // Remove the ribbon after animation
    setTimeout(() => {
      ribbon.remove();
    }, 1200);
  };

  // Create a magic burst effect
  const createMagicBurst = (x: number, y: number) => {
    const burst = document.createElement('div');
    burst.classList.add('animation-element');
    burst.style.position = 'absolute';
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    burst.style.width = '40px';
    burst.style.height = '40px';
    burst.style.borderRadius = '50%';
    burst.style.background = 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(129,199,132,0.6) 40%, rgba(77,182,172,0) 70%)';
    burst.style.transform = 'translate(-50%, -50%) scale(0.2)';
    burst.style.opacity = '1';
    burst.style.transition = 'all 0.6s cubic-bezier(0.215, 0.610, 0.355, 1.000)';
    container.appendChild(burst);

    // Animate the burst
    setTimeout(() => {
      burst.style.transform = 'translate(-50%, -50%) scale(5)';
      burst.style.opacity = '0';
    }, 10);

    // Remove the burst after animation
    setTimeout(() => {
      burst.remove();
    }, 600);
  };

  // Create the initial magic burst
  createMagicBurst(x, y);
  
  // Create multiple sparkles
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 80;
      const sparkleX = x + Math.cos(angle) * distance;
      const sparkleY = y + Math.sin(angle) * distance;
      createSparkle(sparkleX, sparkleY);
    }, i * 20);
  }
  
  // Create swirling ribbons
  for (let i = 0; i < 25; i++) {
    setTimeout(() => {
      createRibbon(x, y);
    }, i * 30);
  }
};

// --- Surprise Me Animations ---

export const FOOD_EMOJIS = [
  '🍕','🍣','🍔','🍩','🍉','🍦','🥑','🍟','🍗','🍜','🍰','🍇','🍤','🍞','🍪','🍿','🍎','🍫','🍋','🍒','🍭','🍧','🥨','🥕','🍄','🥦','🍤','🥚','🍔','🍟','🍕','🍩','🍦','🍉','🍇','🍓','🍒','🍑','🍍','🍌','🍋','🍊','🍎','🍏','🍐','🍈','🍅','🍆','🥑','🥒','🥬','🥦','🥕','🌽','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🧆','🌮','🌯','🥗','🥘','🍲','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🥛','🍼','☕','🍵','🧃','🥤','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🍾','🧊'
];
export const POSITIVE_FACES = ['😋','😍','😁','🤩','😃','😄','😆','😊','😺','😻'];

// 1. Fireworks Extravaganza (burst with food raining down)
export function fireworksExtravaganzaEffect(x: number, y: number, buttonElement?: HTMLElement) {
  clearExistingAnimations();
  const container = getOrCreateAnimationContainer();
  const totalFireworks = 9 + Math.floor(Math.random() * 2); // 9-10 fireworks
  const waveCount = 2 + Math.floor(Math.random() * 2); // 2-3 waves
  const fireworksPerWave = Math.ceil(totalFireworks / waveCount);

  for (let w = 0; w < waveCount; w++) {
    const waveDelay = w * 400;
    for (let i = 0; i < fireworksPerWave; i++) {
      const idx = w * fireworksPerWave + i;
      if (idx >= totalFireworks) break;
      // Spread burst points in a much wider, more dynamic cluster above the center
      const spreadX = (Math.random() - 0.5) * 840; // much wider horizontal spread
      // Vertical spread: some lower (-120), some higher (-320), random in between
      const spreadY = -120 - Math.random() * 200 + (Math.random() - 0.5) * 60;
      const launchX = x + (Math.random() - 0.5) * 40; // Launch close to center
      const launchY = y + 120 + Math.random() * 40;
      const peakX = x + spreadX;
      const peakY = y + spreadY;
      const delay = 120 + waveDelay;

      // Firework rocket (🎆)
      const element = document.createElement('div');
      element.classList.add('animation-element');
      element.style.position = 'fixed';
      element.style.left = `${launchX}px`;
      element.style.top = `${launchY}px`;
      element.style.fontSize = '36px';
      element.style.zIndex = '50';
      element.style.opacity = '0';
      element.textContent = '🎆';
      element.style.transition = 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
      container.appendChild(element);
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.left = `${peakX}px`;
        element.style.top = `${peakY}px`;
        element.style.transform = 'scale(1.25)';
      }, delay);
      setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.7)';
      }, delay + 700);

      // Burst effect: food emojis fly out and fall, with more spacing
      setTimeout(() => {
        // Glow at burst point
        const glow = document.createElement('div');
        glow.classList.add('animation-element');
        glow.style.position = 'fixed';
        glow.style.left = `${peakX}px`;
        glow.style.top = `${peakY}px`;
        glow.style.width = '80px';
        glow.style.height = '80px';
        glow.style.borderRadius = '50%';
        glow.style.background = 'radial-gradient(circle, #FFD700 0%, transparent 80%)';
        glow.style.opacity = '0.7';
        glow.style.transform = 'translate(-50%, -50%) scale(0.2)';
        glow.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        glow.style.zIndex = '51';
        container.appendChild(glow);
        setTimeout(() => {
          glow.style.opacity = '0';
          glow.style.transform = 'translate(-50%, -50%) scale(1.2)';
        }, 120);
        setTimeout(() => { glow.remove(); }, 600);

        // Food burst
        const burstCount = 13 + Math.floor(Math.random() * 4);
        const burstArc = Math.PI * (1.5 + Math.random() * 0.7); // 270-320 deg
        const burstStart = -Math.PI / 2 - burstArc / 2;
        for (let j = 0; j < burstCount; j++) {
          const angle = burstStart + (j / (burstCount - 1)) * burstArc + (Math.random() - 0.5) * 0.12;
          const burstDist = 80 + Math.random() * 60;
          const burstEmoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
          const burst = document.createElement('div');
          burst.classList.add('animation-element');
          burst.textContent = burstEmoji;
          burst.style.position = 'fixed';
          burst.style.left = `${peakX}px`;
          burst.style.top = `${peakY}px`;
          burst.style.fontSize = '24px';
          burst.style.opacity = '0.92';
          burst.style.zIndex = '55';
          burst.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
          container.appendChild(burst);
          setTimeout(() => {
            burst.style.left = `${peakX + Math.cos(angle) * burstDist}px`;
            burst.style.top = `${peakY + Math.sin(angle) * burstDist}px`;
            burst.style.opacity = '1';
            burst.style.transform = 'scale(1.25)';
          }, 60);
          // Fall down
          setTimeout(() => {
            burst.style.transition = 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
            burst.style.top = `${peakY + Math.sin(angle) * burstDist + 140 + Math.random() * 60}px`;
            burst.style.opacity = '0';
          }, 700);
          setTimeout(() => { burst.remove(); }, 1600);
        }
        // Sparkle
        for (let s = 0; s < 7; s++) {
          const sparkle = document.createElement('div');
          sparkle.classList.add('animation-element');
          sparkle.textContent = '✨';
          sparkle.style.position = 'fixed';
          sparkle.style.left = `${peakX}px`;
          sparkle.style.top = `${peakY}px`;
          sparkle.style.fontSize = '20px';
          sparkle.style.opacity = '0.8';
          sparkle.style.zIndex = '56';
          sparkle.style.transition = 'all 0.7s';
          container.appendChild(sparkle);
          setTimeout(() => {
            const angle = Math.random() * Math.PI * 2;
            const dist = 50 + Math.random() * 30;
            sparkle.style.left = `${peakX + Math.cos(angle) * dist}px`;
            sparkle.style.top = `${peakY + Math.sin(angle) * dist}px`;
            sparkle.style.opacity = '0';
          }, 80);
          setTimeout(() => { sparkle.remove(); }, 900);
        }
      }, delay + 700);
      setTimeout(() => { element.remove(); }, delay + 1200);
    }
  }
}

// 2. Food Emoji Parade
export function foodEmojiParadeEffect(x: number, y: number, buttonElement?: HTMLElement) {
  clearExistingAnimations();
  const container = getOrCreateAnimationContainer();
  // Chef emoji (random gender)
  const chef = Math.random() > 0.5 ? '👨‍🍳' : '👩‍🍳';
  const paradeCount = 10 + Math.floor(Math.random() * 4);
  const emojis = [chef];
  for (let i = 0; i < paradeCount; i++) {
    emojis.push(FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)]);
  }
  // Parade marching offscreen right, but chef stops at the end
  const paradeSpacing = 48;
  const paradeStartX = -60;
  const paradeEndX = window.innerWidth + 80;
  const chefEndX = Math.round(window.innerWidth * 0.9); // Chef stops at 90% of the screen width

  // Center parade vertically in the viewport, but move it further up
  const paradeCenterY = window.innerHeight / 2 - 120;
  const chefEndY = paradeCenterY + Math.floor(emojis.length / 2) * paradeSpacing;
  const chefWidth = 38; // Approximate width of the chef emoji
  const promptWidth = 260; // Approximate width of the prompt bubble
  const promptHeight = 60; // Approximate height of the prompt bubble
  // Offset: right edge of bubble is 16px to the left of chef's left edge
  let promptEndX = chefEndX - promptWidth - 16;
  const promptEndY = chefEndY - promptHeight - 12; // Above chef
  if (promptEndX < 16) promptEndX = 16;
  emojis.forEach((emoji, i) => {
    const element = document.createElement('div');
    element.classList.add('animation-element');
    element.textContent = emoji;
    element.style.position = 'fixed';
    // Center parade vertically
    const startY = paradeCenterY;
    element.style.left = `${paradeStartX - i * paradeSpacing}px`;
    element.style.top = `${startY + i * paradeSpacing}px`;
    element.style.fontSize = i === 0 ? '38px' : '32px';
    element.style.opacity = '0.97';
    element.style.zIndex = '50';
    element.style.transition = 'all 3.2s cubic-bezier(0.22, 1, 0.36, 1)';
    if (i === 0) element.classList.add('parade-chef-end');
    container.appendChild(element);
    setTimeout(() => {
      if (i === 0) {
        // Chef stops at the end
        element.style.left = `${chefEndX}px`;
        element.style.top = `${chefEndY}px`;
      } else {
        element.style.left = `${paradeEndX}px`;
      }
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
    }, 100 + i * 120);
    setTimeout(() => {
      if (i !== 0) element.style.opacity = '0';
    }, 2600 + i * 40);
    setTimeout(() => { if (i !== 0) element.remove(); }, 3400 + i * 40);
  });
  // Text bubble with random prompt, large, appears at top left of chef, like a speech bubble
  const prompts = [
    "Order ready!",
    "Come and get it!",
    "Your feast awaits!",
    "Fresh from the kitchen!",
    "Bon appétit!",
    "Ready to serve!",
    "Let's eat!",
    "Food up!"
  ];
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];
  // Calculate when the chef stops (matches parade animation duration and delay)
  const chefArriveDelay = 100 + 0 * 120 + 3200; // initial delay + chef index * step + parade duration
  // Show prompt when chef stops
  setTimeout(() => {
    const bubble = document.createElement('div');
    bubble.classList.add('animation-element');
    bubble.style.position = 'fixed';
    bubble.style.left = `${promptEndX}px`;
    bubble.style.top = `${promptEndY}px`;
    bubble.style.width = `${promptWidth}px`;
    bubble.style.padding = '22px 32px 22px 32px';
    bubble.style.background = '#fff';
    bubble.style.borderRadius = '28px 28px 28px 12px';
    bubble.style.boxShadow = '0 4px 16px rgba(0,0,0,0.13)';
    bubble.style.fontSize = '2.2rem';
    bubble.style.fontWeight = '700';
    bubble.style.color = '#222';
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateY(0)';
    bubble.style.transition = 'none';
    bubble.textContent = prompt;
    bubble.style.zIndex = '70';
    container.appendChild(bubble);
  }, chefArriveDelay);
  // Stampede of faces after bubble, across the whole screen, more variety, no more than twice per type
  const STAMPEDE_FACES_POOL = [
    '😋','🤤','😼','😺','😻','😈','😏','😽','😹','😸','😾','😿','🙀','😏','😈','😋','🤤','😺','😻','😼','😹','😸','😾','😿','🙀','😽','😺','😻','😼','😹','😸','😾','😿','🙀','😽','😏','😈'
  ];
  // Shuffle and limit to max 2 per type
  const faceCounts: Record<string, number> = {};
  const stampedeFaces: string[] = [];
  for (let i = 0; i < STAMPEDE_FACES_POOL.length && stampedeFaces.length < 18; i++) {
    const face = STAMPEDE_FACES_POOL[i];
    faceCounts[face] = (faceCounts[face] || 0) + 1;
    if (faceCounts[face] <= 2) {
      stampedeFaces.push(face);
    }
  }
  // Shuffle
  for (let i = stampedeFaces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [stampedeFaces[i], stampedeFaces[j]] = [stampedeFaces[j], stampedeFaces[i]];
  }
  setTimeout(() => {
    // Screen shake
    const shakeTarget = document.body;
    shakeTarget.style.transition = 'transform 0.1s';
    shakeTarget.style.transform = 'translate(0, 0)';
    let shakeCount = 0;
    const shake = () => {
      if (shakeCount < 8) {
        shakeTarget.style.transform = `translate(${(Math.random() - 0.5) * 16}px, ${(Math.random() - 0.5) * 10}px)`;
        shakeCount++;
        setTimeout(shake, 40);
      } else {
        shakeTarget.style.transform = 'translate(0, 0)';
      }
    };
    shake();
    // Fade out chef and prompt together
    const chefElem = container.querySelector('.parade-chef-end') as HTMLElement | null;
    const promptElem = Array.from(container.children).find(
      (el): el is HTMLElement => (el as HTMLElement).textContent === prompt
    );
    if (chefElem) {
      chefElem.style.transition = 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
      chefElem.style.opacity = '0';
      chefElem.style.transform = 'scale(0.8)';
      setTimeout(() => chefElem.remove(), 600);
    }
    if (promptElem && promptElem instanceof HTMLElement) {
      promptElem.style.transition = 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
      promptElem.style.opacity = '0';
      promptElem.style.transform = 'scale(0.8)';
      setTimeout(() => promptElem.remove(), 600);
    }
    for (let i = 0; i < stampedeFaces.length; i++) {
      const face = stampedeFaces[i];
      const faceElem = document.createElement('div');
      faceElem.classList.add('animation-element');
      faceElem.textContent = face;
      faceElem.style.position = 'fixed';
      faceElem.style.left = `${-120 - Math.random() * 80}px`;
      // Center stampede vertically as well
      faceElem.style.top = `${paradeCenterY + (Math.random() - 0.5) * 180 + Math.floor(emojis.length / 2) * paradeSpacing}px`;
      faceElem.style.fontSize = `${32 + Math.random() * 16}px`;
      faceElem.style.opacity = '0.98';
      faceElem.style.zIndex = '80';
      faceElem.style.transition = 'all 1.2s cubic-bezier(0.22, 1, 0.36, 1)';
      container.appendChild(faceElem);
      // Dust effect
      const dust = document.createElement('div');
      dust.classList.add('animation-element');
      dust.textContent = '💨';
      dust.style.position = 'fixed';
      dust.style.left = `${-120 - Math.random() * 80}px`;
      dust.style.top = `${parseFloat(faceElem.style.top) + 24}px`;
      dust.style.fontSize = '28px';
      dust.style.opacity = '0.7';
      dust.style.zIndex = '79';
      dust.style.transition = 'all 1.2s cubic-bezier(0.22, 1, 0.36, 1)';
      container.appendChild(dust);
      setTimeout(() => {
        faceElem.style.left = `${window.innerWidth + 200}px`;
        faceElem.style.opacity = '1';
        faceElem.style.transform = 'scale(1.1)';
        dust.style.left = `${window.innerWidth + 160}px`;
        dust.style.opacity = '0.2';
      }, 80 + i * 40);
      setTimeout(() => {
        faceElem.style.opacity = '0';
        dust.style.opacity = '0';
      }, 1100 + i * 30);
      setTimeout(() => { faceElem.remove(); dust.remove(); }, 1500 + i * 30);
    }
  }, chefArriveDelay + 400);
}

// 3. Magic Portal (suck in food, pop out positive face)
export function magicPortalEffect(x: number, y: number, buttonElement?: HTMLElement) {
  clearExistingAnimations();
  const container = getOrCreateAnimationContainer();
  // Main white portal
  const portal = document.createElement('div');
  portal.classList.add('animation-element');
  portal.style.position = 'absolute';
  portal.style.left = `${x}px`;
  portal.style.top = `${y}px`;
  portal.style.width = '120px';
  portal.style.height = '120px';
  portal.style.borderRadius = '50%';
  portal.style.background = 'radial-gradient(circle, #fff 60%, #e3f0ff 90%, rgba(255,255,255,0) 100%)';
  portal.style.boxShadow = '0 0 80px 30px #fff8, 0 0 40px 10px #b3e5fc88';
  portal.style.transform = 'translate(-50%, -50%) scale(0.7)';
  portal.style.zIndex = '60';
  portal.style.opacity = '0';
  portal.style.transition = 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
  container.appendChild(portal);
  setTimeout(() => {
    portal.style.opacity = '1';
    portal.style.transform = 'translate(-50%, -50%) scale(1.1)';
  }, 50);

  // Small dark portal at center (initially hidden)
  const darkPortal = document.createElement('div');
  darkPortal.classList.add('animation-element');
  darkPortal.style.position = 'absolute';
  darkPortal.style.left = `${x}px`;
  darkPortal.style.top = `${y}px`;
  darkPortal.style.width = '38px';
  darkPortal.style.height = '38px';
  darkPortal.style.borderRadius = '50%';
  darkPortal.style.background = 'radial-gradient(circle, #222 60%, #000 100%)';
  darkPortal.style.boxShadow = '0 0 18px 6px #000b';
  darkPortal.style.transform = 'translate(-50%, -50%) scale(0.2)';
  darkPortal.style.zIndex = '70';
  darkPortal.style.opacity = '0';
  darkPortal.style.transition = 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
  container.appendChild(darkPortal);

  // Food emoji swirls into the portal
  const food = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
  const swirlSteps = 36;
  const swirlRadius = 180 + Math.random() * 60;
  const swirlStartAngle = Math.random() * Math.PI * 2;
  const foodElem = document.createElement('div');
  foodElem.classList.add('animation-element');
  foodElem.textContent = food;
  foodElem.style.position = 'absolute';
  foodElem.style.left = `${x + Math.cos(swirlStartAngle) * swirlRadius}px`;
  foodElem.style.top = `${y + Math.sin(swirlStartAngle) * swirlRadius}px`;
  foodElem.style.fontSize = '38px';
  foodElem.style.zIndex = '75';
  foodElem.style.opacity = '1';
  foodElem.style.transition = 'none';
  container.appendChild(foodElem);

  // Store the font size for reuse
  const foodFontSize = 38;
  foodElem.style.fontSize = foodFontSize + 'px';

  // Animate swirl
  for (let i = 1; i <= swirlSteps; i++) {
    setTimeout(() => {
      const angle = swirlStartAngle + i * Math.PI * 1.2 / swirlSteps; // spiral in
      const radius = swirlRadius * (1 - i / swirlSteps);
      foodElem.style.left = `${x + Math.cos(angle) * radius}px`;
      foodElem.style.top = `${y + Math.sin(angle) * radius}px`;
      foodElem.style.transform = `translate(-50%, -50%) scale(${1 - i / (swirlSteps * 1.2)}) rotate(${i * 40}deg)`;
      foodElem.style.opacity = `${1 - i / (swirlSteps * 1.1)}`;
      // Reveal dark portal as emoji gets close
      if (i > swirlSteps * 0.6) {
        darkPortal.style.opacity = `${(i - swirlSteps * 0.6) / (swirlSteps * 0.4)}`;
        darkPortal.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    }, i * 22);
  }
  // Fade out at the end
  setTimeout(() => {
    foodElem.style.opacity = '0';
    foodElem.style.transform = 'translate(-50%, -50%) scale(0.2) rotate(900deg)';
    darkPortal.style.opacity = '1';
    darkPortal.style.transform = 'translate(-50%, -50%) scale(1.2)';
  }, swirlSteps * 22 + 60);
  setTimeout(() => { foodElem.remove(); }, swirlSteps * 22 + 400);

  // After food disappears, show twinkle (same size as emoji), then saucer with the same food emoji
  setTimeout(() => {
    // Twinkle at center, small like the moment the emoji first disappeared
    const twinkle = document.createElement('div');
    twinkle.classList.add('animation-element');
    twinkle.textContent = '✨';
    twinkle.style.position = 'absolute';
    twinkle.style.left = `${x}px`;
    twinkle.style.top = `${y}px`;
    twinkle.style.fontSize = (foodFontSize * 0.2) + 'px';
    twinkle.style.zIndex = '95';
    twinkle.style.opacity = '0';
    twinkle.style.transform = 'translate(-50%, -50%) scale(1)';
    twinkle.style.transition = 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
    container.appendChild(twinkle);
    setTimeout(() => {
      twinkle.style.opacity = '1';
      twinkle.style.transform = 'translate(-50%, -50%) scale(1.4)';
    }, 60);
    setTimeout(() => {
      twinkle.style.opacity = '0';
      twinkle.style.transform = 'translate(-50%, -50%) scale(0.7)';
    }, 600);
    setTimeout(() => { twinkle.remove(); }, 1000);
    // Saucer and food emoji appear together after twinkle
    setTimeout(() => {
      const group = document.createElement('div');
      group.classList.add('animation-element');
      group.style.position = 'absolute';
      group.style.left = `${x}px`;
      group.style.top = `${y + 10}px`;
      group.style.zIndex = '90';
      group.style.opacity = '0';
      group.style.transition = 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
      group.style.display = 'flex';
      group.style.alignItems = 'center';
      group.style.justifyContent = 'center';
      // Saucer
      const saucer = document.createElement('span');
      saucer.textContent = '🛸';
      saucer.style.fontSize = '48px';
      saucer.style.marginRight = '6px';
      // Food emoji (same as swirled in)
      const foodClone = document.createElement('span');
      foodClone.textContent = food;
      foodClone.style.fontSize = foodFontSize + 'px';
      group.appendChild(saucer);
      group.appendChild(foodClone);
      container.appendChild(group);
      // Fade in and hover
      setTimeout(() => {
        group.style.opacity = '1';
        group.style.transform = 'translate(-50%, -50%) scale(1.1)';
      }, 80);
      // Hover up and down
      setTimeout(() => {
        group.style.transition = 'all 0.5s cubic-bezier(0.4, 1.6, 0.4, 1)';
        group.style.top = `${y - 10}px`;
      }, 500);
      setTimeout(() => {
        group.style.top = `${y + 10}px`;
      }, 900);
      // Fade out
      setTimeout(() => {
        group.style.opacity = '0';
        group.style.transform = 'translate(-50%, -50%) scale(0.7)';
      }, 1400);
      setTimeout(() => { group.remove(); }, 1800);
    }, 400); // saucer+food appears after twinkle
  }, swirlSteps * 22 + 400);

  // Portal closes
  setTimeout(() => {
    portal.style.opacity = '0';
    portal.style.transform = 'translate(-50%, -50%) scale(0.5)';
    darkPortal.style.opacity = '0';
    darkPortal.style.transform = 'translate(-50%, -50%) scale(0.2)';
  }, swirlSteps * 22 + 1200);
  setTimeout(() => { portal.remove(); darkPortal.remove(); }, swirlSteps * 22 + 1700);
} 