import React, { useMemo } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { QuickDecisionScreenRefactored } from './QuickDecisionScreenRefactored';

export function QuickDecisionWrapper() {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  // Create a stable key that only changes when we actually navigate to this route
  // This prevents infinite re-renders while still ensuring fresh state on navigation
  const componentKey = useMemo(() => {
    // Use stable values that don't change on every render
    const navType = navigationType || 'UNKNOWN';
    const path = location.pathname;
    
    // Remove timestamp to prevent infinite re-renders
    const key = `quick-decision-${path}-${navType}`;
    
    return key;
  }, [location.pathname, navigationType]);
  
  // Force remount with stable key
  return (
    <QuickDecisionScreenRefactored key={componentKey} />
  );
} 