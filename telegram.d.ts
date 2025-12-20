
interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
    is_premium?: boolean;
}

interface WebAppInitData {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: string;
    hash?: string;
}

interface TelegramWebApp {
    initData: string;
    initDataUnsafe: WebAppInitData;
    version: string;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: any;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor: string;
    backgroundColor: string;
    isClosingConfirmationEnabled: boolean;

    // Methods
    ready: () => void;
    expand: () => void;
    close: () => void;
    enableClosingConfirmation: () => void;
    disableClosingConfirmation: () => void;
    onEvent: (eventType: string, eventHandler: Function) => void;
    offEvent: (eventType: string, eventHandler: Function) => void;
    sendData: (data: any) => void;
}

interface Window {
    Telegram: {
        WebApp: TelegramWebApp;
    };
}
