import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';

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

// Component to handle /join/{roomCode} redirects
function JoinRedirect() {
  const { roomCode } = useParams();
  return <Navigate to={`/active-room/${roomCode}`} replace />;
}

function App() {
  const location = useLocation();
  const { 
    setActiveTab, 
    auth
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
      // Use getState to avoid function dependencies
      const { setLoading, setSession, setUser, fetchUserProfile } = useAppStore.getState();
      
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
          const { setSession, setUser, fetchUserProfile } = useAppStore.getState();
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
  }, []); // Empty array is now safe since we use getState() instead of store functions

  // Show loading state while auth is initializing or auth object is undefined
  if (!auth || auth.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3] flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3] overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/create/quick" element={<CreateRoom initialView="quick" />} />
          <Route path="/create/custom" element={<CreateRoom initialView="custom" />} />
          <Route path="/create/custom/basic-info" element={<CreateRoom initialView="custom" initialStep="basic-info" />} />
          <Route path="/create/custom/settings" element={<CreateRoom initialView="custom" initialStep="settings" />} />
          <Route path="/create/custom/summary" element={<CreateRoom initialView="custom" initialStep="summary" />} />
          <Route path="/create/templates" element={<CreateRoom initialView="templates" />} />
          <Route path="/join" element={<JoinRoomScreen />} />
          <Route path="/join/:roomCode" element={<JoinRedirect />} />
          <Route path="/quick-decision" element={<QuickDecisionScreen />} />
          <Route path="/explore" element={<ExploreCuisinesScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/active-room" element={<ActiveRoomScreen />} />
          <Route path="/active-room/:roomCode" element={<ActiveRoomScreen />} />
          <Route path="/security" element={<SecuritySettings />} />
          <Route path="/history" element={<RoomHistoryScreen />} />
          <Route path="/dietary" element={<DietaryPreferencesScreen />} />
          <Route path="/favorites" element={<FavoritesScreen />} />
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
    </div>
  );
}

export default App;