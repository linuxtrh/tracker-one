/**
 * main.js
 * Application entry point.
 * Manages:
 *  - App-level state (loaded from localStorage)
 *  - Current month key + active tab
 *  - Top-level render loop (nav + carryover banner + active tab)
 *  - Month navigation with carryover prompt logic
 *  - Tab routing
 */

import { loadState, getIncome, getCarryover, getTotalSpent, getBillsTotal, isCarryoverDismissed, dismissCarryover, setCarryover } from './state.js';
import { monthKey, prevMonth, nextMonth, monthName, parseMk, fmt } from './utils.js';
import { renderNav } from './components/nav.js';
import { showToast } from './components/toast.js';

import { renderOverview, initOverview } from './tabs/overview.js';
import { renderBudget,   initBudget   } from './tabs/budget.js';
import { renderBills,    initBills    } from './tabs/bills.js';
import { renderSavings,  initSavings  } from './tabs/savings.js';

// ─── App State ────────────────────────────────────────────────────────────────

let state      = loadState();
let currentMk  = monthKey(new Date().getFullYear(), new Date().getMonth());
let activeTab  = 'overview';

// Track whether the carryover banner should be shown for the current month
let pendingCarryoverMk = null; // set to newMonthMk when navigating forward

// ─── Core Render ──────────────────────────────────────────────────────────────

/** Full re-render of the app. Called after every state mutation. */
function render() {
  const app = document.getElementById('app');
  if (!app) return;

  // Reload state from localStorage so it's always fresh
  state = loadState();

  const navHTML      = renderNav(currentMk, activeTab);
  const bannerHTML   = renderCarryoverBanner();
  const tabHTML      = renderActiveTab();

  app.innerHTML = `
    ${navHTML}
    ${bannerHTML}
    <main class="main-content">
      ${tabHTML}
    </main>
  `;

  attachNavListeners();
  attachBannerListeners();
  initActiveTab();
}

// ─── Tab Rendering ────────────────────────────────────────────────────────────

function renderActiveTab() {
  switch (activeTab) {
    case 'overview': return renderOverview(state, currentMk);
    case 'budget':   return renderBudget(state, currentMk);
    case 'bills':    return renderBills(state, currentMk);
    case 'savings':  return renderSavings(state, currentMk);
    default:         return renderOverview(state, currentMk);
  }
}

function initActiveTab() {
  switch (activeTab) {
    case 'overview': initOverview(state, currentMk, render); break;
    case 'budget':   initBudget(state, currentMk, render);   break;
    case 'bills':    initBills(state, currentMk, render);     break;
    case 'savings':  initSavings(state, currentMk, render);   break;
  }
}

// ─── Navigation Event Listeners ──────────────────────────────────────────────

function attachNavListeners() {
  // Tab buttons
  document.querySelectorAll('.nav__tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      render();
    });
  });

  // Month prev / next
  document.getElementById('prev-month')?.addEventListener('click', () => {
    currentMk = prevMonth(currentMk);
    render();
  });

  document.getElementById('next-month')?.addEventListener('click', () => {
    const newMk = nextMonth(currentMk);
    currentMk   = newMk;
    checkCarryoverPrompt(newMk);
    render();
  });
}

// ─── Carryover Banner ─────────────────────────────────────────────────────────

/**
 * When navigating forward to a new month, check if the previous month had a
 * positive remaining balance that hasn't been carried over yet.
 * If so, set pendingCarryoverMk so the banner renders.
 */
function checkCarryoverPrompt(newMk) {
  const prevMk = prevMonth(newMk);

  // Already handled?
  const alreadySet      = getCarryover(state, newMk) > 0;
  const alreadyDismissed = isCarryoverDismissed(state, newMk);
  if (alreadySet || alreadyDismissed) {
    pendingCarryoverMk = null;
    return;
  }

  // Calculate previous month remaining
  const prevIncome  = getIncome(state, prevMk);
  const prevCarry   = getCarryover(state, prevMk);
  const prevSpent   = getTotalSpent(state, prevMk);
  const prevBills   = getBillsTotal(state, prevMk);
  const remaining   = prevIncome + prevCarry - prevSpent - prevBills;

  if (remaining > 0) {
    pendingCarryoverMk = newMk;
  } else {
    pendingCarryoverMk = null;
  }
}

function renderCarryoverBanner() {
  if (!pendingCarryoverMk || pendingCarryoverMk !== currentMk) return '';

  const prevMk  = prevMonth(currentMk);
  const prevName = monthName(prevMk);
  const newName  = monthName(currentMk);

  // Recalculate
  const prevIncome = getIncome(state, prevMk);
  const prevCarry  = getCarryover(state, prevMk);
  const prevSpent  = getTotalSpent(state, prevMk);
  const prevBills  = getBillsTotal(state, prevMk);
  const remaining  = prevIncome + prevCarry - prevSpent - prevBills;

  if (remaining <= 0) {
    pendingCarryoverMk = null;
    return '';
  }

  return `
    <div class="carryover-banner" id="carryover-banner">
      <span class="carryover-banner__text">
        ↩ You had <strong>${fmt(remaining)}</strong> left in ${prevName}.
        Carry it over to ${newName}?
      </span>
      <div class="carryover-banner__actions">
        <button class="btn btn--primary btn--sm" id="carry-over-accept">Carry Over</button>
        <button class="btn btn--secondary btn--sm" id="carry-over-dismiss">Dismiss</button>
      </div>
    </div>
  `;
}

function attachBannerListeners() {
  const banner = document.getElementById('carryover-banner');
  if (!banner) return;

  const prevMk     = prevMonth(currentMk);
  const prevIncome = getIncome(state, prevMk);
  const prevCarry  = getCarryover(state, prevMk);
  const prevSpent  = getTotalSpent(state, prevMk);
  const prevBills  = getBillsTotal(state, prevMk);
  const remaining  = prevIncome + prevCarry - prevSpent - prevBills;

  document.getElementById('carry-over-accept')?.addEventListener('click', () => {
    setCarryover(state, currentMk, remaining);
    pendingCarryoverMk = null;
    showToast(`${fmt(remaining)} carried over to ${monthName(currentMk)}`);
    render();
  });

  document.getElementById('carry-over-dismiss')?.addEventListener('click', () => {
    dismissCarryover(state, currentMk);
    pendingCarryoverMk = null;
    render();
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

render();
