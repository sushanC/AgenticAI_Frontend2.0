/**
 * SettingsPanel.jsx (Developer Console)
 *
 * Console preferences: max entries, auto-scroll, panel visibility.
 * These are session-only preferences stored in React state.
 */

export default function SettingsPanel({ settings, onUpdate }) {
  const s = settings || {};

  function toggle(key) {
    onUpdate({ ...s, [key]: !s[key] });
  }

  return (
    <div className="dc-panel-content">
      <div className="dc-settings-section">
        <div className="dc-settings-title">Display</div>

        {[
          { key: 'autoScroll',     label: 'Auto-scroll timeline' },
          { key: 'showTimestamps', label: 'Show full timestamps' },
          { key: 'showPayloads',   label: 'Show event payloads' },
        ].map(({ key, label }) => (
          <div key={key} className="dc-settings-row">
            <span className="dc-settings-label">{label}</span>
            <label className="dc-toggle">
              <input
                type="checkbox"
                checked={s[key] !== false}
                onChange={() => toggle(key)}
                id={`dc-toggle-${key}`}
              />
              <span className="dc-toggle-slider" />
            </label>
          </div>
        ))}
      </div>

      <div className="dc-settings-section">
        <div className="dc-settings-title">Panels</div>

        {[
          { key: 'showRight',  label: 'Show right summary panel' },
        ].map(({ key, label }) => (
          <div key={key} className="dc-settings-row">
            <span className="dc-settings-label">{label}</span>
            <label className="dc-toggle">
              <input
                type="checkbox"
                checked={s[key] !== false}
                onChange={() => toggle(key)}
                id={`dc-toggle-${key}`}
              />
              <span className="dc-toggle-slider" />
            </label>
          </div>
        ))}
      </div>

      <div className="dc-settings-section">
        <div className="dc-settings-title">About</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <div>samGPT Developer Console</div>
          <div>Developer-only observability dashboard.</div>
          <div>Events are never stored to disk.</div>
          <div>API keys are automatically redacted.</div>
        </div>
      </div>
    </div>
  );
}
