import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, Globe, TrendingUp, Clock, Users, ChefHat, Star, ArrowUpRight, Loader2 } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { fetchCuisines, fetchRecipesByCuisine, type Cuisine, type Recipe } from '../lib/supabase';
import { pageTransitionVariants } from '../lib/utils';
import BackButton from './BackButton';

interface DishDetails {
  name: string;
  cuisine: string;
  image: string;
  prepTime: string;
  servings: number;
  description: string;
  ingredients: string[];
  instructions: string[];
  chefTips: string[];
  difficulty: 1 | 2 | 3;
}

// Fallback cuisines data in case the database is empty
const fallbackCuisines = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: 'Italian',
    image_url: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?auto=format&fit=crop&w=1200&q=80',
    description: 'Classic Italian cuisine',
    created_at: new Date().toISOString()
  },
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d480",
    name: 'Japanese',
    image_url: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?auto=format&fit=crop&w=1200&q=80',
    description: 'Traditional Japanese dishes',
    created_at: new Date().toISOString()
  },
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d481",
    name: 'Mexican',
    image_url: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=1200&q=80',
    description: 'Vibrant Mexican flavors',
    created_at: new Date().toISOString()
  },
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d482",
    name: 'Indian',
    image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80',
    description: 'Spicy Indian cuisine',
    created_at: new Date().toISOString()
  }
];

// Fallback recipes for when no database recipes are available
const fallbackRecipes = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d483",
    name: "Margherita Pizza",
    cuisine_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    description: "Classic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil.",
    image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1200&q=80",
    prep_time: "45 minutes",
    servings: 4,
    difficulty: 2,
    created_at: new Date().toISOString(),
    meal_type: 'main_course',
    recipe_ingredients: [
      { id: "1", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", text: "Pizza dough" },
      { id: "2", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", text: "San Marzano tomatoes" },
      { id: "3", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", text: "Fresh mozzarella" },
      { id: "4", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", text: "Fresh basil" },
      { id: "5", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", text: "Extra virgin olive oil" },
      { id: "6", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", text: "Sea salt" }
    ],
    recipe_instructions: [
      { id: "1", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", step_number: 1, text: "Preheat oven to 500°F (260°C)" },
      { id: "2", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", step_number: 2, text: "Stretch dough into 12-inch circle" },
      { id: "3", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", step_number: 3, text: "Spread crushed tomatoes" },
      { id: "4", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", step_number: 4, text: "Add torn mozzarella pieces" },
      { id: "5", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", step_number: 5, text: "Bake until crust is golden" },
      { id: "6", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", step_number: 6, text: "Garnish with fresh basil and olive oil" }
    ],
    recipe_tips: [
      { id: "1", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", text: "Use room temperature dough for easier stretching" },
      { id: "2", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", text: "Less is more with toppings" },
      { id: "3", recipe_id: "f47ac10b-58cc-4372-a567-0e02b2c3d483", text: "Preheat pizza stone if available" }
    ]
  }
];

export function ExploreCuisinesScreen() {
  const { setActiveTab } = useAppStore();
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null);
  const [selectedDish, setSelectedDish] = useState<DishDetails | null>(null);
  const [view, setView] = useState<'cuisines' | 'trending'>('cuisines');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      // Reset all state when component unmounts
      setCuisines([]);
      setSelectedCuisine(null);
      setSelectedDish(null);
      setView('cuisines');
      setHoveredTab(null);
      setLoading(false);
      setRecipes([]);
      setError(null);
      setIsExiting(false);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadCuisines = async () => {
      if (!mounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const cuisinesData = await fetchCuisines();
        
        if (isCancelled) return;
        
        // If no cuisines in database, use fallback data
        if (cuisinesData.length === 0) {
          setCuisines(fallbackCuisines as Cuisine[]);
        } else {
          setCuisines(cuisinesData);
        }
      } catch (error) {
        if (isCancelled) return;
        
        console.error('Error loading cuisines:', error);
        setError('Failed to load cuisines. Using fallback data.');
        setCuisines(fallbackCuisines as Cuisine[]);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    
    if (mounted && cuisines.length === 0) {
      loadCuisines();
    }
    
    return () => {
      isCancelled = true;
    };
  }, [mounted]);

  useEffect(() => {
    let isCancelled = false;

    const loadRecipes = async () => {
      if (!mounted || !selectedCuisine) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const recipesData = await fetchRecipesByCuisine(selectedCuisine.id);
        
        if (isCancelled) return;
        
        // If no recipes found, use fallback data for Italian cuisine
        if (recipesData.length === 0 && selectedCuisine.name === 'Italian') {
          setRecipes(fallbackRecipes as Recipe[]);
        } else if (recipesData.length === 0) {
          setRecipes([]);
        } else {
          setRecipes(recipesData);
        }
      } catch (error) {
        if (isCancelled) return;
        
        console.error('Error loading recipes:', error);
        setError('Failed to load recipes. Using fallback data.');
        if (selectedCuisine.name === 'Italian') {
          setRecipes(fallbackRecipes as Recipe[]);
        } else {
          setRecipes([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    
    if (selectedCuisine) {
      loadRecipes();
    }
    
    return () => {
      isCancelled = true;
    };
  }, [selectedCuisine, mounted]);

  const handleSelectRecipe = (recipe: Recipe) => {
    const dishDetails: DishDetails = {
      name: recipe.name,
      cuisine: selectedCuisine?.name || 'Unknown',
      image: recipe.image_url || 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1200&q=80',
      prepTime: recipe.prep_time || '30 minutes',
      servings: recipe.servings || 4,
      description: recipe.description || 'A delicious dish to try.',
      ingredients: recipe.recipe_ingredients?.map(i => i.text) || [],
      instructions: recipe.recipe_instructions?.map(i => i.text) || [],
      chefTips: recipe.recipe_tips?.map(i => i.text) || [],
      difficulty: recipe.difficulty as 1 | 2 | 3 || 2
    };
    
    setSelectedDish(dishDetails);
  };

  const handleNavigate = (tab: string) => {
    setIsExiting(true);
    setTimeout(() => {
      setActiveTab(tab as any);
    }, 300);
  };

  if (loading && cuisines.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-neutral font-medium">Loading cuisines...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]"
      initial="initial"
      exit="exit"
      variants={pageTransitionVariants}
      animate={isExiting ? "exit" : "enter"}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <BackButton />
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">TableTalk</h1>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
          {cuisines.map((cuisine, index) => (
            <motion.button
              key={cuisine.id}
              onClick={() => setSelectedCuisine(cuisine)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative h-[280px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <img
                src={cuisine.image_url || `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80`}
                alt={cuisine.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold">{cuisine.name}</h3>
                {cuisine.description && (
                  <p className="mt-2 text-white/90">{cuisine.description}</p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </motion.div>
  );
}