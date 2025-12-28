import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'eng' | 'rus' | 'uzb';

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
        build: 'Build'
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
        build: 'Сборка'
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
        build: 'Qurilish'
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('eng');

    useEffect(() => {
        const savedLang = localStorage.getItem('nexus_lang') as Language;
        if (savedLang && ['eng', 'rus', 'uzb'].includes(savedLang)) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('nexus_lang', lang);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
