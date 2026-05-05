const state = {
  config: {
    position: 'top-right',
    duration: 4000,
    max: 5,
    closable: true,
    pauseOnHover: true,

    appearance: 'elevated',
    layout: 'default',

    icon: true
  },
  toasts: [],
  listeners: new Set()
};

function emit() {
  state.listeners.forEach(fn => fn(state));
}

function subscribe(fn) {
  state.listeners.add(fn);
  return () => state.listeners.delete(fn);
}

function uid() {
  return 'nt_' + Date.now() + Math.random().toString(16).slice(2);
}

function normalize(opts = {}) {
  let resolve;
  const promise = new Promise(r => (resolve = r));

  return {
    id: uid(),
    message: opts.message || '',
    type: opts.type || 'default',
    title: opts.title || opts.type || 'notification',

    appearance: opts.appearance || state.config.appearance,
    layout: opts.layout || state.config.layout,
    position: opts.position || state.config.position,

    duration:
      typeof opts.duration === 'number'
        ? opts.duration
        : state.config.duration,

    closable:
      typeof opts.closable === 'boolean'
        ? opts.closable
        : state.config.closable,

    pauseOnHover:
      typeof opts.pauseOnHover === 'boolean'
        ? opts.pauseOnHover
        : state.config.pauseOnHover,

    actions: opts.actions || [],

    resolve,
    promise,

    timeoutId: null,
    startTime: null,
    remaining: null,

    visible: true
  };
}

function startTimer(t) {
  if (t.duration <= 0) return;

  t.remaining = t.duration;
  t.startTime = Date.now();

  t.timeoutId = setTimeout(() => {
    remove(t.id);
  }, t.remaining);
}

function pauseTimer(t) {
  if (!t.timeoutId) return;

  clearTimeout(t.timeoutId);

  const elapsed = Date.now() - t.startTime;
  t.remaining -= elapsed;
}

function resumeTimer(t) {
  if (t.remaining == null) return;

  if (t.remaining <= 50) {
    t.remaining = 50;
  }

  t.startTime = Date.now();

  t.timeoutId = setTimeout(() => {
    remove(t.id);
  }, t.remaining);
}

/**
 * @typedef {'border'|'soft'|'solid'|'glass'|'gradient'} NotifyAppearance
 * @typedef {'success'|'error'|'warning'|'info'|'default'} NotifyType
 * @param {Object} options
 * @param {string} options.message
 * @param {NotifyType} options.type
 * @param {NotifyAppearance} [options.appearance]
 */
show(options)
function add(opts) {
  const t = normalize(opts);
  if (!t.message) return;

  state.toasts.push(t);

  if (state.toasts.length > state.config.max) {
    const removed = state.toasts.shift();
    removed?.resolve?.(false);
  }

  emit();

  if (t.duration > 0) {
    startTimer(t);
  }

  return Object.assign(t.promise, { toast: t });
}

function remove(id) {
  const t = state.toasts.find(x => x.id === id);
  if (!t) return;

  t.visible = false;
  emit();

  if (t.resolve) {
    t.resolve(false);
    t.resolve = null;
  }

  clearTimeout(t.timeoutId);

  setTimeout(() => {
    state.toasts = state.toasts.filter(x => x.id !== id);
    emit();
  }, 180);
}

function clear() {
  state.toasts.forEach(t => {
    t.resolve?.(false);
  });

  state.toasts = [];
  emit();
}

export {
  state,
  subscribe,
  add as show,
  remove,
  clear,
  pauseTimer,
  resumeTimer
};