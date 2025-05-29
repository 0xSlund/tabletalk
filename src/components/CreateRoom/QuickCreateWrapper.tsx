// This file is just a redirect to the refactored QuickCreate component
import React from 'react';
import { QuickCreate as QuickCreateComponent } from './QuickCreate';

type QuickCreateWrapperProps = {
  onCreate: (roomName: string, time: number, location: number, theme?: number) => Promise<{ roomId: string | null; roomCode: string | null }>;
  onBack: () => void;
};

export function QuickCreate({ onCreate, onBack }: QuickCreateWrapperProps) {
  const handleQuickCreate = async (roomName: string, time: number, location: number, theme?: number) => {
    try {
      // Ensure we're properly awaiting and passing the result
      const result = await onCreate(roomName, time, location, theme);
      console.log('QuickCreateWrapper: Room creation result:', result);
      return result;
    } catch (error) {
      console.error('QuickCreateWrapper: Error in onCreate:', error);
      throw error; // Re-throw so the component can handle it
    }
  };

  return <QuickCreateComponent onCreate={handleQuickCreate} onBack={onBack} />;
} 