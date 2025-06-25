import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, Utensils, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface DietaryPreference {
  id: string;
  name: string;
  selected: boolean;
}

interface Allergy {
  id: string;
  name: string;
  selected: boolean;
}

export function DietaryPreferencesScreen() {
  const { setActiveTab, auth: { user } } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([
    { id: 'vegetarian', name: 'Vegetarian', selected: false },
    { id: 'vegan', name: 'Vegan', selected: false },
    { id: 'pescatarian', name: 'Pescatarian', selected: false },
    { id: 'keto', name: 'Keto', selected: false },
    { id: 'paleo', name: 'Paleo', selected: false },
    { id: 'gluten-free', name: 'Gluten-Free', selected: false },
    { id: 'dairy-free', name: 'Dairy-Free', selected: false },
    { id: 'low-carb', name: 'Low Carb', selected: false },
  ]);
  
  const [allergies, setAllergies] = useState<Allergy[]>([
    { id: 'peanuts', name: 'Peanuts', selected: false },
    { id: 'tree-nuts', name: 'Tree Nuts', selected: false },
    { id: 'shellfish', name: 'Shellfish', selected: false },
    { id: 'fish', name: 'Fish', selected: false },
    { id: 'eggs', name: 'Eggs', selected: false },
    { id: 'dairy', name: 'Dairy', selected: false },
    { id: 'wheat', name: 'Wheat', selected: false },
    { id: 'soy', name: 'Soy', selected: false },
  ]);
  
  const [customPreferences, setCustomPreferences] = useState<string>('');

  useEffect(() => {
    loadDietaryPreferences();
  }, []);

  const loadDietaryPreferences = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('dietary_preferences')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data && data.dietary_preferences) {
        const preferences = data.dietary_preferences;
        
        // Update dietary preferences
        if (preferences.diets) {
          setDietaryPreferences(dietaryPreferences.map(pref => ({
            ...pref,
            selected: preferences.diets.includes(pref.id)
          })));
        }
        
        // Update allergies
        if (preferences.allergies) {
          setAllergies(allergies.map(allergy => ({
            ...allergy,
            selected: preferences.allergies.includes(allergy.id)
          })));
        }
        
        // Update custom preferences
        if (preferences.custom) {
          setCustomPreferences(preferences.custom);
        }
      }
    } catch (err) {
      console.error('Error loading dietary preferences:', err);
      setError('Failed to load your dietary preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    
    try {
      const dietaryPreferencesData = {
        diets: dietaryPreferences.filter(pref => pref.selected).map(pref => pref.id),
        allergies: allergies.filter(allergy => allergy.selected).map(allergy => allergy.id),
        custom: customPreferences
      };
      
      const { error } = await supabase
        .from('profiles')
        .update({
          dietary_preferences: dietaryPreferencesData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setSuccess('Your dietary preferences have been saved!');
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-peach to-background-cream">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Profile</span>
            </button>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Dietary Preferences</h1>
            </div>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-xl">
                <Utensils className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Dietary Preferences</h2>
                <p className="text-gray-600">Let us know your food preferences and restrictions</p>
              </div>
            </div>
            
            {/* Dietary Preferences Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Diet Types</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {dietaryPreferences.map(preference => (
                  <button
                    key={preference.id}
                    onClick={() => toggleDietaryPreference(preference.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                      preference.selected
                        ? "bg-green-100 border-green-300 text-green-800"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {preference.name}
                    {preference.selected && (
                      <Check className="inline-block w-4 h-4 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Allergies Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Allergies & Intolerances</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allergies.map(allergy => (
                  <button
                    key={allergy.id}
                    onClick={() => toggleAllergy(allergy.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                      allergy.selected
                        ? "bg-red-100 border-red-300 text-red-800"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {allergy.name}
                    {allergy.selected && (
                      <X className="inline-block w-4 h-4 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Custom Preferences */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
              <textarea
                value={customPreferences}
                onChange={(e) => setCustomPreferences(e.target.value)}
                placeholder="Any other dietary preferences or restrictions we should know about?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={4}
              />
            </div>
            
            {/* Save Button */}
            <motion.button
              onClick={handleSavePreferences}
              disabled={isSaving}
              whileHover={{ scale: isSaving ? 1 : 1.02 }}
              whileTap={{ scale: isSaving ? 1 : 0.98 }}
              className={cn(
                "w-full flex justify-center items-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors",
                isSaving && "opacity-70 cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
}