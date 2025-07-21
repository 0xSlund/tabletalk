import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, ArrowLeft, Star, Search, Trash2, Loader2, AlertCircle, Heart, 
  Filter, Grid, List, MapPin, Clock, Users, Calendar, Share2, Bookmark, 
  TrendingUp, Sparkles, Gift, Trophy, Camera, MessageCircle, Plus, X,
  ChevronDown, ChevronUp, Tag, DollarSign, Globe, Zap, Coffee, Pizza,
  Salad, Cake, Wine, MapPin as Location, Clock as Time, Users as People
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';

// Enhanced interfaces for rich media experience
interface FavoriteItem {
  id: string;
  name: string;
  type: 'restaurant' | 'dish' | 'cuisine' | 'collection';
  category: string;
  cuisine: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  imageUrl?: string;
  location?: string;
  notes?: string;
  tags: string[];
  occasion: string[];
  dietary: string[];
  created_at: string;
  lastVisited?: string;
  visitCount: number;
  isSeasonal: boolean;
  isTrending: boolean;
  friendsAlsoLiked: number;
  specialOccasion?: string;
  memories?: string;
  collectionId?: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  itemCount: number;
  isPublic: boolean;
  created_at: string;
  tags: string[];
}

interface FilterState {
  viewMode: 'grid' | 'list' | 'masonry';
  sortBy: 'recent' | 'rating' | 'name' | 'price' | 'trending';
  cuisine: string[];
  priceRange: string[];
  occasion: string[];
  dietary: string[];
  tags: string[];
  showTrending: boolean;
  showSeasonal: boolean;
}

interface DiscoveryItem {
  id: string;
  name: string;
  type: 'recommendation' | 'trending' | 'seasonal' | 'friends';
  reason: string;
  imageUrl?: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  distance?: number;
}

export function FavoritesScreen() {
  const navigate = useNavigate();
  const { setActiveTab, auth: { user } } = useAppStore();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [discoveryItems, setDiscoveryItems] = useState<DiscoveryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    viewMode: 'masonry',
    sortBy: 'recent',
    cuisine: [],
    priceRange: [],
    occasion: [],
    dietary: [],
    tags: [],
    showTrending: false,
    showSeasonal: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(true);
  const [milestone, setMilestone] = useState<string | null>(null);
  
  // Animation and scroll effects
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.9]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.95]);

  // Sample data for demonstration
  const sampleFavorites: FavoriteItem[] = [
    {
      id: '1',
      name: 'Truffle Pasta',
      type: 'dish',
      category: 'Italian',
      cuisine: 'Italian',
      priceRange: '$$',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
      location: 'Luigi\'s Trattoria',
      notes: 'Amazing truffle flavor, perfect for date night',
      tags: ['pasta', 'truffle', 'date-night', 'romantic'],
      occasion: ['date-night', 'special-occasion'],
      dietary: ['vegetarian'],
      created_at: '2024-01-15T10:30:00Z',
      lastVisited: '2024-01-20T19:00:00Z',
      visitCount: 3,
      isSeasonal: false,
      isTrending: true,
      friendsAlsoLiked: 12,
      specialOccasion: 'Anniversary dinner',
      memories: 'First time trying truffle - absolutely magical!'
    },
    {
      id: '2',
      name: 'Sushi Master',
      type: 'restaurant',
      category: 'Japanese',
      cuisine: 'Japanese',
      priceRange: '$$$',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      location: 'Downtown',
      notes: 'Best sushi in the city, omakase experience is incredible',
      tags: ['sushi', 'omakase', 'premium', 'fresh'],
      occasion: ['celebration', 'business'],
      dietary: ['pescatarian', 'gluten-free'],
      created_at: '2024-01-10T14:20:00Z',
      lastVisited: '2024-01-25T20:00:00Z',
      visitCount: 8,
      isSeasonal: false,
      isTrending: true,
      friendsAlsoLiked: 25,
      memories: 'Celebrated my promotion here - the chef remembered us!'
    },
    {
      id: '3',
      name: 'Avocado Toast',
      type: 'dish',
      category: 'Breakfast',
      cuisine: 'American',
      priceRange: '$',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop',
      location: 'Sunrise Cafe',
      notes: 'Perfect weekend brunch, great coffee too',
      tags: ['breakfast', 'brunch', 'healthy', 'quick'],
      occasion: ['weekend', 'casual'],
      dietary: ['vegetarian', 'vegan-option'],
      created_at: '2024-01-05T09:15:00Z',
      lastVisited: '2024-01-22T10:30:00Z',
      visitCount: 15,
      isSeasonal: false,
      isTrending: false,
      friendsAlsoLiked: 8
    }
  ];

  const sampleCollections: Collection[] = [
    {
      id: '1',
      name: 'Date Night Spots',
      description: 'Perfect places for romantic evenings',
      coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop',
      itemCount: 12,
      isPublic: true,
      created_at: '2024-01-01T00:00:00Z',
      tags: ['romantic', 'date-night', 'special']
    },
    {
      id: '2',
      name: 'Quick Lunch Options',
      description: 'Fast and delicious lunch spots',
      coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=200&fit=crop',
      itemCount: 8,
      isPublic: true,
      created_at: '2024-01-02T00:00:00Z',
      tags: ['quick', 'lunch', 'casual']
    }
  ];

  const sampleDiscovery: DiscoveryItem[] = [
    {
      id: '1',
      name: 'Ramen House',
      type: 'recommendation',
      reason: 'Based on your love for Japanese cuisine',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
      cuisine: 'Japanese',
      priceRange: '$$',
      rating: 4.7,
      distance: 0.8
    },
    {
      id: '2',
      name: 'Seasonal Pumpkin Spice Latte',
      type: 'seasonal',
      reason: 'Limited time fall favorite',
      imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
      cuisine: 'Coffee',
      priceRange: '$',
      rating: 4.6
    }
  ];

  useEffect(() => {
    loadFavorites();
    checkMilestones();
  }, []);

  const loadFavorites = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // For now, use sample data
      setFavorites(sampleFavorites);
      setCollections(sampleCollections);
      setDiscoveryItems(sampleDiscovery);
      
      // TODO: Replace with actual API calls
      // const { data, error } = await supabase
      //   .from('favorites')
      //   .select('*')
      //   .eq('profile_id', user.id)
      //   .order('created_at', { ascending: false });
        
      // if (error) throw error;
      // setFavorites(data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load your favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const checkMilestones = () => {
    if (favorites.length === 100) {
      setMilestone('🎉 100 Favorites! You\'re a true food explorer!');
    } else if (favorites.length === 50) {
      setMilestone('🌟 50 Favorites! Your culinary journey is amazing!');
    }
  };

  const handleAddFavorite = async () => {
    // TODO: Implement add favorite functionality
    console.log('Add favorite');
  };

  const handleDeleteFavorite = async (id: string) => {
    // TODO: Implement delete favorite functionality
    console.log('Delete favorite', id);
  };

  const handleSaveAnimation = (id: string) => {
    // TODO: Implement save animation
    console.log('Save animation for', id);
  };

  const handleShare = (item: FavoriteItem) => {
    // TODO: Implement share functionality
    console.log('Share', item);
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (favorite.notes && favorite.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCuisine = filters.cuisine.length === 0 || filters.cuisine.includes(favorite.cuisine);
    const matchesPrice = filters.priceRange.length === 0 || filters.priceRange.includes(favorite.priceRange);
    const matchesOccasion = filters.occasion.length === 0 || 
      filters.occasion.some(occ => favorite.occasion.includes(occ));
    
    return matchesSearch && matchesCuisine && matchesPrice && matchesOccasion;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (filters.sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.priceRange.length - b.priceRange.length;
      case 'trending':
        return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

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
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Favorites</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setIsAdding(true)}
                className="p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Milestone Celebration */}
        <AnimatePresence>
          {milestone && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="mb-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-xl text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold text-lg">{milestone}</span>
                <Sparkles className="w-5 h-5" />
              </div>
              <button
                onClick={() => setMilestone(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your favorites..."
              className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, viewMode: 'masonry' }))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filters.viewMode === 'masonry' 
                  ? 'bg-yellow-500 text-white shadow-lg' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <Grid className="w-4 h-4 inline mr-1" />
              Grid
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, viewMode: 'list' }))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filters.viewMode === 'list' 
                  ? 'bg-yellow-500 text-white shadow-lg' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <List className="w-4 h-4 inline mr-1" />
              List
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, showTrending: !prev.showTrending }))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filters.showTrending 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Trending
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Discovery Section */}
          {showDiscovery && discoveryItems.length > 0 && (
            <div className="col-span-full mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Discover More
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoveryItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 cursor-pointer"
                  >
                    {item.imageUrl && (
                      <div className="relative mb-3">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {item.type}
                        </div>
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.reason}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.cuisine}</span>
                      <span>{item.priceRange}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites Grid */}
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
          ) : sortedFavorites.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-4">Start building your culinary collection!</p>
              <button
                onClick={() => setIsAdding(true)}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Add Your First Favorite
              </button>
            </div>
          ) : (
            sortedFavorites.map((favorite) => (
              <motion.div
                key={favorite.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/20 cursor-pointer group"
              >
                {/* Image */}
                {favorite.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={favorite.imageUrl} 
                      alt={favorite.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Trending Badge */}
                    {favorite.isTrending && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </div>
                    )}
                    
                    {/* Seasonal Badge */}
                    {favorite.isSeasonal && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Seasonal
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(favorite);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFavorite(favorite.id);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">{favorite.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{favorite.rating}</span>
                    </div>
                  </div>
                  
                  {favorite.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <Location className="w-4 h-4" />
                      <span>{favorite.location}</span>
                    </div>
                  )}
                  
                  {favorite.notes && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{favorite.notes}</p>
                  )}
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {favorite.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {favorite.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{favorite.tags.length - 3}
                      </span>
                    )}
                  </div>
                  
                  {/* Bottom Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <People className="w-3 h-3" />
                        {favorite.friendsAlsoLiked}
                      </span>
                      <span className="flex items-center gap-1">
                        <Time className="w-3 h-3" />
                        {favorite.visitCount}
                      </span>
                    </div>
                    <span className="font-medium">{favorite.priceRange}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Add Favorite Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAdding(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add to Favorites</h2>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Restaurant or dish name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="What makes this special?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all resize-none"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Add Favorite
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}