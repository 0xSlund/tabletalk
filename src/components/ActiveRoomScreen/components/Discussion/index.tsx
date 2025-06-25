import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import { useAppStore } from '../../../../lib/store';
import { formatTimeAgo } from '../../utils/formatters';
import { supabase } from '../../../../lib/supabase';

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

interface PendingMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  isPending: true;
}

interface DiscussionProps {
  roomExpired: boolean;
}

export const Discussion: React.FC<DiscussionProps> = ({ roomExpired }) => {
  const { currentRoom, auth, addMessage } = useAppStore();
  const [message, setMessage] = useState('');
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = currentRoom?.messages || [];
  const currentUser = auth?.user;
  
  // Load messages when room changes
  useEffect(() => {
    if (currentRoom?.id) {
      // Use getState to avoid function dependency
      const { loadMessages } = useAppStore.getState();
      loadMessages(currentRoom.id);
    }
  }, [currentRoom?.id]); // Only depend on room ID

  // Store channel reference to reuse for broadcasts
  const channelRef = useRef<any>(null);

  // Set up real-time subscription for messages and pending states
  useEffect(() => {
    if (!currentRoom?.id) return;

    const channel = supabase
      .channel(`messages:${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${currentRoom.id}`,
        },
        (payload) => {
          // When a new message is inserted, remove any pending messages from that user
          const newMessage = payload.new as any;
          if (newMessage.profile_id) {
            setPendingMessages(prev => 
              prev.filter(pm => pm.userId !== newMessage.profile_id)
            );
            // Don't reload messages - let the store handle the update via real-time
          }
        }
      )
      .on(
        'broadcast',
        { event: 'pending_message' },
        (payload) => {
          // Handle incoming pending message broadcasts from other users
          const { type, pendingMessage } = payload.payload;
          
          if (type === 'add' && pendingMessage.userId !== currentUser?.id) {
            // Add pending message from another user
            setPendingMessages(prev => {
              // Avoid duplicates
              const exists = prev.some(pm => pm.id === pendingMessage.id);
              if (!exists) {
                return [...prev, pendingMessage];
              }
              return prev;
            });
          } else if (type === 'remove') {
            // Remove pending message
            setPendingMessages(prev => 
              prev.filter(pm => pm.id !== pendingMessage.id)
            );
          }
        }
      )
      .subscribe();

    // Store channel reference for reuse
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [currentRoom?.id]); // Remove loadMessages and currentUser?.id dependencies
  
  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingMessages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser || roomExpired) return;
    
    const messageText = message.trim();
    setMessage('');
    setIsTyping(false);
    
    // Create pending message for other users to see
    const pendingMessage: PendingMessage = {
      id: `pending-${currentUser.id}-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.username || 'You',
      text: messageText,
      timestamp: new Date().toISOString(),
      isPending: true
    };
    
    // Broadcast pending message to other users using existing channel
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'pending_message',
        payload: {
          type: 'add',
          pendingMessage
        }
      });
    }
    
    try {
      // Send message
      const success = await addMessage(messageText);
      
      if (!success) {
        // On failure, broadcast removal of pending message
        if (channelRef.current) {
          await channelRef.current.send({
            type: 'broadcast',
            event: 'pending_message',
            payload: {
              type: 'remove',
              pendingMessage: { id: pendingMessage.id }
            }
          });
        }
        console.error('Failed to send message');
      }
      // On success, the real-time subscription will handle removing the pending message
    } catch (error) {
      // Handle errors - broadcast removal of pending message
      if (channelRef.current) {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'pending_message',
          payload: {
            type: 'remove',
            pendingMessage: { id: pendingMessage.id }
          }
        });
      }
      console.error('Error sending message:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  // Get user avatar
  const getUserAvatar = (userId: string) => {
    if (userId === currentUser?.id) {
      return currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
    }
    
    // Find participant avatar
    const participant = currentRoom?.participants?.find(p => p.id === userId);
    return participant?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
  };

  // Animated dots component
  const AnimatedDots = () => (
    <div className="flex space-x-1">
      <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
      <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-3">
        <MessageCircle className="mr-2" size={20} />
        <h2 className="text-xl font-bold text-gray-800">Discussion</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-3 bg-white rounded-lg p-3 shadow-sm">
        {messages.length === 0 && pendingMessages.filter(pm => pm.userId !== currentUser?.id).length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No messages yet. Start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Regular messages */}
            {messages.map((msg: Message) => (
              <div 
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.userId === currentUser?.id ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <img
                  src={getUserAvatar(msg.userId)}
                  alt={msg.userName}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                
                {/* Message bubble */}
                <div 
                  className={`p-3 rounded-lg max-w-[70%] ${
                    msg.userId === currentUser?.id 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {msg.userId === currentUser?.id ? 'You' : msg.userName}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTimeAgo(msg.timestamp)}
                    </span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            
            {/* Pending messages - only show messages from other users */}
            {pendingMessages
              .filter(pendingMsg => pendingMsg.userId !== currentUser?.id)
              .map((pendingMsg) => (
                <div 
                  key={pendingMsg.id}
                  className="flex items-start gap-3 flex-row"
                >
                  {/* Other user avatar */}
                  <img
                    src={getUserAvatar(pendingMsg.userId)}
                    alt={pendingMsg.userName}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  
                  {/* Pending message bubble */}
                  <div className="p-3 rounded-lg max-w-[70%] bg-gray-50 text-gray-700 border border-gray-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{pendingMsg.userName}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <AnimatedDots />
                      </div>
                    </div>
                    <p className="opacity-80">{pendingMsg.text}</p>
                  </div>
                </div>
              ))}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {roomExpired ? (
        <div className="text-center p-4 bg-gray-100 rounded-lg text-gray-600 font-medium">
          The discussion has ended.
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Type your message..."
              disabled={!currentUser || roomExpired}
            />
            {isTyping && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-1 text-orange-500">
                  <AnimatedDots />
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            disabled={!message.trim() || !currentUser || roomExpired}
          >
            <Send size={20} />
          </button>
        </form>
      )}
    </div>
  );
}; 