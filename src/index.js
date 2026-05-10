import { state, show, remove, clear } from './core.js';
import Renderer from './renderer.js';
import './ui/style.css';

/**
 * @typedef {'success'|'error'|'warning'|'info'|'default'} NotifyType
 * @typedef {'solid'|'mono'|'soft'} NotifyMode
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
 * @property {NotifyMode} [mode]
 * @property {number} [duration]
 * @property {NotifyAction[]} [actions]
 */

/**
 * @typedef {Object} NotifyPromiseOptions
 * @property {string} [loading]
 * @property {string|function|{message?: string|function, actions?: NotifyAction[]}} [success]
 * @property {string|function|{message?: string|function, actions?: NotifyAction[]}} [error]
 * @property {NotifyMode} [mode]
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
    return { message: input, type: Type.DEFAULT };
  }
  return input || {};
}

function normalizeType(type) {
  const TYPES = NotifyIt.Type;

  const values = Object.values(TYPES);

  if (!values.includes(type)) {
    return TYPES.DEFAULT;
  }

  return type;
}

// ------------------------------------------------------------

const NotifyIt = {

  // ------------------------------------------------------------
  // CONSTANTS
  // ------------------------------------------------------------

  mode: Object.freeze({
    MONO: 'mono',
    SOLID: 'solid',
    SOFT: 'soft',
  }),

  Type: Object.freeze({
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    DEFAULT: 'default'
  }),

  Position: Object.freeze({
    TOP: 'bottom-center',
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM: 'bottom-center'
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

  /**
   * @param {string|NotifyShowOptions} options
   */
  toast(options) {
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

    const type = normalizeType(
      data.type ||
      (data.success === false ? 'error' : 'success')
    );

    this.show({
      message: data.message || '',
      type,
      mode: data.mode,
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
        type: normalizeType(type || 'default')
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
      mode: options.mode,
      duration: 0
    });

    return promise
      .then((result) => {
        remove(loading.toast.id);

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
          mode: options.mode,
          duration: options.duration,
          actions:
            typeof options.success === 'object'
              ? options.success.actions
              : undefined
        });

        return result;
      })
      .catch((error) => {
        remove(loading.toast.id);

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
          mode: options.mode,
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
