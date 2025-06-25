import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  X, 
  Check, 
  Search, 
  Share2, 
  MessageSquare, 
  BookTemplate as Template,
  UserRoundPlus,
  Users,
  Save,
  Plus,
  CalendarClock,
  Clock,
  BellRing,
  Sparkles,
  Copy,
  Star,
  ChevronRight,
  Zap,
  Calendar,
  Timer,
  Bell,
  UserCheck,
  Edit2,
  UserPlus,
  UsersRound,
  UserPlus2,
  ChefHat
} from 'lucide-react';
import { popVariants } from '../../../PageTransition';
import { cn } from '../../../../lib/utils';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  favorite?: boolean;
  recent?: boolean;
  status?: 'active' | 'inactive' | 'busy' | 'offline';
}

interface StepInviteProps {
  selectedContacts: string[];
  toggleContact: (contactId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showContactSearch: boolean;
  setShowContactSearch: (show: boolean) => void;
  filteredContacts: Contact[];
  saveAsTemplate: boolean;
  setSaveAsTemplate: (save: boolean) => void;
  templateName: string;
  setTemplateName: (name: string) => void;
  // Room summary props
  participantLimit?: number | null;
  deadline?: string;
  timerOption?: string;
  customDuration?: string;
  durationUnit?: 'minutes' | 'hours';
  reminders?: boolean;
  // Additional props we might need
  roomName?: string;
  selectedCuisines?: string[];
  priceRange?: string[];
  radius?: number;
  foodMode?: string | null;
  // Navigation props
  onNavigateToStep?: (step: number) => void;
}

// Mock template data - in real app this would come from backend
const RECENT_TEMPLATES = [
  { id: '1', name: 'Weekly Standup', icon: Calendar, lastUsed: 'Used this week' },
  { id: '2', name: 'Project Review', icon: Zap, lastUsed: 'Used this week' },
  { id: '3', name: 'Sprint Planning', icon: Timer, lastUsed: 'Used 2 weeks ago' }
];

export function StepInvite({
  selectedContacts,
  toggleContact,
  searchTerm,
  setSearchTerm,
  showContactSearch,
  setShowContactSearch,
  filteredContacts,
  saveAsTemplate,
  setSaveAsTemplate,
  templateName,
  setTemplateName,
  // Room summary props
  participantLimit = null,
  deadline = "",
  timerOption = "30",
  customDuration = "15",
  durationUnit = "minutes",
  reminders = false,
  roomName = "Team Lunch Planning",
  selectedCuisines = [],
  foodMode = null,
  // Navigation props
  onNavigateToStep
}: StepInviteProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  // Format deadline for display
  const formattedDeadline = deadline ? new Date(deadline).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }) : 'No deadline set';

  // Calculate timer display text
  const getTimerText = () => {
    if (timerOption === 'custom') {
      return `${customDuration} ${durationUnit}`;
    } 
    return `${timerOption} minutes`;
  };

  // Get room theme display text
  const getRoomThemeText = () => {
    // Normalize foodMode to handle null/undefined/empty values
    const normalizedFoodMode = foodMode || null;
    
    if (!normalizedFoodMode) return 'Theme not set';
    
    const themeMap = {
      'dining-out': 'Dining Out',
      'cooking': 'Cooking Together',
      'both': 'Cook & Dine',
      'neutral': 'General Planning'
    };
    
    const themeName = themeMap[normalizedFoodMode as keyof typeof themeMap] || 'Custom Theme';
    
    if (selectedCuisines && selectedCuisines.length > 0) {
      const cuisineText = selectedCuisines.length === 1 
        ? selectedCuisines[0] 
        : `${selectedCuisines.length} cuisines selected`;
      return `${themeName} • ${cuisineText}`;
    }
    
    return themeName;
  };

  const handleCopyLink = () => {
    // In real app, copy actual room link
    navigator.clipboard.writeText(`https://tabletalk.app/room/abc123`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Room is Ready!</h1>
        <p className="text-gray-600">Review your configuration, invite friends, and create your collaborative planning session.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Invite & Templates */}
        <div className="lg:col-span-7 space-y-6">
          {/* Invite Collaborators Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <UserPlus2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Invite Collaborators</h2>
                    <p className="text-sm text-gray-600 mt-1">Add team members to join your planning session</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {selectedContacts.length} invited
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Selected Contacts Display */}
              <div className="mb-4">
                <AnimatePresence mode="wait">
                  {selectedContacts.length > 0 ? (
                    <motion.div
                      key="contacts"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-2"
                    >
                      {selectedContacts.map((contactId, index) => {
                        const contact = filteredContacts.find(c => c.id === contactId);
                        if (!contact) return null;
                        
                        // Generate initials from name
                        const initials = contact.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2);
                        
                        // Color palette for avatars
                        const colors = [
                          'bg-purple-500',
                          'bg-blue-500',
                          'bg-green-500',
                          'bg-yellow-500',
                          'bg-pink-500',
                          'bg-indigo-500'
                        ];
                        const bgColor = colors[index % colors.length];
                        
                        return (
                          <motion.div
                            key={contact.id}
                            layout
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center text-white font-semibold shadow-sm`}>
                                  {initials}
                                </div>
                                {/* Status Indicator */}
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                  contact.status === 'active' ? 'bg-green-500' :
                                  contact.status === 'inactive' ? 'bg-yellow-500' :
                                  contact.status === 'busy' ? 'bg-red-500' :
                                  'bg-gray-400'
                                }`} />
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">{contact.name}</span>
                                {contact.favorite && (
                                  <span className="text-xs text-gray-500 ml-2">★ Favorite</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleContact(contact.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-white rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50"
                    >
                      <UsersRound className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 font-medium">No collaborators yet</p>
                      <p className="text-sm text-gray-400 mt-1">Start by adding team members to your planning session</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Add Collaborators Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowContactSearch(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-semibold">Add Collaborators</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Save as Template Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "rounded-2xl shadow-sm border transition-all duration-300",
              saveAsTemplate 
                ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200" 
                : "bg-white border-gray-200"
            )}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      saveAsTemplate ? "bg-emerald-100" : "bg-gray-100"
                    )}
                  >
                    <Template className={cn(
                      "w-6 h-6 transition-colors duration-300",
                      saveAsTemplate ? "text-emerald-600" : "text-gray-600"
                    )} />
                  </motion.div>
                  <div>
                    <h2 className={cn(
                      "text-xl font-semibold transition-colors duration-300",
                      saveAsTemplate ? "text-emerald-900" : "text-gray-900"
                    )}>
                      Save as Template
                    </h2>
                    <p className={cn(
                      "text-sm mt-1 transition-colors duration-300",
                      saveAsTemplate ? "text-emerald-700" : "text-gray-600"
                    )}>
                      Reuse this configuration for future planning sessions
                    </p>
                  </div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={saveAsTemplate}
                    onChange={(e) => setSaveAsTemplate(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="relative w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              
              {/* Template Name Input - Always visible but with different styling */}
              <motion.div
                animate={{ 
                  opacity: saveAsTemplate ? 1 : 0.5,
                  scale: saveAsTemplate ? 1 : 0.98
                }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template Name (e.g., Team Lunch Planning)"
                  disabled={!saveAsTemplate}
                  className={cn(
                    "w-full px-4 py-3 border rounded-xl transition-all duration-300",
                    saveAsTemplate 
                      ? "border-emerald-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400" 
                      : "border-gray-200 bg-gray-50 cursor-not-allowed placeholder-gray-300"
                  )}
                />
              </motion.div>


            </div>
          </motion.div>
        </div>

        {/* Right Column - Room Summary */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 sticky top-4"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  Room Summary
                  <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full font-normal">
                    Ready to Launch
                  </span>
                </h2>
              </div>
            </div>

            <div className="p-6 pb-6">
              {/* Room Name - Clickable */}
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateToStep?.(1)}
                className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{roomName}</h3>
                    <p className="text-sm text-gray-600">Click to edit room name</p>
                  </div>
                  <Edit2 className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>

              {/* Summary Items */}
              <div className="space-y-5">
                {/* Room Theme */}
                <motion.div
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigateToStep?.(1)}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                    foodMode === 'dining-out' 
                      ? 'bg-violet-50 hover:bg-violet-100' 
                      : foodMode === 'cooking' 
                      ? 'bg-teal-50 hover:bg-teal-100' 
                      : 'bg-orange-50 hover:bg-orange-100'
                  }`}
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <ChefHat className={`w-5 h-5 ${
                      foodMode === 'dining-out' 
                        ? 'text-violet-600' 
                        : foodMode === 'cooking' 
                        ? 'text-teal-600' 
                        : 'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Room Theme</p>
                    <p className="text-sm text-gray-600 mt-0.5">{getRoomThemeText()}</p>
                  </div>
                  <Edit2 className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                    foodMode === 'dining-out' 
                      ? 'text-violet-400' 
                      : foodMode === 'cooking' 
                      ? 'text-teal-400' 
                      : 'text-orange-400'
                  }`} />
                </motion.div>

                {/* Participants */}
                <motion.div
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigateToStep?.(2)}
                  className="flex items-start gap-3 p-3 bg-indigo-50 rounded-xl cursor-pointer transition-all duration-200 hover:bg-indigo-100 group"
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Participants</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Up to {participantLimit || 10} participants
                    </p>
                  </div>
                  <Edit2 className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>

                {/* Decision Timer */}
                <motion.div
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigateToStep?.(2)}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                    foodMode === 'dining-out' 
                      ? 'bg-violet-50 hover:bg-violet-100' 
                      : foodMode === 'cooking' 
                      ? 'bg-teal-50 hover:bg-teal-100' 
                      : 'bg-orange-50 hover:bg-orange-100'
                  }`}
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Timer className={`w-5 h-5 ${
                      foodMode === 'dining-out' 
                        ? 'text-violet-600' 
                        : foodMode === 'cooking' 
                        ? 'text-teal-600' 
                        : 'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Decision Timer</p>
                    <p className="text-sm text-gray-600 mt-0.5">{getTimerText()} per decision</p>
                  </div>
                  <Edit2 className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                    foodMode === 'dining-out' 
                      ? 'text-violet-400' 
                      : foodMode === 'cooking' 
                      ? 'text-teal-400' 
                      : 'text-orange-400'
                  }`} />
                </motion.div>

                {/* Schedule */}
                <motion.div
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigateToStep?.(2)}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl cursor-pointer transition-all duration-200 hover:bg-blue-100 group"
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Schedule</p>
                    <p className="text-sm text-gray-600 mt-0.5">{formattedDeadline}</p>
                  </div>
                  <Edit2 className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contact Search Modal */}
      <AnimatePresence>
        {showContactSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              variants={popVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Purple Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Add Collaborators</h3>
                      <p className="text-white/90 text-sm mt-1">Build your dream team for this session</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowContactSearch(false)}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col p-6">
                {/* Search Bar */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
                    autoFocus
                  />
                </div>

                {/* Invite by Email/Phone Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500 p-2.5 rounded-xl">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Invite by Email or Phone</h4>
                      <p className="text-sm text-gray-600">Add anyone to your team instantly</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter email address or phone number..."
                      className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          // Handle invite by email/phone
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center justify-center min-w-[48px]"
                      onClick={() => {
                        // Handle invite
                      }}
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Team Contacts Section */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Team Contacts
                  </h4>
                  
                  <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    <div className="space-y-2">
                      {filteredContacts.length > 0 ? (
                        filteredContacts.map((contact, index) => {
                          // Generate initials from name
                          const initials = contact.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2);
                          
                          // Color palette for avatars
                          const colors = [
                            'bg-purple-500',
                            'bg-blue-500',
                            'bg-green-500',
                            'bg-yellow-500',
                            'bg-pink-500',
                            'bg-indigo-500'
                          ];
                          const bgColor = colors[index % colors.length];
                          
                          // Generate email from name (in real app this would come from data)
                          const email = `${contact.name.toLowerCase().replace(' ', '.')}@company.com`;
                          
                          return (
                            <motion.div
                              key={contact.id}
                              whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.8)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleContact(contact.id)}
                              className="flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-4 pointer-events-none">
                                <div className="relative">
                                  <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow-sm`}>
                                    {initials}
                                  </div>
                                  {/* Status Indicator */}
                                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                    contact.status === 'active' ? 'bg-green-500' :
                                    contact.status === 'inactive' ? 'bg-yellow-500' :
                                    contact.status === 'busy' ? 'bg-red-500' :
                                    'bg-gray-400'
                                  }`} />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{contact.name}</p>
                                  <p className="text-sm text-gray-500">{email}</p>
                                </div>
                              </div>
                              
                              <div className="pointer-events-none">
                                <div className={cn(
                                  "w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center",
                                  selectedContacts.includes(contact.id)
                                    ? "bg-indigo-600 border-indigo-600"
                                    : "bg-white border-gray-300"
                                )}>
                                  {selectedContacts.includes(contact.id) && (
                                    <Check className="w-4 h-4 text-white" />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <UsersRound className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="font-medium">No contacts found</p>
                          <p className="text-sm mt-1">Try searching with a different term</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowContactSearch(false)}
                    className="flex-1 px-6 py-3 text-gray-700 font-medium rounded-2xl border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowContactSearch(false)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-2xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Add Collaborators
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 