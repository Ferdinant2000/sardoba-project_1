import React, { createContext, useContext, useEffect, useState } from 'react';
import { TelegramProvider } from './TelegramContext';
import { AuthProvider } from './AuthContext';
import { DataProvider } from './DataContext';

type Theme = 'light' | 'dark';
type Language = 'eng' | 'rus' | 'uzb';

// --- THEME CONTEXT ---
interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --- LANGUAGE CONTEXT ---
interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    eng: {
        settings: 'Settings',
        preferences: 'Manage your app preferences',
        notifications: 'Notifications',
        notifications_desc: 'Receive updates about orders',
        dark_mode: 'Dark Mode',
        dark_mode_desc: 'Easier on the eyes',
        language: 'Language',
        privacy: 'Privacy & Security',
        privacy_desc: 'Manage your data',
        version: 'Version',
        build: 'Build',
        // Sidebar
        dashboard: 'Dashboard',
        catalog: 'Catalog',
        pos: 'POS / Checkout',
        clients: 'Clients',
        profile: 'Profile',
        logout: 'Logout',
        subheader: 'Nexus B2B'
    },
    rus: {
        settings: 'Настройки',
        preferences: 'Управление настройками приложения',
        notifications: 'Уведомления',
        notifications_desc: 'Получать обновления о заказах',
        dark_mode: 'Темная тема',
        dark_mode_desc: 'Меньше нагрузки на глаза',
        language: 'Язык',
        privacy: 'Конфиденциальность',
        privacy_desc: 'Управление данными',
        version: 'Версия',
        build: 'Сборка',
        // Sidebar
        dashboard: 'Панель',
        catalog: 'Каталог',
        pos: 'Касса / POS',
        clients: 'Клиенты',
        profile: 'Профиль',
        logout: 'Выйти',
        subheader: 'Nexus B2B'
    },
    uzb: {
        settings: 'Sozlamalar',
        preferences: 'Ilova sozlamalarini boshqarish',
        notifications: 'Bildirishnomalar',
        notifications_desc: 'Buyurtmalar haqida yangiliklar olish',
        dark_mode: 'Tungi rejim',
        dark_mode_desc: 'Ko\'z uchun qulay',
        language: 'Til',
        privacy: 'Maxfiylik va Xavfsizlik',
        privacy_desc: 'Ma\'lumotlarni boshqarish',
        version: 'Versiya',
        build: 'Qurilish',
        // Sidebar
        dashboard: 'Boshqaruv',
        catalog: 'Katalog',
        pos: 'Kassa / POS',
        clients: 'Mijozlar',
        profile: 'Profil',
        logout: 'Chiqish',
        subheader: 'Nexus B2B'
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// --- COMBINED PROVIDER ---
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Theme State
    const [theme, setThemeState] = useState<Theme>('light');

    // Language State
    const [language, setLanguageState] = useState<Language>('eng');

    useEffect(() => {
        // Load Defaults
        const savedTheme = localStorage.getItem('nexus_theme') as Theme;
        if (savedTheme) {
            setThemeState(savedTheme);
            applyTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setThemeState('dark');
            applyTheme('dark');
        }

        const savedLang = localStorage.getItem('nexus_lang') as Language;
        if (savedLang && ['eng', 'rus', 'uzb'].includes(savedLang)) {
            setLanguageState(savedLang);
        }
    }, []);

    const applyTheme = (newTheme: Theme) => {
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('nexus_theme', newTheme);
        applyTheme(newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('nexus_lang', lang);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <TelegramProvider>
            <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
                <LanguageContext.Provider value={{ language, setLanguage, t }}>
                    <AuthProvider>
                        <DataProvider>
                            {children}
                        </DataProvider>
                    </AuthProvider>
                </LanguageContext.Provider>
            </ThemeContext.Provider>
        </TelegramProvider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) throw new Error('useTheme must be used within AppProviders');
    return context;
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) throw new Error('useLanguage must be used within AppProviders');
    return context;
};
