
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../supabaseClient';
import { Loader2, AlertCircle, Shield, ExternalLink, Smartphone, Terminal } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTelegramEnv, setIsTelegramEnv] = useState(false);

  // Dev State
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [devInputId, setDevInputId] = useState('');

  // 1. Auto-Detect Telegram Environment
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    // Check if we are truly inside Telegram (valid user data present)
    if (tg?.initDataUnsafe?.user) {
      setIsTelegramEnv(true);
      tg.ready();
      tg.expand();

      const user = tg.initDataUnsafe.user;

      // Auto-login attempt
      handleAuth({
        id: user.id,
        first_name: user.first_name,
        username: user.username,
        photo_url: user.photo_url
      }, true);
    }
  }, []);

  // 2. Robust Auth Logic
  const handleAuth = async (
    telegramUser: { id: number; first_name: string; username?: string; photo_url?: string },
    isAutoLogin: boolean = false
  ) => {
    setIsLoading(true);
    setError('');

    // Ensure we are working with a number
    const searchId = Number(telegramUser.id);
    console.log('--- AUTH ATTEMPT ---', searchId);

    try {
      // Diagnostic: Check if DB is reachable
      const { count, error: countError } = await supabase.from('users').select('*', { count: 'exact', head: true });
      if (countError) throw new Error("DB Connection Failed");

      // Query User
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', searchId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingUser) {
        setError(`Access Denied. User ID ${searchId} is not registered.`);
        setIsLoading(false);
        return;
      }

      // Sync Profile (Avatar/Name)
      const updates = {
        name: telegramUser.first_name,
        username: telegramUser.username,
        avatar_url: telegramUser.photo_url,
      };

      const { data: updatedUser } = await supabase
        .from('users')
        .update(updates)
        .eq('id', existingUser.id)
        .select()
        .single();

      const finalUser = updatedUser || existingUser;

      // Construct User Object
      const user: User = {
        id: finalUser.id,
        telegramId: finalUser.telegram_id,
        name: finalUser.name,
        role: finalUser.role as UserRole,
        avatarUrl: finalUser.avatar_url,
        username: finalUser.username
      };

      onLogin(user);

    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(err.message || 'Authentication Failed');
      setIsLoading(false);
    }
  };

  const handleDevSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devInputId) return;

    // Simulate Telegram User
    handleAuth({
      id: parseInt(devInputId),
      first_name: `DevUser_${devInputId}`,
      username: 'dev_sim',
      photo_url: undefined
    });
  };

  // --- RENDER: SCENARIO A (Telegram Environment) ---
  if (isTelegramEnv) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center w-full max-w-sm">
          {error ? (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-red-100 animate-in fade-in zoom-in duration-300">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Access Denied</h3>
              <p className="text-sm text-slate-500 mb-6">{error}</p>
              <button onClick={() => window.location.reload()} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                Try Again
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-8 animate-pulse">
                <Shield className="text-white" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Nexus B2B</h2>
              <p className="text-slate-500 font-medium text-sm mb-8">Securely logging you in...</p>
              <Loader2 size={32} className="text-blue-500 animate-spin" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER: SCENARIO B (Browser / Landing) ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center relative">

      {showDevLogin ? (
        // Dev Backdoor View
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-10">
          <div className="flex items-center justify-center mb-6">
            <Terminal className="text-slate-800 mr-2" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Dev Login Simulator</h2>
          </div>
          <form onSubmit={handleDevSubmit} className="space-y-4">
            <div className="text-left">
              <label className="text-xs font-bold text-slate-500 uppercase">Simulate Telegram ID</label>
              <input
                type="number"
                value={devInputId}
                onChange={(e) => setDevInputId(e.target.value)}
                className="w-full mt-1 p-3 border border-slate-200 rounded-xl bg-slate-50 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 6062118302"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex justify-center items-center">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Log In'}
            </button>
            <button type="button" onClick={() => setShowDevLogin(false)} className="text-slate-400 text-sm hover:text-slate-600">
              Cancel
            </button>
          </form>
        </div>
      ) : (
        // Normal Landing View
        <div className="max-w-md w-full animate-in fade-in duration-700">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto mb-6">
              <Shield className="text-white" size={32} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Nexus B2B Inventory</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              This application is designed to provide a secure, native experience inside Telegram.
            </p>

            {/* QR Code */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block mb-8">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://t.me/sardoba_project_bot"
                alt="Telegram Bot QR"
                className="w-40 h-40 mix-blend-multiply opacity-90 rounded-lg"
              />
            </div>

            <a
              href="https://t.me/sardoba_project_bot"
              target="_blank"
              rel="noreferrer"
              className="block w-full py-4 bg-[#229ED9] hover:bg-[#1E8BBF] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-[#229ED9]/30 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center group"
            >
              <Smartphone className="mr-3 group-hover:animate-pulse" size={20} />
              Open @sardoba_project_bot
            </a>
          </div>

          {/* Dev Backdoor Trigger */}
          <div className="mt-8">
            <button
              onClick={() => setShowDevLogin(true)}
              className="text-xs text-slate-300 font-mono hover:text-slate-400 transition-colors flex items-center justify-center mx-auto"
            >
              <Terminal size={12} className="mr-1" />
              Dev Login (Simulate)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
