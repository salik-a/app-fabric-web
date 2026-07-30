import React from 'react';
import type { UserProfile } from '../../types';
import { Image, Shield, LogIn } from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile;
  onOpenAuth: () => void;
  onOpenUserManagement: () => void;
  onOpenBackgroundPicker: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onOpenUserManagement,
  onOpenBackgroundPicker
}) => {
  return (
    <header className="h-16 px-4 md:px-6 glass-header flex items-center justify-between border-b border-white/10 text-white z-20 shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="relative group">
          <img
            src="/appfabric_logo.jpg"
            alt="AppFabric Logo"
            className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300 -z-10"></div>
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
              AppFabric
            </h1>
            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-400/30">
              WEB
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
            Görev & Pano Yönetimi
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Background Wallpaper Picker Button */}
        <button
          onClick={onOpenBackgroundPicker}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all duration-200 border border-white/15 active:scale-95"
          title="Arkaplan Manzara Görselini Değiştir"
        >
          <Image className="w-4 h-4 text-sky-300" />
          <span className="hidden md:inline">Arkaplan Değiştir</span>
        </button>

        {/* User Management & Profile Settings Button */}
        <button
          onClick={onOpenUserManagement}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 text-xs font-semibold backdrop-blur-md transition-all duration-200 border border-blue-400/30 active:scale-95"
          title="Kullanıcı & Profil Ayarları"
        >
          <Shield className="w-4 h-4 text-blue-300" />
          <span className="hidden md:inline">Profil & Kullanıcılar</span>
        </button>

        {/* Active User Profile Badge */}
        <button
          onClick={onOpenAuth}
          className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/15 text-white text-xs font-medium backdrop-blur-lg transition-all duration-200 shadow-sm active:scale-95 group"
          title="Kullanıcı Değiştir / Oturum"
        >
          <img
            src={currentUser.avatar_url}
            alt={currentUser.full_name}
            className="w-6 h-6 rounded-full object-cover border border-white/30"
          />
          <div className="text-left hidden sm:block">
            <div className="font-semibold text-white leading-tight flex items-center space-x-1">
              <span>{currentUser.full_name}</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-none">
              {currentUser.email}
            </div>
          </div>
          <div className="p-1 rounded-md bg-white/10 group-hover:bg-white/20 text-slate-300 transition-colors">
            <LogIn className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </header>
  );
};
