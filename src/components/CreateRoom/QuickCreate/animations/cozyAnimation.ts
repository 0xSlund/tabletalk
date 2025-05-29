import { clearExistingAnimations, getOrCreateAnimationContainer } from './animationUtils';
import { fireworksExtravaganzaEffect, foodEmojiParadeEffect, magicPortalEffect } from './surpriseAnimation';

/**
 * Create a cozy gathering animation with conversations, food, and activities
 * @param x The x coordinate of the click/center point
 * @param y The y coordinate of the click/center point
 * @param buttonElement Optional button element to center the animation on
 */
export const triggerCozyAnimation = (x: number, y: number, buttonElement?: HTMLElement): void => {
  // Clear any existing animations first
  clearExistingAnimations();

  // Get or create animation container
  const container = getOrCreateAnimationContainer();

  // Track used topics to prevent repetition
  const usedTopics = new Set<number>();

  // Always prioritize the button element if provided
  if (buttonElement) {
    const rect = buttonElement.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  }

  // Define conversation topics with themed emojis
  const conversationTopics = [
    { 
      question: 'movie night?', 
      response: "Let's order out!",
      emojis: ['🎬', '🍿', '🎥', '📽️', '🎞️'],
      reactionEmoji: '😊'
    },
    { 
      question: 'game night!', 
      response: "Let's make nachos and guac!",
      emojis: ['🎮', '🎲', '🎯', '🎪', '🎭'],
      reactionEmoji: '🤩'
    },
    { 
      question: 'dinner soon?', 
      response: "How about homemade pasta?",
      emojis: ['🍽️', '🍴', '🥗', '🍕', '🍷'],
      reactionEmoji: '😋'
    },
    { 
      question: 'brunch tomorrow?', 
      response: 'How about pancakes delivery?',
      emojis: ['🥞', '☕', '🥐', '🍳', '🥑'],
      reactionEmoji: '😍'
    },
    { 
      question: 'pizza party?', 
      response: 'Pizza sounds perfect',
      emojis: ['🍕', '🧀', '🍅', '🌶️', '🍺'],
      reactionEmoji: '🤤'
    },
    { 
      question: 'weekend plans?',
      response: "Let's bake cookies together!",
      emojis: ['📅', '🏙️', '✨', '🏞️', '🚗'],
      reactionEmoji: '🙂'
    },
    { 
      question: 'beach day?', 
      response: "Let's pack some snacks!",
      emojis: ['🏖️', '🌊', '🌞', '👙', '🐚'],
      reactionEmoji: '😎'
    },
    { 
      question: 'movie marathon?', 
      response: 'Popcorn and delivery, please!',
      emojis: ['🍿', '🎬', '🛋️', '🎞️', '🥤'],
      reactionEmoji: '😁'
    },
    { 
      question: 'game day?', 
      response: 'Wings and fries delivery?',
      emojis: ['🏈', '🏀', '⚽', '🥅', '🎽'],
      reactionEmoji: '🏆'
    }
  ];

  // Get random unique conversation topics
  const getRandomUniqueTopics = (count: number) => {
    const result = [];
    const availableIndices = Array.from({ length: conversationTopics.length }, (_, i) => i)
      .filter(i => !usedTopics.has(i));
    
    // If we don't have enough unused topics, clear the set
    if (availableIndices.length < count) {
      usedTopics.clear();
      availableIndices.push(...Array.from({ length: conversationTopics.length }, (_, i) => i));
    }
    
    // Randomly select indices
    while (result.length < count && availableIndices.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      const topicIndex = availableIndices[randomIndex];
      result.push(topicIndex);
      usedTopics.add(topicIndex);
      availableIndices.splice(randomIndex, 1);
    }
    
    return result.map(index => conversationTopics[index]);
  };

  // Create subtle ambient glow
  const createAmbientGlow = () => {
    const glow = document.createElement('div');
    glow.classList.add('animation-element');
    glow.style.position = 'absolute';
    glow.style.left = `${x}px`;
    glow.style.top = `${y}px`;
    glow.style.width = '100px';
    glow.style.height = '100px';
    glow.style.borderRadius = '50%';
    glow.style.background = 'radial-gradient(circle, rgba(255,245,215,0.3) 0%, rgba(255,235,195,0.15) 50%, rgba(255,235,195,0) 80%)';
    glow.style.transform = 'translate(-50%, -50%) scale(0.8)';
    glow.style.opacity = '0';
    glow.style.transition = 'all 1.5s ease-out';
    glow.style.zIndex = '30';
    container.appendChild(glow);

    // Animate in
    setTimeout(() => {
      // Make the glow taller for vertical layout
      glow.style.transform = 'translate(-50%, -50%) scale(2.2, 2.8)';
      glow.style.opacity = '1';
    }, 100);

    // Clean up at the end
    setTimeout(() => {
      glow.style.opacity = '0';
    }, 9500);

    setTimeout(() => {
      glow.remove();
    }, 10000);
  };

  // Calculate the available display area within the card
  const getMessageArea = () => {
    const cardWidth = buttonElement ? buttonElement.offsetWidth : 300;
    const cardHeight = buttonElement ? buttonElement.offsetHeight : 200;
    
    // Create a smaller area within the card for messages, taller for vertical layout
    return {
      width: cardWidth * 0.7,
      height: cardHeight * 0.7, // Increased height for vertical layout
      centerX: x,
      centerY: y
    };
  };

  // --- Typing indicator ---
  const createTypingIndicator = (left: number, top: number, zIndex: number) => {
    const indicator = document.createElement('div');
    indicator.classList.add('animation-element');
    indicator.style.position = 'fixed';
    indicator.style.left = `${left}px`;
    indicator.style.top = `${top}px`;
    indicator.style.width = '44px';
    indicator.style.height = '28px';
    indicator.style.background = 'rgba(255,255,255,0.97)';
    indicator.style.borderRadius = '16px';
    indicator.style.display = 'flex';
    indicator.style.alignItems = 'center';
    indicator.style.justifyContent = 'center';
    indicator.style.fontSize = '1.15rem';
    indicator.style.color = '#888';
    indicator.style.boxShadow = '0 3px 12px rgba(0,0,0,0.10)';
    indicator.style.zIndex = String(zIndex);
    indicator.style.opacity = '0';
    indicator.style.transition = 'all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    indicator.textContent = '...';
    container.appendChild(indicator);
    setTimeout(() => { indicator.style.opacity = '1'; }, 80);
    return indicator;
  };

  // --- Refined createMessageBubble ---
  const createMessageBubble = (
    message: string,
    isQuestion: boolean,
    delay: number,
    onComplete: () => void,
    verticalOffset: number = 0
  ) => {
    const messageArea = getMessageArea();
    const bubble = document.createElement('div');
    bubble.classList.add('animation-element');
    bubble.classList.add('message-bubble');
    bubble.style.position = 'fixed';
    bubble.style.maxWidth = '210px';
    bubble.style.padding = '14px 24px';
    bubble.style.fontSize = '1.04rem';
    bubble.style.fontWeight = '500';
    bubble.style.boxShadow = '0 4px 18px rgba(0,0,0,0.13)';
    bubble.style.zIndex = '40';
    bubble.style.opacity = '0';
    bubble.style.transition = 'all 0.55s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    bubble.textContent = message;
    // Position and style
    if (isQuestion) {
      bubble.style.left = `${messageArea.centerX - 48}px`;
      bubble.style.top = `${messageArea.centerY - 48 + verticalOffset}px`;
      bubble.style.transform = 'translate(-50%, -50%) scale(0.85)';
      bubble.style.borderRadius = '20px 20px 20px 7px';
      bubble.style.backgroundColor = '#34C759'; // iMessage green
      bubble.style.color = '#FFFFFF';
    } else {
      bubble.style.left = `${messageArea.centerX + 48}px`;
      bubble.style.top = `${messageArea.centerY + 48 + verticalOffset}px`;
      bubble.style.transform = 'translate(-50%, -50%) scale(0.85)';
      bubble.style.borderRadius = '20px 20px 7px 20px';
      bubble.style.backgroundColor = '#007AFF'; // iMessage blue
      bubble.style.color = '#FFFFFF';
    }
    container.appendChild(bubble);
    // Animate in
    setTimeout(() => {
      bubble.style.opacity = '1';
      bubble.style.transform = 'translate(-50%, -50%) scale(1.07)';
    }, delay);
    setTimeout(() => {
      bubble.style.transform = 'translate(-50%, -50%) scale(1)';
    }, delay + 120);
    // Fade out when done (linger less)
    setTimeout(() => {
      bubble.style.opacity = '0';
      bubble.style.transform = isQuestion
        ? 'translate(-50%, -90%) scale(0.8)'
        : 'translate(-50%, -10%) scale(0.8)';
    }, delay + 2000);
    setTimeout(() => {
      bubble.remove();
      onComplete();
    }, delay + 2300);
    return bubble;
  };

  // --- Refined createEmoji ---
  const createEmoji = (
    emoji: string,
    index: number,
    totalEmojis: number,
    delay: number,
    verticalOffset: number = 0
  ) => {
    const messageArea = getMessageArea();
    const bubbleWidth = 210;
    const bubbleHeight = 44;
    const arcRadius = bubbleHeight / 2 + 14;
    const arcSpread = Math.PI / 1.5;
    const arcStart = Math.PI + Math.PI / 2 - arcSpread / 2;
    const angle = arcStart + (index / (totalEmojis - 1 || 1)) * arcSpread;
    const centerX = messageArea.centerX - 48;
    const centerY = messageArea.centerY - 48 + verticalOffset;
    const emojiX = centerX + Math.cos(angle) * (bubbleWidth / 2);
    const emojiY = centerY + Math.sin(angle) * arcRadius;
    const element = document.createElement('div');
    element.classList.add('animation-element');
    element.classList.add('message-emoji');
    element.style.position = 'fixed';
    element.style.left = `${emojiX}px`;
    element.style.top = `${emojiY}px`;
    element.style.width = '32px';
    element.style.height = '32px';
    element.style.borderRadius = '50%';
    element.style.backgroundColor = 'rgba(255, 255, 255, 0.97)';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.fontSize = '20px';
    element.style.transform = 'translate(-50%, -50%) scale(0)';
    element.style.opacity = '0';
    element.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    element.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
    element.style.zIndex = '50';
    element.textContent = emoji;
    container.appendChild(element);
    const rotation = (Math.random() - 0.5) * 10;
    setTimeout(() => {
      element.style.transform = `translate(-50%, -50%) scale(1.13) rotate(${rotation}deg)`;
      element.style.opacity = '1';
    }, delay + index * 110);
    setTimeout(() => {
      element.style.transform = `translate(-50%, -50%) scale(1) rotate(${rotation}deg)`;
    }, delay + index * 110 + 180);
    setTimeout(() => {
      element.style.transition = 'all 1.6s ease-in-out';
      const floatX = (Math.random() - 0.5) * 10;
      const floatY = (Math.random() - 0.5) * 7;
      element.style.transform = `translate(-50%, -50%) scale(1) rotate(${rotation}deg) translate(${floatX}px, ${floatY}px)`;
    }, delay + index * 110 + 500);
    setTimeout(() => {
      element.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
      element.style.opacity = '0';
      element.style.transform = `translate(-50%, -90%) scale(0.6) rotate(${rotation}deg)`;
    }, delay + 2000);
    setTimeout(() => {
      element.remove();
    }, delay + 2350);
  };

  // --- Refined createReactionEmoji ---
  const createReactionEmoji = (
    emoji: string,
    delay: number,
    verticalOffset: number = 0
  ) => {
    const messageArea = getMessageArea();
    const bubbleWidth = 210;
    const bubbleHeight = 36;
    const edgePadding = 24;
    const halfBubbleWidth = bubbleWidth / 2 + edgePadding;
    const halfBubbleHeight = bubbleHeight / 2 + edgePadding;
    const angle = Math.random() * Math.PI * 2;
    const emojiX = messageArea.centerX + 48 + Math.cos(angle) * halfBubbleWidth;
    const emojiY = messageArea.centerY + 48 + Math.sin(angle) * halfBubbleHeight + verticalOffset;
    const element = document.createElement('div');
    element.classList.add('animation-element');
    element.classList.add('reaction-emoji');
    element.style.position = 'fixed';
    element.style.left = `${emojiX}px`;
    element.style.top = `${emojiY}px`;
    element.style.width = '42px';
    element.style.height = '42px';
    element.style.borderRadius = '50%';
    element.style.backgroundColor = 'rgba(255, 255, 255, 0.97)';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.fontSize = '26px';
    element.style.transform = 'translate(-50%, -50%) scale(0)';
    element.style.opacity = '0';
    element.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    element.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
    element.style.zIndex = '60';
    element.textContent = emoji;
    container.appendChild(element);
    setTimeout(() => {
      element.style.transform = 'translate(-50%, -50%) scale(1.18)';
      element.style.opacity = '1';
    }, delay + 120);
    setTimeout(() => {
      element.style.transform = 'translate(-50%, -50%) scale(1)';
    }, delay + 320);
    setTimeout(() => {
      element.style.transition = 'all 1.6s ease-in-out';
      const floatX = (Math.random() - 0.5) * 10;
      const floatY = (Math.random() - 0.5) * 8;
      element.style.transform = `translate(-50%, -50%) scale(1) translate(${floatX}px, ${floatY}px)`;
    }, delay + 600);
    // Pulse
    setTimeout(() => {
      element.style.transform = 'translate(-50%, -50%) scale(1.13)';
    }, delay + 1200);
    setTimeout(() => {
      element.style.transform = 'translate(-50%, -50%) scale(1)';
    }, delay + 1400);
    setTimeout(() => {
      element.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
      element.style.opacity = '0';
      element.style.transform = 'translate(-30%, -50%) scale(0.6)';
    }, delay + 2000);
    setTimeout(() => {
      element.remove();
    }, delay + 2350);
  };

  // --- Refined showConversationPair ---
  const showConversationPair = (topic: any, delay: number, onComplete: () => void, verticalOffset: number = 0) => {
    // Clamp vertical offset to between -40px and +120px
    const clampedOffset = Math.max(Math.min(verticalOffset, 120), -40);
    // Randomly select 2-4 unique emojis for this message
    const numEmojis = Math.floor(Math.random() * 3) + 2;
    const shuffled = [...topic.emojis].sort(() => Math.random() - 0.5);
    const selectedEmojis = shuffled.slice(0, numEmojis);
    // Create question message
    createMessageBubble(
      topic.question,
      true,
      delay,
      () => {},
      clampedOffset
    );
    // Create emojis surrounding the question message
    selectedEmojis.forEach((emoji: string, index: number) => {
      createEmoji(
        emoji,
        index,
        selectedEmojis.length,
        delay + 60,
        clampedOffset
      );
    });
    // Typing indicator before response
    const messageArea = getMessageArea();
    const typingIndicator = createTypingIndicator(
      messageArea.centerX + 48,
      messageArea.centerY + 48 + clampedOffset + 32,
      55
    );
    setTimeout(() => {
      typingIndicator.style.opacity = '0';
    }, delay + 900);
    setTimeout(() => {
      typingIndicator.remove();
    }, delay + 1100);
    // Create response with typing delay
    const responseDelay = delay + 1100;
    createMessageBubble(
      topic.response,
      false,
      responseDelay,
      onComplete,
      clampedOffset
    );
    // Create a single reaction emoji for the response
    if (topic.reactionEmoji) {
      createReactionEmoji(
        topic.reactionEmoji,
        responseDelay,
        clampedOffset
      );
    }
  };

  // --- Refined animation sequence ---
  createAmbientGlow();
  const topics = getRandomUniqueTopics(4);
  let currentPair = 0;
  const maxVisiblePairs = 2;
  const showNextPair = () => {
    if (currentPair < topics.length) {
      // Calculate vertical offset for scrolling effect
      const verticalOffset = (currentPair - Math.max(0, currentPair - maxVisiblePairs + 1)) * 90;
      const delay = currentPair === 0 ? 80 : 200;
      showConversationPair(
        topics[currentPair],
        delay,
        () => {
          currentPair++;
          showNextPair();
        },
        verticalOffset * -1 // Move up as more pairs appear
      );
    }
  };
  showNextPair();
};

// --- Surprise Me Animations ---

let surpriseEffectQueue: number[] = [];
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
export function triggerSurpriseMeAnimation(x: number, y: number, buttonElement?: HTMLElement) {
  const effects = [fireworksExtravaganzaEffect, foodEmojiParadeEffect, magicPortalEffect];
  if (surpriseEffectQueue.length === 0) {
    surpriseEffectQueue = shuffleArray([0, 1, 2]);
  }
  const idx = surpriseEffectQueue.shift()!;
  effects[idx](x, y, buttonElement);
} 