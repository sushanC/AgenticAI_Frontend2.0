/**
 * useDesktopBridge.js
 *
 * React hook that provides safe access to window.desktopAPI.
 *
 * When running inside Electron, desktopAPI is injected by preload.js.
 * When running in a browser (dev, storybook, testing), it falls back
 * to a no-op shim so components never crash with "desktopAPI is undefined".
 *
 * Usage:
 *   const { isElectron, desktopAPI } = useDesktopBridge();
 */

import { useMemo } from 'react';

// ─── Browser Shim ─────────────────────────────────────────────────────────────

const NOOP     = () => {};
const NOOP_SUB = () => NOOP;   // subscriptions return an unsubscribe fn

const BROWSER_SHIM = {
  isElectron:          false,
  getSettings:         () => Promise.resolve({}),
  saveSettings:        () => Promise.resolve({ ok: true }),
  getCommands:         () => Promise.resolve([]),
  executeCommand:      () => Promise.resolve({ ok: false }),
  notify:              NOOP,
  reportDroppedFiles:  NOOP,
  closeQuickAsk:       NOOP,
  resizeQuickAsk:      NOOP,
  minimizeToTray:      NOOP,
  onNewChat:           NOOP_SUB,
  onNavigate:          NOOP_SUB,
  onOpenCommandPalette: NOOP_SUB,
  onFocusChatInput:    NOOP_SUB,
  onFilesAccepted:     NOOP_SUB,
  onQuickAskFocus:     NOOP_SUB,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @returns {{ isElectron: boolean, desktopAPI: typeof BROWSER_SHIM }}
 */
export function useDesktopBridge() {
  return useMemo(() => {
    const api = typeof window !== 'undefined' && window.desktopAPI
      ? window.desktopAPI
      : BROWSER_SHIM;

    return {
      isElectron: api.isElectron === true,
      desktopAPI: api,
    };
  }, []);
}
