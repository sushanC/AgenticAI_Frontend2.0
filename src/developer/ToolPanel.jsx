/**
 * ToolPanel.jsx
 *
 * Displays the tool execution trace for the selected request.
 * Shows each stage (planning, execution, confirmation, etc.)
 * with its duration, status, and tool name.
 */

const STAGE_ICONS = {
  planning:     '📋',
  planner:      '📋',
  execution:    '⚡',
  executor:     '⚡',
  confirmation: '✅',
  web_search:   '🌐',
  pdf_search:   '📄',
  memory_lookup:'🧠',
  task_manager: '✅',
  notes:        '📝',
  email_draft:  '📧',
  email_send:   '📤',
  research:     '🔍',
  agent:        '🤖',
  default:      '🔧',
};

function stageIcon(name) {
  const key = name?.toLowerCase().replace(/[^a-z_]/g, '_');
  return STAGE_ICONS[key] || STAGE_ICONS.default;
}

function formatDuration(ms) {
  if (!ms && ms !== 0) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {{ request: object }} props
 */
export default function ToolPanel({ request }) {
  if (!request) {
    return (
      <div className="dc-no-selection">
        <span className="dc-no-selection-icon">🔧</span>
        Select a request to inspect tool execution.
      </div>
    );
  }

  // Build the trace from toolTrace, executedSteps, or events
  let trace = [];

  if (request.toolTrace && request.toolTrace.length > 0) {
    trace = request.toolTrace;
  } else if (request.events) {
    trace = request.events
      .filter(e => e.type === 'ToolStarted' || e.type === 'ToolFinished')
      .map(e => ({ ...e.payload, eventType: e.type, timestamp: e.timestamp }));
  }

  const tool   = request.tool   || '—';
  const intent = request.intent || '—';

  return (
    <div className="dc-panel-content">
      {/* Summary */}
      <div className="dc-section">
        <div className="dc-section-label">Tool Routing</div>
        <div className="dc-prop-row">
          <span className="dc-prop-key">Intent</span>
          <span className="dc-prop-val dc-prop-val--accent">{intent}</span>
        </div>
        <div className="dc-prop-row">
          <span className="dc-prop-key">Routed Tool</span>
          <span className="dc-prop-val">{tool}</span>
        </div>
        <div className="dc-prop-row">
          <span className="dc-prop-key">Streaming</span>
          <span className="dc-prop-val">{request.streaming ? 'Yes' : 'No'}</span>
        </div>
      </div>

      {/* Trace */}
      {trace.length > 0 && (
        <div className="dc-section">
          <div className="dc-section-label">Execution Trace ({trace.length})</div>
          <div className="dc-tool-trace">
            {trace.map((step, i) => {
              const name     = step.tool || step.stage || step.name || 'Step';
              const dur      = step.durationMs ?? step.latencyMs;
              const isStart  = step.type === 'ToolStarted' || step.eventType === 'ToolStarted';
              const isFailed = step.status === 'failed' || step.success === false;

              return (
                <div key={i}>
                  <div className="dc-tool-stage">
                    <span className="dc-tool-stage-icon">{stageIcon(name)}</span>
                    <div className="dc-tool-stage-info">
                      <div className="dc-tool-stage-name">{name}</div>
                      <div className="dc-tool-stage-type">
                        {isStart ? 'start' : (step.eventType || step.type || step.status || 'completed')}
                        {isFailed && <span style={{ color: '#EF4444', marginLeft: 4 }}>✗ failed</span>}
                      </div>
                    </div>
                    {dur !== undefined && (
                      <span className="dc-tool-stage-duration">{formatDuration(dur)}</span>
                    )}
                    <span
                      className={`dc-status-dot dc-status-dot--${isFailed ? 'error' : isStart ? 'pending' : 'success'}`}
                      style={{ flexShrink: 0 }}
                    />
                  </div>
                  {i < trace.length - 1 && <div className="dc-tool-connector" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {trace.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '16px 0' }}>
          No tool execution trace captured.
        </div>
      )}
    </div>
  );
}
