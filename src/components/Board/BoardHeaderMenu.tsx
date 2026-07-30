import React, { useState, useEffect, useRef } from 'react';
import { Palette, Trash2, Edit2, X, Pipette } from 'lucide-react';

interface BoardHeaderMenuProps {
  isOpen: boolean;
  onClose: () => void;
  boardTitle: string;
  currentColor: string;
  onUpdateTitle: (newTitle: string) => void;
  onUpdateColor: (color: string) => void;
  onDeleteBoard: () => void;
}

const PRESET_BOARD_COLORS = [
  { label: 'Varsayılan Açık', value: '#f1f2f4' },
  { label: 'Yaz Beyazı', value: '#ffffff' },
  { label: 'Yumuşak Mavi', value: '#e0f2fe' },
  { label: 'Yumuşak Yeşil', value: '#dcfce7' },
  { label: 'Yumuşak Mor', value: '#f3e8ff' },
  { label: 'Yumuşak Sarı', value: '#fef9c3' },
  { label: 'Yumuşak Kırmızı', value: '#ffe4e6' },
  { label: 'Gece Slate', value: '#334155' }
];

export const BoardHeaderMenu: React.FC<BoardHeaderMenuProps> = ({
  isOpen,
  onClose,
  boardTitle,
  currentColor,
  onUpdateTitle,
  onUpdateColor,
  onDeleteBoard
}) => {
  const [title, setTitle] = useState(boardTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customColor, setCustomColor] = useState(currentColor || '#f1f2f4');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(boardTitle);
  }, [boardTitle]);

  useEffect(() => {
    setCustomColor(currentColor || '#f1f2f4');
  }, [currentColor]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onUpdateTitle(title.trim());
      setIsEditingTitle(false);
    }
  };

  const handleCustomColorChange = (newColor: string) => {
    setCustomColor(newColor);
    onUpdateColor(newColor);
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-2 top-11 z-40 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200 text-xs animate-fadeIn"
    >
      {/* Menu Header */}
      <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between font-semibold text-white">
        <span>Pano Seçenekleri</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 space-y-4">
        {/* Rename Board */}
        <div>
          <label className="block font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
            Pano Başlığı
          </label>
          {isEditingTitle ? (
            <form onSubmit={handleSaveTitle} className="flex items-center space-x-1.5">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-blue-500 rounded-xl text-white font-medium text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-[11px]"
              >
                Kaydet
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-200 text-left font-medium"
            >
              <span>{boardTitle}</span>
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Change Board Color - Presets */}
        <div>
          <label className="block font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <Palette className="w-3 h-3 text-purple-400" />
            <span>Hazır Pano Renkleri</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {PRESET_BOARD_COLORS.map((c) => {
              const isSelected = currentColor.toLowerCase() === c.value.toLowerCase();
              return (
                <button
                  key={c.value}
                  onClick={() => handleCustomColorChange(c.value)}
                  className={`h-7 rounded-lg border transition-all duration-150 flex items-center justify-center ${
                    isSelected
                      ? 'border-blue-400 ring-2 ring-blue-400/50 scale-105 shadow-sm'
                      : 'border-slate-700/70 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              );
            })}
          </div>
        </div>

        {/* Full Custom Color Picker Wheel & HEX Input */}
        <div className="pt-2 border-t border-slate-800/80">
          <label className="block font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
            <Pipette className="w-3 h-3 text-emerald-400" />
            <span>Tüm Renkler Paleti (Özel Renk Seçin)</span>
          </label>

          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            {/* HTML5 Native Color Picker Input */}
            <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden border border-slate-700 shadow-inner cursor-pointer">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-0 p-0"
                title="Renk Paletinden Seç"
              />
            </div>

            {/* HEX Input Box */}
            <div className="flex-1">
              <input
                type="text"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#f1f2f4"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Delete Board */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              if (window.confirm(`"${boardTitle}" panosunu ve içindeki tüm görevleri silmek istediğinizden emin misiniz?`)) {
                onDeleteBoard();
                onClose();
              }
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Panoyu Sil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
