/**
 * TokenPanel.jsx
 *
 * Displays the token breakdown for the selected request as a
 * stacked horizontal bar chart (pure CSS, no external library)
 * plus a legend with counts and percentages.
 * Also shows: total, output tokens, compression %, budget remaining.
 */

// ─── Token color palette ─────────────────────────────────────────────────────

const TOKEN_SEGMENTS = [
  { key: 'systemTokens',  label: 'System',  color: '#10A37F' },
  { key: 'memoryTokens',  label: 'Memory',  color: '#8B5CF6' },
  { key: 'historyTokens', label: 'History', color: '#3B82F6' },
  { key: 'summaryTokens', label: 'Summary', color: '#F59E0B' },
  { key: 'pdfTokens',     label: 'PDF',     color: '#EC4899' },
  { key: 'userTokens',    label: 'User',    color: '#34D399' },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {{ request: object }} props
 */
export default function TokenPanel({ request }) {
  if (!request) {
    return (
      <div className="dc-no-selection">
        <span className="dc-no-selection-icon">🔢</span>
        Select a request to inspect tokens.
      </div>
    );
  }

  const tb            = request.tokenBreakdown || {};
  const totalInput    = request.estimatedTokens || Object.values(tb).reduce((s, v) => s + (v || 0), 0) || 0;
  const outputTokens  = request.outputTokens   || 0;
  const budgetRemaining = request.budgetRemaining ?? null;
  const compressionPct  = request.compressionPct ?? (request.compressionApplied ? '?' : 0);

  const segments = TOKEN_SEGMENTS.map(s => ({
    ...s,
    count: tb[s.key] || 0,
    pct: totalInput > 0 ? Math.round(((tb[s.key] || 0) / totalInput) * 100) : 0,
  })).filter(s => s.count > 0);

  return (
    <div className="dc-panel-content">
      {/* Bar chart */}
      {segments.length > 0 && (
        <div className="dc-token-chart">
          <div className="dc-section-label">Token Breakdown</div>
          <div className="dc-token-bar-wrap">
            {segments.map(s => (
              <div
                key={s.key}
                className="dc-token-segment"
                style={{ width: `${s.pct}%`, background: s.color, minWidth: s.count > 0 ? 2 : 0 }}
                data-label={`${s.label}: ${s.count}`}
                title={`${s.label}: ${s.count} tokens (${s.pct}%)`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="dc-token-legend">
            {segments.map(s => (
              <div key={s.key} className="dc-token-legend-row">
                <div className="dc-token-color-dot" style={{ background: s.color }} />
                <span className="dc-token-label">{s.label}</span>
                <span className="dc-token-count">{s.count.toLocaleString()}</span>
                <span className="dc-token-pct">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {segments.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '8px 0 16px' }}>
          Detailed token breakdown not available for this request.
        </div>
      )}

      {/* Summary cards */}
      <div className="dc-section-label">Summary</div>
      <div className="dc-token-summary">
        <div className="dc-token-summary-card">
          <div className="dc-token-summary-label">Input Tokens</div>
          <div className="dc-token-summary-value">{totalInput.toLocaleString()}</div>
        </div>
        <div className="dc-token-summary-card">
          <div className="dc-token-summary-label">Output Tokens</div>
          <div className="dc-token-summary-value">{outputTokens.toLocaleString()}</div>
        </div>
        <div className="dc-token-summary-card">
          <div className="dc-token-summary-label">Total</div>
          <div className="dc-token-summary-value">
            {(totalInput + outputTokens).toLocaleString()}
          </div>
        </div>
        <div className="dc-token-summary-card">
          <div className="dc-token-summary-label">Compression</div>
          <div className="dc-token-summary-value">
            {request.compressionApplied
              ? <span style={{ color: '#F59E0B' }}>{compressionPct}%</span>
              : <span style={{ color: '#10A37F' }}>None</span>
            }
          </div>
        </div>
        {budgetRemaining !== null && (
          <div className="dc-token-summary-card">
            <div className="dc-token-summary-label">Budget Remaining</div>
            <div className="dc-token-summary-value">{budgetRemaining.toLocaleString()}</div>
          </div>
        )}
        {request.estimatedTokens && (
          <div className="dc-token-summary-card">
            <div className="dc-token-summary-label">Context Used</div>
            <div className="dc-token-summary-value">
              {request.contextPct || `${request.estimatedTokens.toLocaleString()} tk`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
