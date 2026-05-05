export type NotifyType = 'success' | 'error' | 'warning' | 'info' | 'default';

export type NotifyAppearance =
  | 'border'
  | 'solid'
  | 'gradient'
  | 'glass'
  | 'soft';

export interface NotifyAction {
  label: string;
  value?: any;
  onClick?: (toast: NotifyToast) => void;
}

export interface NotifyToast {
  id: string;
  message: string;
  title?: string;
  type: NotifyType;
  appearance?: NotifyAppearance;
  duration?: number;
  pauseOnHover?: boolean;
  actions?: NotifyAction[];
}

export interface NotifyOptions {
  message: string;
  type?: NotifyType;
  appearance?: NotifyAppearance;
  duration?: number;
  loading?: string;

  success?: {
    message?: string | ((result: any) => string);
    actions?: NotifyAction[];
  };

  error?: {
    message?: string | ((error: any) => string);
    actions?: NotifyAction[];
  };
}

export interface NotifyAPI {
  init(config?: any): void;

  show(options: NotifyOptions): NotifyToast;

  success(message: string, options?: NotifyOptions): NotifyToast;
  error(message: string, options?: NotifyOptions): NotifyToast;
  warning(message: string, options?: NotifyOptions): NotifyToast;
  info(message: string, options?: NotifyOptions): NotifyToast;

  remove(id: string): void;
  clear(): void;

  promise<T>(p: Promise<T>, options?: NotifyOptions): Promise<T>;
}