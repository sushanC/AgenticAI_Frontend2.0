import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useDesktopBridge } from './useDesktopBridge';

/**
 * DesktopSettingsSection.jsx
 *
 * A settings section rendered inside the existing SettingsPage.jsx.
 * Only visible when running inside Electron.
 *
 * Provides controls for all 7 desktop settings:
 *   • minimizeToTray
 *   • enableNotifications
 *   • enableGlobalShortcut
 *   • enableDragDrop
 *   • launchAtLogin
 *   • shortcutQuickAsk
 *   • shortcutCommandPalette
 *
 * Reads/writes exclusively via desktopAPI IPC — no Electron APIs in JSX.
 */

// ─── Toggle Row ───────────────────────────────────────────────────────────────

function ToggleRow({ id, label, description, value, onChange }) {
  return (
    <div className="ds-toggle-row">
      <div className="ds-toggle-text">
        <div className="ds-toggle-label">{label}</div>
        {description && (
          <div className="ds-toggle-desc">{description}</div>
        )}
      </div>
      <button
        id={id}
        className={`ds-toggle ${value ? 'ds-toggle--on' : ''}`}
        onClick={() => onChange(!value)}
        aria-checked={value}
        role="switch"
      >
        <span className="ds-toggle-thumb" />
      </button>
    </div>
  );
}

// ─── Shortcut Row ─────────────────────────────────────────────────────────────

function ShortcutRow({ id, label, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);

  function handleBlur() {
    setEditing(false);
    if (draft.trim() && draft !== value) onChange(draft.trim());
    else setDraft(value);
  }

  return (
    <div className="ds-shortcut-row">
      <span className="ds-shortcut-label">{label}</span>
      <input
        id={id}
        className={`ds-shortcut-input ${editing ? 'ds-shortcut-input--focused' : ''}`}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onFocus={() => setEditing(true)}
        onBlur={handleBlur}
        spellCheck={false}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DesktopSettingsSection() {
  const { isElectron, desktopAPI } = useDesktopBridge();
  const [settings, setSettings] = useState(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (!isElectron) return;
    desktopAPI.getSettings().then(s => setSettings(s));
  }, [isElectron, desktopAPI]);

  const updateSetting = useCallback(async (key, value) => {
    if (!isElectron || saving) return;

    setSettings(prev => ({ ...prev, [key]: value }));
    setSaving(true);

    try {
      await desktopAPI.saveSettings({ [key]: value });
      toast.success(`Desktop setting saved`);
    } catch (err) {
      console.error('[Desktop] Failed to save setting:', err);
      toast.error('Failed to save desktop setting');
    } finally {
      setSaving(false);
    }
  }, [isElectron, desktopAPI, saving]);

  if (!isElectron || !settings) return null;

  return (
    <div className="settings-v2-section">
      <div className="settings-v2-section-title">Desktop</div>

      <div className="ds-section-card">
        <div className="ds-section-header">
          <div className="ds-section-icon">🖥️</div>
          <div>
            <div className="ds-section-title">Desktop Preferences</div>
            <div className="ds-section-subtitle">
              Configure system tray, shortcuts, notifications, and drag & drop behaviour
            </div>
          </div>
        </div>

        {/* ── Behaviour ─────────────────────────────────────────────── */}
        <div className="ds-group">
          <div className="ds-group-label">Window</div>
          <ToggleRow
            id="ds-minimize-to-tray"
            label="Minimize to Tray on Close"
            description="Keep samGPT running in the system tray when you close the window"
            value={settings.minimizeToTray}
            onChange={v => updateSetting('minimizeToTray', v)}
          />
          <ToggleRow
            id="ds-launch-at-login"
            label="Launch at Login"
            description="Start samGPT automatically when your system boots"
            value={settings.launchAtLogin}
            onChange={v => updateSetting('launchAtLogin', v)}
          />
        </div>

        {/* ── Features ─────────────────────────────────────────────── */}
        <div className="ds-group">
          <div className="ds-group-label">Features</div>
          <ToggleRow
            id="ds-enable-notifications"
            label="Native Notifications"
            description="Show OS-level notifications for tasks, emails, and memory events"
            value={settings.enableNotifications}
            onChange={v => updateSetting('enableNotifications', v)}
          />
          <ToggleRow
            id="ds-enable-shortcut"
            label="Global Keyboard Shortcuts"
            description="Register Ctrl+Space (Quick Ask) and Ctrl+K (Command Palette) system-wide"
            value={settings.enableGlobalShortcut}
            onChange={v => updateSetting('enableGlobalShortcut', v)}
          />
          <ToggleRow
            id="ds-enable-dragdrop"
            label="File Drag & Drop"
            description="Drop PDF, images, and documents directly onto the chat window"
            value={settings.enableDragDrop}
            onChange={v => updateSetting('enableDragDrop', v)}
          />
        </div>

        {/* ── Shortcuts ────────────────────────────────────────────── */}
        <div className="ds-group">
          <div className="ds-group-label">Keyboard Shortcuts</div>
          <div className="ds-shortcut-hint">
            Use Electron accelerator syntax, e.g. <code>CmdOrCtrl+Space</code>, <code>Ctrl+Shift+K</code>
          </div>
          <ShortcutRow
            id="ds-shortcut-quick-ask"
            label="Quick Ask"
            value={settings.shortcutQuickAsk}
            onChange={v => updateSetting('shortcutQuickAsk', v)}
          />
          <ShortcutRow
            id="ds-shortcut-palette"
            label="Command Palette"
            value={settings.shortcutCommandPalette}
            onChange={v => updateSetting('shortcutCommandPalette', v)}
          />
        </div>
      </div>
    </div>
  );
}
