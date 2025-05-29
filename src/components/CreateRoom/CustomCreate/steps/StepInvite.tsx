import React from 'react';
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
  BellRing
} from 'lucide-react';
import { popVariants } from '../../../PageTransition';
import { cn } from '../../../../lib/utils';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  favorite?: boolean;
  recent?: boolean;
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
}

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
  reminders = false
}: StepInviteProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  // Format deadline for display if it exists
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
      return `${customDuration} ${durationUnit} per decision`;
    } 
    return `${timerOption === '60' ? '1 hour' : `${timerOption} min`} per decision`;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Invite Friends and Templates - Takes up 2 columns */}
        <div className="lg:col-span-2">
          {/* Invite Friends */}
        <motion.div 
            className="space-y-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="bg-purple-100 p-2 rounded-lg">
              <UserRoundPlus className="w-5 h-5 text-purple-600" />
            </span>
            Invite Friends
          </label>

          {/* Selected Contacts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[280px] flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4">
              {selectedContacts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedContacts.map(contactId => {
                    const contact = filteredContacts.find(c => c.id === contactId);
                    if (!contact) return null;
                    
                    return (
                      <motion.div
                        key={contact.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-2 rounded-full"
                      >
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-medium text-purple-800">{contact.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleContact(contact.id)}
                          className="text-purple-400 hover:text-purple-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 h-full flex flex-col items-center justify-center">
                  <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No friends selected yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add friends to share your room</p>
                </div>
              )}
            </div>

            <div className="mt-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowContactSearch(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
              >
                <UserRoundPlus className="w-5 h-5" />
                {selectedContacts.length > 0 ? 'Add More Friends' : 'Add Friends'}
              </motion.button>
            </div>
          </div>

          {/* Sharing Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="font-medium text-gray-700 mb-3 text-base">Other ways to share</div>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <Share2 className="w-5 h-5" />
                Copy Link
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <MessageSquare className="w-5 h-5" />
                Text Message
              </motion.button>
            </div>
          </div>
        </motion.div>

          {/* Save as Template */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="bg-blue-100 p-2 rounded-lg">
              <Template className="w-5 h-5 text-blue-600" />
            </span>
            Save as Template
          </label>
          
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-gray-700">Save for future use</span>
              </div>

              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <AnimatePresence>
              {saveAsTemplate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Template Name
                      </label>
                      <input
                        type="text"
                        id="template-name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="E.g., Weekend Lunch, Team Dinner..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base"
                      />
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2">
                      <Save className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p>
                        Saving as a template will store your current settings, cuisine preferences, and selected participants for future rooms.
                      </p>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">This template will save:</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm text-gray-600 gap-2">
                          <div className="bg-gray-100 p-1 rounded-full">
                            <Check className="w-3 h-3 text-gray-600" />
                          </div>
                          Room settings (timer, participant limits)
                        </li>
                        <li className="flex items-center text-sm text-gray-600 gap-2">
                          <div className="bg-gray-100 p-1 rounded-full">
                            <Check className="w-3 h-3 text-gray-600" />
                          </div>
                          Food preferences and search radius
                        </li>
                        <li className="flex items-center text-sm text-gray-600 gap-2">
                          <div className="bg-gray-100 p-1 rounded-full">
                            <Check className="w-3 h-3 text-gray-600" />
                          </div>
                          Selected participants
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Recent Templates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="font-medium text-gray-700 mb-3 text-base">Your Recent Templates</div>
            <div className="space-y-2">
              <button 
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <Template className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-800">Weekend Brunch</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">3 people</span>
              </button>
              <button 
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <Template className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-800">Team Lunch</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">6 people</span>
              </button>
            </div>
          </div>
        </motion.div>
        </div>

        {/* Room Summary Sidebar - 1 column */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Room Summary</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    Up to {participantLimit || 25} participants
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarClock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{formattedDeadline}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{getTimerText()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <BellRing className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {reminders ? 'Reminders are enabled' : 'No reminders'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Selected Participants Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6 p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700">Selected Participants</h3>
              <span className="bg-purple-100 text-purple-800 font-medium text-sm px-2.5 py-0.5 rounded-full">
                {selectedContacts.length} {selectedContacts.length === 1 ? 'person' : 'people'}
              </span>
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
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Friends</h3>
                <button
                  type="button"
                  onClick={() => setShowContactSearch(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search friends..."
                  className="w-full pl-11 pr-10 py-3.5 border border-gray-200 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Contact List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map(contact => (
                      <motion.button
                        key={contact.id}
                        variants={itemVariants}
                        type="button"
                        onClick={() => toggleContact(contact.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                          selectedContacts.includes(contact.id)
                            ? "bg-purple-50 border border-purple-200"
                            : "hover:bg-gray-50 border border-gray-100"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                          />
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-gray-900">{contact.name}</span>
                            <div className="flex items-center gap-2">
                              {contact.favorite && (
                                <span className="flex items-center gap-0.5 text-xs text-rose-500">
                                  <Heart className="w-3 h-3" />
                                  Favorite
                                </span>
                              )}
                              {contact.recent && (
                                <span className="text-xs text-gray-500">Recent</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {selectedContacts.includes(contact.id) ? (
                          <div className="flex-shrink-0 bg-purple-500 text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 border border-gray-200 text-gray-400 rounded-full p-1">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </motion.button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No contacts found matching "{searchTerm}"
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setShowContactSearch(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactSearch(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 