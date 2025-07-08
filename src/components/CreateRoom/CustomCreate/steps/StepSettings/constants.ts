// Timer options for the settings
export const timeOptions = [
  { value: 15, label: '15 minutes', description: 'AI analysis' },
  { value: 30, label: '30 minutes', description: 'Standard' },
  { value: 60, label: '1 hour', description: 'Thoughtful' },
  { value: 'custom', label: 'Custom', description: 'Your choice' },
]; 

export const timerDescriptions = {
  '15': 'AI analysis for simple choices',
  '30': 'Balanced time for most decisions',
  '60': 'Extra time for important choices',
  'custom': 'Custom duration for specific needs'
};

export const tooltipContent = {
  participants: "Control who can join your room. Require a code for private rooms or allow anyone with the link to join. Maximum 25 participants in all cases.",
  timer: "Set how long people have to make a decision. This helps keep the process moving.",
  deadline: "Set a deadline by which everyone must decide. This helps coordinate group planning.",
  reminders: "Send automatic reminders to participants as the deadline approaches."
}; 