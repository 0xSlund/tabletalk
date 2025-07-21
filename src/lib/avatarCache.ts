// Avatar caching utility to prevent excessive external API calls
// This caches avatar URLs to prevent repeated requests to dicebear.com

const AVATAR_CACHE_KEY = 'tabletalk-avatar-cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface AvatarCacheEntry {
  url: string;
  timestamp: number;
}

class AvatarCache {
  private cache: Map<string, AvatarCacheEntry>;

  constructor() {
    this.cache = new Map();
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(AVATAR_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, value]) => {
          this.cache.set(key, value as AvatarCacheEntry);
        });
      }
    } catch (error) {
      console.error('Failed to load avatar cache:', error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      localStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Failed to save avatar cache:', error);
    }
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > CACHE_DURATION;
  }

  getAvatarUrl(userId: string, userAvatarUrl?: string | null): string {
    // If user has a custom avatar URL, use it directly
    if (userAvatarUrl) {
      return userAvatarUrl;
    }

    // Check cache first
    const cacheKey = `avatar-${userId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isExpired(cached.timestamp)) {
      return cached.url;
    }

    // Generate deterministic avatar URL
    // Use a local SVG instead of external API
    const avatarUrl = this.generateLocalAvatar(userId);
    
    // Cache the result
    this.cache.set(cacheKey, {
      url: avatarUrl,
      timestamp: Date.now()
    });
    
    this.saveToLocalStorage();
    
    return avatarUrl;
  }

  private generateLocalAvatar(userId: string): string {
    // Generate a simple SVG avatar locally instead of using external API
    // This prevents thousands of external requests
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    
    // Use userId to deterministically pick a color
    const colorIndex = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const bgColor = colors[colorIndex];
    
    // Get initials from userId (first 2 characters)
    const initials = userId.substring(0, 2).toUpperCase();
    
    // Create a data URI for the SVG
    const svg = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="50" fill="${bgColor}"/>
        <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" 
              text-anchor="middle" dy=".35em" fill="white">${initials}</text>
      </svg>
    `.trim();
    
    // Convert to data URI
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  clear(): void {
    this.cache.clear();
    localStorage.removeItem(AVATAR_CACHE_KEY);
  }
}

// Export singleton instance
export const avatarCache = new AvatarCache();

// Helper function for components
export function getCachedAvatarUrl(userId: string, userAvatarUrl?: string | null): string {
  return avatarCache.getAvatarUrl(userId, userAvatarUrl);
} 