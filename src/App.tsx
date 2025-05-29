import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TabBar } from './components/TabBar';
import { HomeScreen } from './components/HomeScreen';
import CreateRoom from './components/CreateRoom';
import { JoinRoomScreen } from './components/JoinRoomScreen';
import { QuickDecisionScreen } from './components/QuickDecisionScreen';
import { ExploreCuisinesScreen } from './components/ExploreCuisinesScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ActiveRoomScreen } from './components/ActiveRoomScreen';
import { AuthForm } from './components/Auth/AuthForm';
import { useAppStore } from './lib/store';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';
import { SecuritySettings } from './components/SecuritySettings';
import { RoomHistoryScreen } from './components/RoomHistoryScreen';
import { DietaryPreferencesScreen } from './components/DietaryPreferencesScreen';
import { FavoritesScreen } from './components/FavoritesScreen';

function App() {
  const location = useLocation();
  const { 
    setActiveTab, 
    auth, 
    setUser, 
    setSession, 
    setLoading,
    fetchUserProfile
  } = useAppStore();

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname.substring(1) || 'home';
    if (path === 'quick-decision') {
      setActiveTab('quick-decision');
    } else if (path === 'explore') {
      setActiveTab('explore-cuisines');
    } else if (path === 'join') {
      setActiveTab('join');
    } else if (path.startsWith('create')) {
      setActiveTab('create');
    } else if (path === 'profile') {
      setActiveTab('profile');
    } else {
      setActiveTab('home');
    }
  }, [location, setActiveTab]);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          
          if (event === 'SIGNED_IN' && session?.user) {
            await fetchUserProfile(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, [setSession, setUser, setLoading, fetchUserProfile]);

  // Show loading state while auth is initializing or auth object is undefined
  if (!auth || auth.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-peach to-background-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-neutral font-medium">Loading TableTalk...</p>
        </div>
      </div>
    );
  }

  // Show auth form if user is not authenticated
  if (!auth.user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-peach to-background-cream overflow-hidden">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/create/quick" element={<CreateRoom initialView="quick" />} />
          <Route path="/create/custom" element={<CreateRoom initialView="custom" />} />
          <Route path="/create/templates" element={<CreateRoom initialView="templates" />} />
          <Route path="/join" element={<JoinRoomScreen />} />
          <Route path="/quick-decision" element={<QuickDecisionScreen />} />
          <Route path="/explore" element={<ExploreCuisinesScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/active-room" element={<ActiveRoomScreen />} />
          <Route path="/security" element={<SecuritySettings />} />
          <Route path="/history" element={<RoomHistoryScreen />} />
          <Route path="/dietary" element={<DietaryPreferencesScreen />} />
          <Route path="/favorites" element={<FavoritesScreen />} />
          <Route path="/:roomCode" element={<ActiveRoomScreen />} />
          <Route path="/trending" element={
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              <div className="card text-center text-neutral">
                Trending rooms coming soon!
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </AnimatePresence>
      <TabBar />
    </div>
  );
}

export default App;