import icons from './icons.js';

export default function defaultLayout(t, config) {

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

    <div class="notify-content">
      <p class="notify-message">${t.message}</p>
      ${actionsHTML}
    </div>

    ${config.closable ? `<button class="notify-close">×</button>` : ''}
  `;
}