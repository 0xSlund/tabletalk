import React, { useEffect } from 'react';
import { TabBar } from './components/TabBar';
import { HomeScreen } from './components/HomeScreen';
import CreateRoom from './components/CreateRoom';
import { JoinRoomScreen } from './components/JoinRoomScreen';
import { QuickDecisionScreen } from './components/QuickDecisionScreen';
import { ExploreCuisinesScreen } from './components/ExploreCuisinesScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ActiveRoomScreen } from './components/ActiveRoomScreen';
import { ResultScreen } from './components/ResultScreen';
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
  const { 
    activeTab, 
    auth, 
    setUser, 
    setSession, 
    setLoading,
    fetchUserProfile
  } = useAppStore();

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
        {activeTab === 'home' && <HomeScreen key="home" />}
        {activeTab === 'create' && <CreateRoom key="create" />}
        {activeTab === 'join' && <JoinRoomScreen key="join" />}
        {activeTab === 'quick-decision' && <QuickDecisionScreen key="quick-decision" />}
        {activeTab === 'explore-cuisines' && <ExploreCuisinesScreen key="explore-cuisines" />}
        {activeTab === 'profile' && <ProfileScreen key="profile" />}
        {activeTab === 'active-room' && <ActiveRoomScreen key="active-room" />}
        {activeTab === 'result' && <ResultScreen key="result" />}
        {activeTab === 'security' && <SecuritySettings key="security" />}
        {activeTab === 'history' && <RoomHistoryScreen key="history" />}
        {activeTab === 'dietary' && <DietaryPreferencesScreen key="dietary" />}
        {activeTab === 'favorites' && <FavoritesScreen key="favorites" />}
        {activeTab === 'trending' && (
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="card text-center text-neutral">
              Trending rooms coming soon!
            </div>
          </div>
        )}
      </AnimatePresence>
      <TabBar />
    </div>
  );
}

export default App;