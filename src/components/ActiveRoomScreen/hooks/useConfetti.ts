import { useRef, useCallback } from 'react';
import { confettiConfig } from '../utils/animations';

interface UseConfettiReturn {
  confettiCanvasRef: React.RefObject<HTMLCanvasElement>;
  triggerConfetti: () => void;
}

export const useConfetti = (): UseConfettiReturn => {
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const triggerConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous confetti
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions to match window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create confetti particles
    const particles: Particle[] = [];
    const particleCount = confettiConfig.elementCount;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(canvas));
    }
    
    // Animate confetti
    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (particles.length === 0) {
        cancelAnimationFrame(animationFrame);
        return;
      }
      
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        if (particle.y > canvas.height || particle.alpha <= 0) {
          particles.splice(i, 1);
          i--;
          continue;
        }
        
        updateParticle(particle);
        drawParticle(ctx, particle);
      }
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);
  
  return { confettiCanvasRef, triggerConfetti };
};

// Helper types and functions
interface Particle {
  x: number;
  y: number;
  color: string;
  velocity: { x: number; y: number };
  size: number;
  alpha: number;
  rotation: number;
}

function createParticle(canvas: HTMLCanvasElement): Particle {
  const colors = confettiConfig.colors;
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    color: colors[Math.floor(Math.random() * colors.length)],
    velocity: {
      x: (Math.random() - 0.5) * 5,
      y: Math.random() * 3 + 2
    },
    size: Math.random() * 6 + 4,
    alpha: 1,
    rotation: Math.random() * 360
  };
}

function updateParticle(particle: Particle): void {
  particle.velocity.y += 0.1; // Gravity
  particle.x += particle.velocity.x;
  particle.y += particle.velocity.y;
  particle.alpha -= 0.005;
  particle.rotation += 1;
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
  ctx.save();
  ctx.globalAlpha = particle.alpha;
  ctx.fillStyle = particle.color;
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation * Math.PI / 180);
  
  // Draw a small rectangle for the confetti
  ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
  
  ctx.restore();
} 