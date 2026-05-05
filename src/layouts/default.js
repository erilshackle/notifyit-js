import icons from '../render/icons.js';

export default function defaultLayout(t, config) {
  const actions = t.actions?.length
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

    <div class="notify-main">
      <div class="notify-message"></div>
      ${actions}
    </div>

    ${config.closable ? `
      <button class="notify-close" aria-label="Close">×</button>
    ` : ''}
  `;
}