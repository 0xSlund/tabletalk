import React from 'react';
import { 
  UtensilsCrossed, Coffee, Utensils, Cake, Apple, Soup
} from 'lucide-react';
import { FilterOption } from './types';

export const filterOptions: FilterOption[] = [
  {
    value: 'all',
    label: 'All Meals',
    description: 'Show suggestions from all meal types',
    icon: React.createElement(UtensilsCrossed, { className: "w-6 h-6" })
  },
  {
    value: 'breakfast',
    label: 'Breakfast',
    description: 'Morning meals and brunch options',
    icon: React.createElement(Coffee, { className: "w-6 h-6" })
  },
  {
    value: 'main_course',
    label: 'Main Course',
    description: 'Hearty main dishes for lunch or dinner',
    icon: React.createElement(Utensils, { className: "w-6 h-6" })
  },
  {
    value: 'dessert',
    label: 'Dessert',
    description: 'Sweet treats and desserts',
    icon: React.createElement(Cake, { className: "w-6 h-6" })
  },
  {
    value: 'appetizers_snacks',
    label: 'Appetizers & Snacks',
    description: 'Small bites and starters',
    icon: React.createElement(Apple, { className: "w-6 h-6" })
  },
  {
    value: 'soups_salads',
    label: 'Soups & Salads',
    description: 'Light and refreshing options',
    icon: React.createElement(Soup, { className: "w-6 h-6" })
  }
]; 