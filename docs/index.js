// src/core.js
var state = {
  config: {
    position: "top-right",
    duration: 4e3,
    max: 5,
    closable: true,
    pauseOnHover: true,
    mode: "solid",
    layout: "default",
    icon: true
  },
  toasts: [],
  listeners: /* @__PURE__ */ new Set()
};
function emit() {
  state.listeners.forEach(
    (fn) => fn({
      config: state.config,
      toasts: state.toasts
    })
  );
}
function subscribe(fn) {
  state.listeners.add(fn);
  return () => state.listeners.delete(fn);
}
function uid() {
  return "nt_" + Date.now() + Math.random().toString(16).slice(2);
}
function normalize(opts) {
  let resolve;
  const promise = new Promise((r) => resolve = r);
  return {
    id: uid(),
    // 🔥 conteúdo correto
    message: opts.message || "",
    title: opts.title || null,
    description: opts.description || null,
    type: opts.type || "default",
    mode: opts.mode || state.config.mode,
    effect: opts.effect ?? state.config.effect,
    layout: opts.layout || state.config.layout,
    position: opts.position || state.config.position,
    duration: typeof opts.duration === "number" ? opts.duration : state.config.duration,
    closable: typeof opts.closable === "boolean" ? opts.closable : state.config.closable,
    pauseOnHover: typeof opts.pauseOnHover === "boolean" ? opts.pauseOnHover : state.config.pauseOnHover,
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
  const elapsed = Date.now() - (t.startTime || 0);
  t.remaining = (t.remaining || 0) - elapsed;
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
function show(opts) {
  const t = normalize(opts);
  if (!t.message && !t.title && !t.description) {
    throw new Error("Toast requires message or title/description");
  }
  state.toasts.push(t);
  if (state.toasts.length > state.config.max) {
    const removed = state.toasts.shift();
    removed == null ? void 0 : removed.resolve(false);
  }
  emit();
  if (t.duration > 0) {
    startTimer(t);
  }
  return Object.assign(t.promise, { toast: t });
}
function remove(id) {
  var _a;
  const t = state.toasts.find((x) => x.id === id);
  if (!t) return;
  t.visible = false;
  emit();
  (_a = t.resolve) == null ? void 0 : _a.call(t, false);
  clearTimeout(t.timeoutId);
  setTimeout(() => {
    state.toasts = state.toasts.filter((x) => x.id !== id);
    emit();
  }, 180);
}
function clear() {
  state.toasts.forEach((t) => {
    var _a;
    return (_a = t.resolve) == null ? void 0 : _a.call(t, false);
  });
  state.toasts = [];
  emit();
}

// src/ui/icons.min.js
var icons = { success: '\n    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n      <circle cx="12" cy="12" r="10"></circle>\n      <path d="M8 12l2.5 2.5L16 9"></path>\n    </svg>\n  ', error: '\n    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">\n      <circle cx="12" cy="12" r="10"></circle>\n      <path d="M9 9l6 6M15 9l-6 6"></path>\n    </svg>\n  ', warning: '\n    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">\n      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>\n      <path d="M12 9v4"></path>\n      <path d="M12 17h.01"></path>\n    </svg>\n  ', info: '\n    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">\n      <circle cx="12" cy="12" r="10"></circle>\n      <path d="M12 10v4"></path>\n      <path d="M12 7h.01"></path>\n    </svg>\n  ', default: '\n    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"\n         stroke-linecap="round" stroke-linejoin="round">\n      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />\n      <path d="M13.73 21a2 2 0 01-3.46 0" />\n    </svg>\n  ' };
var icons_min_default = icons;

// src/ui/template.js
function defaultLayout(t, config) {
  var _a;
  const actionsHTML = ((_a = t.actions) == null ? void 0 : _a.length) ? `
      <div class="notify-actions">
        ${t.actions.map((a, i) => `
          <button class="notify-action" data-action="${i}">
            ${a.label}
          </button>
        `).join("")}
      </div>
    ` : "";
  return `
    ${config.icon ? `
      <div class="notify-icon">
        ${icons_min_default[t.type] || icons_min_default.default}
      </div>
    ` : ""}

    <div class="notify-main">

      ${t.title ? `<div class="notify-title"></div>` : ""}

      <div class="notify-message"></div>

      ${actionsHTML}

    </div>

    ${config.closable ? `<button class="notify-close">\xD7</button>` : ""}
  `;
}

// src/renderer.js
var layouts = {
  default: defaultLayout
};
function createToastElement(t, config) {
  const el = document.createElement("div");
  const appearance = t.appearance || config.appearance;
  const layout = t.layout || config.layout;
  const layoutFn = layouts[layout] || layouts.default;
  const mode = t.mode || config.mode || "neutral";
  el.className = `
  notify
  notify-${t.type || "default"}
  notify--${mode}
  notify-enter
`.trim();
  el.setAttribute("data-id", t.id);
  el.innerHTML = layoutFn(t, config);
  const titleEl = el.querySelector(".notify-title");
  if (titleEl && t.title) {
    titleEl.textContent = t.title;
  }
  const msgEl = el.querySelector(".notify-message");
  if (msgEl) {
    msgEl.textContent = t.description ?? t.message ?? "";
  }
  if (t.pauseOnHover && t.duration > 0) {
    el.addEventListener("mouseenter", () => pauseTimer(t));
    el.addEventListener("mouseleave", () => resumeTimer(t));
  }
  const closeBtn = el.querySelector(".notify-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => remove(t.id));
  }
  el.querySelectorAll(".notify-action").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      var _a, _b, _c;
      const action = (_a = t.actions) == null ? void 0 : _a[i];
      (_b = action == null ? void 0 : action.onClick) == null ? void 0 : _b.call(action, t);
      (_c = t.resolve) == null ? void 0 : _c.call(t, (action == null ? void 0 : action.value) ?? true);
      remove(t.id);
    });
  });
  requestAnimationFrame(() => {
    el.classList.remove("notify-enter");
    el.classList.add("notify-enter-active");
  });
  return el;
}
function Renderer() {
  let containers = {};
  const elements = /* @__PURE__ */ new Map();
  let unsubscribe;
  function getContainer(pos) {
    if (containers[pos]) return containers[pos];
    const el = document.createElement("div");
    el.className = `notify-container notify-${pos}`;
    if (pos.includes("center")) {
      el.style.left = "50%";
      el.style.transform = "translateX(-50%)";
      el.style.alignItems = "center";
    }
    document.body.appendChild(el);
    containers[pos] = el;
    return el;
  }
  function render(state2) {
    const { config, toasts } = state2;
    const active2 = /* @__PURE__ */ new Set();
    toasts.forEach((t) => {
      if (!t.visible) return;
      active2.add(t.id);
      if (elements.has(t.id)) return;
      const container = getContainer(t.position || config.position);
      const el = createToastElement(t, config);
      elements.set(t.id, el);
      container.appendChild(el);
    });
    elements.forEach((el, id) => {
      if (active2.has(id)) return;
      el.classList.add("notify-leave-active");
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
      unsubscribe == null ? void 0 : unsubscribe();
      Object.values(containers).forEach((el) => el.remove());
      containers = {};
      elements.clear();
    }
  };
}

// src/index.js
var active;
function mount() {
  var _a;
  (_a = active == null ? void 0 : active.unmount) == null ? void 0 : _a.call(active);
  active = Renderer();
  active.mount(state);
}
function normalizeInput(input) {
  if (typeof input === "string") {
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
var NotifyIt = {
  // ------------------------------------------------------------
  // CONSTANTS
  // ------------------------------------------------------------
  mode: Object.freeze({
    MONO: "mono",
    SOLID: "solid",
    RICH: "rich"
  }),
  Type: Object.freeze({
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
    DEFAULT: "default"
  }),
  Position: Object.freeze({
    TOP_RIGHT: "top-right",
    TOP_LEFT: "top-left",
    BOTTOM_RIGHT: "bottom-right",
    BOTTOM_LEFT: "bottom-left"
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
    return this.show({ message, type: "success", ...options });
  },
  error(message, options = {}) {
    return this.show({ message, type: "error", ...options });
  },
  warning(message, options = {}) {
    return this.show({ message, type: "warning", ...options });
  },
  info(message, options = {}) {
    return this.show({ message, type: "info", ...options });
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
      data = typeof json === "string" ? JSON.parse(json) : json;
    } catch {
      console.warn("[NotifyIt] Invalid JSON response", json);
      return;
    }
    const type = normalizeType(
      data.type || (data.success === false ? "error" : "success")
    );
    this.show({
      message: data.message || "",
      type,
      mode: data.mode,
      duration: data.duration
    });
  },
  triggerHx(event) {
    var _a, _b;
    const xhr = ((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.xhr) || (event == null ? void 0 : event.xhr) || ((_b = event == null ? void 0 : event.target) == null ? void 0 : _b.xhr);
    if (!xhr) return;
    const message = xhr.getResponseHeader("HX-Notify-Message");
    const type = xhr.getResponseHeader("HX-Notify-Type");
    if (message) {
      this.show({
        message,
        type: normalizeType(type || "default")
      });
      return;
    }
    try {
      const json = JSON.parse(xhr.responseText);
      this.fromJsonResponse(json);
    } catch {
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
      message: options.loading || "Loading...",
      type: "info",
      mode: options.mode,
      duration: 0
    });
    return promise.then((result) => {
      remove(loading.toast.id);
      const msg = typeof options.success === "object" ? options.success.message : options.success;
      this.show({
        message: typeof msg === "function" ? msg(result) : msg || "Success",
        type: "success",
        mode: options.mode,
        duration: options.duration,
        actions: typeof options.success === "object" ? options.success.actions : void 0
      });
      return result;
    }).catch((error) => {
      remove(loading.toast.id);
      const msg = typeof options.error === "object" ? options.error.message : options.error;
      this.show({
        message: typeof msg === "function" ? msg(error) : msg || "Error",
        type: "error",
        mode: options.mode,
        duration: options.duration,
        actions: typeof options.error === "object" ? options.error.actions : void 0
      });
      throw error;
    });
  }
};
if (typeof window !== "undefined") {
  window.NotifyIt = NotifyIt;
}
//# sourceMappingURL=index.js.map