import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Layout, 
  Clock, 
  Users, 
  MapPin, 
  Play,
  Trash2,
  Edit3,
  Star,
  Calendar,
  ChefHat,
  Timer,
  UserCheck,
  Search,
  Plus,
  Sparkles
} from 'lucide-react';
import { TemplateService, type TemplateData } from '../../lib/templateService';
import type { Database } from '../../lib/database.types';

type RoomTemplate = any; // TODO: Update when room_templates table is added to database types

interface SavedTemplatesScreenProps {
  onBack: () => void;
  onCreateFromTemplate: (template: RoomTemplate) => void;
}

export function SavedTemplatesScreen({ onBack, onCreateFromTemplate }: SavedTemplatesScreenProps) {
  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<RoomTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await TemplateService.getUserTemplates();
      
      if (result.success && result.templates) {
        setTemplates(result.templates);
      } else {
        setError(result.error || 'Failed to load templates');
      }
    } catch (err) {
      setError('An error occurred while loading templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const result = await TemplateService.deleteTemplate(templateId);
      
      if (result.success) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      } else {
        setError(result.error || 'Failed to delete template');
      }
    } catch (err) {
      setError('An error occurred while deleting the template');
      console.error('Error deleting template:', err);
    }
  };

  const handleUseTemplate = async (template: RoomTemplate) => {
    try {
      // Increment usage count
      await TemplateService.incrementUsageCount(template.id);
      
      // Call the callback to create room from template
      onCreateFromTemplate(template);
    } catch (err) {
      console.error('Error using template:', err);
      // Still proceed with template usage even if incrementing fails
      onCreateFromTemplate(template);
    }
  };

  const getThemeText = (foodMode: string | null) => {
    if (!foodMode) return 'General Planning';
    
    const themeMap = {
      'dining-out': 'Dining Out',
      'cooking': 'Cooking Together',
      'neutral': 'General Planning'
    };
    
    return themeMap[foodMode as keyof typeof themeMap] || 'Custom Theme';
  };

  const getThemeColors = (foodMode: string | null) => {
    if (!foodMode) return 'bg-orange-50 text-orange-600 border-orange-200';
    
    const colorMap = {
      'dining-out': 'bg-violet-50 text-violet-600 border-violet-200',
      'cooking': 'bg-teal-50 text-teal-600 border-teal-200',
      'neutral': 'bg-orange-50 text-orange-600 border-orange-200'
    };
    
    return colorMap[foodMode as keyof typeof colorMap] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getTimerText = (template: RoomTemplate) => {
    if (template.timer_option === 'custom') {
      return `${template.custom_duration} ${template.duration_unit}`;
    }
    return `${template.timer_option} minutes`;
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.room_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3] flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your templates...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#F3ECE3]"
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
              <button
                onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Create</span>
              </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Templates</h1>
            </div>
            <div className="w-4" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
              <Layout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'No templates match your search.' : 'You haven\'t saved any templates yet. Create a custom room and save it as a template to get started.'}
              </p>
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Room
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  {/* Template Header */}
                  <div className={`p-4 border-b border-gray-100 ${getThemeColors(template.food_mode)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm opacity-75">{template.room_name}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">{template.usage_count}</span>
                      </div>
                    </div>
                  </div>

                  {/* Template Details */}
                  <div className="p-4 space-y-3">
                    {/* Theme */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ChefHat className="w-4 h-4" />
                      <span>{getThemeText(template.food_mode)}</span>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCheck className="w-4 h-4" />
                      <span>Up to {template.participant_limit || 10} participants</span>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Timer className="w-4 h-4" />
                      <span>{getTimerText(template)} per decision</span>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Template Actions */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUseTemplate(template)}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Use Template
                      </motion.button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default SavedTemplatesScreen; 