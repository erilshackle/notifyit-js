// core.js

export const state = {
  config: {
    position: 'top-right',
    duration: 4000,
    max: 5,
    closable: true,
    pauseOnHover: true,
    mode: 'solid',
    layout: 'default',
    icon: true
  },
  toasts: [],
  listeners: new Set()
};

// ------------------------------------------------------------

function emit() {
  state.listeners.forEach(fn =>
    fn({
      config: state.config,
      toasts: state.toasts
    })
  );
}

export function subscribe(fn) {
  state.listeners.add(fn);
  return () => state.listeners.delete(fn);
}

function uid() {
  return 'nt_' + Date.now() + Math.random().toString(16).slice(2);
}

// ------------------------------------------------------------

function normalize(opts) {
  let resolve;
  const promise = new Promise(r => (resolve = r));

  return {
    id: uid(),

    // 🔥 conteúdo correto
    message: opts.message || '',
    title: opts.title || null,
    description: opts.description || null,

    type: opts.type || 'default',

    mode: opts.mode || state.config.mode,
    effect: opts.effect ?? state.config.effect,

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

// ------------------------------------------------------------

function startTimer(t) {
  if (t.duration <= 0) return;

  t.remaining = t.duration;
  t.startTime = Date.now();

  t.timeoutId = setTimeout(() => {
    remove(t.id);
  }, t.remaining);
}

export function pauseTimer(t) {
  if (!t.timeoutId) return;

  clearTimeout(t.timeoutId);

  const elapsed = Date.now() - (t.startTime || 0);
  t.remaining = (t.remaining || 0) - elapsed;
}

export function resumeTimer(t) {
  if (t.remaining == null) return;

  if (t.remaining <= 50) {
    t.remaining = 50;
  }

  t.startTime = Date.now();

  t.timeoutId = setTimeout(() => {
    remove(t.id);
  }, t.remaining);
}

// ------------------------------------------------------------

export function show(opts) {
  const t = normalize(opts);

  if (!t.message && !t.title && !t.description) {
    throw new Error('Toast requires message or title/description');
  }

  state.toasts.push(t);

  if (state.toasts.length > state.config.max) {
    const removed = state.toasts.shift();
    removed?.resolve(false);
  }

  emit();

  if (t.duration > 0) {
    startTimer(t);
  }

  return Object.assign(t.promise, { toast: t });
}

// ------------------------------------------------------------

export function remove(id) {
  const t = state.toasts.find(x => x.id === id);
  if (!t) return;

  t.visible = false;
  emit();

  t.resolve?.(false);

  clearTimeout(t.timeoutId);

  setTimeout(() => {
    state.toasts = state.toasts.filter(x => x.id !== id);
    emit();
  }, 180);
}

// ------------------------------------------------------------

export function clear() {
  state.toasts.forEach(t => t.resolve?.(false));
  state.toasts = [];
  emit();
}