import { state, show, remove, clear } from './core.js';
import Renderer from './render/renderer.js';

/**
 * @typedef {'success'|'error'|'warning'|'info'|'default'} NotifyType
 * @typedef {'outline'|'subtle'|'elevated'|'solid'|'gradient'|'glass'} NotifyAppearance
 */

/**
 * @typedef {Object} NotifyAction
 * @property {string} label
 * @property {(toast: any) => void} [onClick]
 * @property {*} [value]
 */

/**
 * @typedef {Object} NotifyShowOptions
 * @property {string} message
 * @property {NotifyType} [type]
 * @property {NotifyAppearance} [appearance]
 * @property {number} [duration]
 * @property {NotifyAction[]} [actions]
 */

/**
 * @typedef {Object} NotifyPromiseOptions
 * @property {string} [loading]
 * @property {string|function|{message?: string|function, actions?: NotifyAction[]}} [success]
 * @property {string|function|{message?: string|function, actions?: NotifyAction[]}} [error]
 * @property {NotifyAppearance} [appearance]
 * @property {number} [duration]
 */

// ------------------------------------------------------------

let active;

/**
 * Mount renderer
 */
function mount() {
  active?.unmount?.();
  active = Renderer();
  active.mount(state);
}

// ------------------------------------------------------------
// INTERNAL HELPERS
// ------------------------------------------------------------

function normalizeInput(input) {
  if (typeof input === 'string') {
    return { message: input };
  }
  return input || {};
}

function normalizeType(type) {
  const TYPES = Object.values(NotifyIt.Type);
  return TYPES.includes(type) ? type : 'default';
}

// ------------------------------------------------------------

const NotifyIt = {

  // ------------------------------------------------------------
  // CONSTANTS
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

  /**
   * @param {string|NotifyShowOptions} options
   */
  show(options) {
    const opts = normalizeInput(options);

    return show({
      ...opts,
      type: normalizeType(opts.type)
    });
  },

  success(message, options = {}) {
    return this.show({ message, type: 'success', ...options });
  },

  error(message, options = {}) {
    return this.show({ message, type: 'error', ...options });
  },

  warning(message, options = {}) {
    return this.show({ message, type: 'warning', ...options });
  },

  info(message, options = {}) {
    return this.show({ message, type: 'info', ...options });
  },

  remove,
  clear,

  config(config = {}) {
    state.config = {
      ...state.config,
      ...config
    };
  },

  getState() {
    return state;
  },

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

    this.show({
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
      this.show({
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
   */
  promise(promise, options = {}) {
    const loading = this.show({
      message: options.loading || 'Loading...',
      type: 'info',
      appearance: options.appearance,
      duration: 0
    });

    return promise
      .then((result) => {
        setTimeout(() => remove(loading.toast.id), 300);

        const msg =
          typeof options.success === 'object'
            ? options.success.message
            : options.success;

        this.show({
          message:
            typeof msg === 'function'
              ? msg(result)
              : msg || 'Success',
          type: 'success',
          appearance: options.appearance,
          duration: options.duration,
          actions:
            typeof options.success === 'object'
              ? options.success.actions
              : undefined
        });

        return result;
      })
      .catch((error) => {
        setTimeout(() => remove(loading.toast.id), 300);

        const msg =
          typeof options.error === 'object'
            ? options.error.message
            : options.error;

        this.show({
          message:
            typeof msg === 'function'
              ? msg(error)
              : msg || 'Error',
          type: 'error',
          appearance: options.appearance,
          duration: options.duration,
          actions:
            typeof options.error === 'object'
              ? options.error.actions
              : undefined
        });

        throw error;
      });
  }
};

// ------------------------------------------------------------
// GLOBAL
// ------------------------------------------------------------

if (typeof window !== 'undefined') {
  window.NotifyIt = NotifyIt;
}

export default NotifyIt;