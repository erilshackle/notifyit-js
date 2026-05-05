import icons from '../render/icons.js';

export default function alpineLayout(t, config) {

  const actionsHTML = t.actions?.length
    ? `<div class="notify-actions">
        ${t.actions.map((a, i) => `
          <button class="notify-action" data-action="${i}">
            ${a.label}
          </button>
        `).join('')}
      </div>`
    : '';

  return `
    ${config.icon ? `
      <div class="notify-icon">
        ${icons[t.type] || icons.info}
      </div>
    ` : ''}

    <div class="notify-label">
      ${(t.title || t.type || 'notification')}
    </div>

    <div class="notify-content">
      <div class="notify-body">
        <p class="notify-message">${t.message}</p>
      </div>

      ${actionsHTML}
    </div>

    ${config.closable ? `<button class="notify-close">×</button>` : ''}
  `;
}