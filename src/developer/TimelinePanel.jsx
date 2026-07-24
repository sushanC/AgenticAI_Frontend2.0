/**
 * TimelinePanel.jsx
 *
 * Left panel: virtualized list of all recorded AI requests.
 * Each row shows time, intent, tool, provider, model, latency, status.
 * Clicking a row selects it and populates the center/right panels.
 */

import { useRef, useEffect } from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(isoString) {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatLatency(ms) {
  if (!ms && ms !== 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function intentIcon(intent) {
  const map = {
    chat: '💬', email: '📧', task: '✅', note: '📝',
    memory: '🧠', pdf: '📄', research: '🔍', agent: '🤖',
    web: '🌐', default: '⚡',
  };
  return map[intent?.toLowerCase()] || map.default;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * @param {{
 *   requests:      object[],
 *   selectedId:    string|null,
 *   onSelect:      (id: string) => void,
 *   liveEventCount: number,
 * }} props
 */
export default function TimelinePanel({ requests, selectedId, onSelect, liveEventCount }) {
  const listRef    = useRef(null);
  const prevLength = useRef(0);

  // Auto-scroll to top when new items arrive
  useEffect(() => {
    if (requests.length > prevLength.current && listRef.current) {
      listRef.current.scrollTop = 0;
    }
    prevLength.current = requests.length;
  }, [requests.length]);

  return (
    <div className="dc-panel-left">
      <div className="dc-panel-header">
        <span>Timeline</span>
        <span className="dc-panel-header-count">{requests.length}</span>
      </div>

      <div className="dc-timeline" ref={listRef}>
        {requests.length === 0 ? (
          <div className="dc-timeline-empty">
            <span className="dc-timeline-empty-icon">📭</span>
            <span>No requests yet.</span>
            <span>Send a chat message to see events here.</span>
          </div>
        ) : (
          requests.map((req) => {
            const isSelected = req.requestId === selectedId;
            const hasError   = req.success === false;

            return (
              <div
                key={req.requestId || req.id}
                className={[
                  'dc-timeline-item',
                  isSelected ? 'dc-timeline-item--selected' : '',
                  hasError   ? 'dc-timeline-item--error'    : '',
                ].filter(Boolean).join(' ')}
                onClick={() => onSelect(req.requestId || req.id)}
                title={req.userPrompt || ''}
              >
                <div className="dc-timeline-row">
                  <span className="dc-timeline-time">
                    {formatTime(req.finalizedAt || req.startedAt)}
                  </span>
                  <span style={{ fontSize: 12 }}>{intentIcon(req.intent)}</span>
                  <span className="dc-timeline-intent">
                    {req.userPrompt
                      ? req.userPrompt.slice(0, 48) + (req.userPrompt.length > 48 ? '…' : '')
                      : (req.intent || 'Unknown request')}
                  </span>
                  <span className={`dc-status-dot dc-status-dot--${hasError ? 'error' : 'success'}`} />
                </div>

                <div className="dc-timeline-meta">
                  {req.intent && (
                    <span className="dc-timeline-chip">{req.intent}</span>
                  )}
                  {req.tool && req.tool !== req.intent && (
                    <span className="dc-timeline-chip">{req.tool}</span>
                  )}
                  {req.provider && (
                    <span className="dc-timeline-chip">{req.provider}</span>
                  )}
                  {req.retryCount > 0 && (
                    <span className="dc-timeline-chip" style={{ color: '#F59E0B' }}>
                      ↺{req.retryCount}
                    </span>
                  )}
                  {req.fallbackOccurred && (
                    <span className="dc-timeline-chip" style={{ color: '#FB923C' }}>fallback</span>
                  )}
                  <span className="dc-timeline-latency">{formatLatency(req.latencyMs)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
