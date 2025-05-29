import { FoodMode } from './constants';

export interface RoomNameInputProps {
  roomName: string;
  setRoomName: (name: string) => void;
  foodMode: FoodMode;
  isLoading: boolean;
}

export interface FoodModeSelectorProps {
  foodMode: FoodMode;
  handleFoodModeChange: (mode: FoodMode) => void;
  isLoading: boolean;
}

export interface StepBasicInfoProps {
  roomName: string;
  setRoomName: (name: string) => void;
  selectedCuisines: string[];
  setSelectedCuisines: (cuisines: string[]) => void;
  priceRange: string[];
  setPriceRange: (range: string[]) => void;
  radius: number;
  setRadius: (radius: number) => void;
  isLoading: boolean;
  foodMode: FoodMode | null;
  setFoodMode: ((mode: FoodMode | null) => void) | undefined;
  completedSections?: {
    foodMode: boolean;
    diningOptions: boolean;
    cuisineTypes: boolean;
    cookingOptions: boolean;
  };
  setCompletedSections?: (sections: {
    foodMode: boolean;
    diningOptions: boolean;
    cuisineTypes: boolean;
    cookingOptions: boolean;
  }) => void;
}

export interface CuisineSelectorProps {
  selectedCuisines: string[];
  setSelectedCuisines: (cuisines: string[]) => void;
  foodMode: FoodMode;
  isLoading: boolean;
  dietaryRestrictions: string[];
  setDietaryRestrictions: (restrictions: string[]) => void;
}

export interface DiningModeContentProps {
  priceRange: string[];
  setPriceRange: (range: string[]) => void;
  radius: number;
  setRadius: (radius: number) => void;
  foodMode: FoodMode;
  isLoading: boolean;
}

export interface CookingModeContentProps {
  recipeDifficulty: 'easy' | 'medium' | 'challenging' | '';
  setRecipeDifficulty: (difficulty: 'easy' | 'medium' | 'challenging' | '') => void;
  cookingTime: number;
  setCookingTime: (time: number) => void;
  isLoading: boolean;
}

export interface AllCuisinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  cuisines: Array<{ id: string; name: string; emoji: string; popular?: boolean }>;
  selectedCuisines: string[];
  setSelectedCuisines: (cuisines: string[]) => void;
  foodMode: FoodMode;
}

export interface AnimationProps {
  foodMode: FoodMode;
} 