export const steps = [
  {
    title: 'Basic Info',
    description: 'Set up your room details and dining preferences',
    urlSegment: 'basic-info'
  },
  {
    title: 'Settings',
    description: 'Configure timers, participants, and voting',
    urlSegment: 'settings'
  },
  {
    title: 'Summary',
    description: 'Review room details, invite friends, and save templates',
    urlSegment: 'summary'
  }
];

// Helper function to get step by URL segment
export const getStepByUrlSegment = (segment: string) => {
  return steps.find(step => step.urlSegment === segment);
};

// Helper function to get URL segment by step number
export const getUrlSegmentByStepNumber = (stepNumber: number) => {
  const step = steps[stepNumber - 1];
  return step ? step.urlSegment : 'basic-info';
};

// Mock contacts data - in real app would come from user's contacts
export const mockContacts = [
  { 
    id: '1', 
    name: 'Alice Smith', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    favorite: true,
    recent: true,
    status: 'active' as const
  },
  { 
    id: '2', 
    name: 'Bob Johnson', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    recent: true,
    status: 'busy' as const
  },
  { 
    id: '3', 
    name: 'Carol Williams', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
    favorite: true,
    status: 'active' as const
  },
  { 
    id: '4', 
    name: 'David Brown', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    recent: true,
    status: 'inactive' as const
  },
  { 
    id: '5', 
    name: 'Emma Davis', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    status: 'active' as const
  },
  { 
    id: '6', 
    name: 'Frank Miller', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank',
    status: 'offline' as const
  }
]; 