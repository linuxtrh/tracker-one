/**
 * modal.js
 * Reusable modal dialog system.
 * Renders into the #modal-root portal to avoid stacking-context issues.
 *
 * Usage:
 *   openModal({
 *     title: 'Add Expense',
 *     body: '<div class="form-group">...</div>',
 *     onSubmit: () => { ... read form values ... closeModal(); },
 *     submitLabel: 'Add',
 *   });
 */

// ─── Colour Palette ───────────────────────────────────────────────────────────

/** User-selectable colours for categories, bills, goals, and pots. */
export const COLOURS = [
  '#7effd4', '#ff6b6b', '#ffd166', '#74b9ff',
  '#c084fc', '#fb923c', '#f472b6', '#34d399',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build an HTML string for a colour-swatch radio group.
 * @param {string} [selected=COLOURS[0]]  Currently selected hex colour.
 * @param {string} [name='colour']         Radio group name attribute.
 * @returns {string}
 */
export function colourPickerHTML(selected = COLOURS[0], name = 'colour') {
  return `
    <div class="colour-picker">
      ${COLOURS.map(c => `
        <label
          class="colour-swatch${c === selected ? ' selected' : ''}"
          style="background:${c}"
          title="${c}"
        >
          <input type="radio" name="${name}" value="${c}"${c === selected ? ' checked' : ''} />
        </label>
      `).join('')}
    </div>
  `;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Open a modal.
 * @param {object} opts
 * @param {string}   opts.title
 * @param {string}   opts.body         Inner HTML for the modal body.
 * @param {Function} [opts.onSubmit]   Called when the Submit button is clicked.
 * @param {string}   [opts.submitLabel='Save']
 * @param {boolean}  [opts.showCancel=true]
 */
export function openModal({
  title,
  body,
  onSubmit,
  submitLabel = 'Save',
  showCancel = true,
}) {
  const root = document.getElementById('modal-root');
  if (!root) return;

  const footerHTML = (showCancel || onSubmit) ? `
    <div class="modal__footer">
      ${showCancel ? '<button class="btn btn--secondary" id="modal-cancel">Cancel</button>' : ''}
      ${onSubmit   ? `<button class="btn btn--primary"   id="modal-submit">${submitLabel}</button>` : ''}
    </div>
  ` : '';

  root.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal__header">
          <h2 class="modal__title" id="modal-title">${title}</h2>
          <button class="modal__close" id="modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="modal__body">${body}</div>
        ${footerHTML}
      </div>
    </div>
  `;

  // Wire up colour swatches so clicking one updates the .selected class
  root.querySelectorAll('.colour-swatch input[type="radio"]').forEach(input => {
    input.addEventListener('change', () => {
      root.querySelectorAll(`.colour-picker .colour-swatch`).forEach(sw => {
        sw.classList.toggle('selected', sw.querySelector('input')?.value === input.value);
      });
    });
  });

  // Close triggers
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Submit
  if (onSubmit) {
    document.getElementById('modal-submit')?.addEventListener('click', onSubmit);
  }

  // Also allow Enter to submit (unless in a textarea)
  root.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === 'Escape') closeModal();
  });

  // Auto-focus first interactive element
  setTimeout(() => {
    const first = root.querySelector('input:not([type=radio]), select, textarea');
    first?.focus();
  }, 50);
}

/** Close and empty the active modal. */
export function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) root.innerHTML = '';
}

/**
 * Read the selected colour value from a colour picker inside a container.
 * @param {Element} container
 * @param {string}  [name='colour']
 * @returns {string}
 */
export function getSelectedColour(container, name = 'colour') {
  const checked = container.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : COLOURS[0];
}
