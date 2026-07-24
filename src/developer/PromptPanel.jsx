/**
 * PromptPanel.jsx
 *
 * Displays the full constructed prompt broken into labeled sections:
 * System Prompt, Memory Block, Summary Block, History Block, PDF Context, Final Prompt.
 * Each section is collapsible and has a copy button.
 */

import { useState, useCallback } from 'react';

// ─── Section config ───────────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'systemPrompt',  label: 'System Prompt',  icon: '⚙️',  colorClass: 'dc-prompt-body--system',  defaultOpen: false },
  { key: 'memoryBlock',   label: 'Memory Block',   icon: '🧠',  colorClass: 'dc-prompt-body--memory',  defaultOpen: true  },
  { key: 'summaryBlock',  label: 'Summary Block',  icon: '📋',  colorClass: 'dc-prompt-body--summary', defaultOpen: false },
  { key: 'historyBlock',  label: 'History Block',  icon: '💬',  colorClass: 'dc-prompt-body--history', defaultOpen: false },
  { key: 'pdfContext',    label: 'PDF Context',    icon: '📄',  colorClass: 'dc-prompt-body--pdf',     defaultOpen: false },
  { key: 'finalPrompt',   label: 'Final Prompt',   icon: '✉️',  colorClass: 'dc-prompt-body--user',    defaultOpen: true  },
];

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  }, [text]);

  return (
    <button className="dc-prompt-copy-btn" onClick={handleCopy} title="Copy to clipboard">
      {copied ? '✓ Copied' : '⎘ Copy'}
    </button>
  );
}

// ─── PromptSection ────────────────────────────────────────────────────────────

function PromptSection({ label, icon, colorClass, content, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!content) return null;

  const charCount = content.length.toLocaleString();
  const estTokens = Math.round(content.length / 4).toLocaleString();

  return (
    <div className="dc-prompt-section">
      <div className="dc-prompt-section-header" onClick={() => setOpen(v => !v)}>
        <div className="dc-prompt-section-title">
          <span>{icon}</span>
          {label}
          <span className="dc-prompt-section-badge">{charCount} chars · ~{estTokens} tokens</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CopyButton text={content} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', transition: 'transform 0.15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
        </div>
      </div>

      {open && (
        <div className={`dc-prompt-body ${colorClass}`}>
          {content}
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {{ request: object }} props
 */
export default function PromptPanel({ request }) {
  if (!request) {
    return (
      <div className="dc-no-selection">
        <span className="dc-no-selection-icon">📝</span>
        Select a request to inspect the prompt.
      </div>
    );
  }

  const pd = request.promptDetails || {};

  // Pull from both FullRequestSummary top-level and promptDetails sub-object
  const data = {
    systemPrompt: pd.systemPrompt || request.systemPrompt,
    memoryBlock:  pd.memoryBlock  || request.memoryBlock,
    summaryBlock: pd.summaryBlock || request.summaryBlock,
    historyBlock: pd.historyBlock || request.historyBlock,
    pdfContext:   pd.pdfContext   || request.pdfContext,
    finalPrompt:  pd.finalPrompt  || request.finalPrompt,
  };

  const hasAnyContent = Object.values(data).some(Boolean);

  if (!hasAnyContent) {
    return (
      <div className="dc-no-selection">
        <span className="dc-no-selection-icon">📝</span>
        <span>Prompt data not captured for this request.</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Only available for requests made after the Developer Console was initialized.</span>
      </div>
    );
  }

  return (
    <div className="dc-panel-content">
      {SECTIONS.map(({ key, label, icon, colorClass, defaultOpen }) => (
        <PromptSection
          key={key}
          label={label}
          icon={icon}
          colorClass={colorClass}
          content={data[key]}
          defaultOpen={defaultOpen}
        />
      ))}
    </div>
  );
}
