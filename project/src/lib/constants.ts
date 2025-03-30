// App Configuration
export const APP_CONFIG = {
  name: 'TableTalk',
  version: '1.0.0',
  description: 'A collaborative food decision making app',
  maxRoomParticipants: 50,
  maxSuggestionsPerRoom: 20,
  maxOptionsPerSuggestion: 10,
  defaultRoomExpiryMinutes: 30,
  maxMessageLength: 500,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  auth: '/auth/v1',
  rest: '/rest/v1',
  realtime: '/realtime/v1',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  theme: 'tabletalk-theme',
  authToken: 'tabletalk-auth-token',
  userPreferences: 'tabletalk-user-preferences',
  recentRooms: 'tabletalk-recent-rooms',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  auth: {
    invalidCredentials: 'Invalid email or password',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    weakPassword: 'Password must be at least 8 characters long',
    emailExists: 'An account with this email already exists',
    accountNotFound: 'No account found with this email',
  },
  room: {
    notFound: 'Room not found',
    expired: 'This room has expired',
    full: 'Room is at maximum capacity',
    invalidCode: 'Invalid room code',
    createFailed: 'Failed to create room',
    joinFailed: 'Failed to join room',
  },
  network: {
    offline: 'You are currently offline',
    connectionError: 'Connection error. Please try again',
  },
  validation: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    invalidUrl: 'Please enter a valid URL',
    maxLength: (max: number) => `Maximum length is ${max} characters`,
  },
} as const;

// Animation Variants
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
  },
} as const;

// Form Validation Rules
export const VALIDATION_RULES = {
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: 'Please enter a valid email address',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
  },
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: 'Username can only contain letters, numbers, underscores, and hyphens',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Date Formats
export const DATE_FORMATS = {
  full: 'MMMM dd, yyyy',
  short: 'MM/dd/yyyy',
  time: 'h:mm a',
  datetime: 'MM/dd/yyyy h:mm a',
} as const;

// Theme Colors
export const COLORS = {
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
} as const;