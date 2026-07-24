/**
 * ModelPanel.jsx
 *
 * Displays the model selection decision for the selected request:
 * - All candidate models with scores
 * - Which was selected and why
 * - Health, latency estimate, cost tier, cooldown status
 */

export default function ModelPanel({ request }) {
  if (!request) {
    return (
      <div className="dc-no-selection">
        <span className="dc-no-selection-icon">🤖</span>
        Select a request to inspect model selection.
      </div>
    );
  }

  const candidates = request.modelCandidates || [];
  const selected   = request.selectedModel || {};
  const reason     = request.modelSelectionReason || '';

  if (candidates.length === 0 && !selected.name) {
    return (
      <div className="dc-panel-content">
        <div className="dc-section-label">Model Selection</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '16px 0' }}>
          Model selection data not available for this request.
        </div>

        {/* Show minimal info if we at least know what was used */}
        {(request.model || request.provider) && (
          <div className="dc-prop-row">
            <span className="dc-prop-key">Used</span>
            <span className="dc-prop-val dc-prop-val--accent">
              {request.provider} / {request.model}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dc-panel-content">
      {/* Selection reason */}
      {reason && (
        <div className="dc-section">
          <div className="dc-section-label">Selection Reason</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {reason}
          </div>
        </div>
      )}

      {/* Candidate table */}
      <div className="dc-section">
        <div className="dc-section-label">Candidates ({candidates.length || (selected.name ? 1 : 0)})</div>
        <table className="dc-model-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Score</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length > 0
              ? candidates.map((c, i) => {
                  const isWinner = c.selected || c.name === selected.name || i === 0;
                  return (
                    <ModelRow
                      key={c.name || i}
                      candidate={c}
                      isWinner={isWinner}
                    />
                  );
                })
              : selected.name
              ? <ModelRow candidate={selected} isWinner />
              : null
            }
          </tbody>
        </table>
      </div>

      {/* Selected model detail */}
      {selected.name && (
        <div className="dc-section">
          <div className="dc-section-label">Selected Model Details</div>
          {[
            ['Name',        selected.name || selected.displayName],
            ['Model ID',    selected.modelId],
            ['Provider',    selected.provider],
            ['Score',       selected.score !== undefined ? `${selected.score}/100` : null],
            ['Health',      selected.health !== undefined ? `${Math.round(selected.health * 100)}%` : null],
            ['Latency Est', selected.latency ? `${selected.latency}ms` : null],
            ['Cost Tier',   selected.costTier],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="dc-prop-row">
              <span className="dc-prop-key">{k}</span>
              <span className="dc-prop-val">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ModelRow({ candidate, isWinner }) {
  const score = candidate.score ?? candidate.capabilityScore;

  let statusLabel = 'Rejected';
  let statusClass = 'dc-badge--neutral';
  if (candidate.unavailable || candidate.cooldown) {
    statusLabel = candidate.cooldown ? `${candidate.cooldown} Cooldown` : 'Unavailable';
    statusClass = 'dc-badge--error';
  } else if (isWinner || candidate.selected) {
    statusLabel = '✓ Selected';
    statusClass = 'dc-badge--success';
  }

  return (
    <tr className={isWinner ? 'dc-model-row--selected' : ''}>
      <td>
        <span style={{ fontWeight: isWinner ? 600 : 400, color: isWinner ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {candidate.name || candidate.displayName || candidate.provider || '—'}
        </span>
        {candidate.provider && candidate.name && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{candidate.provider}</div>
        )}
      </td>
      <td>
        {score !== undefined ? (
          <div className="dc-model-score">
            <span className="dc-model-score-bar">
              <span className="dc-model-score-fill" style={{ width: `${score}%` }} />
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{score}</span>
          </div>
        ) : '—'}
      </td>
      <td>
        <span className={`dc-badge ${statusClass}`} style={{ fontSize: 9 }}>{statusLabel}</span>
      </td>
      <td>
        <span className="dc-model-reason">
          {candidate.rejectionReason || candidate.reason || ''}
        </span>
      </td>
    </tr>
  );
}
