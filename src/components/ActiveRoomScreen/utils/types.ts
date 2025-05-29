/**
 * Common types used across ActiveRoomScreen components
 */

export interface FoodSuggestion {
  id: string;
  name: string;
  emoji: string;
  description: string;
  votes?: number;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  expiresAt: string;
  participants: User[];
  suggestions: FoodSuggestion[];
  messages: Message[];
  votes: Record<string, string>; // userId -> suggestionId
  phase: 'suggestion' | 'discussion' | 'voting' | 'results';
  winningOptions?: Record<string, string>; // suggestionId -> optionId
}

export interface RoomState {
  isLoading: boolean;
  error: string | null;
  showAddForm: boolean;
  roomExpired: boolean;
  remainingTime: number;
  topPick: string | null;
}

export type RoomPhase = 'suggestion' | 'discussion' | 'voting' | 'results'; 