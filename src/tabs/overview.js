/**
 * overview.js
 * Renders the Overview tab:
 *  - KPI cards (Income, Spent, Bills, Remaining, Total Savings)
 *  - Income vs Spent progress bar
 *  - Spending by Category horizontal bar chart
 *  - Upcoming Bills panel (next 6 by day of month)
 *  - 6-Month Spending Trend (pure SVG bar chart with CSS animation)
 */

import {
  getIncome, getCarryover, getTotalSpent, getBillsTotal,
  getRemaining, getTotalSavings, getExpenses, isBillPaid,
} from '../state.js';
import {
  fmt, prevMonth, monthKey, shortMonth, clamp, ordinal, parseMk,
} from '../utils.js';

// ─── Public render ────────────────────────────────────────────────────────────

/**
 * Return the HTML string for the Overview tab.
 * @param {object} state
 * @param {string} mk     Current month key
 * @returns {string}
 */
export function renderOverview(state, mk) {
  return `
    <div class="overview-tab">
      ${renderKPIs(state, mk)}
      ${renderIncomeBar(state, mk)}
      <div class="overview-grid">
        ${renderCategoryChart(state, mk)}
        ${renderUpcomingBills(state, mk)}
      </div>
      ${renderTrendChart(state, mk)}
    </div>
  `;
}

/** No interactive listeners needed on this tab — all read-only. */
export function initOverview() {}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function renderKPIs(state, mk) {
  const income    = getIncome(state, mk);
  const carryover = getCarryover(state, mk);
  const spent     = getTotalSpent(state, mk);
  const bills     = getBillsTotal(state, mk);
  const remaining = income + carryover - spent - bills;
  const savings   = getTotalSavings(state);

  const carryoverSub = carryover > 0
    ? `<div class="kpi-card__sub">Incl. ${fmt(carryover)} carry over</div>`
    : '';

  return `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-card__label">Income</div>
        <div class="kpi-card__value">${fmt(income)}</div>
        <div class="kpi-card__sub">Base monthly</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">Spent</div>
        <div class="kpi-card__value" style="color:var(--red)">${fmt(spent)}</div>
        <div class="kpi-card__sub">Categories total</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">Bills</div>
        <div class="kpi-card__value" style="color:var(--yellow)">${fmt(bills)}</div>
        <div class="kpi-card__sub">This month</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">Remaining</div>
        <div class="kpi-card__value" style="color:${remaining >= 0 ? 'var(--green)' : 'var(--red)'}">${fmt(remaining)}</div>
        ${carryoverSub}
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">Total Savings</div>
        <div class="kpi-card__value" style="color:var(--blue)">${fmt(savings)}</div>
        <div class="kpi-card__sub">Goals + pots</div>
      </div>
    </div>
  `;
}

// ─── Income vs Spent Bar ──────────────────────────────────────────────────────

function renderIncomeBar(state, mk) {
  const income    = getIncome(state, mk);
  const carryover = getCarryover(state, mk);
  const total     = income + carryover;
  const spent     = getTotalSpent(state, mk);
  const pct       = total > 0 ? clamp((spent / total) * 100, 0, 100) : 0;

  return `
    <div class="card income-bar" style="margin-bottom:1.5rem">
      <div class="card__header">
        <span class="card__title">Income vs Spent</span>
        <span style="font-size:0.78rem;color:var(--muted);font-family:var(--font-mono)">${fmt(spent)} / ${fmt(total)}</span>
      </div>
      <div class="income-bar__track">
        <div class="income-bar__fill" style="width:${pct}%"></div>
      </div>
      <div class="income-bar__labels">
        <span style="color:var(--red)">Spent ${Math.round(pct)}%</span>
        <span style="color:var(--green)">Remaining ${fmt(total - spent)}</span>
      </div>
    </div>
  `;
}

// ─── Category Chart ───────────────────────────────────────────────────────────

function renderCategoryChart(state, mk) {
  const income = getIncome(state, mk) || 1; // avoid ÷0

  // Build per-category totals
  const rows = state.categories.map(cat => {
    const spent = getExpenses(state, mk)
      .filter(e => e.categoryId === cat.id)
      .reduce((s, e) => s + e.amount, 0);
    return { cat, spent };
  }).sort((a, b) => b.spent - a.spent);

  const maxSpent = rows.reduce((m, r) => Math.max(m, r.spent), 0) || 1;

  const rowsHTML = rows.length === 0
    ? `<div class="empty-state" style="padding:1rem 0">
         <div class="empty-state__icon">📂</div>
         No categories yet
       </div>`
    : rows.map(({ cat, spent }) => {
        const barPct  = (spent / maxSpent) * 100;
        const incPct  = ((spent / income) * 100).toFixed(1);
        return `
          <div class="category-chart__row">
            <div class="category-chart__name">
              <span>${cat.emoji || '📦'}</span>
              <span>${cat.name}</span>
            </div>
            <div class="category-chart__bar-wrap">
              <div class="category-chart__bar-fill"
                   style="width:${barPct}%;background:${cat.colour || 'var(--accent)'}"></div>
            </div>
            <div class="category-chart__amount">${fmt(spent)}</div>
            <div class="category-chart__pct">${incPct}%</div>
          </div>
        `;
      }).join('');

  return `
    <div class="card">
      <div class="card__header">
        <span class="card__title">Spending by Category</span>
      </div>
      <div class="category-chart">${rowsHTML}</div>
    </div>
  `;
}

// ─── Upcoming Bills ───────────────────────────────────────────────────────────

function renderUpcomingBills(state, mk) {
  const { year, month } = parseMk(mk);
  const monthNum = month + 1; // 1-indexed
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  // Filter bills relevant to this month
  const relevant = state.bills.filter(b => {
    if (b.frequency === 'annual') return b.annualMonth === monthNum;
    return true;
  });

  // Sort by dayOfMonth, take up to 6
  const sorted = [...relevant]
    .sort((a, b) => a.dayOfMonth - b.dayOfMonth)
    .slice(0, 6);

  if (sorted.length === 0) {
    return `
      <div class="card">
        <div class="card__header"><span class="card__title">Upcoming Bills</span></div>
        <div class="empty-state" style="padding:1rem 0">
          <div class="empty-state__icon">🧾</div>No bills this month
        </div>
      </div>
    `;
  }

  const billRowsHTML = sorted.map(bill => {
    const paid = isBillPaid(bill, year, month);
    const badge = getBillBadge(bill, year, month, isCurrentMonth, today, paid);

    return `
      <div class="bill-row${paid ? ' bill-row--paid' : ''}">
        <div class="bill-row__left">
          <span class="colour-dot" style="background:${bill.colour || 'var(--accent)'}"></span>
          <div>
            <div class="bill-row__name">${bill.name}</div>
            <div class="bill-row__due">${ordinal(bill.dayOfMonth)} of month</div>
          </div>
        </div>
        <div class="bill-row__right">
          ${badge}
          <span class="bill-row__amount">${fmt(bill.amount)}</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="card">
      <div class="card__header">
        <span class="card__title">Upcoming Bills</span>
        <span style="font-family:var(--font-mono);font-size:0.8rem;color:var(--muted)">${fmt(getBillsTotal(state, mk))}</span>
      </div>
      <div class="bills-list">${billRowsHTML}</div>
    </div>
  `;
}

/** Return the correct badge HTML for a bill in the Upcoming Bills panel. */
function getBillBadge(bill, year, month, isCurrentMonth, today, paid) {
  if (paid) {
    const manual = bill.manualOverride &&
      `${year}-${String(month + 1).padStart(2,'0')}` in bill.manualOverride;
    return `<span class="badge badge--green">${manual ? '✓ Paid' : '✓ Auto-paid'}</span>`;
  }
  if (!isCurrentMonth) {
    return `<span class="badge badge--muted">Due ${ordinal(bill.dayOfMonth)}</span>`;
  }
  const daysLeft = bill.dayOfMonth - today.getDate();
  if (daysLeft < 0)  return `<span class="badge badge--red">Overdue</span>`;
  if (daysLeft <= 3) return `<span class="badge badge--yellow">Due Soon</span>`;
  return `<span class="badge badge--blue">Due in ${daysLeft}d</span>`;
}

// ─── 6-Month Trend SVG Chart ──────────────────────────────────────────────────

function renderTrendChart(state, mk) {
  // Build last 6 months oldest → newest
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const m = prevMonth(mk);
    // go back i months from current
    let cur = mk;
    for (let j = 0; j < i; j++) cur = prevMonth(cur);
    months.push(cur);
  }

  const data = months.map(m => ({
    mk: m,
    label: shortMonth(m),
    spent: getTotalSpent(state, m),
    isCurrent: m === mk,
  }));

  const maxSpent = data.reduce((mx, d) => Math.max(mx, d.spent), 0);

  // SVG dimensions
  const W = 600, H = 160;
  const BAR_W = 50;
  const MAX_BAR_H = 130;
  const MIN_BAR_H = 8;
  const BOTTOM_Y = H - 20; // leave room for month labels
  const COUNT = 6;
  const STEP = W / COUNT;

  const bars = data.map((d, i) => {
    const cx = STEP * i + STEP / 2;
    const barH = maxSpent > 0
      ? Math.max(MIN_BAR_H, (d.spent / maxSpent) * MAX_BAR_H)
      : MIN_BAR_H;
    const barY = BOTTOM_Y - barH;
    const animDelay = `${i * 0.06}s`;

    const fillColour = d.isCurrent ? '#7effd4' : '#252a38';
    const topAccent  = d.isCurrent ? '' : `
      <rect
        x="${cx - BAR_W / 2}"
        y="${barY}"
        width="${BAR_W}"
        height="3"
        rx="2"
        fill="#7effd4"
        opacity="0.5"
      />
    `;

    // Amount label above bar
    const amountLabel = d.spent > 0
      ? `<text
           x="${cx}"
           y="${barY - 5}"
           text-anchor="middle"
           font-family="DM Mono, monospace"
           font-size="11"
           fill="#e8eaf0"
         >${fmt(d.spent)}</text>`
      : '';

    return `
      <g class="trend-bar" style="animation-delay:${animDelay}">
        <rect
          x="${cx - BAR_W / 2}"
          y="${barY}"
          width="${BAR_W}"
          height="${barH}"
          rx="4"
          fill="${fillColour}"
        />
        ${topAccent}
      </g>
      ${amountLabel}
      <text
        x="${cx}"
        y="${H - 4}"
        text-anchor="middle"
        font-family="DM Mono, monospace"
        font-size="11"
        fill="#6b7290"
      >${d.label}</text>
    `;
  }).join('');

  return `
    <div class="card" style="margin-top:1rem">
      <div class="card__header">
        <span class="card__title">6-Month Spending Trend</span>
      </div>
      <div class="trend-chart">
        <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
          <style>
            .trend-bar {
              transform-origin: center ${BOTTOM_Y}px;
              animation: barGrow 0.5s ease backwards;
            }
            @keyframes barGrow {
              from { transform: scaleY(0); opacity: 0; }
              to   { transform: scaleY(1); opacity: 1; }
            }
          </style>
          ${bars}
        </svg>
      </div>
    </div>
  `;
}
