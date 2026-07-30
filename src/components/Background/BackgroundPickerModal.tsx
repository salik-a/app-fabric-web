import React, { useState } from 'react';
import { LANDSCAPE_WALLPAPERS } from '../../lib/supabase';
import { Image as ImageIcon, Link as LinkIcon, Check, X } from 'lucide-react';

interface BackgroundPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground: string;
  onSelectBackground: (url: string) => void;
}

export const BackgroundPickerModal: React.FC<BackgroundPickerModalProps> = ({
  isOpen,
  onClose,
  currentBackground,
  onSelectBackground
}) => {
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelectBackground(customUrl.trim());
      setCustomUrl('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 animate-scaleUp">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Arkaplan Manzara Görseli</h3>
              <p className="text-xs text-slate-400">UYGULAMA ARKA PLANINI ÖZELLEŞTİRİN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Preset Landscape Wallpapers */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Örnek Manzara Duvar Kağıtları
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LANDSCAPE_WALLPAPERS.map((wallpaper) => {
                const isSelected = currentBackground === wallpaper.url;
                return (
                  <button
                    key={wallpaper.id}
                    onClick={() => {
                      onSelectBackground(wallpaper.url);
                      onClose();
                    }}
                    className={`group relative h-28 rounded-xl overflow-hidden border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={wallpaper.thumbnail}
                      alt={wallpaper.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-2.5 flex flex-col justify-between">
                      {isSelected ? (
                        <div className="self-end bg-purple-500 text-white rounded-full p-1 shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div></div>
                      )}
                      <span className="text-xs font-semibold text-white drop-shadow-md">
                        {wallpaper.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Image URL Input */}
          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Özel Görsel Bağlantısı (URL)
            </h4>
            <form onSubmit={handleApplyCustomUrl} className="flex items-center space-x-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={!customUrl.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white text-xs font-semibold rounded-xl transition-all duration-200"
              >
                Uygula
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
