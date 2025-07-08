-- Add AI-themed room name suggestions
-- This migration adds AI Food Assistant themed room name suggestions

-- AI-THEMED GENERAL SUGGESTIONS
INSERT INTO room_name_suggestions (category, text) VALUES
('ai-general', 'AI Food Assistant Lab'),
('ai-general', 'Smart Food Recommendations'),
('ai-general', 'AI-Powered Food Choices'),
('ai-general', 'Intelligent Dining Decisions'),
('ai-general', 'AI Cuisine Analyzer'),
('ai-general', 'Smart Meal Planning'),
('ai-general', 'AI Food Discovery'),
('ai-general', 'Intelligent Food Finder'),
('ai-general', 'AI Taste Predictor'),
('ai-general', 'Smart Dining Assistant'),
('ai-general', 'AI Food Matchmaker'),
('ai-general', 'Intelligent Meal Suggestions'),
('ai-general', 'AI Culinary Advisor'),
('ai-general', 'Smart Food Explorer'),
('ai-general', 'AI Dining Intelligence');

-- AI-THEMED MORNING SUGGESTIONS
INSERT INTO room_name_suggestions (category, text) VALUES
('morning', 'AI Morning Meal Planner'),
('morning', 'Smart Breakfast Assistant'),
('morning', 'AI-Powered Morning Eats'),
('morning', 'Intelligent Breakfast Finder'),
('morning', 'Morning AI Food Lab'),
('morning', 'Smart Dawn Dining'),
('morning', 'AI Breakfast Analyzer'),
('morning', 'Intelligent Morning Bites'),
('morning', 'AI-Guided Breakfast Hunt'),
('morning', 'Smart Sunrise Sustenance');

-- AI-THEMED LUNCH SUGGESTIONS
INSERT INTO room_name_suggestions (category, text) VALUES
('lunch', 'AI Lunch Optimizer'),
('lunch', 'Smart Midday Meal Finder'),
('lunch', 'Intelligent Lunch Assistant'),
('lunch', 'AI-Powered Lunch Planner'),
('lunch', 'Smart Lunch Analytics'),
('lunch', 'AI Midday Menu Advisor'),
('lunch', 'Intelligent Lunch Explorer'),
('lunch', 'AI-Guided Lunch Quest'),
('lunch', 'Smart Lunch Intelligence'),
('lunch', 'AI Lunch Recommendation Engine');

-- AI-THEMED EVENING SUGGESTIONS
INSERT INTO room_name_suggestions (category, text) VALUES
('evening', 'AI Dinner Intelligence'),
('evening', 'Smart Evening Meal Planner'),
('evening', 'AI-Powered Dinner Finder'),
('evening', 'Intelligent Dinner Assistant'),
('evening', 'AI Evening Food Lab'),
('evening', 'Smart Dinner Analyzer'),
('evening', 'AI-Guided Dinner Hunt'),
('evening', 'Intelligent Evening Eats'),
('evening', 'AI Dinner Optimization'),
('evening', 'Smart Supper Assistant');

-- AI-THEMED COOKING MODE SUGGESTIONS
INSERT INTO room_name_suggestions (category, text, food_mode) VALUES
('cooking', 'AI Recipe Assistant', 'cooking'),
('cooking', 'Smart Kitchen Helper', 'cooking'),
('cooking', 'AI Cooking Advisor', 'cooking'),
('cooking', 'Intelligent Recipe Finder', 'cooking'),
('cooking', 'AI-Powered Kitchen Lab', 'cooking'),
('cooking', 'Smart Cooking Intelligence', 'cooking'),
('cooking', 'AI Culinary Assistant', 'cooking'),
('cooking', 'Intelligent Home Chef', 'cooking'),
('cooking', 'AI Kitchen Optimizer', 'cooking'),
('cooking', 'Smart Recipe Analyzer', 'cooking');

-- AI-THEMED DINING OUT MODE SUGGESTIONS
INSERT INTO room_name_suggestions (category, text, food_mode) VALUES
('dining-out', 'AI Restaurant Finder', 'dining-out'),
('dining-out', 'Smart Dining Assistant', 'dining-out'),
('dining-out', 'AI-Powered Restaurant Hunt', 'dining-out'),
('dining-out', 'Intelligent Dining Explorer', 'dining-out'),
('dining-out', 'AI Restaurant Analyzer', 'dining-out'),
('dining-out', 'Smart Dining Intelligence', 'dining-out'),
('dining-out', 'AI Food Spot Finder', 'dining-out'),
('dining-out', 'Intelligent Restaurant Guide', 'dining-out'),
('dining-out', 'AI Dining Optimizer', 'dining-out'),
('dining-out', 'Smart Restaurant Assistant', 'dining-out');

-- AI-THEMED BOTH MODE SUGGESTIONS
INSERT INTO room_name_suggestions (category, text, food_mode) VALUES
('both', 'AI Food Decision Engine', 'both'),
('both', 'Smart Food Intelligence Hub', 'both'),
('both', 'AI-Powered Food Assistant', 'both'),
('both', 'Intelligent Food Advisor', 'both'),
('both', 'AI Food Optimization Lab', 'both'),
('both', 'Smart Culinary Intelligence', 'both'),
('both', 'AI Food Choice Assistant', 'both'),
('both', 'Intelligent Food Planner', 'both'),
('both', 'AI Food Discovery Engine', 'both'),
('both', 'Smart Food Recommendation Hub', 'both'); 