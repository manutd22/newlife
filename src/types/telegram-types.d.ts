interface TelegramWebApps {
  WebApp: {
    initDataUnsafe?: {
      start_param?: string;
      user?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
      };
    };
    initData: string;
    showPopup(params: {
      title?: string;
      message: string;
      buttons?: Array<{
        type: 'ok' | 'close' | 'cancel' | 'destructive';
        text?: string;
        id?: string;
      }>;
    }): void;
    showAlert(message: string, callback?: () => void): void;
    showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
    ready(): void;
    expand(): void;
    close(): void;
    // Добавьте здесь другие методы WebApp, которые вы используете
  };
  // Добавьте здесь другие свойства Telegram, если они вам нужны
}

declare global {
  interface Window {
    Telegram?: TelegramWebApps;
  }
}

export {};