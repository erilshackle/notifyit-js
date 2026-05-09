import icons from './icons.min.js';

export default function defaultLayout(t, config) {

  const actionsHTML = t.actions?.length
    ? `
      <div class="notify-actions">
        ${t.actions.map((a, i) => `
          <button class="notify-action" data-action="${i}">
            ${a.label}
          </button>
        `).join('')}
      </div>
    `
    : '';

  return `
    ${config.icon ? `
      <div class="notify-icon">
        ${icons[t.type] || icons.default}
      </div>
    ` : ''}

    <div class="notify-main">

      ${t.title ? `<div class="notify-title"></div>` : ''}

      <div class="notify-message"></div>

      ${actionsHTML}

    </div>

    ${config.closable ? `<button class="notify-close">×</button>` : ''}
  `;
}