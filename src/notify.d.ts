export type NotifyAppearance =
  | 'border'
  | 'soft'
  | 'solid'
  | 'glass'
  | 'gradient';

export type NotifyType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default';

export interface NotifyOptions {
  message: string;
  type?: NotifyType;
  appearance?: NotifyAppearance;
  duration?: number;
}