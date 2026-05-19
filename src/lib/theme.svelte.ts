/**
 * Theme store — Svelte 5 runes, shared module state.
 *
 * Manages both theme (light/dark/system) and color-scheme (forest/ocean/...)
 * localStorage keys:
 *   "gf-theme" → "system" | "light" | "dark"
 *   "gf-color" → scheme id (string, defaults to first scheme)
 */

import { SCHEMES, applyColorScheme } from './colors.ts';

export type Theme = 'system' | 'light' | 'dark';

export type { ColorScheme } from './colors.ts';
export { SCHEMES };

/* ── State ─────────────────────────────────────── */
let _theme = $state<Theme>('system');
let _schemeId = $state<string>(SCHEMES[0].id);

/* ── Accessors ─────────────────────────────────── */
export function getTheme(): Theme { return _theme; }
export function getSchemeId(): string { return _schemeId; }

/* ── Internal apply helpers ─────────────────────── */

function isDark(): boolean {
  if (_theme === 'dark') return true;
  if (_theme === 'light') return false;
  // system
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme() {
  const root = document.documentElement;
  if (_theme === 'system') {
    root.removeAttribute('data-theme');
    localStorage.removeItem('gf-theme');
  } else {
    root.setAttribute('data-theme', _theme);
    localStorage.setItem('gf-theme', _theme);
  }
}

function applyScheme() {
  applyColorScheme(_schemeId, isDark());
}

/* ── Public API ────────────────────────────────── */

/** Call once in +layout.svelte onMount. */
export function initTheme() {
  const savedTheme = localStorage.getItem('gf-theme') as Theme | null;
  if (savedTheme === 'light' || savedTheme === 'dark') {
    _theme = savedTheme;
  } else {
    _theme = 'system';
  }

  const savedScheme = localStorage.getItem('gf-color');
  if (savedScheme && SCHEMES.some(s => s.id === savedScheme)) {
    _schemeId = savedScheme;
  } else {
    _schemeId = SCHEMES[0].id;
  }

  applyTheme();
  applyScheme();
}

/** Switch theme (light / dark / system). */
export function setTheme(t: Theme) {
  _theme = t;
  applyTheme();
  applyScheme(); // re-apply scheme tokens in case system→dark
}

/** Switch color scheme. */
export function setScheme(id: string) {
  _schemeId = id;
  applyScheme();
}

/** Call when system prefers-color-scheme changes (system mode only). */
export function handleSystemChange() {
  if (_theme !== 'system') return;
  applyScheme();
}