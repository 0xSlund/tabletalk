import { FilteredRecipe, MealType } from '../../lib/database.functions';

export type SuggestionWithVote = FilteredRecipe & {
  userVote?: 'yes' | 'no' | null;
  votedAt?: Date;
};

export interface FilterOption {
  value: MealType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export interface SuggestionCardProps {
  suggestion: SuggestionWithVote;
  onVote: (vote: 'yes' | 'no') => void;
  onSave: () => void;
}

export interface FilterPanelProps {
  showFilters: boolean;
  selectedFilter: MealType;
  onClose: () => void;
  onFilterChange: (filter: MealType) => void;
  onApplyFilters: () => void;
}

export interface StartScreenProps {
  onStart: () => void;
}

export interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

export interface SuggestionScreenProps {
  suggestion: SuggestionWithVote;
  onVote: (vote: 'yes' | 'no') => void;
  onSave: () => void;
}

export interface EmptyStateProps {
  onLoad: () => void;
} 