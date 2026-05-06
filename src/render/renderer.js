import {
  subscribe,
  remove,
  pauseTimer,
  resumeTimer
} from './../core.js';

import defaultLayout from '../layouts/default.js';

const layouts = {
  default: defaultLayout
};

// ------------------------------------------------------------

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

  // message (única fonte de verdade)
  const msgEl = el.querySelector('.notify-message');
  if (msgEl) msgEl.textContent = t.message;

  // hover pause
  if (t.pauseOnHover && t.duration > 0) {
    el.addEventListener('mouseenter', () => pauseTimer(t));
    el.addEventListener('mouseleave', () => resumeTimer(t));
  }

  // close
  const closeBtn = el.querySelector('.notify-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => remove(t.id));
  }

  // actions
  el.querySelectorAll('.notify-action').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const action = t.actions?.[i];

      if (action?.onClick) {
        action.onClick(t);
      }

      if (t.resolve) {
        t.resolve(action?.value ?? true);
      }

      remove(t.id);
    });
  });

  // animation
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

    // cleanup
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