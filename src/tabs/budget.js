/**
 * budget.js
 * Budget tab: income display, carryover modal, category cards grid,
 * per-category expense logging, and spend/edit/delete modals.
 */

import {
  getIncome, getCarryover, setIncome, setCarryover,
  getTotalSpent, getBillsTotal, getExpenses,
  addExpense, deleteExpense,
  addCategory, updateCategory, deleteCategory,
} from '../state.js';
import { fmt, uid, monthKey, prevMonth, parseMk, todayStr, fmtDate, clamp } from '../utils.js';
import { openModal, closeModal, colourPickerHTML, getSelectedColour, COLOURS } from '../components/modal.js';
import { showToast } from '../components/toast.js';

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Render the Budget tab HTML.
 * @param {object} state
 * @param {string} mk
 * @returns {string}
 */
export function renderBudget(state, mk) {
  return `
    <div class="budget-tab">
      ${renderIncomeRow(state, mk)}
      ${renderCategoryGrid(state, mk)}
    </div>
  `;
}

/**
 * Bind all Budget tab event listeners after the HTML is in the DOM.
 * @param {object} state
 * @param {string} mk
 * @param {Function} rerender
 */
export function initBudget(state, mk, rerender) {
  const tab = document.querySelector('.budget-tab');
  if (!tab) return;

  // ── Income controls
  tab.querySelector('#edit-income-btn')?.addEventListener('click', () => {
    openEditIncomeModal(state, mk, rerender);
  });

  tab.querySelector('#carryover-btn')?.addEventListener('click', () => {
    openCarryoverModal(state, mk, rerender);
  });

  // ── Add category
  tab.querySelector('#add-category-btn')?.addEventListener('click', () => {
    openCategoryModal(state, mk, null, rerender);
  });

  // ── Event delegation for card actions
  tab.addEventListener('click', e => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const id     = target.dataset.id;

    switch (action) {
      case 'add-spend':
        openSpendModal(state, mk, id, rerender); break;
      case 'edit-category':
        openCategoryModal(state, mk, id, rerender); break;
      case 'delete-category':
        confirmDeleteCategory(state, mk, id, rerender); break;
      case 'toggle-log':
        toggleExpenseLog(id); break;
      case 'delete-expense':
        confirmDeleteExpense(state, mk, id, rerender); break;
    }
  });
}

// ─── Income Row ───────────────────────────────────────────────────────────────

function renderIncomeRow(state, mk) {
  const income    = getIncome(state, mk);
  const carryover = getCarryover(state, mk);

  const carryoverLine = carryover > 0
    ? `<div class="income-row__carryover">+ ${fmt(carryover)} carried over</div>`
    : '';

  return `
    <div class="income-row">
      <div class="income-row__info">
        <div class="income-row__label">Monthly Income</div>
        <div class="income-row__value">${fmt(income)}</div>
        ${carryoverLine}
      </div>
      <div class="income-row__actions">
        <button class="btn btn--secondary btn--sm" id="edit-income-btn">Edit Income</button>
        <button class="btn btn--secondary btn--sm" id="carryover-btn">↩ Carry Over</button>
      </div>
    </div>
  `;
}

// ─── Category Grid ────────────────────────────────────────────────────────────

function renderCategoryGrid(state, mk) {
  const income = getIncome(state, mk);

  const cardsHTML = state.categories.length === 0
    ? `<div class="empty-state" style="grid-column:1/-1;padding:2.5rem 0">
         <div class="empty-state__icon">📂</div>
         No categories yet — add one to start tracking your spending.
       </div>`
    : state.categories.map(cat => renderCategoryCard(state, cat, mk, income)).join('');

  return `
    <div class="section-header">
      <h2 class="section-title">Categories</h2>
      <button class="btn btn--primary btn--sm" id="add-category-btn">+ Category</button>
    </div>
    <div class="categories-grid">${cardsHTML}</div>
  `;
}

function renderCategoryCard(state, cat, mk, income) {
  const budget  = cat.budgets?.[mk] ?? 0;
  const expenses = getExpenses(state, mk).filter(e => e.categoryId === cat.id);
  const spent   = expenses.reduce((s, e) => s + e.amount, 0);
  const over    = spent > budget && budget > 0;
  const remaining = budget > 0 ? budget - spent : null;
  const pct     = budget > 0 ? clamp((spent / budget) * 100, 0, 100) : 0;
  const incPct  = income > 0 ? ((spent / income) * 100).toFixed(1) : '0.0';

  const remainLabel = remaining !== null
    ? (over
        ? `<span class="category-card__remaining--over">Over by ${fmt(Math.abs(remaining))}</span>`
        : `<span class="category-card__remaining--ok">${fmt(remaining)} left</span>`)
    : `<span style="color:var(--muted)">No budget set</span>`;

  const logHTML = renderExpenseLog(expenses);

  return `
    <div class="category-card" id="cat-card-${cat.id}">
      <div class="category-card__accent" style="background:${cat.colour || 'var(--accent)'}"></div>
      <div class="category-card__body">
        <div class="category-card__top">
          <div class="category-card__name-row">
            <span class="category-card__emoji">${cat.emoji || '📦'}</span>
            <span class="category-card__name">${cat.name}</span>
          </div>
          <div class="category-card__actions">
            <button class="btn btn--ghost btn--icon" data-action="edit-category" data-id="${cat.id}" title="Edit">✏️</button>
            <button class="btn btn--icon" data-action="delete-category" data-id="${cat.id}" title="Delete">✕</button>
          </div>
        </div>

        <div class="category-card__amounts">
          <span class="category-card__spent">${fmt(spent)}</span>
          ${budget > 0 ? `<span class="category-card__budget">/ ${fmt(budget)}</span>` : ''}
        </div>

        <div class="progress progress--thick">
          <div class="progress__fill${over ? ' progress__fill--red' : ''}"
               style="width:${pct}%"></div>
        </div>

        <div class="category-card__bar-label">
          ${remainLabel}
          <span>${incPct}% of income</span>
        </div>
      </div>

      <div class="category-card__footer">
        <button class="btn btn--primary btn--sm" data-action="add-spend" data-id="${cat.id}">+ Spend</button>
        <button class="btn btn--secondary btn--sm" data-action="edit-category" data-id="${cat.id}">Edit</button>
      </div>

      <button class="expense-toggle" data-action="toggle-log" data-id="${cat.id}">
        <span>Expenses (${expenses.length})</span>
        <span id="log-arrow-${cat.id}">▸</span>
      </button>

      <div class="expense-log" id="log-${cat.id}" style="display:none">
        ${logHTML}
      </div>
    </div>
  `;
}

function renderExpenseLog(expenses) {
  if (expenses.length === 0) {
    return `<div class="expense-log__empty">No entries this month</div>`;
  }

  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return sorted.map(e => `
    <div class="expense-entry">
      <span class="expense-entry__note">${e.note || '—'}</span>
      <span class="expense-entry__date">${fmtDate(e.date)}</span>
      <span class="expense-entry__amount">${fmt(e.amount)}</span>
      <button class="btn btn--icon" data-action="delete-expense" data-id="${e.id}" title="Delete">✕</button>
    </div>
  `).join('');
}

// ─── Toggle Expense Log ───────────────────────────────────────────────────────

function toggleExpenseLog(catId) {
  const log   = document.getElementById(`log-${catId}`);
  const arrow = document.getElementById(`log-arrow-${catId}`);
  if (!log) return;
  const open = log.style.display === 'none';
  log.style.display   = open ? 'block' : 'none';
  if (arrow) arrow.textContent = open ? '▾' : '▸';
}

// ─── Edit Income Modal ────────────────────────────────────────────────────────

function openEditIncomeModal(state, mk, rerender) {
  const current = getIncome(state, mk);
  openModal({
    title: 'Edit Income',
    body: `
      <div class="form-group">
        <label for="income-amount">Monthly Income (£)</label>
        <input id="income-amount" class="form-control" type="number" min="0" step="0.01"
               value="${current}" placeholder="0.00" />
      </div>
    `,
    submitLabel: 'Save',
    onSubmit: () => {
      const val = parseFloat(document.getElementById('income-amount')?.value);
      if (isNaN(val) || val < 0) return;
      setIncome(state, mk, val);
      closeModal();
      showToast('Income updated');
      rerender();
    },
  });
}

// ─── Carryover Modal ──────────────────────────────────────────────────────────

function openCarryoverModal(state, mk, rerender) {
  const prevMk      = prevMonth(mk);
  const prevIncome  = getIncome(state, prevMk);
  const prevCarry   = getCarryover(state, prevMk);
  const prevSpent   = getTotalSpent(state, prevMk);
  const prevBills   = getBillsTotal(state, prevMk);
  const prevRemain  = prevIncome + prevCarry - prevSpent - prevBills;
  const currentCarry = getCarryover(state, mk);

  openModal({
    title: '↩ Carry Over from Previous Month',
    body: `
      <div class="info-list">
        <div class="info-list__row">
          <span class="label">Previous income</span>
          <span class="value">${fmt(prevIncome)}</span>
        </div>
        ${prevCarry > 0 ? `
        <div class="info-list__row">
          <span class="label">Previous carryover</span>
          <span class="value">${fmt(prevCarry)}</span>
        </div>` : ''}
        <div class="info-list__row">
          <span class="label">Previous spent</span>
          <span class="value" style="color:var(--red)">− ${fmt(prevSpent)}</span>
        </div>
        <div class="info-list__row">
          <span class="label">Previous bills</span>
          <span class="value" style="color:var(--yellow)">− ${fmt(prevBills)}</span>
        </div>
        <div class="info-list__row info-list__row--total">
          <span class="label">Available to carry</span>
          <span class="value">${fmt(Math.max(0, prevRemain))}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="carry-amount">Amount to carry over (£)</label>
        <input id="carry-amount" class="form-control" type="number" min="0" step="0.01"
               value="${Math.max(0, prevRemain).toFixed(2)}" placeholder="0.00" />
      </div>
    `,
    submitLabel: 'Carry Over',
    onSubmit: () => {
      const val = parseFloat(document.getElementById('carry-amount')?.value);
      if (isNaN(val) || val < 0) return;
      setCarryover(state, mk, val);
      closeModal();
      showToast(`${fmt(val)} carried over`);
      rerender();
    },
  });
}

// ─── Add / Edit Category Modal ────────────────────────────────────────────────

function openCategoryModal(state, mk, catId, rerender) {
  const cat    = catId ? state.categories.find(c => c.id === catId) : null;
  const budget = cat?.budgets?.[mk] ?? '';
  const isEdit = !!cat;

  openModal({
    title: isEdit ? 'Edit Category' : 'New Category',
    body: `
      <div class="form-group">
        <label for="cat-name">Name</label>
        <input id="cat-name" class="form-control" type="text"
               value="${cat?.name || ''}" placeholder="e.g. Groceries" maxlength="32" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="cat-emoji">Emoji</label>
          <input id="cat-emoji" class="form-control" type="text"
                 value="${cat?.emoji || ''}" placeholder="🛒" maxlength="4" />
        </div>
        <div class="form-group">
          <label for="cat-budget">Budget for this month (£)</label>
          <input id="cat-budget" class="form-control" type="number" min="0" step="0.01"
                 value="${budget}" placeholder="0.00" />
        </div>
      </div>
      <div class="form-group">
        <label>Colour</label>
        ${colourPickerHTML(cat?.colour || COLOURS[0])}
      </div>
    `,
    submitLabel: isEdit ? 'Save Changes' : 'Add Category',
    onSubmit: () => {
      const name   = document.getElementById('cat-name')?.value.trim();
      const emoji  = document.getElementById('cat-emoji')?.value.trim() || '📦';
      const budget = parseFloat(document.getElementById('cat-budget')?.value) || 0;
      const colour = getSelectedColour(document.getElementById('modal-root'));
      if (!name) return;

      if (isEdit) {
        const existing = state.categories.find(c => c.id === catId);
        const budgets  = { ...(existing?.budgets || {}), [mk]: budget };
        updateCategory(state, catId, { name, emoji, colour, budgets });
        showToast('Category updated');
      } else {
        addCategory(state, {
          id: uid(), name, emoji, colour,
          budgets: budget > 0 ? { [mk]: budget } : {},
        });
        showToast('Category added');
      }
      closeModal();
      rerender();
    },
  });
}

// ─── Add Spend Modal ──────────────────────────────────────────────────────────

function openSpendModal(state, mk, catId, rerender) {
  const cat = state.categories.find(c => c.id === catId);
  openModal({
    title: `Add Spend — ${cat?.name || 'Category'}`,
    body: `
      <div class="form-group">
        <label for="spend-amount">Amount (£)</label>
        <input id="spend-amount" class="form-control" type="number" min="0.01" step="0.01"
               placeholder="0.00" />
      </div>
      <div class="form-group">
        <label for="spend-note">Note (optional)</label>
        <input id="spend-note" class="form-control" type="text"
               placeholder="e.g. Weekly shop" maxlength="80" />
      </div>
      <div class="form-group">
        <label for="spend-date">Date</label>
        <input id="spend-date" class="form-control" type="date"
               value="${todayStr()}" />
      </div>
    `,
    submitLabel: 'Add Spend',
    onSubmit: () => {
      const amount = parseFloat(document.getElementById('spend-amount')?.value);
      const note   = document.getElementById('spend-note')?.value.trim() || '';
      const date   = document.getElementById('spend-date')?.value || todayStr();
      if (isNaN(amount) || amount <= 0) return;
      addExpense(state, { id: uid(), categoryId: catId, amount, note, date });
      closeModal();
      showToast('Expense added');
      rerender();
    },
  });
}

// ─── Delete Helpers ───────────────────────────────────────────────────────────

function confirmDeleteCategory(state, mk, catId, rerender) {
  const cat = state.categories.find(c => c.id === catId);
  if (!confirm(`Delete category "${cat?.name}"? All its expenses will also be removed.`)) return;
  deleteCategory(state, catId);
  showToast('Category deleted', 'info');
  rerender();
}

function confirmDeleteExpense(state, mk, expId, rerender) {
  if (!confirm('Delete this expense?')) return;
  deleteExpense(state, expId);
  showToast('Expense deleted', 'info');
  rerender();
}
