import { state, show, remove, clear } from './core.js';
import Renderer from './render/renderer.js';

/**
 * @typedef {import('../types/notify').NotifyAPI} NotifyAPI
 * @typedef {import('../types/notify').NotifyAppearance} NotifyAppearance
 * @typedef {import('../types/notify').NotifyType} NotifyType
 * @typedef {import('../types/notify').NotifyShowOptions} NotifyShowOptions
 * @typedef {import('../types/notify').NotifyPromiseOptions} NotifyPromiseOptions
 * @typedef {import('../types/notify').NotifyPromise} NotifyPromise
 */

let active;

/**
 * Mount renderer instance
 */
function mount() {
  active?.unmount?.();
  active = Renderer();
  active.mount(state);
}

/** @type {NotifyAPI & {
 *   Appearance: Record<string, NotifyAppearance>,
 *   Type: Record<string, NotifyType>,
 *   Position: Record<string, string>
 * }} */
const NotifyIt = {

  // ------------------------------------------------------------
  // CONSTANTS (AUTO-COMPLETE REAL)
  // ------------------------------------------------------------

  Appearance: Object.freeze({
    OUTLINE: 'outline',
    SUBTLE: 'subtle',
    ELEVATED: 'elevated',
    SOLID: 'solid',
    GRADIENT: 'gradient',
    GLASS: 'glass'
  }),

  Type: Object.freeze({
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    DEFAULT: 'default'
  }),

  Position: Object.freeze({
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left'
  }),

  // ------------------------------------------------------------
  // CORE
  // ------------------------------------------------------------

  init(config = {}) {
    state.config = {
      ...state.config,
      ...config
    };

    mount();
  },

  /** @type {(options: NotifyShowOptions) => NotifyPromise} */
  show,

  success: (message, options) =>
    show({ message, type: 'success', ...options }),

  error: (message, options) =>
    show({ message, type: 'error', ...options }),

  warning: (message, options) =>
    show({ message, type: 'warning', ...options }),

  info: (message, options) =>
    show({ message, type: 'info', ...options }),

  remove,
  clear,

  config(config) {
    state.config = {
      ...state.config,
      ...config
    };
  },

  getState: () => state,

  // ------------------------------------------------------------
  // BACKEND
  // ------------------------------------------------------------

  fromJsonResponse(json) {
    if (!json) return;

    let data;

    try {
      data = typeof json === 'string'
        ? JSON.parse(json)
        : json;
    } catch {
      console.warn('[NotifyIt] Invalid JSON response', json);
      return;
    }

    const type =
      data.type ||
      (data.success === false ? 'error' : 'success');

    show({
      message: data.message || '',
      type,
      appearance: data.appearance,
      duration: data.duration
    });
  },

  triggerHx(event) {
    const xhr =
      event?.detail?.xhr ||
      event?.xhr ||
      event?.target?.xhr;

    if (!xhr) return;

    const message = xhr.getResponseHeader('HX-Notify-Message');
    const type = xhr.getResponseHeader('HX-Notify-Type');

    if (message) {
      show({
        message,
        type: type || 'default'
      });
      return;
    }

    try {
      const json = JSON.parse(xhr.responseText);
      this.fromJsonResponse(json);
    } catch {
      // silent
    }
  },

  // ------------------------------------------------------------
  // PROMISE
  // ------------------------------------------------------------

  /**
   * @param {Promise<any>} promise
   * @param {NotifyPromiseOptions} [options]
   * @returns {Promise<any>}
   */
  promise(promise, options = {}) {
    const loading = show({
      message: options.loading || 'Loading...',
      type: 'info',
      appearance: options.appearance,
      duration: 0
    });

    return promise
      .then((result) => {
        setTimeout(() => remove(loading.toast.id), 300);

        const msg =
          options.success?.message ||
          options.success ||
          'Success';

        show({
          message: typeof msg === 'function'
            ? msg(result)
            : msg,
          type: 'success',
          appearance: options.appearance,
          duration: options.duration,
          actions: options.success?.actions
        });

        return result;
      })
      .catch((error) => {
        setTimeout(() => remove(loading.toast.id), 300);

        const msg =
          options.error?.message ||
          options.error ||
          'Error';

        show({
          message: typeof msg === 'function'
            ? msg(error)
            : msg,
          type: 'error',
          appearance: options.appearance,
          duration: options.duration,
          actions: options.error?.actions
        });

        throw error;
      });
  }
};

window.NotifyIt = NotifyIt;

export default NotifyIt;