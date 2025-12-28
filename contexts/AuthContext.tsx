import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { User, UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isTelegram: boolean;
    isDevBypass: boolean;
    login: (user: User) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isTelegram, setIsTelegram] = useState(false);
    const [isDevBypass, setIsDevBypass] = useState(false);

    // Authentication Logic
    const checkOrCreateUser = async (tgUser: any) => {
        try {
            // 1. Check existence
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', tgUser.id)
                .single();

            if (data) {
                console.log("Found existing user:", data);
                const appUser: User = {
                    id: data.id,
                    telegramId: data.telegram_id,
                    name: data.name,
                    role: data.role as UserRole,
                    avatarUrl: data.avatar_url,
                    phone: data.phone,
                    age: data.age
                };
                setUser(appUser);
                localStorage.setItem('nexus_user', JSON.stringify(appUser));
            } else {
                console.log("Creating new user for:", tgUser);
                // 2. Create if new
                const newUser = {
                    telegram_id: tgUser.id,
                    name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
                    role: 'user', // Default Role
                    username: tgUser.username,
                };

                const { data: createdUser, error: insertError } = await supabase
                    .from('users')
                    .insert(newUser)
                    .select()
                    .single();

                if (insertError) throw insertError;

                if (createdUser) {
                    const appUser: User = {
                        id: createdUser.id,
                        telegramId: createdUser.telegram_id,
                        name: createdUser.name,
                        role: createdUser.role as UserRole,
                        avatarUrl: createdUser.avatar_url,
                        phone: createdUser.phone,
                        age: createdUser.age
                    };
                    setUser(appUser);
                    localStorage.setItem('nexus_user', JSON.stringify(appUser));
                }
            }
        } catch (e) {
            console.error("Auth Error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Detect if running inside Telegram
        const tg = window.Telegram?.WebApp;
        const isTgEnv = !!tg?.initData;
        setIsTelegram(isTgEnv);

        // 2. Handle Session based on Environment
        if (!isTgEnv) {
            // BROWSER MODE:
            // By default, ignore cached session to show Landing Page.
            // We only allow session if isDevBypass is set (handled by Login component callback)
            setLoading(false);
        } else {
            // TELEGRAM MODE:
            const telegramUserId = tg.initDataUnsafe?.user?.id;

            if (telegramUserId) {
                checkOrCreateUser(tg.initDataUnsafe.user);
            } else {
                // Fallback or dev mode within TG?
                const savedUser = localStorage.getItem('nexus_user');
                if (savedUser) {
                    try {
                        setUser(JSON.parse(savedUser));
                    } catch (e) {
                        console.error("Failed to parse user session");
                        localStorage.removeItem('nexus_user');
                    }
                }
                setLoading(false);
            }
        }
    }, []);

    const login = (loggedInUser: User) => {
        setUser(loggedInUser);
        localStorage.setItem('nexus_user', JSON.stringify(loggedInUser));

        // If logging in explicitly (Dev/Simulate), enable bypass
        if (!isTelegram) {
            setIsDevBypass(true);
        }
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('nexus_user');
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <AuthContext.Provider value={{ user, loading, isTelegram, isDevBypass, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
