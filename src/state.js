/**
 * state.js
 * Single source of truth for all app data.
 * Handles reading from / writing to localStorage under the "financeHub" key.
 * All mutation helpers accept the state object, modify it in place, then persist.
 */

const STORAGE_KEY = 'financeHub';

// Default structure ensures all keys always exist after a load.
const DEFAULT_STATE = {
  income: {},           // { "YYYY-MM": number }
  carryover: {},        // { "YYYY-MM": number }
  carryoverDismissed: [], // ["YYYY-MM", ...]  — months whose prompt was dismissed
  categories: [],       // Category[]
  expenses: [],         // Expense[]
  bills: [],            // Bill[]
  goals: [],            // Goal[]
  pots: [],             // Pot[]
};

// ─── Persistence ──────────────────────────────────────────────────────────────

/** Load state from localStorage, merging with defaults to fill any missing keys. */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

/** Persist the full state object to localStorage. */
export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Income & Carryover ───────────────────────────────────────────────────────

export function getIncome(state, mk) {
  return state.income[mk] ?? 0;
}

export function setIncome(state, mk, amount) {
  state.income[mk] = amount;
  saveState(state);
}

export function getCarryover(state, mk) {
  return state.carryover[mk] ?? 0;
}

export function setCarryover(state, mk, amount) {
  state.carryover[mk] = amount;
  saveState(state);
}

export function isCarryoverDismissed(state, mk) {
  return (state.carryoverDismissed || []).includes(mk);
}

export function dismissCarryover(state, mk) {
  if (!state.carryoverDismissed) state.carryoverDismissed = [];
  if (!state.carryoverDismissed.includes(mk)) {
    state.carryoverDismissed.push(mk);
  }
  saveState(state);
}

// ─── Derived Totals ───────────────────────────────────────────────────────────

/**
 * Return all expenses whose date falls within the given month key.
 * Expenses store full "YYYY-MM-DD" dates; we compare the "YYYY-MM" prefix.
 */
export function getExpenses(state, mk) {
  return state.expenses.filter(e => e.date && e.date.startsWith(mk));
}

/** Sum of all expenses in a month. */
export function getTotalSpent(state, mk) {
  return getExpenses(state, mk).reduce((sum, e) => sum + (e.amount || 0), 0);
}

/**
 * Sum of all bills relevant to this month.
 * Monthly bills always count; annual bills only count in their annualMonth.
 * mk uses 1-indexed months in the string, e.g. "2025-05" → monthNum = 5.
 */
export function getBillsTotal(state, mk) {
  const monthNum = parseInt(mk.split('-')[1], 10); // 1–12
  return state.bills
    .filter(b => b.frequency === 'annual' ? b.annualMonth === monthNum : true)
    .reduce((sum, b) => sum + (b.amount || 0), 0);
}

/** income + carryover − spent − bills for a given month. */
export function getRemaining(state, mk) {
  return (
    getIncome(state, mk) +
    getCarryover(state, mk) -
    getTotalSpent(state, mk) -
    getBillsTotal(state, mk)
  );
}

/** Combined total of all goal saved amounts + all pot balances. */
export function getTotalSavings(state) {
  const goalsSaved = state.goals.reduce((s, g) => s + (g.saved || 0), 0);
  const potsBalance = state.pots.reduce((s, p) => s + (p.balance || 0), 0);
  return goalsSaved + potsBalance;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export function addExpense(state, expense) {
  state.expenses.push(expense);
  saveState(state);
}

export function deleteExpense(state, id) {
  state.expenses = state.expenses.filter(e => e.id !== id);
  saveState(state);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function addCategory(state, category) {
  state.categories.push(category);
  saveState(state);
}

export function updateCategory(state, id, updates) {
  const idx = state.categories.findIndex(c => c.id === id);
  if (idx !== -1) state.categories[idx] = { ...state.categories[idx], ...updates };
  saveState(state);
}

export function deleteCategory(state, id) {
  state.categories = state.categories.filter(c => c.id !== id);
  // Cascade: remove all expenses belonging to this category
  state.expenses = state.expenses.filter(e => e.categoryId !== id);
  saveState(state);
}

// ─── Bills ────────────────────────────────────────────────────────────────────

export function addBill(state, bill) {
  state.bills.push(bill);
  saveState(state);
}

export function updateBill(state, id, updates) {
  const idx = state.bills.findIndex(b => b.id === id);
  if (idx !== -1) state.bills[idx] = { ...state.bills[idx], ...updates };
  saveState(state);
}

export function deleteBill(state, id) {
  state.bills = state.bills.filter(b => b.id !== id);
  saveState(state);
}

/**
 * Determine whether a bill is paid for a given calendar month.
 * Logic:
 *  1. If there's a manualOverride for this month key → use it.
 *  2. If we're in the current real-world month AND today >= bill.dayOfMonth → auto-paid.
 *  3. Otherwise → not paid.
 *
 * @param {object} bill
 * @param {number} year
 * @param {number} month  0-indexed
 * @returns {boolean}
 */
export function isBillPaid(bill, year, month) {
  const mk = `${year}-${String(month + 1).padStart(2, '0')}`;
  if (bill.manualOverride && mk in bill.manualOverride) {
    return bill.manualOverride[mk];
  }
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  if (isCurrentMonth && today.getDate() >= bill.dayOfMonth) return true;
  return false;
}

/** Check whether the paid state came from a manual override (vs auto). */
export function isBillManuallyPaid(bill, year, month) {
  const mk = `${year}-${String(month + 1).padStart(2, '0')}`;
  return bill.manualOverride && mk in bill.manualOverride;
}

/** Toggle a bill's paid state for a specific month via manualOverride. */
export function toggleBillPaid(state, billId, year, month) {
  const bill = state.bills.find(b => b.id === billId);
  if (!bill) return;
  if (!bill.manualOverride) bill.manualOverride = {};
  const currentPaid = isBillPaid(bill, year, month);
  const mk = `${year}-${String(month + 1).padStart(2, '0')}`;
  bill.manualOverride[mk] = !currentPaid;
  saveState(state);
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export function addGoal(state, goal) {
  state.goals.push(goal);
  saveState(state);
}

export function updateGoal(state, id, updates) {
  const idx = state.goals.findIndex(g => g.id === id);
  if (idx !== -1) state.goals[idx] = { ...state.goals[idx], ...updates };
  saveState(state);
}

export function deleteGoal(state, id) {
  state.goals = state.goals.filter(g => g.id !== id);
  saveState(state);
}

// ─── Pots ─────────────────────────────────────────────────────────────────────

export function addPot(state, pot) {
  state.pots.push(pot);
  saveState(state);
}

export function updatePot(state, id, updates) {
  const idx = state.pots.findIndex(p => p.id === id);
  if (idx !== -1) state.pots[idx] = { ...state.pots[idx], ...updates };
  saveState(state);
}

export function deletePot(state, id) {
  state.pots = state.pots.filter(p => p.id !== id);
  saveState(state);
}
