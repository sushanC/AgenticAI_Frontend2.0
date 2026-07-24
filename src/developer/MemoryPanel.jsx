/**
 * MemoryPanel.jsx (Developer Console)
 *
 * Displays memory retrieved for the selected request:
 * - Key name
 * - Raw stored value
 * - Similarity score (with visual bar)
 * - Whether injected into the prompt
 * - Memory category
 *
 * NOTE: This is the developer console memory inspector.
 *       It is completely separate from components/MemoryPanel.jsx
 *       which is the user-facing memory browser.
 */

export default function MemoryPanel({ request }) {
  if (!request) {
    return (
      <div className="dc-no-selection">
        <span className="dc-no-selection-icon">🧠</span>
        Select a request to inspect memory.
      </div>
    );
  }

  const md = request.memoryDetails || {};
  const keys    = md.keys    || md.memoryKeys || [];
  const scores  = md.scores  || {};
  const injected = md.injected || md.keys || [];
  const raw     = md.rawMemory || {};

  if (keys.length === 0) {
    return (
      <div className="dc-panel-content">
        <div className="dc-section-label">Memory Retrieved</div>
        <div className="dc-no-selection" style={{ height: 'auto', padding: '24px 0' }}>
          <span style={{ fontSize: 24 }}>🧠</span>
          No memory was retrieved for this request.
        </div>
      </div>
    );
  }

  return (
    <div className="dc-panel-content">
      <div className="dc-section-label">Memory Retrieved ({keys.length})</div>

      {keys.map((key) => {
        const score     = scores[key] ?? null;
        const wasInjected = injected.includes(key);
        const rawValue  = typeof raw[key] !== 'undefined'
          ? (typeof raw[key] === 'object' ? JSON.stringify(raw[key]) : String(raw[key]))
          : '—';

        return (
          <div key={key} className="dc-memory-card">
            <div className="dc-memory-card-header">
              <span className="dc-memory-key">{key}</span>
              {score !== null && (
                <div className="dc-memory-score">
                  <span className="dc-memory-score-bar">
                    <span
                      className="dc-memory-score-fill"
                      style={{ width: `${Math.round(score * 100)}%` }}
                    />
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                    {score.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="dc-memory-value">{rawValue}</div>

            <div className="dc-memory-tags">
              <span
                className="dc-badge"
                style={
                  wasInjected
                    ? { background: 'rgba(16,163,127,0.12)', color: '#10A37F', border: '1px solid rgba(16,163,127,0.2)' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                {wasInjected ? '✓ Injected' : 'Not Injected'}
              </span>

              {score !== null && (
                <span
                  className="dc-badge"
                  style={
                    score >= 0.8
                      ? { background: 'rgba(16,163,127,0.12)', color: '#10A37F', border: '1px solid rgba(16,163,127,0.2)' }
                      : score >= 0.6
                      ? { background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }
                      : { background: 'rgba(239,68,68,0.12)',  color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)'  }
                  }
                >
                  {score >= 0.8 ? 'High relevance' : score >= 0.6 ? 'Medium relevance' : 'Low relevance'}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
