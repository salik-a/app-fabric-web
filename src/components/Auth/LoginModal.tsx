import React, { useState } from 'react';
import type { UserProfile } from '../../types';
import { Check, ShieldCheck, X, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUserClick = (user: UserProfile) => {
    if (!user.is_allowed) {
      setErrorMessage(`"${user.full_name}" hesabının yetkili giriş izni kapalıdır. Sadece yetkili hesaplar giriş yapabilir.`);
      return;
    }
    setErrorMessage(null);
    onSelectUser(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Kullanıcı Girişi</h3>
              <p className="text-xs text-slate-400">SADECE YETKİLİ KULLANICILAR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300 bg-blue-950/40 border border-blue-800/40 rounded-lg p-3 leading-relaxed">
            🔒 <strong>Erişim Koruması:</strong> Şu an yalnızca sizin hesabınızın giriş izni tanımlıdır. Oturumunuz kalıcı saklanır.
          </p>

          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="p-1 text-rose-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-2.5">
            {allUsers.map((user) => {
              const isSelected = user.id === currentUser.id;
              const isAllowed = user.is_allowed;

              return (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500/60 ring-1 ring-blue-500/50 shadow-md shadow-blue-500/10'
                      : isAllowed
                      ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-950/50 border-slate-800/60 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-sm"
                    />
                    <div>
                      <div className="font-semibold text-sm text-white flex items-center space-x-2">
                        <span>{user.full_name}</span>
                        {isSelected && (
                          <span className="bg-blue-500 text-[10px] text-white font-bold px-1.5 py-0.2 rounded-full">
                            Aktif
                          </span>
                        )}
                        {!isAllowed && (
                          <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-rose-500/30 flex items-center space-x-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>İzin Yok</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : !isAllowed ? (
                    <Lock className="w-4 h-4 text-slate-500" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Yetkili kullanıcıları 'Profil & Kullanıcılar' panelinden yönetebilirsiniz.
        </div>
      </div>
    </div>
  );
};
