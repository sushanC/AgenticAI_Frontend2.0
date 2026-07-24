/**
 * ProviderPanel.jsx
 *
 * Realtime provider health grid.
 * Displays all known providers with their health, latency, request count,
 * quota, and cooldown status.
 *
 * Data is extracted from the selected request's providerHealth payload
 * OR from all recent events to build an aggregate view.
 */

import { useMemo } from 'react';

// ─── Known providers ─────────────────────────────────────────────────────────

const ALL_PROVIDERS = [
  { key: 'google',      label: 'Google Gemini',  icon: '🔵' },
  { key: 'groq',        label: 'Groq',            icon: '⚡' },
  { key: 'openrouter',  label: 'OpenRouter',      icon: '🛣️' },
  { key: 'deepseek',    label: 'DeepSeek',        icon: '🌊' },
  { key: 'glm',         label: 'Qwen / GLM',      icon: '🧩' },
  { key: 'ollama',      label: 'Ollama',          icon: '🦙' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatLatency(ms) {
  if (!ms && ms !== 0) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatHealth(score) {
  if (score === undefined || score === null) return null;
  const pct = Math.round(score * 100);
  return { pct, label: `${pct}%` };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {{ request: object, allRequests: object[] }} props
 */
export default function ProviderPanel({ request, allRequests }) {
  // Build a per-provider stats map from recent requests
  const providerStats = useMemo(() => {
    const stats = {};

    for (const req of (allRequests || [])) {
      const p = req.provider;
      if (!p) continue;

      if (!stats[p]) {
        stats[p] = { requests: 0, errors: 0, totalLatency: 0, lastLatency: null, lastHealth: null };
      }

      stats[p].requests++;
      if (req.success === false) stats[p].errors++;
      if (req.latencyMs) {
        stats[p].totalLatency += req.latencyMs;
        stats[p].lastLatency = req.latencyMs;
      }
    }

    // Compute averages
    for (const k of Object.keys(stats)) {
      const s = stats[k];
      s.avgLatency = s.requests > 0 ? Math.round(s.totalLatency / s.requests) : null;
      s.errorRate  = s.requests > 0 ? Math.round((s.errors / s.requests) * 100) : 0;
    }

    return stats;
  }, [allRequests]);

  // Per-provider health from the selected request (if available)
  const requestHealth = request?.providerHealth || {};
  const activeProvider = request?.provider;

  return (
    <div className="dc-panel-content">
      <div className="dc-section-label">Provider Health</div>
      <div className="dc-provider-grid">
        {ALL_PROVIDERS.map(({ key, label, icon }) => {
          const s      = providerStats[key] || {};
          const health = requestHealth[key];
          const h      = formatHealth(health);
          const isActive = key === activeProvider;
          const hasError = s.errorRate > 30;

          return (
            <div
              key={key}
              className={[
                'dc-provider-card',
                isActive  ? 'dc-provider-card--active' : '',
                hasError  ? 'dc-provider-card--error'  : '',
              ].filter(Boolean).join(' ')}
            >
              <div className="dc-provider-name">
                <span>{icon}</span>
                {label}
                {isActive && (
                  <span
                    className="dc-badge dc-badge--success"
                    style={{ fontSize: 9, padding: '1px 4px', marginLeft: 'auto' }}
                  >
                    active
                  </span>
                )}
              </div>

              <div className="dc-provider-stats">
                <div className="dc-provider-stat">
                  <span className="dc-provider-stat-label">Requests</span>
                  <span className="dc-provider-stat-value">{s.requests ?? 0}</span>
                </div>
                <div className="dc-provider-stat">
                  <span className="dc-provider-stat-label">Errors</span>
                  <span
                    className="dc-provider-stat-value"
                    style={{ color: s.errors > 0 ? '#EF4444' : 'var(--text-secondary)' }}
                  >
                    {s.errors ?? 0} {s.requests > 0 ? `(${s.errorRate}%)` : ''}
                  </span>
                </div>
                <div className="dc-provider-stat">
                  <span className="dc-provider-stat-label">Avg Latency</span>
                  <span className="dc-provider-stat-value">{formatLatency(s.avgLatency)}</span>
                </div>
                {h && (
                  <div className="dc-provider-stat">
                    <span className="dc-provider-stat-label">Health</span>
                    <span
                      className="dc-provider-stat-value"
                      style={{
                        color: h.pct >= 80 ? '#10A37F' : h.pct >= 50 ? '#F59E0B' : '#EF4444',
                      }}
                    >
                      {h.label}
                    </span>
                  </div>
                )}
              </div>

              {h && (
                <div className="dc-provider-health-bar">
                  <div
                    className="dc-provider-health-fill"
                    style={{
                      width: `${h.pct}%`,
                      background: h.pct >= 80 ? '#10A37F' : h.pct >= 50 ? '#F59E0B' : '#EF4444',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error detail for the selected request */}
      {request?.errorDetails && (
        <div style={{ marginTop: 16 }}>
          <div className="dc-section-label">Error Details</div>
          <div className="dc-error-card">
            <div className="dc-error-title">
              {request.provider} — {request.errorDetails.code || 'Error'}
            </div>
            <div className="dc-error-message">
              {request.errorDetails.message || 'Unknown error'}
            </div>
            {request.errorDetails.suggestion && (
              <div className="dc-suggestion">
                💡 {request.errorDetails.suggestion}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
