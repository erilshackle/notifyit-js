// index.js
import { state, show, remove, clear } from './core.js';
import Renderer from './render/renderer.js';

let active;

/**
 * Mount renderer instance
 */
function mount() {
  active?.unmount?.();
  active = Renderer();
  active.mount(state);
}


/**
 * @typedef {import('../types/notify').NotifyAPI} NotifyAPI
 */

/** @type {NotifyAPI} */
const NotifyIt = {

  // ------------------------------------------------------------
  // CORE LIFECYCLE
  // ------------------------------------------------------------

  /**
   * Initialize notification system
   * @param {Object} config
   * @param {NotifyAppearance} [config.appearance]
   * @param {NotifyType} [config.type]
   * @param {number} [config.duration]
   * @param {boolean} [config.closable]
   */
  init(config = {}) {
    state.config = {
      ...state.config,
      ...config
    };

    mount();
  },

  /**
   * Show a notification
   * @param {Object} options
   * @param {string} options.message
   * @param {NotifyType} [options.type]
   * @param {NotifyAppearance} [options.appearance]
   * @param {number} [options.duration]
   * @param {Array<{label:string,onClick?:Function,value?:any}>} [options.actions]
   */
  show,

  /**
   * Success shortcut
   */
  success: (message, options) =>
    show({ message, type: 'success', ...options }),

  /**
   * Error shortcut
   */
  error: (message, options) =>
    show({ message, type: 'error', ...options }),

  /**
   * Warning shortcut
   */
  warning: (message, options) =>
    show({ message, type: 'warning', ...options }),

  /**
   * Info shortcut
   */
  info: (message, options) =>
    show({ message, type: 'info', ...options }),

  /**
   * Remove a toast by id
   */
  remove,

  /**
   * Clear all toasts
   */
  clear,

  /**
   * Update runtime config
   * @param {Object} config
   */
  config(config) {
    state.config = {
      ...state.config,
      ...config
    };
  },

  /**
   * Get internal state (debug only)
   */
  getState: () => state,

  // ------------------------------------------------------------
  // BACKEND HELPERS
  // ------------------------------------------------------------

  /**
   * Parse JSON response and show toast
   * @param {Object|string} json
   */
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

  /**
   * Handle HTMX response headers or JSON fallback
   * @param {Event} event
   */
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
      // silent fail
    }
  },

  // ------------------------------------------------------------
  // PROMISE HELPER
  // ------------------------------------------------------------

  /**
   * Wrap a promise with toast lifecycle
   *
   * - shows loading toast
   * - replaces with success or error toast
   *
   * @param {Promise} promise
   * @param {Object} [options]
   * @param {string} [options.loading]
   * @param {string|Function} [options.success]
   * @param {string|Function} [options.error]
   * @param {NotifyAppearance} [options.appearance]
   * @param {number} [options.duration]
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