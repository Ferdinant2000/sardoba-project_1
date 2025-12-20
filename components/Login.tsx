
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../supabaseClient';
import { Send, Loader2, AlertCircle, Shield, Users, Eye } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [telegramIdInput, setTelegramIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // This function mimics the logic you'd use with the real Telegram Widget
  const handleAuth = async (telegramUser: { id: number; first_name: string; username?: string; photo_url?: string }) => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Check if user exists in 'users' table by telegram_id
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (fetchError || !existingUser) {
        setError('Access Denied: Contact Developer. Your Telegram ID is not registered.');
        setIsLoading(false);
        return;
      }

      // 2. Update user profile in DB with latest Telegram info
      const updates = {
        name: telegramUser.first_name,
        username: telegramUser.username,
        avatar_url: telegramUser.photo_url,
        // Role is NOT updated here; it's managed by Admin
      };

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to sync profile', updateError);
        // We continue even if sync fails, using the existing data
      }

      const finalUser = updatedUser || existingUser;

      // 3. Map to frontend User type
      const user: User = {
        id: finalUser.id,
        telegramId: finalUser.telegram_id,
        name: finalUser.name,
        role: finalUser.role as UserRole,
        avatarUrl: finalUser.avatar_url,
        username: finalUser.username
      };

      // 4. Log User In
      onLogin(user);

    } catch (err) {
      console.error(err);
      setError('Connection error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramIdInput) return;

    // Simulate a Telegram User object
    const mockTelegramUser = {
      id: parseInt(telegramIdInput, 10),
      first_name: `User ${telegramIdInput}`,
      username: `user_${telegramIdInput}`,
      photo_url: undefined
    };

    handleAuth(mockTelegramUser);
  };

  const handleDevLogin = () => {
    // Requirements: Mock ID 6062118302 (Main Dev)
    const devUser = {
      id: 6062118302,
      first_name: 'Main Developer',
      username: 'dev_nexus',
      photo_url: undefined
    };
    handleAuth(devUser);
  };

  const handleGuestLogin = () => {
    const guestUser: User = {
      id: 'guest-session',
      telegramId: 0,
      name: 'Guest User',
      role: UserRole.GUEST,
      avatarUrl: undefined,
      username: 'guest'
    };
    onLogin(guestUser);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-slate-900 p-8 text-center bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-900/50">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nexus B2B</h1>
          <p className="text-slate-400 mt-2 text-sm">Secure Inventory Management</p>
        </div>

        <div className="p-8">
          <div className="mb-6 text-center text-slate-600">
            <h2 className="text-lg font-semibold text-slate-800">Authentication</h2>
            <p className="text-sm mt-1">Simulate Telegram Login for Development</p>
          </div>

          <form onSubmit={handleSimulateLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Custom Telegram ID
              </label>
              <div className="relative group">
                <Send className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="number"
                  required
                  value={telegramIdInput}
                  onChange={(e) => setTelegramIdInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono text-sm"
                  placeholder="Enter Telegram ID"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg border border-red-100 flex items-start animate-pulse">
                <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-lg font-bold flex items-center justify-center transition-all shadow-sm hover:shadow-md"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Login with Custom ID'}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase">OR</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={handleDevLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 rounded-lg font-bold flex items-center justify-center transition-all shadow-md hover:shadow-lg transform active:scale-[0.98] mb-3"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <span className="flex items-center">
                  <Users size={18} className="mr-2" />
                  Simulate Login (Dev)
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-3 rounded-lg font-bold flex items-center justify-center transition-all shadow-sm hover:shadow-md transform active:scale-[0.98]"
            >
              <span className="flex items-center">
                <Eye size={18} className="mr-2" />
                Continue as Guest (Read-Only)
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
