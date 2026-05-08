/**
 * bills.js
 * Bills tab: bills grouped by category (Utilities / Subscriptions /
 * Insurance / Transport / Other), with status badges, paid toggle,
 * add-bill modal, and delete.
 */

import {
  addBill, updateBill, deleteBill,
  isBillPaid, isBillManuallyPaid, toggleBillPaid,
  getBillsTotal,
} from '../state.js';
import { fmt, uid, ordinal, parseMk } from '../utils.js';
import { openModal, closeModal, colourPickerHTML, getSelectedColour, COLOURS } from '../components/modal.js';
import { showToast } from '../components/toast.js';

const BILL_CATEGORIES = ['Utilities', 'Subscriptions', 'Insurance', 'Transport', 'Other'];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ─── Public API ───────────────────────────────────────────────────────────────

export function renderBills(state, mk) {
  const { year, month } = parseMk(mk); // month is 0-indexed
  const monthNum = month + 1;          // 1-indexed for comparison with annualMonth

  // Only include bills relevant to this month
  const relevant = state.bills.filter(b =>
    b.frequency === 'annual' ? b.annualMonth === monthNum : true
  );

  const total = relevant.reduce((s, b) => s + (b.amount || 0), 0);

  const groupsHTML = BILL_CATEGORIES.map(cat => {
    const bills = relevant.filter(b => b.category === cat);
    if (bills.length === 0) return '';
    const groupTotal = bills.reduce((s, b) => s + b.amount, 0);
    return renderBillGroup(cat, bills, groupTotal, year, month);
  }).join('');

  const emptyState = relevant.length === 0
    ? `<div class="empty-state" style="padding:3rem 0">
         <div class="empty-state__icon">🧾</div>
         No bills this month — add one to start tracking.
       </div>`
    : groupsHTML;

  return `
    <div class="bills-tab">
      <div class="bills-tab-header">
        <div>
          <h2 class="tab-title">Bills</h2>
          <div style="font-size:0.8rem;color:var(--muted);margin-top:0.2rem">
            Monthly total: <span class="bills-total">${fmt(total)}</span>
          </div>
        </div>
        <button class="btn btn--primary btn--sm" id="add-bill-btn">+ Bill</button>
      </div>
      ${emptyState}
    </div>
  `;
}

export function initBills(state, mk, rerender) {
  const tab = document.querySelector('.bills-tab');
  if (!tab) return;

  tab.querySelector('#add-bill-btn')?.addEventListener('click', () => {
    openBillModal(state, mk, null, rerender);
  });

  tab.addEventListener('click', e => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action  = target.dataset.action;
    const id      = target.dataset.id;
    const { year, month } = parseMk(mk);

    switch (action) {
      case 'toggle-paid': {
        toggleBillPaid(state, id, year, month);
        const bill = state.bills.find(b => b.id === id);
        showToast(isBillPaid(bill, year, month) ? 'Marked as paid' : 'Marked as unpaid');
        rerender();
        break;
      }
      case 'edit-bill':
        openBillModal(state, mk, id, rerender); break;
      case 'delete-bill':
        confirmDeleteBill(state, id, rerender); break;
    }
  });
}

// ─── Bill Group ───────────────────────────────────────────────────────────────

function renderBillGroup(catName, bills, groupTotal, year, month) {
  const sortedBills = [...bills].sort((a, b) => a.dayOfMonth - b.dayOfMonth);
  const cardsHTML = sortedBills.map(b => renderBillCard(b, year, month)).join('');

  return `
    <div class="bill-group">
      <div class="bill-group__header">
        <span class="bill-group__name">${catName}</span>
        <span class="bill-group__total">${fmt(groupTotal)}</span>
      </div>
      <div class="bills-cards">${cardsHTML}</div>
    </div>
  `;
}

// ─── Bill Card ────────────────────────────────────────────────────────────────

function renderBillCard(bill, year, month) {
  const paid   = isBillPaid(bill, year, month);
  const badge  = buildStatusBadge(bill, year, month, paid);
  const toggle = paid ? 'Mark Unpaid' : 'Mark Paid';
  const dueStr = bill.frequency === 'annual'
    ? `${MONTHS[bill.annualMonth - 1]}, ${ordinal(bill.dayOfMonth)}`
    : `${ordinal(bill.dayOfMonth)} of month`;

  return `
    <div class="bill-card${paid ? ' bill-card--paid' : ''}">
      <div class="bill-card__accent" style="background:${bill.colour || 'var(--accent)'}"></div>
      <div class="bill-card__body">
        <div class="bill-card__top">
          <div class="bill-card__name-row">
            <span class="colour-dot" style="background:${bill.colour || 'var(--accent)'}"></span>
            <span class="bill-card__name">${bill.name}</span>
          </div>
          <div style="display:flex;gap:0.2rem">
            <button class="btn btn--ghost btn--icon" data-action="edit-bill" data-id="${bill.id}" title="Edit">✏️</button>
            <button class="btn btn--icon" data-action="delete-bill" data-id="${bill.id}" title="Delete">✕</button>
          </div>
        </div>
        <div class="bill-card__meta">
          <span class="bill-card__due">${dueStr}</span>
          <span class="bill-card__amount">${fmt(bill.amount)}</span>
        </div>
      </div>
      <div class="bill-card__footer">
        ${badge}
        <button class="btn btn--secondary btn--xs" data-action="toggle-paid" data-id="${bill.id}">
          ${toggle}
        </button>
      </div>
    </div>
  `;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function buildStatusBadge(bill, year, month, paid) {
  if (paid) {
    const isManual = isBillManuallyPaid(bill, year, month);
    return `<span class="badge badge--green">${isManual ? '✓ Paid' : '✓ Auto-paid'}</span>`;
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  if (!isCurrentMonth) {
    return `<span class="badge badge--muted">Due ${ordinal(bill.dayOfMonth)}</span>`;
  }

  const daysLeft = bill.dayOfMonth - today.getDate();
  if (daysLeft < 0)  return `<span class="badge badge--red">Overdue</span>`;
  if (daysLeft === 0) return `<span class="badge badge--yellow">Due Today</span>`;
  if (daysLeft <= 3) return `<span class="badge badge--yellow">Due Soon</span>`;
  return `<span class="badge badge--blue">Due in ${daysLeft}d</span>`;
}

// ─── Add / Edit Bill Modal ────────────────────────────────────────────────────

function openBillModal(state, mk, billId, rerender) {
  const bill   = billId ? state.bills.find(b => b.id === billId) : null;
  const isEdit = !!bill;

  const monthOptions = MONTHS.map((m, i) =>
    `<option value="${i + 1}"${bill?.annualMonth === i + 1 ? ' selected' : ''}>${m}</option>`
  ).join('');

  const catOptions = BILL_CATEGORIES.map(c =>
    `<option value="${c}"${bill?.category === c ? ' selected' : ''}>${c}</option>`
  ).join('');

  openModal({
    title: isEdit ? 'Edit Bill' : 'New Bill',
    body: `
      <div class="form-group">
        <label for="bill-name">Name</label>
        <input id="bill-name" class="form-control" type="text"
               value="${bill?.name || ''}" placeholder="e.g. Netflix" maxlength="48" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="bill-amount">Amount (£)</label>
          <input id="bill-amount" class="form-control" type="number" min="0.01" step="0.01"
                 value="${bill?.amount || ''}" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label for="bill-day">Day of Month</label>
          <input id="bill-day" class="form-control" type="number" min="1" max="31"
                 value="${bill?.dayOfMonth || ''}" placeholder="1–31" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="bill-category">Category</label>
          <select id="bill-category" class="form-control">
            ${catOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="bill-freq">Frequency</label>
          <select id="bill-freq" class="form-control">
            <option value="monthly"${(!bill || bill.frequency === 'monthly') ? ' selected' : ''}>Monthly</option>
            <option value="annual"${bill?.frequency === 'annual' ? ' selected' : ''}>Annual</option>
          </select>
        </div>
      </div>
      <div class="form-group" id="annual-month-group" style="display:${bill?.frequency === 'annual' ? 'flex' : 'none'}">
        <label for="bill-annual-month">Billing Month</label>
        <select id="bill-annual-month" class="form-control">
          ${monthOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Colour</label>
        ${colourPickerHTML(bill?.colour || COLOURS[0])}
      </div>
    `,
    submitLabel: isEdit ? 'Save Changes' : 'Add Bill',
    onSubmit: () => {
      const name        = document.getElementById('bill-name')?.value.trim();
      const amount      = parseFloat(document.getElementById('bill-amount')?.value);
      const dayOfMonth  = parseInt(document.getElementById('bill-day')?.value, 10);
      const category    = document.getElementById('bill-category')?.value;
      const frequency   = document.getElementById('bill-freq')?.value;
      const annualMonth = parseInt(document.getElementById('bill-annual-month')?.value, 10) || 1;
      const colour      = getSelectedColour(document.getElementById('modal-root'));

      if (!name || isNaN(amount) || amount <= 0 || isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) return;

      const data = {
        name, amount, dayOfMonth, category,
        frequency, annualMonth, colour,
        manualOverride: bill?.manualOverride || {},
      };

      if (isEdit) {
        updateBill(state, billId, data);
        showToast('Bill updated');
      } else {
        addBill(state, { id: uid(), ...data });
        showToast('Bill added');
      }
      closeModal();
      rerender();
    },
  });

  // Show/hide annual month field when frequency changes
  setTimeout(() => {
    document.getElementById('bill-freq')?.addEventListener('change', e => {
      const annual = document.getElementById('annual-month-group');
      if (annual) annual.style.display = e.target.value === 'annual' ? 'flex' : 'none';
    });
  }, 60);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

function confirmDeleteBill(state, billId, rerender) {
  const bill = state.bills.find(b => b.id === billId);
  if (!confirm(`Delete bill "${bill?.name}"?`)) return;
  deleteBill(state, billId);
  showToast('Bill deleted', 'info');
  rerender();
}
