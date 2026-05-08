/**
 * utils.js
 * Shared utility functions used across the entire app:
 * currency formatting, unique IDs, month key helpers, and date utilities.
 */

// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Format a number as a GBP currency string using en-GB locale.
 * Always shows 2 decimal places. e.g. fmt(1234.5) → "£1,234.50"
 * @param {number} amount
 * @returns {string}
 */
export function fmt(amount) {
  return '£' + Number(amount || 0).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── IDs ──────────────────────────────────────────────────────────────────────

/**
 * Generate a short unique ID based on timestamp + random chars.
 * Not cryptographically secure — only used for local data keys.
 * @returns {string}
 */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Month Keys ───────────────────────────────────────────────────────────────

/**
 * Build a "YYYY-MM" month key from a year and JS-style (0-indexed) month.
 * e.g. monthKey(2025, 4) → "2025-05"
 * @param {number} year
 * @param {number} month  0-indexed (Jan = 0)
 * @returns {string}
 */
export function monthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/**
 * Parse a "YYYY-MM" month key into { year, month } where month is 0-indexed.
 * @param {string} mk
 * @returns {{ year: number, month: number }}
 */
export function parseMk(mk) {
  const [year, month] = mk.split('-').map(Number);
  return { year, month: month - 1 };
}

/**
 * Add n months to a month key. n can be negative.
 * @param {string} mk
 * @param {number} n
 * @returns {string}
 */
export function addMonths(mk, n) {
  const { year, month } = parseMk(mk);
  const d = new Date(year, month + n, 1);
  return monthKey(d.getFullYear(), d.getMonth());
}

/** Return the month key for the month before the given one. */
export function prevMonth(mk) {
  return addMonths(mk, -1);
}

/** Return the month key for the month after the given one. */
export function nextMonth(mk) {
  return addMonths(mk, 1);
}

// ─── Month Name Helpers ───────────────────────────────────────────────────────

/**
 * Full month + year label. e.g. "2025-05" → "May 2025"
 * @param {string} mk
 * @returns {string}
 */
export function monthName(mk) {
  const { year, month } = parseMk(mk);
  return new Date(year, month, 1).toLocaleString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Short 3-letter month abbreviation. e.g. "2025-05" → "May"
 * @param {string} mk
 * @returns {string}
 */
export function shortMonth(mk) {
  const { year, month } = parseMk(mk);
  return new Date(year, month, 1).toLocaleString('en-GB', { month: 'short' });
}

// ─── Ordinal ──────────────────────────────────────────────────────────────────

/**
 * Return number with ordinal suffix. e.g. ordinal(1) → "1st", ordinal(12) → "12th"
 * @param {number} n
 * @returns {string}
 */
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

/**
 * Today's date as "YYYY-MM-DD" string.
 * @returns {string}
 */
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Format a "YYYY-MM-DD" date string as "DD/MM/YYYY".
 * @param {string} dateStr
 * @returns {string}
 */
export function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Extract the "YYYY-MM" prefix from a "YYYY-MM-DD" date string.
 * @param {string} dateStr
 * @returns {string}
 */
export function dateToMk(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : '';
}

/**
 * Clamp a number between min and max (inclusive).
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
