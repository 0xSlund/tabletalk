import React, { useState, useEffect, useRef } from 'react';
import { Plus, UtensilsCrossed, X, Smile, HelpCircle, MessageSquare, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAppStore } from '../../../../lib/store';
import { motion, AnimatePresence } from 'framer-motion';

interface FoodSuggestion {
  id: string;
  name: string;
  emoji: string;
  description: string;
  votes?: number;
}

// Animated empty state component with plate SVG and typewriter effect
const EmptyStateAnimation: React.FC<{ onAddClick?: () => void }> = ({ onAddClick }) => {
  const [text, setText] = useState('');
  const fullText = 'Be the first to suggest something!';
  const typeDelay = 50; // ms per character
  
  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      if (i < fullText.length) {
        setText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
      }
    }, typeDelay);
    
    return () => clearInterval(typing);
  }, []);
  
  return (
    <div className="text-center py-8 flex flex-col items-center justify-center">
      {/* Simplified plate with question mark SVG animation */}
      <motion.svg 
        width="160" 
        height="160" 
        viewBox="0 0 160 160" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, -5, 0] }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="mb-4"
      >
        {/* Plate base */}
        <ellipse cx="80" cy="105" rx="60" ry="15" fill="#F0F0F0" />
        <ellipse cx="80" cy="105" rx="50" ry="10" fill="#E0E0E0" />
        
        {/* Question mark in orange circle on top of the plate */}
        <motion.g
          animate={{ 
            y: [0, -3, 0],
            scale: [1, 1.05, 1] 
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            repeatType: "reverse" 
          }}
        >
          {/* Orange circle background */}
          <circle
            cx="80"
            cy="75"
            r="30"
            fill="#F97316"
          />
          
          {/* Question mark */}
          <text
            x="80"
            y="83"
            fontSize="40"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            ?
          </text>
        </motion.g>
      </motion.svg>
      
      {/* Typewriter text */}
      <div className="h-6 mb-4">
        <p className="text-gray-500">{text}</p>
      </div>
      
      {/* Pulsing add button */}
      <motion.button
        onClick={onAddClick}
        className="flex items-center px-4 py-2 mt-2 bg-orange-500 text-white rounded-full hover:bg-orange-600"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={20} className="mr-1" /> Add Suggestion
      </motion.button>
    </div>
  );
};

export const FoodSuggestionForm: React.FC<{
  onSubmit: (foodName: string, emoji: string, description: string) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [foodName, setFoodName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [description, setDescription] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<'popular' | 'main' | 'dessert' | 'drinks'>('popular');
  const formRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const maxDescriptionLength = 200;

  // Auto-resize text area to content
  useEffect(() => {
    if (descriptionRef.current) {
      // Reset height first to get accurate scrollHeight
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = `${Math.min(descriptionRef.current.scrollHeight, 150)}px`;
    }
  }, [description]);

  // List of popular food emoji options
  const popularFoodEmojis = [
    '🍕', '🍔', '🍟', '🌭', '🍗', '🍣', '🌮', '🍜',
    '🥗', '🍝', '🌯', '🍖', '🥩', '🥪', '🍛', '🍱'
  ];
  
  // Categorized emoji sets
  const emojiCategories = {
    main: [
      '🍕', '🍔', '🍟', '🌭', '🍗', '🍖', '🥓', '🌮', 
      '🌯', '🥙', '🥪', '🍣', '🍤', '🍦', '🍜', '🥘',
      '🫕', '🍲', '🥗', '🍝', '🍱', '🍛', '🍠', '🥟'
    ],
    dessert: [
      '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁',
      '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍡', '🥮'
    ],
    drinks: [
      '☕', '🍵', '🫖', '🍶', '🍾', '🍷', '🍸', '🍹', 
      '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧋', '🥛',
      '🧊', '🥥', '🧉', '🍶', '🍸', '🥂', '🍹', '🍷'
    ]
  };

  // Quick selection food options
  const quickFoodOptions = [
    { name: 'Pizza', emoji: '🍕', category: 'Italian' },
    { name: 'Burgers', emoji: '🍔', category: 'American' },
    { name: 'Sushi', emoji: '🍣', category: 'Japanese' },
    { name: 'Tacos', emoji: '🌮', category: 'Mexican' },
    { name: 'Salad', emoji: '🥗', category: 'Healthy' },
    { name: 'Pasta', emoji: '🍝', category: 'Italian' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (foodName.trim()) {
      setShowSuccess(true);
      
      // If no emoji was selected, use a default
      const finalEmoji = emoji || '🍽️';
      
      setTimeout(() => {
        onSubmit(foodName, finalEmoji, description);
        // Reset form
        setFoodName('');
        setEmoji('');
        setDescription('');
      }, 800);
    }
  };

  const handleQuickOptionClick = (name: string, emoji: string) => {
    setFoodName(name);
    setEmoji(emoji);
    
    // Focus on description field after selecting a quick option
    setTimeout(() => {
      descriptionRef.current?.focus();
    }, 100);
  };
  
  const handleEmojiClick = (em: string) => {
    setEmoji(em);
    setShowEmojiPicker(false);
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxDescriptionLength) {
      setDescription(value);
    }
  };
  
  // Get display for emoji button (either selected emoji or placeholder)
  const getEmojiDisplay = () => {
    if (emoji) {
      return <span className="text-5xl">{emoji}</span>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center text-gray-400">
        <Smile size={32} />
        <span className="text-xs mt-1 font-medium">Choose</span>
      </div>
    );
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      ref={formRef}
    >
      <div className="px-8 pt-6 pb-4 border-b border-gray-100 relative">
        {/* Decorative element */}
        <motion.div 
          className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-orange-200/30 to-amber-300/30 rounded-full"
          animate={{ 
            scale: [1, 1.1, 1], 
            rotate: [0, 10, 0], 
            opacity: [0.3, 0.4, 0.3] 
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        <div className="flex justify-between items-center relative">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-transparent bg-clip-text flex items-center">
              <UtensilsCrossed size={24} className="mr-2 text-orange-500" />
              Suggest Food
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Add something delicious for everyone to vote on
            </p>
          </div>
          
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit} className="px-8 py-6">
        <div className="grid grid-cols-[auto,1fr] gap-5 mb-6 items-start">
          {/* Emoji selector */}
          <div className="relative">
            <motion.button
              type="button"
              className="w-20 h-20 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center shadow-sm border border-orange-100 hover:shadow-md transition-all relative group"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Choose emoji"
            >
              {getEmojiDisplay()}
              
              {/* Pulsing effect when no emoji selected */}
              {!emoji && (
                <motion.div 
                  className="absolute inset-0 rounded-xl border-2 border-orange-300"
                  animate={{ 
                    opacity: [0.7, 0.3, 0.7], 
                    scale: [1, 1.05, 1] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                />
              )}
              
              {/* Hint overlay on hover */}
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-sm font-medium">
                  {emoji ? 'Change' : 'Select'}
                </div>
              </div>
            </motion.button>
            
            {/* Modern Emoji Picker Modal */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                  onClick={() => setShowEmojiPicker(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="bg-white rounded-2xl shadow-2xl p-6 max-w-[500px] w-full m-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <span className="mr-2">🍽️</span>
                        Choose Your Food Emoji
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setShowEmojiPicker(false)}
                        className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    {/* Category Tabs */}
                    <div className="flex space-x-2 mb-5 pb-1 overflow-x-auto scrollbar-hide">
                      <motion.button
                        type="button"
                        className={`px-3 py-2 rounded-full text-sm font-medium flex items-center ${
                          emojiCategory === 'popular' 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => setEmojiCategory('popular')}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="mr-1.5">🔥</span>
                        Popular 
                      </motion.button>
                      
                      <motion.button
                        type="button"
                        className={`px-3 py-2 rounded-full text-sm font-medium flex items-center ${
                          emojiCategory === 'main' 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => setEmojiCategory('main')}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="mr-1.5">🍲</span>
                        Main Dishes
                      </motion.button>
                      
                      <motion.button
                        type="button"
                        className={`px-3 py-2 rounded-full text-sm font-medium flex items-center ${
                          emojiCategory === 'dessert' 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => setEmojiCategory('dessert')}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="mr-1.5">🍰</span>
                        Desserts
                      </motion.button>
                      
                      <motion.button
                        type="button"
                        className={`px-3 py-2 rounded-full text-sm font-medium flex items-center ${
                          emojiCategory === 'drinks' 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => setEmojiCategory('drinks')}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="mr-1.5">🍹</span>
                        Drinks
                      </motion.button>
                    </div>
                    
                    {/* Emojis Grid with background */}
                    <div 
                      className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 0h2v20H9V0zm25.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm-20 20l1.732 1-10 17.32-1.732-1 10-17.32zM58.16 4.134l1 1.732-17.32 10-1-1.732 17.32-10zm-40 40l1 1.732-17.32 10-1-1.732 17.32-10zM80 9v2H60V9h20zM20 69v2H0v-2h20zm79.32-55l-1 1.732-17.32-10L82 4l17.32 10zm-80 80l-1 1.732-17.32-10L2 84l17.32 10zm96.546-75.84l-1.732 1-10-17.32 1.732-1 10 17.32zm-100 100l-1.732 1-10-17.32 1.732-1 10 17.32zM38.16 24.134l1 1.732-17.32 10-1-1.732 17.32-10zM60 29v2H40v-2h20zm19.32 5l-1 1.732-17.32-10L62 24l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM111 40h-2V20h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zM40 49v2H20v-2h20zm19.32 5l-1 1.732-17.32-10L42 44l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM91 60h-2V40h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm24.026 3.294l1 1.732-17.32 10-1-1.732 17.32-10zM39.32 74l-1 1.732-17.32-10L22 64l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM71 80h-2V60h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm24.026 3.294l1 1.732-17.32 10-1-1.732 17.32-10zM120 89v2h-20v-2h20zm-84.134 9.16l-1.732 1-10-17.32 1.732-1 10 17.32zM51 100h-2V80h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm24.026 3.294l1 1.732-17.32 10-1-1.732 17.32-10zM100 109v2H80v-2h20zm19.32 5l-1 1.732-17.32-10 1-1.732 17.32 10zM31 120h-2v-20h2v20z' fill='%23f97316' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={emojiCategory}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {emojiCategory === 'drinks' ? (
                            <div>
                              <div className="grid grid-cols-8 gap-3">
                                {emojiCategories.drinks.slice(0, 16).map(em => (
                                  <motion.button
                                    key={em}
                                    type="button"
                                    className={`${
                                      emoji === em 
                                        ? 'bg-white ring-2 ring-orange-400' 
                                        : 'bg-white/60 hover:bg-white'
                                    } p-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center`}
                                    onClick={() => handleEmojiClick(em)}
                                    whileHover={{ y: -4, scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <span className="text-2xl">{em}</span>
                                  </motion.button>
                                ))}
                              </div>
                              
                              <div className="text-xs text-center text-gray-500 my-2">More Drinks</div>
                              
                              <div className="grid grid-cols-8 gap-3">
                                {emojiCategories.drinks.slice(16).map(em => (
                                  <motion.button
                                    key={em}
                                    type="button"
                                    className={`${
                                      emoji === em 
                                        ? 'bg-white ring-2 ring-orange-400' 
                                        : 'bg-white/60 hover:bg-white'
                                    } p-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center`}
                                    onClick={() => handleEmojiClick(em)}
                                    whileHover={{ y: -4, scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <span className="text-2xl">{em}</span>
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-8 gap-3">
                              {(emojiCategory === 'popular' ? popularFoodEmojis : emojiCategories[emojiCategory]).map(em => (
                                <motion.button
                                  key={em}
                                  type="button"
                                  className={`${
                                    emoji === em 
                                      ? 'bg-white ring-2 ring-orange-400' 
                                      : 'bg-white/60 hover:bg-white'
                                  } p-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center`}
                                  onClick={() => handleEmojiClick(em)}
                                  whileHover={{ y: -4, scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <span className="text-2xl">{em}</span>
                                </motion.button>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    
                    {/* Selected Emoji Preview */}
                    {emoji && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-5 flex justify-center"
                      >
                        <div className="bg-gradient-to-br from-orange-100 to-amber-100 px-4 py-2 rounded-full flex items-center shadow-sm">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mr-3">
                            <span className="text-2xl">{emoji}</span>
                          </div>
                          <span className="font-medium text-orange-800">Selected</span>
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(false)}
                            className="ml-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-orange-600 shadow-sm"
                          >
                            Use this
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Food name input */}
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-medium">
              Food Name
            </label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
              placeholder="What's on the menu?"
              required
            />
          </div>
        </div>
        
        {/* Description field with character counter */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 text-sm font-medium">
              Why is this a good choice? <span className="text-gray-400">(optional)</span>
            </label>
            <span className={`text-xs ${description.length > maxDescriptionLength * 0.8 ? 'text-orange-500' : 'text-gray-400'}`}>
              {description.length}/{maxDescriptionLength}
            </span>
          </div>
          <textarea
            ref={descriptionRef}
            value={description}
            onChange={handleDescriptionChange}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm min-h-[80px] resize-none overflow-hidden"
            placeholder="Add details like cuisine type, restaurant suggestions..."
            style={{ height: 'auto' }}
          />
        </div>
        
        {/* Quick selection */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Quick select:
          </label>
          <div className="flex flex-wrap gap-2">
            {quickFoodOptions.map((option) => (
              <motion.button
                key={option.name}
                type="button"
                className="px-3 py-1.5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-full flex items-center hover:from-orange-100 hover:to-amber-100 border border-orange-100 shadow-sm"
                onClick={() => handleQuickOptionClick(option.name, option.emoji)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-1.5">{option.emoji}</span> 
                <span className="font-medium text-gray-700 text-sm">{option.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Preview */}
        {foodName && (
          <motion.div 
            className="mb-6 bg-gradient-to-br from-orange-50 to-amber-50 p-3 rounded-xl border border-orange-100 flex items-center gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-sm text-gray-500">Preview:</div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-2">
                {emoji ? (
                  <span className="text-xl">{emoji}</span>
                ) : (
                  <Smile size={16} className="text-gray-400" />
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 text-sm">{foodName}</h3>
                {description && (
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Form actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:pointer-events-none text-sm font-medium flex items-center gap-1.5 relative overflow-hidden"
            disabled={!foodName.trim() || showSuccess}
          >
            {showSuccess ? (
              <motion.div 
                className="flex items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Check size={18} /> Added!
              </motion.div>
            ) : (
              <motion.div className="flex items-center gap-1.5">
                <Plus size={18} /> Add Suggestion
              </motion.div>
            )}
            
            {showSuccess && (
              <motion.div 
                className="absolute inset-0 bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.6 }}
              />
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export const FoodSuggestions: React.FC<{
  showAddForm?: boolean;
  onAddClick?: () => void;
}> = ({ showAddForm = false, onAddClick }) => {
  const { currentRoom, addFoodSuggestion } = useAppStore();
  
  const handleSubmitSuggestion = (foodName: string, emoji: string, description: string) => {
    addFoodSuggestion(foodName, emoji, description);
    onAddClick && onAddClick(); // Close the form after submission
  };
  
  const suggestions = currentRoom?.suggestions || [];
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-lg mr-3 shadow-sm">
            <UtensilsCrossed className="text-white" size={22} />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 inline-block text-transparent bg-clip-text">
            Food Suggestions
          </h2>
        </div>
        
        {suggestions.length > 0 && (
          <button
            onClick={onAddClick}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-sm flex items-center gap-1.5"
          >
            <Plus size={18} />
            <span>Add Option</span>
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {suggestions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-8"
          >
            <EmptyStateAnimation onAddClick={onAddClick} />
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 gap-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {suggestions.map((suggestion: FoodSuggestion) => (
              <motion.div
                key={suggestion.id}
                className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-orange-200"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center mr-3">
                    <span className="text-2xl">{suggestion.emoji}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{suggestion.name}</h3>
                    {suggestion.description && (
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add suggestion modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onAddClick}>
          <div onClick={(e) => e.stopPropagation()}>
            <FoodSuggestionForm 
              onSubmit={handleSubmitSuggestion} 
              onCancel={onAddClick} 
            />
          </div>
        </div>
      )}
    </div>
  );
}; 