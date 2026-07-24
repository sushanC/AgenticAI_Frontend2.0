/**
 * DeveloperConsole.jsx
 *
 * Root container for the samGPT Developer Console overlay.
 * Mounted inside Home.jsx as a full-screen overlay (portal-like).
 *
 * Features:
 *   - Full-screen overlay with dark backdrop
 *   - 3-column layout: Timeline | Request+Tabs | Details
 *   - Ctrl+Shift+D / Command+Shift+D to open/close
 *   - Escape key to close
 *   - Header with shortcut hint, clear, export, settings, close
 *   - Live event indicator dot
 *   - Auto-subscribes to desktop IPC 'open-developer-console' signal
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import './developerConsole.css';

import { useDeveloperEvents } from './useDeveloperEvents.js';
import TimelinePanel  from './TimelinePanel.jsx';
import RequestPanel   from './RequestPanel.jsx';
import SearchBar      from './SearchBar.jsx';
import ExportMenu     from './ExportMenu.jsx';
import SettingsPanel  from './SettingsPanel.jsx';

// ─── Right detail panel ───────────────────────────────────────────────────────

function DetailsPanel({ request }) {
  if (!request) {
    return (
      <div className="dc-panel-right">
        <div className="dc-panel-header"><span>Summary</span></div>
        <div className="dc-no-selection" style={{ height: 'auto', padding: '24px 12px' }}>
          <span style={{ fontSize: 24 }}>📊</span>
          <span style={{ fontSize: 12 }}>Select a request</span>
        </div>
      </div>
    );
  }

  const {
    latencyMs, retryCount, fallbackOccurred, fallbackChain,
    compressionApplied, contextQuality, outputTokens, estimatedTokens,
    success, errorDetails, provider, model, intent, tool, streaming, capability,
    modelSelectionReason,
  } = request;

  const rows = [
    ['Status',      success === false ? '❌ Failed' : '✅ Success'],
    ['Intent',      intent],
    ['Tool',        tool],
    ['Provider',    provider],
    ['Model',       model],
    ['Latency',     latencyMs ? `${(latencyMs / 1000).toFixed(2)}s` : null],
    ['Streaming',   streaming ? 'Yes' : 'No'],
    ['Retries',     retryCount || null],
    ['Fallback',    fallbackOccurred ? (fallbackChain || []).join(' → ') : null],
    ['Compression', compressionApplied ? 'Applied' : null],
    ['Context Qty', contextQuality !== undefined ? `${contextQuality}%` : null],
    ['Input Tokens',  estimatedTokens?.toLocaleString()],
    ['Output Tokens', outputTokens?.toLocaleString()],
    ['Capability',  capability],
    ['MSE Reason',  modelSelectionReason],
  ].filter(([, v]) => v !== null && v !== undefined);

  return (
    <div className="dc-panel-right">
      <div className="dc-panel-header"><span>Summary</span></div>
      <div className="dc-details-scroll">
        {rows.map(([label, value]) => (
          <div key={label} className="dc-stat-row">
            <span className="dc-stat-label">{label}</span>
            <span
              className="dc-stat-value"
              style={{
                color: label === 'Status' && success === false ? '#EF4444'
                      : label === 'Status' ? '#10A37F'
                      : 'var(--text-secondary)',
              }}
            >
              {value}
            </span>
          </div>
        ))}

        {errorDetails && (
          <div style={{ marginTop: 12 }}>
            <div className="dc-error-card">
              <div className="dc-error-title">Error</div>
              <div className="dc-error-message">
                {errorDetails.code} — {errorDetails.message}
              </div>
              {errorDetails.suggestion && (
                <div className="dc-suggestion">💡 {errorDetails.suggestion}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export default function DeveloperConsole({ isOpen, onClose }) {
  const [showSettings, setShowSettings] = useState(false);
  const [consoleSettings, setConsoleSettings] = useState({
    autoScroll:     true,
    showTimestamps: true,
    showPayloads:   true,
    showRight:      true,
  });

  const {
    requests,
    selectedId,
    selectedRequest,
    selectRequest,
    clearAll,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,
    filteredRequests,
    isLive,
  } = useDeveloperEvents();

  // ── Escape key to close ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleClearAll = useCallback(() => {
    if (window.confirm('Clear all developer console history?')) {
      clearAll();
    }
  }, [clearAll]);

  if (!isOpen) return null;

  return (
    <div className="dc-overlay" role="dialog" aria-label="Developer Console">
      <div className="dc-shell">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="dc-header">
          <div className="dc-header-logo">
            <div className="dc-header-icon">🛠️</div>
            <span className="dc-header-title">Developer Console</span>
            <span className="dc-header-badge">
              {isLive && <span className="dc-live-dot" style={{ marginRight: 4 }} />}
              samGPT
            </span>
          </div>

          <span className="dc-header-subtitle">
            {requests.length} requests captured
          </span>

          <div className="dc-header-spacer" />

          {/* Keyboard hint */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <kbd className="dc-kbd">Ctrl+Shift+D</kbd>
          </span>

          <div className="dc-header-actions">
            {/* Toggle settings */}
            <button
              id="dc-settings-btn"
              className={`dc-icon-btn ${showSettings ? 'dc-tab--active' : ''}`}
              onClick={() => setShowSettings(v => !v)}
              title="Console settings"
            >
              ⚙
            </button>

            {/* Export */}
            <ExportMenu requests={filteredRequests} />

            {/* Clear */}
            <button
              id="dc-clear-btn"
              className="dc-icon-btn dc-icon-btn--danger"
              onClick={handleClearAll}
              title="Clear all history"
            >
              🗑
            </button>

            {/* Close */}
            <button
              id="dc-close-btn"
              className="dc-close-btn"
              onClick={onClose}
              title="Close (Esc)"
              aria-label="Close Developer Console"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Settings overlay ────────────────────────────────────────── */}
        {showSettings && (
          <div style={{
            position: 'absolute', top: 48, right: 12, width: 260, zIndex: 10001,
            background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-lg)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}>
            <div className="dc-panel-header" style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
              <span>Console Settings</span>
              <button className="dc-icon-btn" onClick={() => setShowSettings(false)} style={{ fontSize: 14 }}>✕</button>
            </div>
            <SettingsPanel settings={consoleSettings} onUpdate={setConsoleSettings} />
          </div>
        )}

        {/* ── Search bar ──────────────────────────────────────────────── */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
          totalCount={requests.length}
          filteredCount={filteredRequests.length}
        />

        {/* ── Body: 3-column layout ───────────────────────────────────── */}
        <div className="dc-body">
          {/* Left: Timeline */}
          <TimelinePanel
            requests={filteredRequests}
            selectedId={selectedId}
            onSelect={selectRequest}
            liveEventCount={requests.length}
          />

          {/* Center: Request detail + tabs */}
          <RequestPanel
            request={selectedRequest}
            allRequests={requests}
          />

          {/* Right: Summary details */}
          {consoleSettings.showRight && (
            <DetailsPanel request={selectedRequest} />
          )}
        </div>
      </div>
    </div>
  );
}
