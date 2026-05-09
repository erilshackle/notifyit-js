import {
  subscribe,
  remove,
  pauseTimer,
  resumeTimer
} from './core.js';

import defaultLayout from './ui/template.js';

const layouts = {
  default: defaultLayout
};

// ------------------------------------------------------------

function createToastElement(t, config) {
  const el = document.createElement('div');

  const appearance = t.appearance || config.appearance;
  const layout = t.layout || config.layout;

  const layoutFn = layouts[layout] || layouts.default;

  const mode = t.mode || config.mode || 'neutral';

  el.className = `
  notify
  notify-${t.type || 'default'}
  notify--${mode}
  notify-enter
`.trim();

  el.setAttribute('data-id', t.id);

  el.innerHTML = layoutFn(t, config);

  // ------------------------------------------------------------
  // TITLE
  // ------------------------------------------------------------

  const titleEl = el.querySelector('.notify-title');
  if (titleEl && t.title) {
    titleEl.textContent = t.title;
  }

  // ------------------------------------------------------------
  // MESSAGE / DESCRIPTION (PRIORIDADE CLARA)
  // ------------------------------------------------------------

  const msgEl = el.querySelector('.notify-message');
  if (msgEl) {
    msgEl.textContent =
      t.description ??
      t.message ??
      '';
  }

  // ------------------------------------------------------------
  // TIMER CONTROL
  // ------------------------------------------------------------

  if (t.pauseOnHover && t.duration > 0) {
    el.addEventListener('mouseenter', () => pauseTimer(t));
    el.addEventListener('mouseleave', () => resumeTimer(t));
  }

  // ------------------------------------------------------------
  // CLOSE
  // ------------------------------------------------------------

  const closeBtn = el.querySelector('.notify-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => remove(t.id));
  }

  // ------------------------------------------------------------
  // ACTIONS
  // ------------------------------------------------------------

  el.querySelectorAll('.notify-action').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const action = t.actions?.[i];

      action?.onClick?.(t);

      t.resolve?.(action?.value ?? true);

      remove(t.id);
    });
  });

  // ------------------------------------------------------------
  // ANIMATION
  // ------------------------------------------------------------

  requestAnimationFrame(() => {
    el.classList.remove('notify-enter');
    el.classList.add('notify-enter-active');
  });

  return el;
}

// ------------------------------------------------------------

export default function Renderer() {
  let containers = {};
  const elements = new Map();
  let unsubscribe;

  function getContainer(pos) {
    if (containers[pos]) return containers[pos];

    const el = document.createElement('div');
    el.className = `notify-container notify-${pos}`;

    if (pos.includes('center')) {
      el.style.left = '50%';
      el.style.transform = 'translateX(-50%)';
      el.style.alignItems = 'center';
    }

    document.body.appendChild(el);
    containers[pos] = el;

    return el;
  }

  function render(state) {
    const { config, toasts } = state;
    const active = new Set();

    toasts.forEach(t => {
      if (!t.visible) return;

      active.add(t.id);

      if (elements.has(t.id)) return;

      const container = getContainer(t.position || config.position);
      const el = createToastElement(t, config);

      elements.set(t.id, el);
      container.appendChild(el);
    });

    // cleanup
    elements.forEach((el, id) => {
      if (active.has(id)) return;

      el.classList.add('notify-leave-active');

      setTimeout(() => {
        el.remove();
        elements.delete(id);
      }, 150);
    });
  }

  return {
    mount(initialState) {
      unsubscribe = subscribe(render);
      render(initialState);
    },

    unmount() {
      unsubscribe?.();

      Object.values(containers).forEach(el => el.remove());
      containers = {};
      elements.clear();
    }
  };
}