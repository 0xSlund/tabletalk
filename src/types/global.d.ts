// Global type declarations for the app

interface TabletalkState {
  showVotingResults?: boolean;
  showOlympicResults?: boolean;
  userVotes?: Record<string, string>;
  otherUserVotesData?: Record<string, { reaction: string, name: string }>;
  votesMap?: Record<string, string>;
  votesBySuggestion?: Record<string, { count: number, userIds: string[] }>;
  roomExpired?: boolean;
  noVotes?: boolean;
  noOptions?: boolean;
  suggestions?: any[];
  [key: string]: any;
}

declare global {
  interface Window {
    __tabletalk_state?: TabletalkState;
  }
}

export {}; 