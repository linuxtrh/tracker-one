/**
 * savings.js
 * Savings tab with two sections:
 *  1. Goals — savings targets with progress bars and deadline tracking.
 *  2. Pots & Accounts — free-form savings pots without a target.
 */

import {
  addGoal, updateGoal, deleteGoal,
  addPot,  updatePot,  deletePot,
} from '../state.js';
import { fmt, uid, fmtDate, clamp } from '../utils.js';
import { openModal, closeModal, colourPickerHTML, getSelectedColour, COLOURS } from '../components/modal.js';
import { showToast } from '../components/toast.js';

// ─── Public API ───────────────────────────────────────────────────────────────

export function renderSavings(state) {
  return `
    <div class="savings-tab">
      ${renderGoalsSection(state)}
      ${renderPotsSection(state)}
    </div>
  `;
}

export function initSavings(state, _mk, rerender) {
  const tab = document.querySelector('.savings-tab');
  if (!tab) return;

  // Goals
  tab.querySelector('#add-goal-btn')?.addEventListener('click', () => {
    openGoalModal(state, null, rerender);
  });

  // Pots
  tab.querySelector('#add-pot-btn')?.addEventListener('click', () => {
    openPotModal(state, null, rerender);
  });

  // Delegated actions
  tab.addEventListener('click', e => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const { action, id } = target.dataset;

    switch (action) {
      case 'add-goal-funds':  openFundsModal(state, id, rerender, 'goal'); break;
      case 'edit-goal':       openGoalModal(state, id, rerender);          break;
      case 'delete-goal':     confirmDeleteGoal(state, id, rerender);      break;
      case 'pot-add':         openPotTransfer(state, id, rerender, 'add'); break;
      case 'pot-withdraw':    openPotTransfer(state, id, rerender, 'withdraw'); break;
      case 'edit-pot':        openPotModal(state, id, rerender);           break;
      case 'delete-pot':      confirmDeletePot(state, id, rerender);       break;
    }
  });
}

// ─── Goals Section ────────────────────────────────────────────────────────────

function renderGoalsSection(state) {
  const goalsHTML = state.goals.length === 0
    ? `<div class="empty-state">
         <div class="empty-state__icon">🎯</div>
         No goals yet — set one to start saving with purpose.
       </div>`
    : `<div class="goals-grid">${state.goals.map(renderGoalCard).join('')}</div>`;

  return `
    <div class="savings-section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Savings Goals</h2>
        </div>
        <button class="btn btn--primary btn--sm" id="add-goal-btn">+ Goal</button>
      </div>
      ${goalsHTML}
    </div>
  `;
}

function renderGoalCard(goal) {
  const saved      = goal.saved  || 0;
  const target     = goal.target || 0;
  const pct        = target > 0 ? clamp((saved / target) * 100, 0, 100) : 0;
  const complete   = target > 0 && saved >= target;

  // £/month needed calculation
  let monthlyNeeded = '';
  if (goal.deadline && !complete && target > 0) {
    const remaining  = Math.max(0, target - saved);
    const deadlineMs = new Date(goal.deadline).getTime();
    const nowMs      = Date.now();
    const monthsLeft = Math.max(1, Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24 * 30.44)));
    monthlyNeeded    = `<span>${fmt(remaining / monthsLeft)}/mo needed</span>`;
  }

  const deadlineHTML = goal.deadline
    ? `<span>Due ${fmtDate(goal.deadline)}</span>`
    : '';

  const completeHTML = complete
    ? `<div class="goal-card__complete-badge">🎉 Complete!</div>`
    : '';

  return `
    <div class="goal-card">
      <div class="goal-card__accent" style="background:${goal.colour || 'var(--accent)'}"></div>
      <div class="goal-card__body">
        <div class="goal-card__top">
          <div class="goal-card__title-row">
            <span class="goal-card__emoji">${goal.emoji || '🎯'}</span>
            <span class="goal-card__name">${goal.name}</span>
          </div>
          <div style="display:flex;gap:0.2rem;align-items:center">
            ${completeHTML}
            <button class="btn btn--ghost btn--icon" data-action="edit-goal" data-id="${goal.id}" title="Edit">✏️</button>
            <button class="btn btn--icon" data-action="delete-goal" data-id="${goal.id}" title="Delete">✕</button>
          </div>
        </div>

        <div class="goal-card__amounts">
          <span class="goal-card__saved">${fmt(saved)}</span>
          <span class="goal-card__target">/ ${fmt(target)}</span>
        </div>

        <div class="progress progress--thick">
          <div class="progress__fill${complete ? ' progress__fill--green' : ''}"
               style="width:${pct}%;background:${goal.colour || 'var(--accent)'}"></div>
        </div>

        <div class="goal-card__pct-label">${pct.toFixed(1)}%</div>

        ${deadlineHTML || monthlyNeeded
          ? `<div class="goal-card__meta">${deadlineHTML}${monthlyNeeded}</div>`
          : ''}
      </div>
      <div class="goal-card__footer">
        <button class="btn btn--primary btn--sm" data-action="add-goal-funds" data-id="${goal.id}"${complete ? ' disabled style="opacity:0.4"' : ''}>
          + Add Funds
        </button>
        <button class="btn btn--secondary btn--sm" data-action="edit-goal" data-id="${goal.id}">Edit</button>
      </div>
    </div>
  `;
}

// ─── Pots Section ─────────────────────────────────────────────────────────────

function renderPotsSection(state) {
  const potsHTML = state.pots.length === 0
    ? `<div class="empty-state">
         <div class="empty-state__icon">🪴</div>
         No pots yet — add one to stash savings without a specific target.
       </div>`
    : `<div class="pots-grid">${state.pots.map(renderPotCard).join('')}</div>`;

  return `
    <div class="savings-section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Pots &amp; Accounts</h2>
          <p class="section-subtitle">Savings without a target</p>
        </div>
        <button class="btn btn--primary btn--sm" id="add-pot-btn">+ Pot</button>
      </div>
      ${potsHTML}
    </div>
  `;
}

function renderPotCard(pot) {
  return `
    <div class="pot-card">
      <div class="pot-card__accent" style="background:${pot.colour || 'var(--accent)'}"></div>
      <div class="pot-card__body">
        <div class="pot-card__top">
          <div class="pot-card__title-row">
            <span class="pot-card__emoji">${pot.emoji || '🪴'}</span>
            <span class="pot-card__name">${pot.name}</span>
          </div>
          <div style="display:flex;gap:0.2rem">
            <button class="btn btn--ghost btn--icon" data-action="edit-pot" data-id="${pot.id}" title="Edit">✏️</button>
            <button class="btn btn--icon" data-action="delete-pot" data-id="${pot.id}" title="Delete">✕</button>
          </div>
        </div>
        <div class="pot-card__balance">${fmt(pot.balance || 0)}</div>
        ${pot.note ? `<div class="pot-card__note">${pot.note}</div>` : ''}
      </div>
      <div class="pot-card__footer">
        <button class="btn btn--primary btn--sm" data-action="pot-add" data-id="${pot.id}">+ Add</button>
        <button class="btn btn--secondary btn--sm" data-action="pot-withdraw" data-id="${pot.id}">− Withdraw</button>
        <button class="btn btn--secondary btn--sm" data-action="edit-pot" data-id="${pot.id}">Edit</button>
      </div>
    </div>
  `;
}

// ─── Goal Modals ──────────────────────────────────────────────────────────────

function openGoalModal(state, goalId, rerender) {
  const goal   = goalId ? state.goals.find(g => g.id === goalId) : null;
  const isEdit = !!goal;

  openModal({
    title: isEdit ? 'Edit Goal' : 'New Savings Goal',
    body: `
      <div class="form-group">
        <label for="goal-name">Goal Name</label>
        <input id="goal-name" class="form-control" type="text"
               value="${goal?.name || ''}" placeholder="e.g. Emergency Fund" maxlength="48" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="goal-emoji">Emoji</label>
          <input id="goal-emoji" class="form-control" type="text"
                 value="${goal?.emoji || ''}" placeholder="🎯" maxlength="4" />
        </div>
        <div class="form-group">
          <label for="goal-target">Target (£)</label>
          <input id="goal-target" class="form-control" type="number" min="0.01" step="0.01"
                 value="${goal?.target || ''}" placeholder="0.00" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="goal-saved">Already Saved (£)</label>
          <input id="goal-saved" class="form-control" type="number" min="0" step="0.01"
                 value="${goal?.saved || 0}" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label for="goal-deadline">Deadline (optional)</label>
          <input id="goal-deadline" class="form-control" type="date"
                 value="${goal?.deadline || ''}" />
        </div>
      </div>
      <div class="form-group">
        <label>Colour</label>
        ${colourPickerHTML(goal?.colour || COLOURS[3])}
      </div>
    `,
    submitLabel: isEdit ? 'Save Changes' : 'Add Goal',
    onSubmit: () => {
      const name     = document.getElementById('goal-name')?.value.trim();
      const emoji    = document.getElementById('goal-emoji')?.value.trim() || '🎯';
      const target   = parseFloat(document.getElementById('goal-target')?.value);
      const saved    = parseFloat(document.getElementById('goal-saved')?.value) || 0;
      const deadline = document.getElementById('goal-deadline')?.value || null;
      const colour   = getSelectedColour(document.getElementById('modal-root'));

      if (!name || isNaN(target) || target <= 0) return;

      if (isEdit) {
        updateGoal(state, goalId, { name, emoji, target, saved, deadline, colour });
        showToast('Goal updated');
      } else {
        addGoal(state, { id: uid(), name, emoji, target, saved, deadline, colour });
        showToast('Goal added');
      }
      closeModal();
      rerender();
    },
  });
}

function openFundsModal(state, goalId, rerender) {
  const goal = state.goals.find(g => g.id === goalId);
  if (!goal) return;
  const remaining = Math.max(0, (goal.target || 0) - (goal.saved || 0));

  openModal({
    title: `Add Funds — ${goal.name}`,
    body: `
      <div class="info-list">
        <div class="info-list__row">
          <span class="label">Current saved</span>
          <span class="value">${fmt(goal.saved || 0)}</span>
        </div>
        <div class="info-list__row">
          <span class="label">Target</span>
          <span class="value">${fmt(goal.target || 0)}</span>
        </div>
        <div class="info-list__row info-list__row--total">
          <span class="label">Remaining</span>
          <span class="value">${fmt(remaining)}</span>
        </div>
      </div>
      <div class="form-group">
        <label for="funds-amount">Amount to Add (£)</label>
        <input id="funds-amount" class="form-control" type="number" min="0.01" step="0.01"
               placeholder="0.00" />
      </div>
    `,
    submitLabel: 'Add Funds',
    onSubmit: () => {
      const amount = parseFloat(document.getElementById('funds-amount')?.value);
      if (isNaN(amount) || amount <= 0) return;
      const newSaved = (goal.saved || 0) + amount;
      updateGoal(state, goalId, { saved: newSaved });
      closeModal();
      showToast(`${fmt(amount)} added to ${goal.name}`);
      rerender();
    },
  });
}

// ─── Pot Modals ───────────────────────────────────────────────────────────────

function openPotModal(state, potId, rerender) {
  const pot    = potId ? state.pots.find(p => p.id === potId) : null;
  const isEdit = !!pot;

  openModal({
    title: isEdit ? 'Edit Pot' : 'New Pot',
    body: `
      <div class="form-group">
        <label for="pot-name">Name</label>
        <input id="pot-name" class="form-control" type="text"
               value="${pot?.name || ''}" placeholder="e.g. Holiday Fund" maxlength="48" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="pot-emoji">Emoji</label>
          <input id="pot-emoji" class="form-control" type="text"
                 value="${pot?.emoji || ''}" placeholder="🪴" maxlength="4" />
        </div>
        <div class="form-group">
          <label for="pot-balance">Starting Balance (£)</label>
          <input id="pot-balance" class="form-control" type="number" min="0" step="0.01"
                 value="${pot?.balance || 0}" placeholder="0.00" />
        </div>
      </div>
      <div class="form-group">
        <label for="pot-note">Note (optional)</label>
        <input id="pot-note" class="form-control" type="text"
               value="${pot?.note || ''}" placeholder="What's this pot for?" maxlength="80" />
      </div>
      <div class="form-group">
        <label>Colour</label>
        ${colourPickerHTML(pot?.colour || COLOURS[4])}
      </div>
    `,
    submitLabel: isEdit ? 'Save Changes' : 'Add Pot',
    onSubmit: () => {
      const name    = document.getElementById('pot-name')?.value.trim();
      const emoji   = document.getElementById('pot-emoji')?.value.trim() || '🪴';
      const balance = parseFloat(document.getElementById('pot-balance')?.value) || 0;
      const note    = document.getElementById('pot-note')?.value.trim() || '';
      const colour  = getSelectedColour(document.getElementById('modal-root'));

      if (!name) return;

      if (isEdit) {
        updatePot(state, potId, { name, emoji, balance, note, colour });
        showToast('Pot updated');
      } else {
        addPot(state, { id: uid(), name, emoji, balance, note, colour });
        showToast('Pot added');
      }
      closeModal();
      rerender();
    },
  });
}

function openPotTransfer(state, potId, rerender, direction) {
  const pot = state.pots.find(p => p.id === potId);
  if (!pot) return;
  const isAdd = direction === 'add';

  openModal({
    title: `${isAdd ? 'Add to' : 'Withdraw from'} ${pot.name}`,
    body: `
      <div class="info-list" style="margin-bottom:0.5rem">
        <div class="info-list__row">
          <span class="label">Current balance</span>
          <span class="value">${fmt(pot.balance || 0)}</span>
        </div>
      </div>
      <div class="form-group">
        <label for="transfer-amount">Amount (£)</label>
        <input id="transfer-amount" class="form-control" type="number"
               min="0.01" step="0.01" placeholder="0.00" />
      </div>
    `,
    submitLabel: isAdd ? '+ Add' : '− Withdraw',
    onSubmit: () => {
      const amount = parseFloat(document.getElementById('transfer-amount')?.value);
      if (isNaN(amount) || amount <= 0) return;
      const newBalance = isAdd
        ? (pot.balance || 0) + amount
        : Math.max(0, (pot.balance || 0) - amount);
      updatePot(state, potId, { balance: newBalance });
      closeModal();
      showToast(isAdd ? `${fmt(amount)} added` : `${fmt(amount)} withdrawn`);
      rerender();
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

function confirmDeleteGoal(state, goalId, rerender) {
  const goal = state.goals.find(g => g.id === goalId);
  if (!confirm(`Delete goal "${goal?.name}"?`)) return;
  deleteGoal(state, goalId);
  showToast('Goal deleted', 'info');
  rerender();
}

function confirmDeletePot(state, potId, rerender) {
  const pot = state.pots.find(p => p.id === potId);
  if (!confirm(`Delete pot "${pot?.name}"?`)) return;
  deletePot(state, potId);
  showToast('Pot deleted', 'info');
  rerender();
}
