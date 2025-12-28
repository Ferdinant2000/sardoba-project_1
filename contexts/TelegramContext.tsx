import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

// --- TYPES ---
// Types are globally defined in telegram.d.ts

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
export type NotificationType = 'error' | 'success' | 'warning';

// --- CONTEXT ---

interface TelegramContextType {
    webApp: TelegramWebApp | undefined;
    isReady: boolean;
    user: any | undefined;
    haptic: (style: HapticStyle) => void;
    showMainButton: (text: string, onClick: () => void) => void;
    hideMainButton: () => void;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

// --- PROVIDER ---

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [webApp, setWebApp] = useState<TelegramWebApp | undefined>(undefined);
    const [isReady, setIsReady] = useState(false);

    // Ref to keep track of the current MainButton click handler to unsubscribe correctly
    const mainButtonClickHandlerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // 1. Initialize Telegram Web App
        const telegram = window.Telegram?.WebApp;

        if (telegram) {
            setWebApp(telegram);

            telegram.ready();
            telegram.expand(); // Auto expand

            // Sync Theme - simple approach: set body background
            if (telegram.themeParams.bg_color) {
                document.body.style.backgroundColor = telegram.themeParams.bg_color;
            }

            setIsReady(true);

            // Setup BackButton Default Logic
            // Since we are using HashRouter in App.tsx, we can listen to hash changes
            // or just handle the click to go back in history.
            const handleBackBtn = () => {
                window.history.back();
            };
            telegram.BackButton.onClick(handleBackBtn);

            // Initial check for BackButton visibility
            // If we are at root (#/ or # or empty), hide it. Otherwise show.
            const updateBackButton = () => {
                const hash = window.location.hash;
                if (!hash || hash === '#/' || hash === '#') {
                    telegram.BackButton.hide();
                } else {
                    telegram.BackButton.show();
                }
            };

            updateBackButton();
            window.addEventListener('hashchange', updateBackButton);
            // Also listening to popstate might be useful for standard history
            window.addEventListener('popstate', updateBackButton);

            return () => {
                telegram.BackButton.offClick(handleBackBtn);
                window.removeEventListener('hashchange', updateBackButton);
                window.removeEventListener('popstate', updateBackButton);
            };
        }
    }, []);

    // Haptic Helper
    const haptic = useCallback((style: HapticStyle) => {
        if (webApp?.HapticFeedback) {
            webApp.HapticFeedback.impactOccurred(style);
        }
    }, [webApp]);

    // MainButton Control
    const showMainButton = useCallback((text: string, onClick: () => void) => {
        if (!webApp) return;

        // Remove previous listener if exists
        if (mainButtonClickHandlerRef.current) {
            webApp.MainButton.offClick(mainButtonClickHandlerRef.current);
        }

        // Update Button
        webApp.MainButton.setText(text);
        webApp.MainButton.show();

        // Set new listener
        const handler = () => {
            haptic('light');
            onClick();
        };
        mainButtonClickHandlerRef.current = handler;
        webApp.MainButton.onClick(handler);

    }, [webApp, haptic]);

    const hideMainButton = useCallback(() => {
        if (!webApp) return;
        webApp.MainButton.hide();

        // Clean up listener
        if (mainButtonClickHandlerRef.current) {
            webApp.MainButton.offClick(mainButtonClickHandlerRef.current);
            mainButtonClickHandlerRef.current = null;
        }
    }, [webApp]);


    const value = {
        webApp,
        isReady,
        user: webApp?.initDataUnsafe?.user,
        haptic,
        showMainButton,
        hideMainButton,
    };

    return (
        <TelegramContext.Provider value={value}>
            {children}
        </TelegramContext.Provider>
    );
};

// --- HOOK ---

export const useTelegram = () => {
    const context = useContext(TelegramContext);
    // It's optional so it can be used outside TG (returns undefined webApp)
    // but if we want strict typing we might check availability.
    // For now return context safe, but let consumers check `webApp`.
    if (context === undefined) {
        throw new Error("useTelegram must be used within a TelegramProvider");
    }
    return context;
};
