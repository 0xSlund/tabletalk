import React, { useMemo } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { QuickDecisionScreenRefactored } from './QuickDecisionScreenRefactored';

export function QuickDecisionWrapper() {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  // Create a unique key that changes when we navigate to this route
  // This forces a complete component remount, ensuring fresh state
  const componentKey = useMemo(() => {
    // Include navigation type and timestamp for unique key generation
    const timestamp = Date.now();
    const navType = navigationType || 'UNKNOWN';
    const path = location.pathname;
    
    const key = `quick-decision-${path}-${navType}-${timestamp}`;
    console.log('🔑 Generated new component key:', key);
    
    return key;
  }, [location.pathname, navigationType]);
  
  // Force remount with unique key
  return (
    <QuickDecisionScreenRefactored key={componentKey} />
  );
} 