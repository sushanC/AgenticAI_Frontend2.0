/**
 * RequestPanel.jsx
 *
 * Center panel: shows the selected request with a tab bar
 * for each inspector (Prompt, Memory, Model, Tool, Token, Provider, Events).
 * Also renders the request header (prompt, badges, metadata).
 */

import { useState } from 'react';
import PromptPanel   from './PromptPanel.jsx';
import MemoryPanel   from './MemoryPanel.jsx';
import ModelPanel    from './ModelPanel.jsx';
import ToolPanel     from './ToolPanel.jsx';
import TokenPanel    from './TokenPanel.jsx';
import ProviderPanel from './ProviderPanel.jsx';
import EventStream   from './EventStream.jsx';

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'prompt',   label: 'Prompt',   icon: '📝' },
  { id: 'memory',   label: 'Memory',   icon: '🧠' },
  { id: 'model',    label: 'Model',    icon: '🤖' },
  { id: 'tool',     label: 'Tool',     icon: '🔧' },
  { id: 'token',    label: 'Tokens',   icon: '🔢' },
  { id: 'provider', label: 'Provider', icon: '☁️' },
  { id: 'events',   label: 'Events',   icon: '📡' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatLatency(ms) {
  if (!ms && ms !== 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString('en-US', { hour12: false });
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   request:     object|null,
 *   allRequests: object[],
 * }} props
 */
export default function RequestPanel({ request, allRequests }) {
  const [activeTab, setActiveTab] = useState('prompt');

  if (!request) {
    return (
      <div className="dc-panel-center">
        <div className="dc-no-selection">
          <span className="dc-no-selection-icon">👆</span>
          <span>Select a request from the timeline</span>
          <span style={{ fontSize: 11 }}>to inspect prompt, memory, model, tokens, and events</span>
        </div>
      </div>
    );
  }

  const hasError   = request.success === false;
  const hasFallback = request.fallbackOccurred;
  const hasRetry   = request.retryCount > 0;
  const isStreamed  = request.streaming;

  return (
    <div className="dc-panel-center" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Request header */}
      <div className="dc-request-header">
        <div className="dc-request-header-top">
          <span className="dc-request-prompt" title={request.userPrompt}>
            {request.userPrompt
              ? request.userPrompt.slice(0, 120) + (request.userPrompt.length > 120 ? '…' : '')
              : '(no prompt captured)'}
          </span>
          <span
            className={`dc-badge ${hasError ? 'dc-badge--error' : 'dc-badge--success'}`}
          >
            {hasError ? '✗ Failed' : '✓ OK'}
          </span>
        </div>

        <div className="dc-request-badges">
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {formatTime(request.finalizedAt || request.startedAt)}
          </span>

          {request.intent && (
            <span className="dc-badge dc-badge--blue">🎯 {request.intent}</span>
          )}
          {request.tool && request.tool !== request.intent && (
            <span className="dc-badge dc-badge--neutral">🔧 {request.tool}</span>
          )}
          {request.provider && (
            <span className="dc-badge dc-badge--neutral">☁️ {request.provider}</span>
          )}
          {request.model && (
            <span className="dc-badge dc-badge--neutral">🤖 {request.model?.split('/').pop()}</span>
          )}
          {request.latencyMs && (
            <span className="dc-badge dc-badge--neutral">⏱ {formatLatency(request.latencyMs)}</span>
          )}
          {isStreamed && (
            <span className="dc-badge dc-badge--purple">~ streaming</span>
          )}
          {hasRetry && (
            <span className="dc-badge dc-badge--warning">↺ {request.retryCount} retry</span>
          )}
          {hasFallback && (
            <span className="dc-badge dc-badge--warning">⚡ fallback</span>
          )}
          {request.compressionApplied && (
            <span className="dc-badge dc-badge--warning">🗜 compressed</span>
          )}
          {request.contextQuality !== undefined && (
            <span className="dc-badge dc-badge--neutral">ctx {request.contextQuality}%</span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="dc-tabbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`dc-tab-${tab.id}`}
            className={`dc-tab ${activeTab === tab.id ? 'dc-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="dc-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab panel */}
      {activeTab === 'prompt'   && <PromptPanel   request={request} />}
      {activeTab === 'memory'   && <MemoryPanel   request={request} />}
      {activeTab === 'model'    && <ModelPanel    request={request} />}
      {activeTab === 'tool'     && <ToolPanel     request={request} />}
      {activeTab === 'token'    && <TokenPanel    request={request} />}
      {activeTab === 'provider' && <ProviderPanel request={request} allRequests={allRequests} />}
      {activeTab === 'events'   && <EventStream   request={request} />}
    </div>
  );
}
