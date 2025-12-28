
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../supabaseClient';
import { Loader2, ShoppingBag, ShieldAlert, Send } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [status, setStatus] = useState<'loading' | 'error' | 'idle'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isTelegramEnv, setIsTelegramEnv] = useState(false);

  // Dev State for "Developer Access" footer
  const [showDevInput, setShowDevInput] = useState(false);
  const [devInput, setDevInput] = useState('6062118302');

  const executeLogin = async (telegramUser: any) => {
    setStatus('loading');
    try {
      const searchId = Number(telegramUser.id);
      const fullName = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();

      console.log("Syncing User:", searchId);

      // UPSERT User Data (Insert if new, Update if exists)
      const userDataPayload = {
        telegram_id: searchId,
        username: telegramUser.username,
        name: fullName,
        avatar_url: telegramUser.photo_url,
        // We do NOT overwrite 'role' if it exists. 
        // Supabase upsert needs to know to ignore 'role' if updating, or we handle it carefully.
        // Actually, if we just exclude 'role' from the payload, it won't be updated if the row exists?
        // No, upsert replaces the row or updates specified columns.
        // Better strategy: Use on_conflict to update only specific columns? 
        // Standard supabase upsert updates all columns provided.
        // If we want to preserve 'role', we might need to fetch first OR use a stored procedure, 
        // OR rely on the fact that we can default role in DB and only send it for new users?
        // But if we send {role: 'user'} in upsert, it will overwrite an 'admin' role to 'user'.
        // So we MUST fetch first to check role, OR just update name/avatar/username.
      };

      // To fix the "Frozen Profile" bug while preserving roles:
      // 1. Try to SELECT the user first to get their current role.
      // 2. Then UPSERT with the correct role (existing or default).

      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('role')
        .eq('telegram_id', searchId)
        .maybeSingle();

      if (fetchError) {
        console.warn("Fetch error during sync, proceeding with default role:", fetchError);
      }

      const roleToUse = existingUser?.role || 'user';

      const finalPayload = {
        ...userDataPayload,
        role: roleToUse
      };

      const { data: upsertedUser, error: upsertError } = await supabase
        .from('users')
        .upsert(finalPayload, { onConflict: 'telegram_id' })
        .select()
        .single();

      if (upsertError) {
        console.error("Upsert Error:", upsertError);
        throw new Error(`Sync Failed: ${upsertError.message}`);
      }

      if (!upsertedUser) {
        throw new Error("Sync succeeded but returned no data.");
      }

      console.log("User Synced Successfully:", upsertedUser);

      const user: User = {
        id: upsertedUser.id,
        telegramId: upsertedUser.telegram_id,
        name: upsertedUser.name,
        role: upsertedUser.role as UserRole,
        avatarUrl: upsertedUser.avatar_url,
        username: upsertedUser.username
      };
      onLogin(user);

    } catch (e: any) {
      console.error("Login Caught Error:", e);
      setErrorMessage(e.message || JSON.stringify(e));
      setStatus('error');
    }
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setIsTelegramEnv(true);
      tg.ready();
      tg.expand();
      executeLogin(tg.initDataUnsafe.user);
    } else {
      setIsTelegramEnv(false);
      setStatus('idle');
    }
  }, []);

  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin({
      id: Number(devInput),
      first_name: 'Dev User',
      username: 'developer'
    });
  };

  // SCENARIO 1: INSIDE TELEGRAM (Minimalist Loader)
  if (isTelegramEnv) {
    if (status === 'error') {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full border border-red-100">
            <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>

            {/* DEBUG ERROR BOX */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-left">
              <p className="text-red-800 text-xs font-mono break-words">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Creating your profile...</p>
      </div>
    );
  }

  // SCENARIO 2: BROWSER LANDING PAGE (Clean & Professional)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

      {/* Main Card */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-8 pb-6 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={32} className="text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
            Nexus Inventory
          </h1>

          {/* Description */}
          <p className="text-slate-500 leading-relaxed mb-6">
            To access the secured inventory, please open this application inside our Telegram Bot.
          </p>

          {/* QR Code */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block mb-6">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://t.me/sardoba_project_bot"
              alt="Bot QR Code"
              className="w-40 h-40 mix-blend-multiply opacity-90 rounded-lg"
            />
          </div>

          {/* Main Action Button */}
          <a
            href="https://t.me/sardoba_project_bot"
            target="_blank"
            rel="noreferrer"
            className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
          >
            <Send size={20} className="mr-2" />
            Open Telegram Bot
          </a>
        </div>

        {/* Footer / Dev Access */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
          {!showDevInput ? (
            <button
              onClick={() => setShowDevInput(true)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
            >
              Developer Access
            </button>
          ) : (
            <form onSubmit={handleDevLogin} className="flex gap-2 animate-in slide-in-from-bottom-2">
              <input
                type="number"
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter Test ID"
                value={devInput}
                onChange={(e) => setDevInput(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors"
              >
                Go
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="mt-8 text-xs text-center text-gray-400">
        &copy; 2025 Nexus B2B. All rights reserved.
      </p>
    </div>
  );
};

export default Login;
