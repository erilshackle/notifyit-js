import { subscribe, remove, pauseTimer, resumeTimer } from '../core.js';
import defaultLayout from '../layouts/default.js';
import alpineLayout from '../layouts/alpine.js';

const layouts = {
  default: defaultLayout,
  alpine: alpineLayout
};

function createToastElement(t, config) {
  const el = document.createElement('div');

  const appearance = t.appearance || config.appearance;
  const layout = t.layout || config.layout;
  const layoutFn = layouts[layout] || layouts.default;

  el.className = `
    notify
    notify-${t.type}
    notify--${appearance}
    notify-enter
  `;

  el.setAttribute('data-type', t.title || t.type);

  el.innerHTML = layoutFn(t, config);

  // mensagem (garantia)
  const msgEl = el.querySelector('.notify-message');
  if (msgEl) msgEl.textContent = t.message;

  // pause on hover
  if (t.pauseOnHover && t.duration > 0) {
    el.addEventListener('mouseenter', () => pauseTimer(t));
    el.addEventListener('mouseleave', () => resumeTimer(t));
  }

  // close (fade only via core remove)
  const closeBtn = el.querySelector('.notify-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => remove(t.id));
  }

  // actions
  el.querySelectorAll('.notify-action').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const action = t.actions?.[i];

      action?.onClick?.(t);

      if (t.resolve) {
        t.resolve(action?.value ?? true);
        t.resolve = null;
      }

      remove(t.id);
    });
  });

  // enter animation
  requestAnimationFrame(() => {
    el.classList.remove('notify-enter');
    el.classList.add('notify-enter-active');
  });

  return el;
}

export default function Renderer() {
  let containers = {};
  const elements = new Map();
  let unsubscribe;

  function getContainer(pos) {
    if (containers[pos]) return containers[pos];

    const el = document.createElement('div');
    el.className = `notify-container notify-${pos}`;
    document.body.appendChild(el);

    containers[pos] = el;
    return el;
  }

  function render(state) {
    const config = state.config;
    const activeIds = new Set();

    state.toasts.forEach(t => {
      if (!t.visible) return;

      const pos = t.position || config.position;
      const container = getContainer(pos);

      activeIds.add(t.id);

      if (elements.has(t.id)) return;

      const el = createToastElement(t, config);

      elements.set(t.id, el);
      container.appendChild(el);
    });

    // cleanup com fade
    elements.forEach((el, id) => {
      if (activeIds.has(id)) return;

      el.classList.add('notify-leave-active');

      setTimeout(() => {
        el.remove();
        elements.delete(id);
      }, 150);
    });
  }

  return {
    mount(state) {
      unsubscribe = subscribe(render);
      render(state);
    },

    unmount() {
      unsubscribe?.();

      Object.values(containers).forEach(el => el.remove());
      containers = {};
      elements.clear();
    }
  };
}