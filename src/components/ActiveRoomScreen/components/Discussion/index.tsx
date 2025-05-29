import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useAppStore } from '../../../../lib/store';
import { formatTimeAgo } from '../../utils/formatters';

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export const Discussion: React.FC = () => {
  const { currentRoom, currentUser, addMessage } = useAppStore();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = currentRoom?.messages || [];
  
  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      addMessage(message);
      setMessage('');
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-3">
        <MessageCircle className="mr-2" size={20} />
        <h2 className="text-xl font-bold text-gray-800">Discussion</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-3 bg-white rounded-lg p-3 shadow-sm">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No messages yet. Start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg: Message) => (
              <div 
                key={msg.id}
                className={`p-3 rounded-lg max-w-[85%] ${
                  msg.userId === currentUser?.id 
                    ? 'ml-auto bg-orange-100 text-orange-800' 
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
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="p-2 bg-orange-500 text-white rounded-r hover:bg-orange-600 disabled:bg-gray-300"
          disabled={!message.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}; 