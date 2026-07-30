import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface AddBoardCardProps {
  onAddBoard: (title: string) => void;
}

export const AddBoardCard: React.FC<AddBoardCardProps> = ({ onAddBoard }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddBoard(title.trim());
      setTitle('');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="w-72 sm:w-80 shrink-0 bg-slate-900/80 border border-white/20 backdrop-blur-md rounded-2xl p-3 shadow-xl text-white animate-fadeIn">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            autoFocus
            placeholder="Pano başlığı girin..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Pano Ekle
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-72 sm:w-80 shrink-0 h-12 bg-white/20 hover:bg-white/30 border border-white/20 backdrop-blur-md rounded-2xl p-3 text-white font-semibold text-xs flex items-center space-x-2 transition-all duration-200 shadow-md active:scale-98"
    >
      <Plus className="w-4 h-4 stroke-[2.5]" />
      <span>Başka pano ekleyin</span>
    </button>
  );
};
