import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Clock, Users, MapPin, UtensilsCrossed, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { fadeVariants } from '../PageTransition';
import { Link } from 'react-router-dom';

// Mock data for templates - in a real app, this would be fetched from Supabase
const MOCK_TEMPLATES = [
  {
    id: '1',
    name: 'Lunch with Team',
    settings: {
      participantLimit: 8,
      timerDuration: 20,
      radius: 3,
      cuisines: ['Italian', 'Japanese'],
      priceRange: ['$$', '$$$']
    }
  },
  {
    id: '2',
    name: 'Weekend Dinner',
    settings: {
      participantLimit: null, // Open invite
      timerDuration: 45,
      radius: 10,
      cuisines: ['American', 'Mexican', 'Indian'],
      priceRange: ['$$', '$$$', '$$$$']
    }
  },
  {
    id: '3',
    name: 'Quick Breakfast',
    settings: {
      participantLimit: 4,
      timerDuration: 15,
      radius: 2,
      cuisines: ['Cafe', 'Bakery'],
      priceRange: ['$', '$$']
    }
  }
];

interface SavedTemplatesScreenProps {
  onBack: () => void;
  onCreateFromTemplate: (
    templateName: string, 
    timerDuration: number, 
    radius: number
  ) => void;
}

const SavedTemplatesScreen: React.FC<SavedTemplatesScreenProps> = ({
  onBack,
  onCreateFromTemplate
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customRoomName, setCustomRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateRoom = () => {
    if (!selectedTemplate || !customRoomName.trim() || isCreating) return;
    
    setIsCreating(true);
    const template = MOCK_TEMPLATES.find(t => t.id === selectedTemplate);
    
    if (template) {
      onCreateFromTemplate(
        customRoomName,
        template.settings.timerDuration,
        template.settings.radius
      );
    }
  };
  
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100/30 to-red-50"
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              to="/create"
              className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors ${isCreating ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-orange-300 rounded-full blur-sm opacity-70"></div>
                <Bookmark className="relative w-6 h-6 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Templates</h1>
            </div>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12 relative">
        {/* Decorative circles */}
        <div className="absolute top-20 right-4 w-32 h-32 bg-orange-200 rounded-full opacity-20 blur-xl -z-10"></div>
        <div className="absolute bottom-20 left-4 w-24 h-24 bg-red-200 rounded-full opacity-20 blur-xl -z-10"></div>
        
        <motion.p 
          className="text-center text-gray-700 mb-8 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Create a room using one of your saved templates
        </motion.p>
        
        <div className="space-y-6">
          {MOCK_TEMPLATES.map(template => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                selectedTemplate === template.id 
                  ? 'border-orange-400 ring-2 ring-orange-300' 
                  : 'border-orange-100 hover:border-orange-300'
              }`}
              onClick={() => {
                if (isCreating) return;
                setSelectedTemplate(template.id);
                // Pre-fill room name based on template
                if (!customRoomName) {
                  setCustomRoomName(template.name);
                }
              }}
            >
              <div className="relative py-6 px-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-400"></div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-orange-500" />
                      {template.name}
                    </h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // In a real app, this would delete the template
                        alert(`Deleting template ${template.name} (not implemented)`);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>{template.settings.timerDuration} min timer</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 text-orange-500" />
                      <span>
                        {template.settings.participantLimit 
                          ? `${template.settings.participantLimit} people max`
                          : 'Open invitation'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span>{template.settings.radius} mile radius</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                      <span>{template.settings.cuisines.length} cuisines</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {template.settings.priceRange.map(price => (
                      <div key={price} className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                        {price}
                      </div>
                    ))}
                    {template.settings.cuisines.slice(0, 2).map(cuisine => (
                      <div key={cuisine} className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                        {cuisine}
                      </div>
                    ))}
                    {template.settings.cuisines.length > 2 && (
                      <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                        +{template.settings.cuisines.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer border border-dashed border-orange-300 hover:border-orange-400 transition-all duration-300"
            onClick={() => {
              // In a real app, this would navigate to custom create with an option to save
              alert('Create new template (not implemented)');
            }}
          >
            <div className="py-6 px-6 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <PlusCircle className="w-8 h-8 text-orange-400" />
                <p className="font-medium">Create New Template</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Room creation form */}
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-orange-100"
          >
            <h3 className="text-lg font-semibold mb-4">Create Room from Template</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name
                </label>
                <input
                  id="roomName"
                  type="text"
                  placeholder="Enter a name for your room"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  disabled={isCreating}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>
              
              <motion.button
                whileHover={{ scale: !isCreating && customRoomName.trim() ? 1.03 : 1 }}
                whileTap={{ scale: !isCreating && customRoomName.trim() ? 0.97 : 1 }}
                onClick={handleCreateRoom}
                disabled={isCreating || !customRoomName.trim()}
                className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all ${
                  !isCreating && customRoomName.trim() 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isCreating ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating room...
                  </div>
                ) : (
                  'Create Room'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
};

export default SavedTemplatesScreen; 