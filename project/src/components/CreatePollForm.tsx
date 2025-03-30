import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface CreatePollFormProps {
  onSubmit: (title: string, options: string[]) => void;
}

export function CreatePollForm({ onSubmit }: CreatePollFormProps) {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && options.every(option => option.trim())) {
      onSubmit(title, options);
      setTitle('');
      setOptions(['', '']);
    }
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h3 className="text-xl font-semibold mb-4">Create New Poll</h3>
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Poll Question
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What should we eat?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              placeholder={`Option ${index + 1}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4">
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Option
        </button>
        
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Create Poll
        </button>
      </div>
    </form>
  );
}