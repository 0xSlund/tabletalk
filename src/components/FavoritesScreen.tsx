import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, ArrowLeft, Star, Search, Trash2, Loader2, AlertCircle, Heart } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface Favorite {
  id: string;
  name: string;
  type: 'restaurant' | 'dish';
  notes?: string;
  created_at: string;
}

export function FavoritesScreen() {
  const { setActiveTab, auth: { user } } = useAppStore();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [newFavorite, setNewFavorite] = useState({
    name: '',
    type: 'restaurant' as 'restaurant' | 'dish',
    notes: ''
  });

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setFavorites(data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load your favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!user || !newFavorite.name.trim()) return;
    
    setError(null);
    setIsAdding(true);
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          profile_id: user.id,
          name: newFavorite.name.trim(),
          type: newFavorite.type,
          notes: newFavorite.notes.trim() || null
        })
        .select();
        
      if (error) throw error;
      
      // Add the new favorite to the list
      if (data && data.length > 0) {
        setFavorites([data[0], ...favorites]);
      }
      
      // Reset the form
      setNewFavorite({
        name: '',
        type: 'restaurant',
        notes: ''
      });
      
      // Close the add form
      setIsAdding(false);
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError('Failed to add favorite');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteFavorite = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);
        
      if (error) throw error;
      
      // Remove the favorite from the list
      setFavorites(favorites.filter(fav => fav.id !== id));
    } catch (err) {
      console.error('Error deleting favorite:', err);
      setError('Failed to delete favorite');
    }
  };

  const filteredFavorites = favorites.filter(favorite => 
    favorite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (favorite.notes && favorite.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
            </div>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Your Favorites</h2>
              <p className="text-gray-600">Keep track of your favorite restaurants and dishes</p>
            </div>
          </div>
          
          {/* Add Favorite Button */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 px-4 mb-6 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
            >
              Add New Favorite
            </button>
          )}
          
          {/* Add Favorite Form */}
          {isAdding && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Favorite</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newFavorite.name}
                    onChange={(e) => setNewFavorite({...newFavorite, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Restaurant or dish name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={newFavorite.type === 'restaurant'}
                        onChange={() => setNewFavorite({...newFavorite, type: 'restaurant'})}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span>Restaurant</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={newFavorite.type === 'dish'}
                        onChange={() => setNewFavorite({...newFavorite, type: 'dish'})}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span>Dish</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={newFavorite.notes}
                    onChange={(e) => setNewFavorite({...newFavorite, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Any notes about this favorite"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddFavorite}
                    disabled={!newFavorite.name.trim() || isAdding}
                    className="flex-1 py-2 bg-yellow-500 text-white rounded-md font-medium hover:bg-yellow-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isAdding ? 'Adding...' : 'Add Favorite'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Search */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search favorites..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          
          {/* Favorites List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No favorites match your search.' : 'No favorites added yet.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFavorites.map((favorite) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Heart className={`w-4 h-4 ${favorite.type === 'restaurant' ? 'text-blue-500' : 'text-pink-500'}`} />
                        <h3 className="font-medium text-gray-900">{favorite.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          favorite.type === 'restaurant' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {favorite.type === 'restaurant' ? 'Restaurant' : 'Dish'}
                        </span>
                      </div>
                      
                      {favorite.notes && (
                        <p className="text-sm text-gray-600 mt-1">{favorite.notes}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDeleteFavorite(favorite.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove favorite"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}