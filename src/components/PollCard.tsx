import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Vote, Check, X, AlertCircle, RotateCcw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PollCardProps {
  title: string;
  options: {
    id: string;
    text: string;
    votes: number;
    voters?: string[];
  }[];
  onVote: (optionId: string) => void;
  currentUserId?: string;
  pollId: string;
  confirmVote: (pollId: string, optionId: string) => void;
  cancelVote: (pollId: string) => void;
  undoVote: () => void;
  pendingVotes: Record<string, string>;
  completedVotes: string[];
  participants: { id: string; name: string }[];
  isExpired?: boolean;
  winningOptionId?: string;
}

export function PollCard({ 
  title, 
  options, 
  onVote, 
  currentUserId = '1', 
  pollId,
  confirmVote,
  cancelVote,
  undoVote,
  pendingVotes,
  completedVotes,
  participants,
  isExpired = false,
  winningOptionId
}: PollCardProps) {
  const totalVotes = options.reduce((acc, option) => acc + option.votes, 0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const hasVoted = completedVotes.includes(currentUserId);
  const hasPendingVote = pendingVotes[currentUserId] !== undefined;
  const pendingOptionId = pendingVotes[currentUserId];
  
  const handleOptionClick = (optionId: string) => {
    if (hasVoted || hasPendingVote || isExpired) return;
    
    setSelectedOption(optionId);
    onVote(optionId);
  };

  const handleConfirmVote = () => {
    if (pendingOptionId) {
      confirmVote(pollId, pendingOptionId);
    }
  };

  const handleCancelVote = () => {
    cancelVote(pollId);
    setSelectedOption(null);
  };

  // Calculate how many participants have voted
  const votedParticipantsCount = completedVotes.length;
  const totalParticipantsCount = participants.length;
  const remainingVotes = totalParticipantsCount - votedParticipantsCount;

  // Find which option the current user voted for
  const userVotedOption = options.find(option => option.voters?.includes(currentUserId));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
        <Vote className="w-5 h-5 text-blue-500" />
        {title}
      </h3>
      
      {/* Voting progress */}
      <div className="mb-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <span>{votedParticipantsCount} of {totalParticipantsCount} voted</span>
        </div>
        {remainingVotes > 0 && !isExpired && (
          <div className="text-orange-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            <span>Waiting for {remainingVotes} more {remainingVotes === 1 ? 'vote' : 'votes'}</span>
          </div>
        )}
        {isExpired && (
          <div className="text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            <span>Voting closed</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {options.map((option) => {
          const percentage = totalVotes > 0 
            ? Math.round((option.votes / totalVotes) * 100) 
            : 0;
          
          const isSelected = option.id === pendingOptionId;
          const isConfirmed = hasVoted && option.voters?.includes(currentUserId);
          const isWinner = winningOptionId === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={hasVoted || hasPendingVote || isExpired}
              className={cn(
                "w-full text-left group relative",
                (hasVoted || hasPendingVote || isExpired) && !isSelected && !isConfirmed && !isWinner && "opacity-70"
              )}
            >
              <div className="flex justify-between mb-1">
                <span className={cn(
                  "text-sm font-medium flex items-center gap-1",
                  isSelected && "text-blue-600",
                  isConfirmed && "text-green-600",
                  isWinner && "text-orange-600"
                )}>
                  {isWinner && <Trophy className="w-3 h-3 text-orange-500" />}
                  {option.text}
                  {isSelected && " (Your vote)"}
                  {isConfirmed && " (Your vote)"}
                </span>
                <span className="text-sm text-gray-500">{option.votes} votes</span>
              </div>
              <div className={cn(
                "h-2.5 bg-gray-200 rounded-full overflow-hidden",
                isSelected && "bg-blue-100",
                isConfirmed && "bg-green-100",
                isWinner && "bg-orange-100"
              )}>
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    isSelected ? "bg-blue-500" : 
                    isConfirmed ? "bg-green-500" : 
                    isWinner ? "bg-orange-500" :
                    percentage > 0 ? "bg-blue-500" : "bg-gray-300",
                    !hasVoted && !hasPendingVote && !isExpired && "group-hover:brightness-110"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{percentage}%</span>
            </button>
          );
        })}
      </div>

      {/* Confirmation buttons */}
      <AnimatePresence>
        {hasPendingVote && !isExpired && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex gap-2"
          >
            <button
              onClick={handleConfirmVote}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
            >
              <Check className="w-4 h-4" />
              Confirm Vote
            </button>
            <button
              onClick={handleCancelVote}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already voted message with undo option */}
      {hasVoted && !isExpired && (
        <div className="mt-4 flex items-center justify-between bg-green-50 py-2 px-4 rounded-lg">
          <div className="text-sm text-green-600 flex items-center">
            <Check className="w-4 h-4 inline-block mr-1" />
            <span>Your vote for <span className="font-medium">{userVotedOption?.text}</span> has been recorded</span>
          </div>
          <button 
            onClick={undoVote}
            className="ml-2 p-1.5 bg-white rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
            title="Undo vote"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Expired room message */}
      {isExpired && winningOptionId && (
        <div className="mt-4 bg-orange-50 py-2 px-4 rounded-lg">
          <div className="text-sm text-orange-600 flex items-center">
            <Trophy className="w-4 h-4 inline-block mr-1" />
            <span>
              Winner: <span className="font-medium">
                {options.find(o => o.id === winningOptionId)?.text}
              </span> with {options.find(o => o.id === winningOptionId)?.votes} votes
            </span>
          </div>
        </div>
      )}
    </div>
  );
}