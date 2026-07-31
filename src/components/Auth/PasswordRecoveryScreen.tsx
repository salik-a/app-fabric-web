import React, { useState } from 'react';
import { AlertCircle, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { AppService } from '../../services/appService';

interface PasswordRecoveryScreenProps {
  onComplete: () => void;
}

export const PasswordRecoveryScreen: React.FC<PasswordRecoveryScreenProps> = ({
  onComplete
}) => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('Yeni şifreniz en az 8 karakter olmalıdır.');
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMessage('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    setIsLoading(true);
    try {
      await AppService.updateRecoveredPassword(password);
      onComplete();
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Yeni şifre kaydedilemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-100">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 mb-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="font-extrabold text-2xl text-white tracking-tight">Yeni Şifre Belirleyin</h2>
          <p className="text-xs text-slate-400 mt-2">
            AppFabric hesabınız için kullanmak istediğiniz yeni şifreyi girin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Yeni Şifre</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoFocus
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorMessage(null);
              }}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-2xl text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
              Yeni Şifre Tekrar
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(event) => {
                setPasswordConfirmation(event.target.value);
                setErrorMessage(null);
              }}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-2xl text-xs text-white focus:outline-none"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password || !passwordConfirmation}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isLoading ? 'Kaydediliyor...' : 'Yeni Şifreyi Kaydet'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
