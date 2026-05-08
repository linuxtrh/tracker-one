/**
 * nav.js
 * Renders the sticky top navigation bar: brand name, tab links, and month
 * navigation arrows with the current month label.
 * Returns an HTML string; event binding is handled by main.js after insertion.
 */

import { monthName } from '../utils.js';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'budget',   label: 'Budget'   },
  { id: 'bills',    label: 'Bills'    },
  { id: 'savings',  label: 'Savings'  },
];

/**
 * Build the nav HTML string.
 * @param {string} currentMk   Active month key e.g. "2025-05"
 * @param {string} activeTab   ID of the currently active tab
 * @returns {string}
 */
export function renderNav(currentMk, activeTab) {
  return `
    <nav class="nav">
      <div class="nav__brand">Finance Hub</div>

      <div class="nav__tabs">
        ${TABS.map(t => `
          <button
            class="nav__tab${t.id === activeTab ? ' nav__tab--active' : ''}"
            data-tab="${t.id}"
          >${t.label}</button>
        `).join('')}
      </div>

      <div class="nav__month">
        <button class="nav__arrow" id="prev-month" aria-label="Previous month">&#8249;</button>
        <span class="nav__month-label">${monthName(currentMk)}</span>
        <button class="nav__arrow" id="next-month" aria-label="Next month">&#8250;</button>
      </div>
    </nav>
  `;
}
