export type NotifyType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default';

export type NotifyAppearance =
  | 'outline'
  | 'subtle'
  | 'elevated'
  | 'solid'
  | 'gradient'
  | 'glass';

export interface NotifyConfig {
  position: string;
  duration: number;
  max: number;
  closable: boolean;
  pauseOnHover: boolean;
  appearance: NotifyAppearance;
  layout: string;
  icon: boolean;
}

export interface NotifyToast {
  id: string;
  message: string;
  type: NotifyType;
  title: string;
  appearance: NotifyAppearance;
  layout: string;
  position: string;
  duration: number;
  closable: boolean;
  pauseOnHover: boolean;
  actions: any[];
  resolve: ((value: any) => void) | null;
  promise: Promise<any>;
  timeoutId: number | null;
  startTime: number | null;
  remaining: number | null;
  visible: boolean;
}

export interface NotifyState {
  config: NotifyConfig;
  toasts: NotifyToast[];
  listeners: Set<(state: NotifyState) => void>;
}