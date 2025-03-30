import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, User, Settings, History, Star, LogOut, ChevronRight, Lock, Edit, Loader2, Camera, Check, X, AlertCircle, Trophy, Eye, Utensils, Instagram, Twitter, Youtube, Video, ExternalLink } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { formatTimeRemaining } from '../lib/utils';

export function ProfileScreen() {
  const { setActiveTab, auth: { user }, signOut, fetchRecentRooms, joinRoom } = useAppStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [aboutMe, setAboutMe] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roomHistory, setRoomHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: ''
  });

  useEffect(() => {
    loadRoomHistory();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('about_me, social_links')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        if (data.about_me) {
          setAboutMe(data.about_me);
        }
        if (data.social_links) {
          setSocialLinks({
            ...socialLinks,
            ...data.social_links
          });
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  const loadRoomHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('room_history')
        .select(`
          id, joined_at,
          rooms:rooms(id, name, code, created_at, expires_at)
        `)
        .eq('profile_id', user.id)
        .order('joined_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setRoomHistory(data || []);
    } catch (err) {
      console.error('Error loading room history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Refresh user data
      await useAppStore.getState().fetchUserProfile(user.id);
      setIsEditing(false);
      setSuccess('Username updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating your profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAboutMe = async () => {
    if (!user) return;
    
    setError(null);
    setSuccess(null);
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          about_me: aboutMe, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setIsEditingAbout(false);
      setSuccess('About me updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating about me:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating your profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSocialLinks = async () => {
    if (!user) return;
    
    setError(null);
    setSuccess(null);
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          social_links: socialLinks, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setIsEditingSocial(false);
      setSuccess('Social links updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating social links:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating your profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarClick = () => {
    setIsEditingAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) {
      setIsEditingAvatar(false);
      return;
    }
    
    const file = e.target.files[0];
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      setIsEditingAvatar(false);
      return;
    }
    
    setError(null);
    setSuccess(null);
    setIsUpdating(true);
    
    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      const avatarUrl = publicUrlData.publicUrl;
      
      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatarUrl, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user?.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setAvatarUrl(avatarUrl);
      setSuccess('Profile picture updated successfully!');
      
      // Refresh user data
      await useAppStore.getState().fetchUserProfile(user?.id || '');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating your profile picture');
    } finally {
      setIsUpdating(false);
      setIsEditingAvatar(false);
    }
  };

  const handleViewRoom = async (roomCode: string) => {
    if (!roomCode) return;
    
    try {
      // Try to join the room
      const success = await joinRoom(roomCode);
      if (success) {
        // Navigate to the room
        setActiveTab('active-room');
      } else {
        setError('Could not join this room. It may have been deleted or expired.');
      }
    } catch (err) {
      console.error('Error joining room:', err);
      setError('An error occurred while trying to join the room.');
    }
  };

  const menuItems = [
    {
      icon: History,
      label: 'History',
      description: 'View your past rooms and decisions',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      action: () => setActiveTab('history')
    },
    {
      icon: Star,
      label: 'Favorites',
      description: 'Your favorite restaurants and dishes',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      action: () => setActiveTab('favorites')
    },
    {
      icon: Utensils,
      label: 'Dietary Considerations',
      description: 'Manage your food preferences and restrictions',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      action: () => setActiveTab('dietary')
    },
    {
      icon: Lock,
      label: 'Security Settings',
      description: 'Update password and security preferences',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      action: () => setActiveTab('security')
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRoomActive = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    return expiration > now;
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'tiktok':
        return <Video className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const getSocialLabel = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'Instagram';
      case 'twitter':
        return 'X (Twitter)';
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
      default:
        return platform;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center relative">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2"
            >
              <Check className="w-5 h-5 flex-shrink-0" />
              <p>{success}</p>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with edit button */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                <img 
                  src={avatarUrl} 
                  alt={user?.username || 'User'} 
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleAvatarClick}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarChange}
              />
              {isUpdating && isEditingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="space-y-2">
                  <div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Username"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className={cn(
                        "px-3 py-1 bg-orange-500 text-white rounded-md text-sm flex items-center gap-1",
                        isUpdating && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setUsername(user?.username || '');
                        setError(null);
                      }}
                      disabled={isUpdating}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">{user?.username || 'User'}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-500">{user?.email || ''}</p>
                </>
              )}
              
              {/* About Me Section */}
              <div className="mt-4">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <h3 className="text-sm font-medium text-gray-700">About Me</h3>
                  <button
                    onClick={() => setIsEditingAbout(true)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
                
                {isEditingAbout ? (
                  <div className="space-y-2">
                    <textarea
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateAboutMe}
                        disabled={isUpdating}
                        className={cn(
                          "px-3 py-1 bg-orange-500 text-white rounded-md text-sm flex items-center gap-1",
                          isUpdating && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingAbout(false);
                          loadUserProfile();
                          setError(null);
                        }}
                        disabled={isUpdating}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    {aboutMe || 'No description yet'}
                  </p>
                )}
              </div>
              
              {/* Social Media Links */}
              <div className="mt-4">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Social Media</h3>
                  <button
                    onClick={() => setIsEditingSocial(true)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
                
                {isEditingSocial ? (
                  <div className="space-y-3">
                    {Object.keys(socialLinks).map((platform) => (
                      <div key={platform} className="flex items-center gap-2">
                        {getSocialIcon(platform)}
                        <input
                          type="text"
                          value={socialLinks[platform as keyof typeof socialLinks]}
                          onChange={(e) => setSocialLinks({
                            ...socialLinks,
                            [platform]: e.target.value
                          })}
                          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder={`Your ${getSocialLabel(platform)} URL`}
                        />
                      </div>
                    ))}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateSocialLinks}
                        disabled={isUpdating}
                        className={cn(
                          "px-3 py-1 bg-orange-500 text-white rounded-md text-sm flex items-center gap-1",
                          isUpdating && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingSocial(false);
                          loadUserProfile();
                          setError(null);
                        }}
                        disabled={isUpdating}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(socialLinks).some(([_, value]) => value) ? (
                      Object.entries(socialLinks).map(([platform, url]) => 
                        url ? (
                          <a 
                            key={platform}
                            href={url.startsWith('http') ? url : `https://${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            {getSocialIcon(platform)}
                            <span>{getSocialLabel(platform)}</span>
                          </a>
                        ) : null
                      )
                    ) : (
                      <p className="text-gray-500 text-sm">No social media links added</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={item.action}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Sign Out Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleSignOut}
          className="w-full mt-8 py-4 px-6 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </motion.button>
      </main>
    </div>
  );
}