import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  UtensilsCrossed, User, Settings, History, Star, LogOut, ChevronRight, 
  Lock, Edit, Loader2, Camera, Check, X, AlertCircle, Trophy, Eye, 
  Utensils, Instagram, Twitter, Youtube, Video, ExternalLink, Award,
  TrendingUp, Calendar, Users, Zap, Shield, Heart, MessageCircle,
  Activity, Target, Sparkles, Crown, Flame, Coffee, Pizza, Salad,
  Cake, Wine, MapPin, Clock, BarChart3, Share2, MoreVertical,
  ChefHat, Medal, Gem, Gift, ArrowLeft, Share, Copy, Plus
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { formatTimeRemaining } from '../lib/utils';
import { getCachedAvatarUrl } from '../lib/avatarCache';

// Add navigation hook
import { useNavigate } from 'react-router-dom';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const glassCardVariants = {
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { scale: 0.98 }
};

// Achievement data
const achievements = [
  { id: 1, title: "Early Bird", icon: Coffee, progress: 80, color: "from-amber-400 to-orange-500", unlocked: true },
  { id: 2, title: "Decision Maker", icon: Target, progress: 65, color: "from-blue-400 to-purple-500", unlocked: true },
  { id: 3, title: "Social Butterfly", icon: Users, progress: 45, color: "from-pink-400 to-rose-500", unlocked: false },
  { id: 4, title: "Trendsetter", icon: TrendingUp, progress: 90, color: "from-green-400 to-emerald-500", unlocked: true }
];

// Stats data structure
interface UserStats {
  roomsCreated: number;
  decisionsInfluenced: number;
  cuisinesExplored: number;
  friendsConnected: number;
}

export function ProfileScreen() {
  const navigate = useNavigate();
  const { setActiveTab, auth: { user, session }, signOut, fetchRecentRooms, joinRoom } = useAppStore();
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
  const [avatarUrl, setAvatarUrl] = useState(getCachedAvatarUrl(user?.id || '', user?.avatar_url));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: ''
  });
  
  // New state for modern features
  const [userStats, setUserStats] = useState<UserStats>({
    roomsCreated: 12,
    decisionsInfluenced: 47,
    cuisinesExplored: 23,
    friendsConnected: 8
  });
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null);
  const [profileCompletion, setProfileCompletion] = useState(75);
  const [userLevel, setUserLevel] = useState(7);
  const [userXP, setUserXP] = useState(2350);
  const [nextLevelXP, setNextLevelXP] = useState(3000);
  const [carouselIndex, setCarouselIndex] = useState(0); // 0: Impact, 1: About+Social, 2: Achievements
  
  // Add state for editing About Me in carousel
  const [isEditingAboutInCarousel, setIsEditingAboutInCarousel] = useState(false);

  // Parallax scroll effects
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 300], [0, -50]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8]);

  useEffect(() => {
    loadRoomHistory();
    loadUserProfile();
    calculateProfileCompletion();
  }, []);

  // Handle escape key for social media modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditingSocial) {
        setIsEditingSocial(false);
      }
    };

    if (isEditingSocial) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isEditingSocial]);

  const calculateProfileCompletion = () => {
    let completion = 25; // Base for having an account
    if (user?.username) completion += 25;
    if (aboutMe) completion += 25;
    if (Object.values(socialLinks).some(link => link)) completion += 15;
    if (avatarUrl && !avatarUrl.includes('default')) completion += 10;
    setProfileCompletion(completion);
  };

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
      
      await useAppStore.getState().fetchUserProfile(user.id);
      setIsEditing(false);
      setSuccess('Profile updated! +50 XP 🎉');
      setUserXP(prev => prev + 50);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
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
      
      setIsEditingAboutInCarousel(false);
      setSuccess('About section updated! +25 XP ✨');
      setUserXP(prev => prev + 25);
      calculateProfileCompletion();
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating about me:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
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
      setSuccess('Social links connected! +30 XP 🔗');
      setUserXP(prev => prev + 30);
      calculateProfileCompletion();
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating social links:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      setIsEditingAvatar(false);
      return;
    }
    
    setError(null);
    setSuccess(null);
    setIsUpdating(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      const avatarUrl = publicUrlData.publicUrl;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatarUrl, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user?.id);
        
      if (updateError) throw updateError;
      
      setAvatarUrl(avatarUrl);
      setSuccess('New look unlocked! +100 XP 📸');
      setUserXP(prev => prev + 100);
      calculateProfileCompletion();
      
      await useAppStore.getState().fetchUserProfile(user?.id || '');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUpdating(false);
      setIsEditingAvatar(false);
    }
  };

  const menuItems = [
    {
      icon: History,
      label: 'Room History',
      description: 'Relive your dining adventures',
      stats: `${userStats.roomsCreated} rooms`,
      color: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      action: () => navigate('/history')
    },
    {
      icon: Star,
      label: 'Favorites',
      description: 'Your culinary hall of fame',
      stats: '24 saved',
      color: 'from-yellow-500 to-amber-500',
      bgGradient: 'from-yellow-500/10 to-amber-500/10',
      action: () => navigate('/favorites')
    },
    {
      icon: Utensils,
      label: 'Dietary Preferences',
      description: 'Personalized for your taste',
      stats: '5 active',
      color: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      action: () => navigate('/dietary')
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Manage your preferences',
      stats: 'Configured',
      color: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      action: () => setActiveTab('security')
    }
  ];

  const getSocialIcon = (platform: string) => {
    const icons = {
      instagram: Instagram,
      twitter: Twitter,
      youtube: Youtube,
      tiktok: Video
    };
    const Icon = icons[platform as keyof typeof icons] || ExternalLink;
    return <Icon className="w-4 h-4" />;
  };

  const getSocialLabel = (platform: string) => {
    const labels = {
      instagram: 'Instagram',
      twitter: 'X (Twitter)',
      youtube: 'YouTube',
      tiktok: 'TikTok'
    };
    return labels[platform as keyof typeof labels] || platform;
  };

  // Carousel navigation handlers
  const handlePrev = () => setCarouselIndex((prev) => (prev === 0 ? 2 : prev - 1));
  const handleNext = () => setCarouselIndex((prev) => (prev === 2 ? 0 : prev + 1));

  // Add back navigation handler
  const handleBack = () => {
    navigate(-1);
  };

  // Share functionality
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const shareOptionsRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside share options
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareOptionsRef.current && !shareOptionsRef.current.contains(event.target as Node)) {
        setShowShareOptions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleShare = async (platform?: string) => {
    const profileUrl = `${window.location.origin}/profile`;
    const shareText = `Check out my TableTalk profile! I'm a Level ${userLevel} Foodie with ${userXP} XP.`;
    
    try {
      if (platform === 'clipboard') {
        await navigator.clipboard.writeText(profileUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
        return;
      }
      
      if (platform === 'email') {
        const mailtoLink = `mailto:?subject=${encodeURIComponent('Check out my TableTalk profile!')}&body=${encodeURIComponent(`${shareText}\n\n${profileUrl}`)}`;
        window.open(mailtoLink);
        return;
      }

      if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${profileUrl}`)}`);
        return;
      }
      
      if (platform === 'telegram') {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareText)}`);
        return;
      }
      
      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${profileUrl}`)}`);
        return;
      }
      
      // Use Web Share API if available and no specific platform chosen
      if (!platform && navigator.share) {
        await navigator.share({
          title: 'My TableTalk Profile',
          text: shareText,
          url: profileUrl
        });
        return;
      }
      
      // Fallback to clipboard copy
      await navigator.clipboard.writeText(profileUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (error) {
      console.error('Error sharing profile:', error);
    } finally {
      setShowShareOptions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3] relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-10 left-5 w-48 h-48 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-5 w-64 h-64 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-50" />
      </motion.div>

      {/* Background animated orbs */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-orange-400/20 to-pink-400/20 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Header */}
      <motion.header 
        className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            {/* Centered Profile Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
            </div>
              <h1 className="text-lg font-bold text-gray-800">Profile</h1>
          </div>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Share</span>
              </button>
              
              {showShareOptions && (
                <div
                  ref={shareOptionsRef}
                  className="absolute top-full right-0 mt-2 w-64 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 transition-all duration-300"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-gray-800">Share Profile</h3>
                      <button 
                        onClick={() => setShowShareOptions(false)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
        </div>
                    
                    {/* Shareable Link Section */}
                    <div className="bg-gray-50 p-3 rounded-xl mb-4 flex items-center">
                      <input 
                        type="text" 
                        value={`${window.location.origin}/profile`} 
                        className="flex-1 bg-transparent border-none text-sm text-gray-600 focus:outline-none truncate pr-2" 
                        readOnly
                      />
                      <button
                        onClick={() => handleShare('clipboard')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          shareCopied 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {shareCopied ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-medium">Copied</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-4 h-4" />
                            <span className="text-xs font-medium">Copy</span>
                          </span>
                        )}
                      </button>
                    </div>
                    
                    {/* Share Options Grid */}
                    <div className="grid grid-cols-4 gap-3">
                      {/* Email */}
                      <button
                        onClick={() => handleShare('email')}
                        className="flex flex-col items-center gap-1 p-3 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-700">Email</span>
                      </button>
                      
                      {/* WhatsApp */}
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.6 6.31999C16.8 5.49999 15.8 4.84999 14.7 4.38999C13.6 3.92999 12.5 3.69999 11.3 3.69999C10.1 3.69999 8.99999 3.92999 7.89999 4.38999C6.79999 4.84999 5.79999 5.49999 5.00002 6.31999C4.20005 7.14 3.55002 8.13999 3.11001 9.28999C2.67001 10.44 2.45001 11.61 2.45001 12.83C2.45001 14.37 2.85001 15.83 3.64001 17.21L2.4 21.6L6.94999 20.37C8.29999 21.09 9.75 21.45 11.3 21.45C12.5 21.45 13.66 21.22 14.76 20.76C15.86 20.3 16.85 19.65 17.65 18.83C18.45 18.01 19.1 17.01 19.55 15.86C20 14.71 20.23 13.54 20.23 12.32C20.23 11.1 20 9.94 19.55 8.79C19.1 7.63999 18.45 6.64 17.6 6.31999V6.31999ZM11.3 19.95C9.99999 19.95 8.7 19.64 7.5 19.02L7.19999 18.84L4.45001 19.59L5.20001 16.92L5 16.61C4.3 15.38 3.95 14.05 3.95 12.62C3.95 11.62 4.13 10.65 4.5 9.71999C4.85 8.78999 5.35 7.96 5.97 7.22C6.6 6.48 7.35 5.9 8.2 5.47C9.05 5.04 9.95 4.83 10.9 4.83C11.85 4.83 12.75 5.04 13.6 5.47C14.45 5.9 15.2 6.48 15.83 7.22C16.45 7.96 16.95 8.78999 17.3 9.71999C17.65 10.65 17.83 11.62 17.83 12.62C17.83 13.62 17.65 14.58 17.3 15.51C16.95 16.44 16.45 17.27 15.83 18.01C15.2 18.75 14.45 19.33 13.6 19.76C12.75 20.19 12.25 20.05 11.3 20.05M15.45 14.05C15.3 13.95 15.16 13.86 15.05 13.83C14.93 13.8 14.65 13.66 14.38 13.53C14.1 13.4 13.96 13.34 13.85 13.32C13.73 13.29 13.58 13.32 13.42 13.47C13.26 13.62 12.96 13.97 12.82 14.13C12.69 14.29 12.54 14.31 12.39 14.24C12.24 14.17 12.01 14.1 11.76 13.97C11.5 13.84 11.13 13.62 10.73 13.2C10.33 12.79 10.12 12.45 10.03 12.23C9.94001 12.03 10.04 11.87 10.14 11.73C10.24 11.58 10.35 11.44 10.46 11.3C10.57 11.16 10.62 11.06 10.67 10.96C10.72 10.85 10.7 10.74 10.66 10.65C10.62 10.56 10.41 10.01 10.27 9.70999C10.13 9.42999 9.98 9.44 9.84 9.43C9.7 9.42 9.57 9.41 9.43 9.41C9.29 9.41 9.07 9.48999 8.85 9.66999C8.63 9.84999 8.27 10.15 8.27 10.7C8.27 11.25 8.62 11.79 8.67 11.88C8.72 11.98 9.27 12.92 10.13 13.71C10.99 14.5 11.84 14.78 12.17 14.87C12.5 14.97 12.95 14.95 13.34 14.86C13.73 14.78 14.21 14.51 14.35 14.17C14.49 13.83 14.49 13.53 14.45 13.47C14.41 13.4 14.26 13.35 14.05 13.25L15.45 14.05Z" fill="#16A34A"/>
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                      </button>
                      
                      {/* Telegram */}
                      <button
                        onClick={() => handleShare('telegram')}
                        className="flex flex-col items-center gap-1 p-3 hover:bg-sky-50 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.8 3.27001L1.79995 10.15C0.794966 10.56 0.849962 11.25 1.65997 11.5L6.73994 13.03L18.86 6.27C19.29 5.99 19.67 6.14 19.35 6.44L9.50997 15.33H9.50995L9.50997 15.33L9.15996 20.51C9.53996 20.51 9.70995 20.33 9.92995 20.12L12.22 17.87L17.34 21.69C18.11 22.11 18.66 21.89 18.84 21.02L21.93 4.47001C22.2 3.41001 21.49 2.81001 20.8 3.27001H21.8Z" fill="#0EA5E9"/>
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-700">Telegram</span>
                      </button>
                      
                      {/* Twitter/X */}
                      <button
                        onClick={() => handleShare('twitter')}
                        className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.1761 4H19.9362L13.9061 10.7774L21 20H15.4456L11.0951 14.4066L6.11723 20H3.35544L9.80517 12.7455L3 4H8.69545L12.6279 9.11258L17.1761 4ZM16.2073 18.3754H17.7368L7.86441 5.53928H6.2232L16.2073 18.3754Z" fill="#111827"/>
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-700">X</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-4 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Notifications */}
          <AnimatePresence mode="wait">
          {success && (
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg flex items-center gap-2 text-sm"
              >
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="font-medium">{success}</p>
            </motion.div>
          )}
          
          {error && (
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="p-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-lg flex items-center gap-2 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
          {/* Profile Completion Bar - Moved above first card */}
          <motion.div variants={itemVariants} className="p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm font-bold text-orange-600">{profileCompletion}%</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
        <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            {profileCompletion < 100 && (
              <p className="text-xs text-gray-600 mt-2">
                Complete your profile to unlock exclusive features! 🎁
              </p>
            )}
          </motion.div>

          {/* Main Profile Card */}
          <motion.div
            variants={itemVariants}
            className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 md:p-6 overflow-hidden"
          >
            <div className="relative grid md:grid-cols-3 gap-4 md:gap-6">
              {/* Avatar & Basic Info (static left column) */}
              <div className="md:col-span-1 text-center md:text-left flex flex-col items-center md:items-start">
                {/* Avatar with Level Badge */}
                <div className="relative inline-block group">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl">
                <img 
                  src={avatarUrl} 
                  alt={user?.username || 'User'} 
                  className="w-full h-full object-cover"
                />
              </div>
                    
                    {/* Camera Overlay */}
              <button
                onClick={handleAvatarClick}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
                  </motion.div>
                  
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            
                {/* Name & Email */}
                <div className="mt-3">
              {isEditing ? (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                      placeholder="Username"
                    />
                  <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                          className="flex-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium shadow-lg disabled:opacity-70 text-sm"
                    >
                      {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                      ) : (
                        'Save'
                      )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsEditing(false);
                        setUsername(user?.username || '');
                      }}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm"
                    >
                      Cancel
                        </motion.button>
                  </div>
                    </motion.div>
              ) : (
                <>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <h2 className="text-lg font-bold text-gray-800">
                          {user?.username || 'Foodie'}
                        </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                          <Edit className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                      <p className="text-gray-500 text-sm">{session?.user?.email}</p>
                </>
              )}
                </div>
                
                {/* XP Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-start justify-between text-xs">
                    <motion.div 
                      className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-lg px-1.5 py-0.5 text-xs font-bold shadow-lg w-fit"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      Lvl {userLevel}
                    </motion.div>
                    <span className="font-medium text-gray-800 ml-8 mt-1">
                      {userXP} / {nextLevelXP} XP
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-orange-400 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(userXP / nextLevelXP) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
              {/* Carousel Card (right, 2 columns on desktop) */}
              <div className="md:col-span-2 flex flex-col h-full">
                <div className="flex-1 flex flex-col justify-between h-full">
                  <AnimatePresence mode="wait" initial={false}>
                    {carouselIndex === 0 && (
                      <motion.div
                        key="impact"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="h-full flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-800">Your Impact</h3>
                          <div className="flex items-center gap-2">
                            <button onClick={handlePrev} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                              <span className="sr-only">Previous</span>
                              <ChevronRight className="w-4 h-4 rotate-180 text-gray-500" />
                            </button>
                            {[0, 1, 2].map((idx) => (
                  <button
                                key={idx}
                                onClick={() => setCarouselIndex(idx)}
                                className={cn(
                                  "w-2.5 h-2.5 rounded-full mx-0.5 transition-all",
                                  carouselIndex === idx ? "bg-orange-500 scale-110" : "bg-gray-300"
                                )}
                                aria-label={`Go to slide ${idx + 1}`}
                              />
                            ))}
                            <button onClick={handleNext} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                              <span className="sr-only">Next</span>
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 flex-1">
                          {[
                            { label: 'Rooms Created', value: userStats.roomsCreated, icon: Users, color: 'from-blue-400 to-blue-600' },
                            { label: 'Decisions Made', value: userStats.decisionsInfluenced, icon: Target, color: 'from-green-400 to-green-600' },
                            { label: 'Cuisines Tried', value: userStats.cuisinesExplored, icon: ChefHat, color: 'from-purple-400 to-purple-600' },
                            { label: 'Friends', value: userStats.friendsConnected, icon: Heart, color: 'from-pink-400 to-pink-600' }
                          ].map((stat, index) => (
                            <motion.div
                              key={stat.label}
                              variants={glassCardVariants}
                              whileHover="hover"
                              whileTap="tap"
                              className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-lg cursor-pointer"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <motion.p 
                                    className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                                    style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                  >
                                    <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                      {stat.value}
                                    </span>
                                  </motion.p>
                                  <p className="text-xs text-gray-600 mt-0.5">{stat.label}</p>
                                </div>
                                <div className={`p-1.5 bg-gradient-to-br ${stat.color} rounded-lg text-white opacity-80`}>
                                  <stat.icon className="w-4 h-4" />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    {carouselIndex === 1 && (
                      <motion.div
                        key="about"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="h-full flex flex-col"
                      >
                                                     <div className="flex items-center justify-between mb-3">
                               <h3 className="text-base font-bold text-gray-800">About Me</h3>
                               <div className="flex items-center gap-2">
                                 <button onClick={handlePrev} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                   <span className="sr-only">Previous</span>
                                   <ChevronRight className="w-4 h-4 rotate-180 text-gray-500" />
                                 </button>
                                 {[0, 1, 2].map((idx) => (
                                   <button
                                     key={idx}
                                     onClick={() => setCarouselIndex(idx)}
                                     className={cn(
                                       "w-2.5 h-2.5 rounded-full mx-0.5 transition-all",
                                       carouselIndex === idx ? "bg-orange-500 scale-110" : "bg-gray-300"
                                     )}
                                     aria-label={`Go to slide ${idx + 1}`}
                                   />
                                 ))}
                                 <button onClick={handleNext} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                   <span className="sr-only">Next</span>
                                   <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                               </div>
                </div>
                
                                                     {isEditingAboutInCarousel ? (
                               <motion.div
                                 className="flex-1 flex flex-col bg-gray-50 rounded-lg p-4"
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{ type: "spring", stiffness: 200, damping: 20 }}
                               >
                                 <div className="flex items-center gap-2 mb-3">
                                   <Edit className="w-4 h-4 text-gray-500" />
                                   <h4 className="font-medium text-gray-700">Edit About Me</h4>
                                 </div>
                                 
                    <textarea
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                                   className="flex-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm leading-relaxed"
                                   placeholder="Tell us about your food journey! Share your favorite cuisines, cooking adventures, or memorable dining experiences..."
                                   rows={5}
                                 />
                                 
                                 <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                                   <p className="text-xs text-gray-500">
                                     {aboutMe.length}/500 characters
                                   </p>
                    <div className="flex gap-2">
                                     <motion.button
                                       whileHover={{ scale: 1.05 }}
                                       whileTap={{ scale: 0.95 }}
                                       onClick={() => {
                                         setIsEditingAboutInCarousel(false);
                                         loadUserProfile();
                                       }}
                                       className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg font-medium transition-colors text-sm"
                                     >
                                       Cancel
                                     </motion.button>
                                     <motion.button
                                       whileHover={{ scale: 1.05 }}
                                       whileTap={{ scale: 0.95 }}
                        onClick={handleUpdateAboutMe}
                        disabled={isUpdating}
                                       className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-70 text-sm"
                      >
                        {isUpdating ? (
                                         <div className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                                           <span>Saving...</span>
                                         </div>
                        ) : (
                          'Save'
                        )}
                                     </motion.button>
                    </div>
                  </div>
                               </motion.div>
                                                     ) : (
                                                                <div className="flex-1 flex flex-col group">
                                 <div 
                                   className="flex-1 cursor-pointer p-4 rounded-lg hover:bg-gray-50 hover:border hover:border-gray-200 transition-all duration-300 ease-out group"
                                   onClick={() => setIsEditingAboutInCarousel(true)}
                                 >
                                   {aboutMe ? (
                                     <div className="space-y-2">
                                       <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                                         <Edit className="w-3 h-3 text-gray-400" />
                                         <span className="text-xs text-gray-500">Click to edit</span>
                                       </div>
                                       <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-800 transition-colors duration-300 ease-out">
                                         {aboutMe}
                                       </p>
                                     </div>
                                   ) : (
                                     <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                                       <Edit className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300 ease-out" />
                                       <div>
                                         <p className="text-gray-500 text-sm group-hover:text-gray-600 transition-colors duration-300 ease-out">Tell us about your food journey!</p>
                                       </div>
                                     </div>
                )}
              </div>
              <div className="mt-4">
                                   <h3 className="text-base font-bold text-gray-800 mb-2">Connect</h3>
                                   <motion.button
                    onClick={() => setIsEditingSocial(true)}
                                     className="w-full flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 hover:shadow-md rounded-lg transition-all duration-300 ease-out text-sm font-medium text-gray-700 hover:text-gray-800 cursor-pointer"
                                     whileHover={{ scale: 1.02 }}
                                     whileTap={{ scale: 0.98 }}
                  >
                                     <Plus className="w-4 h-4 transition-colors duration-300 ease-out group-hover:text-gray-800" />
                                     <span>Add Social Media</span>
                                   </motion.button>
                </div>
                      </div>
                                                          )}


                           </motion.div>
                         )}
                    {carouselIndex === 2 && (
                      <motion.div
                        key="achievements"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="h-full flex flex-col"
                      >
                                                     <div className="flex items-center justify-between mb-3">
                               <div className="flex items-center gap-3">
                                 <h3 className="text-lg font-bold text-gray-800">Achievements</h3>
                                 <motion.button
                                   whileHover={{ scale: 1.05 }}
                                   whileTap={{ scale: 0.95 }}
                                   className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg text-xs font-medium shadow-lg"
                                 >
                                   View All
                                 </motion.button>
                               </div>
                               <div className="flex items-center gap-2">
                                 <button onClick={handlePrev} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                   <span className="sr-only">Previous</span>
                                   <ChevronRight className="w-4 h-4 rotate-180 text-gray-500" />
                                 </button>
                                 {[0, 1, 2].map((idx) => (
                      <button
                                     key={idx}
                                     onClick={() => setCarouselIndex(idx)}
                        className={cn(
                                       "w-2.5 h-2.5 rounded-full mx-0.5 transition-all",
                                       carouselIndex === idx ? "bg-orange-500 scale-110" : "bg-gray-300"
                                     )}
                                     aria-label={`Go to slide ${idx + 1}`}
                                   />
                                 ))}
                                 <button onClick={handleNext} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                   <span className="sr-only">Next</span>
                                   <ChevronRight className="w-4 h-4 text-gray-500" />
                                 </button>
                               </div>
                             </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                          {achievements.map((achievement, index) => (
                            <motion.div
                              key={achievement.id}
                              variants={glassCardVariants}
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => setSelectedAchievement(achievement.id)}
                              className={cn(
                                "relative p-3 rounded-xl cursor-pointer transition-all",
                                achievement.unlocked 
                                  ? "bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-sm border border-white/30 shadow-lg" 
                                  : "bg-gray-100/50 backdrop-blur-sm border border-gray-200/30 opacity-60"
                              )}
                            >
                              <div className="flex flex-col items-center text-center space-y-1.5">
                                <motion.div 
                                  className={cn(
                                    "p-2 rounded-lg",
                                    achievement.unlocked 
                                      ? `bg-gradient-to-br ${achievement.color} shadow-lg` 
                                      : "bg-gray-300"
                                  )}
                                  whileHover={{ rotate: 360 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <achievement.icon className="w-4 h-4 text-white" />
                                </motion.div>
                                <div className="w-full">
                                  <p className={cn(
                                    "text-xs font-semibold",
                                    achievement.unlocked ? "text-gray-800" : "text-gray-500"
                                  )}>
                                    {achievement.title}
                                  </p>
                                  <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div 
                                      className={`h-full bg-gradient-to-r ${achievement.color}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${achievement.progress}%` }}
                                      transition={{ duration: 1, delay: index * 0.1 }}
                                    />
                    </div>
                                  <p className="text-xs text-gray-500 mt-0.5">{achievement.progress}%</p>
                  </div>
                                {achievement.unlocked && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5"
                                  >
                                    <Check className="w-2.5 h-2.5 text-yellow-900" />
                                  </motion.div>
                    )}
                  </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                )}
                  </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

          {/* Quick Actions - Made Bigger */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
                  variants={itemVariants}
                  custom={index}
                  className="group relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={item.action}
            >
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/20 transition-all group-hover:shadow-xl">
              <div className="flex items-center gap-4">
                      <div className={`p-3 bg-gradient-to-br ${item.color} rounded-lg transition-all`}>
                        <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                        <h4 className="font-semibold text-gray-800 mb-1">{item.label}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </div>
              </div>
            </motion.button>
          ))}
        </div>
          </motion.div>

          {/* Sign Out - Enhanced with Better Microinteractions */}
          <motion.div variants={itemVariants} className="flex justify-center pt-4">
        <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.95 }}
          onClick={handleSignOut}
              className="relative px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-3 text-base overflow-hidden group"
            >
              {/* Background gradient animation on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="relative flex items-center gap-3"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
        >
          <LogOut className="w-5 h-5" />
                </motion.div>
          <span>Sign Out</span>
              </motion.div>
        </motion.button>
          </motion.div>
        </motion.div>
      </main>

      {/* Social Media Modal */}
      <AnimatePresence>
        {isEditingSocial && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditingSocial(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white rounded-t-2xl p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Connect Your Social Media</h3>
                    <p className="text-sm text-gray-600">Share your food journey with friends</p>
                  </div>
                  <button
                    onClick={() => setIsEditingSocial(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {Object.entries(socialLinks).map(([platform, url]) => (
                    <div key={platform} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                          {getSocialIcon(platform)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-lg">{getSocialLabel(platform)}</h4>
                          <p className="text-sm text-gray-500">Add your {getSocialLabel(platform).toLowerCase()} profile</p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setSocialLinks(prev => ({
                          ...prev,
                          [platform]: e.target.value
                        }))}
                        placeholder={`https://${platform}.com/yourusername`}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white rounded-b-2xl p-6 border-t border-gray-100">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsEditingSocial(false)}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSocialLinks}
                    disabled={isUpdating}
                    className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-70"
                  >
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="inline-flex p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg mb-3">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Achievement Unlocked!</h3>
                <p className="text-sm text-gray-600">Keep up the great work!</p>
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="mt-4 px-5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}