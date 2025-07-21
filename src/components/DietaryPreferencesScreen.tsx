import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, ArrowLeft, Utensils, Check, X, AlertCircle, Loader2, 
  Heart, Shield, Leaf, Zap, Clock, Users, Settings, Plus, Minus,
  TrendingUp, Star, Info, AlertTriangle, ChevronRight, ChevronDown,
  Calendar, MapPin, Globe, Coffee, Pizza, Salad, Cake, Wine,
  Apple, Carrot, Fish, Egg, Milk, Wheat, Nut, Eye
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

// Enhanced interfaces for rich dietary management
interface DietaryPreference {
  id: string;
  name: string;
  description: string;
  category: 'medical' | 'lifestyle' | 'cultural' | 'personal';
  intensity: 'strict' | 'moderate' | 'flexible';
  selected: boolean;
  icon: any;
  color: string;
  benefits: string[];
  conflicts: string[];
  imageUrl?: string;
  commonPatterns: string[];
}

interface Allergy {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  selected: boolean;
  icon: any;
  color: string;
  symptoms: string[];
  alternatives: string[];
  emergencyInfo: string;
}

interface DietaryPattern {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  benefits: string[];
  restrictions: string[];
  imageUrl: string;
  popularity: number;
}

interface PreferenceOverride {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
  preferences: string[];
}

export function DietaryPreferencesScreen() {
  const navigate = useNavigate();
  const { setActiveTab, auth: { user } } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTabLocal] = useState<'overview' | 'patterns' | 'allergies' | 'custom'>('overview');
  const [showIntensitySlider, setShowIntensitySlider] = useState<string | null>(null);
  const [showConflicts, setShowConflicts] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [matchingRestaurants, setMatchingRestaurants] = useState(0);
  const [overrides, setOverrides] = useState<PreferenceOverride[]>([]);
  
  // Animation and scroll effects
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.9]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.95]);

  // Enhanced dietary preferences with visual elements
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([
    {
      id: 'vegetarian',
      name: 'Vegetarian',
      description: 'Plant-based diet excluding meat and fish',
      category: 'lifestyle',
      intensity: 'moderate',
      selected: false,
      icon: Leaf,
      color: 'from-green-500 to-emerald-600',
      benefits: ['Reduced environmental impact', 'Lower cholesterol', 'Rich in antioxidants'],
      conflicts: ['keto', 'paleo'],
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=200&fit=crop',
      commonPatterns: ['Mediterranean', 'Plant-based']
    },
    {
      id: 'vegan',
      name: 'Vegan',
      description: 'Strictly plant-based, no animal products',
      category: 'lifestyle',
      intensity: 'strict',
      selected: false,
      icon: Heart,
      color: 'from-purple-500 to-pink-600',
      benefits: ['Complete plant-based nutrition', 'Ethical choice', 'Environmental impact'],
      conflicts: ['pescatarian', 'keto', 'paleo'],
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=200&fit=crop',
      commonPatterns: ['Plant-based', 'Raw vegan']
    },
    {
      id: 'keto',
      name: 'Keto',
      description: 'High-fat, low-carbohydrate diet',
      category: 'lifestyle',
      intensity: 'strict',
      selected: false,
      icon: Zap,
      color: 'from-orange-500 to-red-600',
      benefits: ['Rapid weight loss', 'Mental clarity', 'Stable energy'],
      conflicts: ['vegetarian', 'vegan', 'low-carb'],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=200&fit=crop',
      commonPatterns: ['Atkins', 'Low-carb']
    },
    {
      id: 'gluten-free',
      name: 'Gluten-Free',
      description: 'Excludes gluten-containing grains',
      category: 'medical',
      intensity: 'strict',
      selected: false,
      icon: Shield,
      color: 'from-blue-500 to-cyan-600',
      benefits: ['Celiac disease management', 'Reduced inflammation', 'Digestive health'],
      conflicts: [],
      imageUrl: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=200&fit=crop',
      commonPatterns: ['Celiac-friendly', 'Grain-free']
    },
    {
      id: 'dairy-free',
      name: 'Dairy-Free',
      description: 'Excludes milk and dairy products',
      category: 'medical',
      intensity: 'moderate',
      selected: false,
      icon: Milk,
      color: 'from-yellow-500 to-amber-600',
      benefits: ['Lactose intolerance relief', 'Reduced inflammation', 'Clearer skin'],
      conflicts: [],
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=200&fit=crop',
      commonPatterns: ['Lactose-free', 'Plant-based']
    },
    {
      id: 'pescatarian',
      name: 'Pescatarian',
      description: 'Vegetarian diet including fish and seafood',
      category: 'lifestyle',
      intensity: 'moderate',
      selected: false,
      icon: Fish,
      color: 'from-teal-500 to-blue-600',
      benefits: ['Omega-3 fatty acids', 'Sustainable protein', 'Heart health'],
      conflicts: ['vegan'],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=200&fit=crop',
      commonPatterns: ['Mediterranean', 'Flexitarian']
    }
  ]);

  const [allergies, setAllergies] = useState<Allergy[]>([
    {
      id: 'peanuts',
      name: 'Peanuts',
      severity: 'severe',
      selected: false,
      icon: Nut,
      color: 'from-red-500 to-pink-600',
      symptoms: ['Anaphylaxis', 'Swelling', 'Difficulty breathing'],
      alternatives: ['Almonds', 'Cashews', 'Sunflower seeds'],
      emergencyInfo: 'Carry epinephrine auto-injector'
    },
    {
      id: 'shellfish',
      name: 'Shellfish',
      severity: 'moderate',
      selected: false,
      icon: Fish,
      color: 'from-orange-500 to-red-600',
      symptoms: ['Hives', 'Nausea', 'Abdominal pain'],
      alternatives: ['Fish', 'Chicken', 'Tofu'],
      emergencyInfo: 'Avoid all crustaceans and mollusks'
    },
    {
      id: 'dairy',
      name: 'Dairy',
      severity: 'mild',
      selected: false,
      icon: Milk,
      color: 'from-yellow-500 to-orange-600',
      symptoms: ['Bloating', 'Gas', 'Diarrhea'],
      alternatives: ['Almond milk', 'Oat milk', 'Coconut milk'],
      emergencyInfo: 'Check for hidden dairy in processed foods'
    },
    {
      id: 'wheat',
      name: 'Wheat',
      severity: 'moderate',
      selected: false,
      icon: Wheat,
      color: 'from-amber-500 to-yellow-600',
      symptoms: ['Digestive issues', 'Fatigue', 'Joint pain'],
      alternatives: ['Rice', 'Quinoa', 'Gluten-free grains'],
      emergencyInfo: 'Read labels carefully for wheat derivatives'
    }
  ]);

  const [dietaryPatterns, setDietaryPatterns] = useState<DietaryPattern[]>([
    {
      id: 'mediterranean',
      name: 'Mediterranean',
      description: 'Heart-healthy diet rich in olive oil, fish, and vegetables',
      icon: Globe,
      color: 'from-blue-500 to-teal-600',
      benefits: ['Heart health', 'Longevity', 'Brain function'],
      restrictions: ['Limited red meat', 'Processed foods'],
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=200&fit=crop',
      popularity: 95
    },
    {
      id: 'plant-based',
      name: 'Plant-Based',
      description: 'Focus on whole, unprocessed plant foods',
      icon: Leaf,
      color: 'from-green-500 to-emerald-600',
      benefits: ['Environmental impact', 'Heart health', 'Weight management'],
      restrictions: ['Animal products', 'Processed foods'],
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=200&fit=crop',
      popularity: 88
    },
    {
      id: 'keto',
      name: 'Keto',
      description: 'High-fat, low-carb diet for metabolic health',
      icon: Zap,
      color: 'from-orange-500 to-red-600',
      benefits: ['Weight loss', 'Mental clarity', 'Stable energy'],
      restrictions: ['High-carb foods', 'Grains', 'Most fruits'],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=200&fit=crop',
      popularity: 82
    }
  ]);

  const [customPreferences, setCustomPreferences] = useState<string>('');

  useEffect(() => {
    loadDietaryPreferences();
    calculateProfileCompletion();
    calculateMatchingRestaurants();
  }, [dietaryPreferences, allergies]);

  const loadDietaryPreferences = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // For now, use sample data
      // TODO: Replace with actual API calls
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('dietary_preferences')
      //   .eq('id', user.id)
      //   .single();
        
      // if (error) throw error;
      
      // if (data && data.dietary_preferences) {
      //   const preferences = data.dietary_preferences;
      //   // Update preferences based on saved data
      // }
    } catch (err) {
      console.error('Error loading dietary preferences:', err);
      setError('Failed to load your dietary preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    const totalPreferences = dietaryPreferences.length + allergies.length;
    const selectedPreferences = dietaryPreferences.filter(p => p.selected).length + 
                               allergies.filter(a => a.selected).length;
    const completion = Math.round((selectedPreferences / totalPreferences) * 100);
    setProfileCompletion(completion);
  };

  const calculateMatchingRestaurants = () => {
    // Simulate restaurant matching based on preferences
    const baseRestaurants = 150;
    const selectedPreferences = dietaryPreferences.filter(p => p.selected).length;
    const matching = Math.max(50, baseRestaurants - (selectedPreferences * 10));
    setMatchingRestaurants(matching);
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    
    try {
      const dietaryPreferencesData = {
        diets: dietaryPreferences.filter(pref => pref.selected).map(pref => ({
          id: pref.id,
          intensity: pref.intensity
        })),
        allergies: allergies.filter(allergy => allergy.selected).map(allergy => ({
          id: allergy.id,
          severity: allergy.severity
        })),
        custom: customPreferences,
        overrides: overrides
      };
      
      // TODO: Replace with actual API call
      // const { error } = await supabase
      //   .from('profiles')
      //   .update({
      //     dietary_preferences: dietaryPreferencesData,
      //     updated_at: new Date().toISOString()
      //   })
      //   .eq('id', user.id);
        
      // if (error) throw error;
      
      setSuccess('Your dietary preferences have been saved! 🎉');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving dietary preferences:', err);
      setError('Failed to save your dietary preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDietaryPreference = (id: string) => {
    setDietaryPreferences(dietaryPreferences.map(pref => 
      pref.id === id ? { ...pref, selected: !pref.selected } : pref
    ));
  };

  const toggleAllergy = (id: string) => {
    setAllergies(allergies.map(allergy => 
      allergy.id === id ? { ...allergy, selected: !allergy.selected } : allergy
    ));
  };

  const updateIntensity = (id: string, intensity: 'strict' | 'moderate' | 'flexible') => {
    setDietaryPreferences(dietaryPreferences.map(pref => 
      pref.id === id ? { ...pref, intensity } : pref
    ));
  };

  const updateSeverity = (id: string, severity: 'mild' | 'moderate' | 'severe') => {
    setAllergies(allergies.map(allergy => 
      allergy.id === id ? { ...allergy, severity } : allergy
    ));
  };

  const getConflicts = (preferenceId: string) => {
    const preference = dietaryPreferences.find(p => p.id === preferenceId);
    if (!preference) return [];
    
    return dietaryPreferences.filter(p => 
      p.selected && preference.conflicts.includes(p.id)
    );
  };

  const applyDietaryPattern = (pattern: DietaryPattern) => {
    // Apply pattern preferences
    const patternPreferences = pattern.restrictions.map(restriction => {
      const pref = dietaryPreferences.find(p => p.name.toLowerCase().includes(restriction.toLowerCase()));
      return pref?.id;
    }).filter(Boolean);

    setDietaryPreferences(dietaryPreferences.map(pref => ({
      ...pref,
      selected: patternPreferences.includes(pref.id)
    })));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]">
      {/* Header */}
      <motion.header 
        className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50"
        style={{ opacity: headerOpacity, scale: headerScale }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <Utensils className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Dietary Preferences</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Eye className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl shadow-xl flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              <p className="font-medium">{success}</p>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-2xl shadow-xl flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/20">
            {[
              { id: 'overview', label: 'Overview', icon: Utensils },
              { id: 'patterns', label: 'Quick Setup', icon: Zap },
              { id: 'allergies', label: 'Allergies', icon: Shield },
              { id: 'custom', label: 'Custom', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                                 onClick={() => setActiveTabLocal(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Based on Active Tab */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Dietary Preferences Grid */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-500" />
                    Lifestyle & Medical Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dietaryPreferences.map((preference) => (
                      <motion.div
                        key={preference.id}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className={cn(
                          "relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/20 cursor-pointer group h-72",
                          preference.selected && "ring-2 ring-green-500/50"
                        )}
                        onClick={() => toggleDietaryPreference(preference.id)}
                      >
                        {/* Background Image */}
                        {preference.imageUrl && (
                          <div className="relative h-32 overflow-hidden">
                            <img 
                              src={preference.imageUrl} 
                              alt={preference.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            
                            {/* Category Badge */}
                            <div className={cn(
                              "absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold text-white",
                              preference.category === 'medical' && "bg-red-500",
                              preference.category === 'lifestyle' && "bg-green-500",
                              preference.category === 'cultural' && "bg-blue-500",
                              preference.category === 'personal' && "bg-purple-500"
                            )}>
                              {preference.category}
                            </div>
                            
                            {/* Selected Check */}
                            {preference.selected && (
                              <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-4 h-40 flex flex-col justify-between relative">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={cn("p-2 rounded-lg bg-gradient-to-br", preference.color)}>
                                  <preference.icon className="w-4 h-4 text-white" />
                                </div>
                                <h4 className="font-semibold text-gray-800">{preference.name}</h4>
                              </div>
                              {preference.selected && (
                                <span className={cn(
                                  "px-3 py-1 text-xs font-medium rounded-full capitalize w-16 text-center",
                                  preference.intensity === 'flexible' && "bg-green-100 text-green-700",
                                  preference.intensity === 'moderate' && "bg-yellow-100 text-yellow-700",
                                  preference.intensity === 'strict' && "bg-red-100 text-red-700"
                                )}>
                                  {preference.intensity}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{preference.description}</p>
                            
                            {/* Benefits - Always visible */}
                            <div className="space-y-1 mb-3">
                              {preference.benefits.slice(0, 2).map((benefit, index) => (
                                <div key={index} className="flex items-center gap-1 text-xs text-gray-500">
                                  <Star className="w-3 h-3 text-yellow-400" />
                                  <span>{benefit}</span>
                                </div>
                              ))}
                            </div>
                            
                            {/* Restriction Levels Overlay - Only show when selected */}
                            {preference.selected && (
                              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center" style={{ top: '3rem' }}>
                                <div className="text-center p-4">
                                  <p className="text-sm font-medium text-gray-700 mb-3">Choose Restriction Level</p>
                                  <div className="flex gap-2">
                                    {(['flexible', 'moderate', 'strict'] as const).map((level) => (
                                      <button
                                        key={level}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateIntensity(preference.id, level);
                                        }}
                                        className={cn(
                                          "px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 w-20",
                                          preference.intensity === level
                                            ? level === 'flexible' 
                                              ? "bg-green-500 text-white"
                                              : level === 'moderate'
                                              ? "bg-yellow-500 text-white"
                                              : "bg-red-500 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'patterns' && (
              <motion.div
                key="patterns"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Quick Setup - Popular Dietary Patterns
                  </h3>
                  <p className="text-gray-600 mb-6">Choose a pattern to quickly set up your preferences, then customize as needed.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dietaryPatterns.map((pattern) => (
                      <motion.div
                        key={pattern.id}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/20 cursor-pointer group"
                        onClick={() => applyDietaryPattern(pattern)}
                      >
                        {/* Background Image */}
                        <div className="relative h-40 overflow-hidden">
                          <img 
                            src={pattern.imageUrl} 
                            alt={pattern.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          
                          {/* Popularity Badge */}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-gray-800">
                            {pattern.popularity}% popular
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn("p-2 rounded-lg bg-gradient-to-br", pattern.color)}>
                              <pattern.icon className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">{pattern.name}</h4>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                          
                          {/* Benefits */}
                          <div className="space-y-1 mb-3">
                            {pattern.benefits.slice(0, 2).map((benefit, index) => (
                              <div key={index} className="flex items-center gap-1 text-xs text-gray-500">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                          
                          <button className="w-full py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                            Apply Pattern
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'allergies' && (
              <motion.div
                key="allergies"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Allergies & Intolerances
                  </h3>
                  <p className="text-gray-600 mb-6">Set severity levels to help us provide better recommendations and safety alerts.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allergies.map((allergy) => (
                      <motion.div
                        key={allergy.id}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className={cn(
                          "bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 cursor-pointer group",
                          allergy.selected && "ring-2 ring-red-500/50"
                        )}
                        onClick={() => toggleAllergy(allergy.id)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn("p-3 rounded-lg bg-gradient-to-br", allergy.color)}>
                            <allergy.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{allergy.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {allergy.selected && (
                                <div className="flex gap-1">
                                  {(['mild', 'moderate', 'severe'] as const).map((level) => (
                                    <button
                                      key={level}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateSeverity(allergy.id, level);
                                      }}
                                      className={cn(
                                        "px-2 py-1 rounded text-xs font-medium transition-all",
                                        allergy.severity === level
                                          ? "bg-red-500 text-white"
                                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                      )}
                                    >
                                      {level}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {allergy.selected && (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <X className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {allergy.selected && (
                          <div className="space-y-2">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Symptoms:</h5>
                              <div className="flex flex-wrap gap-1">
                                {allergy.symptoms.map((symptom, index) => (
                                  <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                                    {symptom}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Alternatives:</h5>
                              <div className="flex flex-wrap gap-1">
                                {allergy.alternatives.map((alternative, index) => (
                                  <span key={index} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                                    {alternative}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-xs text-yellow-800 font-medium">{allergy.emergencyInfo}</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'custom' && (
              <motion.div
                key="custom"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-500" />
                    Custom Preferences & Overrides
                  </h3>
                  
                  {/* Custom Notes */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Additional Notes</h4>
                    <textarea
                      value={customPreferences}
                      onChange={(e) => setCustomPreferences(e.target.value)}
                      placeholder="Any other dietary preferences, restrictions, or special requirements we should know about?"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none"
                      rows={4}
                    />
                  </div>
                  
                  {/* Temporary Overrides */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800">Temporary Overrides</h4>
                      <button className="px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                        <Plus className="w-4 h-4 inline mr-1" />
                        Add Override
                      </button>
                    </div>
                    
                    {overrides.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No temporary overrides set</p>
                        <p className="text-sm">Add overrides for special occasions or travel</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {overrides.map((override) => (
                          <div key={override.id} className="p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-800">{override.name}</h5>
                                <p className="text-sm text-gray-600">{override.reason}</p>
                              </div>
                              <button className="text-red-500 hover:text-red-700">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Preview Panel */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed inset-y-0 right-0 w-96 bg-white/95 backdrop-blur-xl border-l border-white/20 shadow-2xl z-40 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Recommendation Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Perfect Matches</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Utensils className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Green Garden Cafe</p>
                          <p className="text-sm text-green-600">100% match - Vegan, Gluten-free</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Good Options</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Pizza className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-yellow-800">Pizza Palace</p>
                          <p className="text-sm text-yellow-600">85% match - Gluten-free options</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}