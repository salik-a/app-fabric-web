import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../../types';
import {
  X,
  UserCheck,
  UserPlus,
  Lock,
  Unlock,
  Shield,
  User,
  Mail,
  Image as ImageIcon,
  Save,
  Check,
  Trash2,
  KeyRound
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onUpdateProfile: (userId: string, updates: Partial<UserProfile>) => void;
  onToggleUserAccess: (userId: string) => void;
  onAddUser: (fullName: string, email: string, passwordInput?: string, avatarUrl?: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onUpdateProfile,
  onToggleUserAccess,
  onAddUser,
  onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'add_user'>('profile');

  // Edit My Profile Form State
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url);
  const [password, setPassword] = useState(currentUser.password || '1234');
  const [isSaved, setIsSaved] = useState(false);

  // New User Form State
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('1234');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  useEffect(() => {
    setFullName(currentUser.full_name);
    setEmail(currentUser.email);
    setAvatarUrl(currentUser.avatar_url);
    setPassword(currentUser.password || '1234');
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(currentUser.id, {
      full_name: fullName.trim(),
      email: email.trim(),
      avatar_url: avatarUrl.trim(),
      password: password.trim()
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFullName.trim() && newEmail.trim()) {
      onAddUser(newFullName.trim(), newEmail.trim(), newPassword.trim(), newAvatarUrl.trim());
      setNewFullName('');
      setNewEmail('');
      setNewPassword('1234');
      setNewAvatarUrl('');
      setActiveTab('users');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 animate-scaleUp flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Profil & Kullanıcı Ayarları</h3>
              <p className="text-xs text-slate-400">KULLANICI BİLGİLERİ VE ERİŞİM YÖNETİMİ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 font-semibold text-xs border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Kendi Bilgilerim & Şifrem</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-semibold text-xs border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Kullanıcı İzinleri ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add_user')}
            className={`px-4 py-3 font-semibold text-xs border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'add_user'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Yeni Kullanıcı Ekle</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* TAB 1: Edit My Profile & Password */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-slate-950/50 border border-slate-800 rounded-xl mb-4">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/50 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <div>
                  <h4 className="font-bold text-sm text-white">{fullName || 'Kullanıcı'}</h4>
                  <p className="text-xs text-slate-400">{email}</p>
                  <span className="inline-block mt-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                    Sistem Yöneticisi (Admin)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ad Soyad</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <span>E-posta Adresi (Giriş Kullanıcı Adı)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Giriş Şifreniz</span>
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Profil Resmi Bağlantısı (Avatar URL)</span>
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Kaydedildi!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Profil & Şifre Bilgilerini Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: User Permissions & Deletion */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                🔒 <strong>Kullanıcı Yönetimi:</strong> Kullanıcıların erişim izinlerini yönetebilir veya kilit simgesine basarak engelleyebilir / çöp kutusu simgesiyle kullanıcıyı tamamen silebilirsiniz.
              </p>

              <div className="space-y-2.5 pt-2">
                {allUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-sm text-white flex items-center space-x-2">
                            <span>{user.full_name}</span>
                            {isCurrent && (
                              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-blue-500/30">
                                Siz
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Şifre: {user.password || '1234'}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {user.is_allowed ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center space-x-1">
                            <Unlock className="w-3 h-3" />
                            <span className="hidden sm:inline">Giriş İzni Var</span>
                          </span>
                        ) : (
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span className="hidden sm:inline">Giriş Engelli</span>
                          </span>
                        )}

                        {!isCurrent && (
                          <>
                            <button
                              onClick={() => onToggleUserAccess(user.id)}
                              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                                user.is_allowed
                                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30'
                                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
                              }`}
                              title={user.is_allowed ? 'Giriş iznini kapat' : 'Giriş iznini aç'}
                            >
                              {user.is_allowed ? 'İzni Kaldır' : 'İzin Ver'}
                            </button>

                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `"${user.full_name}" kullanıcısını ve tüm verilerini silmek istediğinizden emin misiniz?`
                                  )
                                ) {
                                  onDeleteUser(user.id);
                                }
                              }}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
                              title="Kullanıcıyı Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Add New User Form with Password Field */}
          {activeTab === 'add_user' && (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-slate-300">
                ➕ Ekleyeceğiniz yeni kullanıcının adı, e-posta adresi ve giriş şifresi tanımlanır. Kullanıcı kendi e-postası ve şifresi ile sisteme giriş yapabilir.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Yeni Kullanıcı Adı Soyadı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Mehmet Can"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  E-posta Adresi (Giriş Kullanıcı Adı)
                </label>
                <input
                  type="email"
                  placeholder="mehmet@appfabric.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Giriş Şifresi
                </label>
                <input
                  type="text"
                  placeholder="1234"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Profil Resmi Bağlantısı (Opsiyonel)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newFullName.trim() || !newEmail.trim() || !newPassword.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Kullanıcıyı Oluştur ve İzin Ver</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
