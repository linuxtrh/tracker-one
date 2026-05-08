/**
 * toast.js
 * Lightweight toast notification system.
 * Toasts appear in the bottom-right corner and auto-dismiss after 3 seconds.
 * Types: 'success' | 'error' | 'info'
 */

let dismissTimer = null;

/**
 * Display a toast notification.
 * @param {string} message   - Text to display.
 * @param {'success'|'error'|'info'} [type='success']
 */
export function showToast(message, type = 'success') {
  const root = document.getElementById('toast-root');
  if (!root) return;

  // Cancel any in-flight dismiss timer so we don't flicker
  if (dismissTimer) clearTimeout(dismissTimer);

  root.innerHTML = `<div class="toast toast--${type} toast--visible">${message}</div>`;

  dismissTimer = setTimeout(() => {
    const toast = root.querySelector('.toast');
    if (toast) {
      toast.classList.remove('toast--visible');
      // Remove from DOM after fade-out transition
      setTimeout(() => { root.innerHTML = ''; }, 300);
    }
  }, 3000);
}
