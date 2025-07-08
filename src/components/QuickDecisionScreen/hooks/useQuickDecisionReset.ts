import { useState, useCallback } from 'react';

export const useQuickDecisionReset = () => {
  const [resetKey, setResetKey] = useState(0);
  
  const forceReset = useCallback(() => {
    console.log('🔄 Forcing QuickDecisionScreen reset');
    setResetKey(prev => prev + 1);
  }, []);
  
  return {
    resetKey,
    forceReset
  };
}; 