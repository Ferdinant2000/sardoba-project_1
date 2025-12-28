import React, { useState } from 'react';
import { AppSettings, Product, Client, Order } from '../types';
import { Bell, Moon, Sun, ChevronRight, Globe, Shield, ChevronsRight } from 'lucide-react';
import { useTheme, useLanguage } from '../contexts/Providers';
import { useTelegram } from '../contexts/TelegramContext';

interface SettingsProps {
    settings: AppSettings;
    onUpdateSettings: (newSettings: AppSettings) => void;
    products: Product[];
    clients: Client[];
    orders: Order[];
    onResetData: () => void;
}

const Settings: React.FC<SettingsProps> = () => {
    const [notifications, setNotifications] = useState(true);
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { haptic } = useTelegram();

    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const languages = [
        { code: 'eng', label: 'English' },
        { code: 'rus', label: 'Русский' },
        { code: 'uzb', label: "O'zbekcha" }
    ];

    const currentLangLabel = languages.find(l => l.code === language)?.label;

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4">
            <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('settings')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('preferences')}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                    {/* Notifications */}
                    <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3 transition-colors">
                                <Bell size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white transition-colors capitalize">{t('notifications')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{t('notifications_desc')}</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={notifications} onChange={() => {
                                setNotifications(!notifications);
                                haptic('medium');
                            }} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Theme */}
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors" onClick={() => {
                        toggleTheme();
                        haptic('medium');
                    }}>
                        <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-colors ${theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-purple-50 text-purple-600'}`}>
                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white transition-colors capitalize">{t('dark_mode')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{t('dark_mode_desc')}</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                            <input type="checkbox" checked={theme === 'dark'} readOnly className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>

                {/* Other Preferences */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">

                    {/* Language Switcher */}
                    <div onClick={() => {
                        setIsLangMenuOpen(!isLangMenuOpen);
                        haptic('light');
                    }} className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-gray-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mr-3 transition-colors">
                                <Globe size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white transition-colors capitalize">{t('language')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{currentLangLabel}</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className={`text-slate-300 dark:text-slate-500 transition-transform ${isLangMenuOpen ? 'rotate-90' : ''}`} />
                    </div>

                    {/* Language Dropdown Area */}
                    {isLangMenuOpen && (
                        <div className="bg-slate-50 dark:bg-gray-900/50 p-2 space-y-1 border-b border-slate-100 dark:border-gray-700 animate-in slide-in-from-top-2">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code as any);
                                        setIsLangMenuOpen(false);
                                        haptic('medium');
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${language === lang.code
                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <span>{lang.label}</span>
                                    {language === lang.code && <ChevronsRight size={16} />}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 mr-3 transition-colors">
                                <Shield size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white transition-colors capitalize">{t('privacy')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{t('privacy_desc')}</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 dark:text-slate-500" />
                    </div>
                </div>

                <div className="text-center pt-8 pb-4">
                    <p className="text-xs text-slate-400 dark:text-slate-600 font-mono">
                        {t('version')} 1.2.0 • {t('build')} 2025.12.22
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
