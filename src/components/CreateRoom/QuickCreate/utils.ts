/**
 * Gets an appropriate greeting based on the time of day
 */
export const getTimePeriodGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Evening';
  } else {
    return 'Night';
  }
};

/**
 * Formats a number to display like $, $$, or $$$ based on price range value
 */
export const formatPriceRange = (value: string): string => {
  switch (value) {
    case '$':
      return '$';
    case '$$':
      return '$$';
    case '$$$':
      return '$$$';
    case '$$$$':
      return '$$$$';
    default:
      return '$$';
  }
};

/**
 * Formats a radius value with the appropriate unit
 */
export const formatRadius = (value: number): string => {
  return `${value} ${value === 1 ? 'mile' : 'miles'}`;
}; 