import React, { useState } from 'react';
import type { UserProfile } from '../../types';
import { AppService } from '../../services/appService';
import { KeyRound, ArrowRight, ShieldCheck, AlertCircle, Mail, Loader2 } from 'lucide-react';

interface AuthLockScreenProps {
  onLogin: (user: UserProfile) => void;
}

export const AuthLockScreen: React.FC<AuthLockScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Login directly against Supabase
      const user = await AppService.loginWithSupabase(email, password);
      onLogin(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Giriş yapılamadı.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      {/* Background Ambient Glow */}
      <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute w-80 h-80 bg-purple-600/20 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-100 animate-scaleUp text-center relative overflow-hidden">
        {/* App Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4 group">
            <img
              src="/appfabric_logo.jpg"
              alt="AppFabric Logo"
              className="w-16 h-16 rounded-2xl object-cover border border-white/20 shadow-xl shadow-blue-500/30"
              onError={(e) => {
                (e.target as HTMLImageElement).src = './appfabric_logo.jpg';
              }}
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-40 -z-10"></div>
          </div>

          <h2 className="font-extrabold text-2xl text-white tracking-tight flex items-center space-x-2">
            <span>AppFabric</span>
            <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
              Kullanıcı Girişi
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Uygulamaya erişmek için e-posta ve şifrenizle giriş yapın.
          </p>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>E-posta Adresiniz</span>
            </label>
            <input
              type="email"
              required
              autoFocus
              placeholder="ornek@appfabric.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Giriş Şifreniz</span>
              </span>
            </label>
            <input
              type="password"
              required
              placeholder="Şifrenizi girin..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs rounded-xl flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!email.trim() || !password.trim() || isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Doğrulanıyor...</span>
              </>
            ) : (
              <>
                <span>Giriş Yap ve Oturumu Sakla</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Giriş yaptığınızda oturumunuz bu cihazda kalıcı olarak saklanır.</span>
        </div>
      </div>
    </div>
  );
};
