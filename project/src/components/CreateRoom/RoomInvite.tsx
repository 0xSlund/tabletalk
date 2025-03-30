import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Check, Search, Share2, MessageSquare, BookTemplate as Template } from 'lucide-react';
import { popVariants } from '../../components/PageTransition';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  favorite?: boolean;
  recent?: boolean;
}

interface RoomInviteProps {
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
}

export function RoomInvite({
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
  setTemplateName
}: RoomInviteProps) {
  return (
    <div className="space-y-8">
      {/* Invite Friends */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-lg font-medium text-gray-900">
            Invite Friends
          </label>
          <button
            type="button"
            onClick={() => setShowContactSearch(true)}
            className="text-orange-600 hover:text-orange-700 font-medium text-sm"
          >
            Add More
          </button>
        </div>

        {/* Selected Contacts */}
        <div className="flex flex-wrap gap-2">
          {selectedContacts.map(contactId => {
            const contact = filteredContacts.find(c => c.id === contactId);
            if (!contact) return null;
            
            return (
              <div
                key={contact.id}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full"
              >
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium">{contact.name}</span>
                <button
                  type="button"
                  onClick={() => toggleContact(contact.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Contact Search Modal */}
        <AnimatePresence>
          {showContactSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                variants={popVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-2xl p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Add Friends</h3>
                  <button
                    type="button"
                    onClick={() => setShowContactSearch(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search contacts..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Contact List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredContacts.map(contact => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => toggleContact(contact.id)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium">{contact.name}</span>
                        {contact.favorite && (
                          <Heart className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.recent && (
                          <span className="text-xs text-gray-500">Recent</span>
                        )}
                        {selectedContacts.includes(contact.id) && (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Options */}
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Share via Message
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            More Options
          </button>
        </div>
      </div>

      {/* Save as Template */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <Template className="w-5 h-5 text-gray-600" />
          <span className="text-gray-900">Save as Template</span>
        </div>
        <button
          type="button"
          onClick={() => setSaveAsTemplate(!saveAsTemplate)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            saveAsTemplate ? 'bg-orange-500' : 'bg-gray-200'
          }`}
        >
          <span className="sr-only">Save as template</span>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              saveAsTemplate ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Template Name Input */}
      <AnimatePresence>
        {saveAsTemplate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name (e.g., Weekly Team Lunch)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}