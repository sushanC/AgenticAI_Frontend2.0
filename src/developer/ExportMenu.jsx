/**
 * ExportMenu.jsx
 *
 * Dropdown menu to export the current session as JSON, Markdown, or TXT.
 * Triggered from the console header toolbar.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Formatters ───────────────────────────────────────────────────────────────

function toJSON(requests) {
  return JSON.stringify(requests, null, 2);
}

function toMarkdown(requests) {
  const lines = [
    '# samGPT Developer Console Export',
    `> Generated: ${new Date().toISOString()}`,
    `> Requests: ${requests.length}`,
    '',
  ];

  for (const req of requests) {
    lines.push(`## Request — ${req.finalizedAt || req.startedAt || ''}`);
    lines.push(`**Prompt:** ${req.userPrompt || '—'}`);
    lines.push(`**Intent:** ${req.intent || '—'} | **Tool:** ${req.tool || '—'}`);
    lines.push(`**Provider:** ${req.provider || '—'} | **Model:** ${req.model || '—'}`);
    lines.push(`**Latency:** ${req.latencyMs ? `${(req.latencyMs / 1000).toFixed(2)}s` : '—'}`);
    lines.push(`**Status:** ${req.success === false ? '❌ Failed' : '✅ Success'}`);

    if (req.retryCount > 0)     lines.push(`**Retries:** ${req.retryCount}`);
    if (req.fallbackOccurred)   lines.push(`**Fallback:** Yes (${(req.fallbackChain || []).join(' → ')})`);
    if (req.contextQuality)     lines.push(`**Context Quality:** ${req.contextQuality}%`);

    const tb = req.tokenBreakdown || {};
    if (Object.keys(tb).length > 0) {
      lines.push('');
      lines.push('**Tokens:**');
      for (const [k, v] of Object.entries(tb)) {
        if (v) lines.push(`- ${k}: ${v}`);
      }
    }

    if (req.errorDetails) {
      lines.push('');
      lines.push('**Error:**');
      lines.push(`- Code: ${req.errorDetails.code}`);
      lines.push(`- Message: ${req.errorDetails.message}`);
      if (req.errorDetails.suggestion) lines.push(`- Suggestion: ${req.errorDetails.suggestion}`);
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

function toTXT(requests) {
  const lines = [
    'samGPT Developer Console Export',
    `Generated: ${new Date().toISOString()}`,
    `Requests: ${requests.length}`,
    '═'.repeat(60),
    '',
  ];

  for (const req of requests) {
    lines.push(`Time     : ${req.finalizedAt || req.startedAt || '—'}`);
    lines.push(`Prompt   : ${req.userPrompt || '—'}`);
    lines.push(`Intent   : ${req.intent || '—'}`);
    lines.push(`Tool     : ${req.tool || '—'}`);
    lines.push(`Provider : ${req.provider || '—'}`);
    lines.push(`Model    : ${req.model || '—'}`);
    lines.push(`Latency  : ${req.latencyMs ? `${(req.latencyMs / 1000).toFixed(2)}s` : '—'}`);
    lines.push(`Status   : ${req.success === false ? 'FAILED' : 'SUCCESS'}`);
    if (req.retryCount > 0)   lines.push(`Retries  : ${req.retryCount}`);
    if (req.fallbackOccurred) lines.push(`Fallback : ${(req.fallbackChain || []).join(' → ')}`);
    lines.push('─'.repeat(60));
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Download helper ─────────────────────────────────────────────────────────

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {{ requests: object[] }} props
 */
export default function ExportMenu({ requests }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const ts = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const handleExport = useCallback((format) => {
    setOpen(false);
    if (requests.length === 0) return;

    switch (format) {
      case 'json':
        downloadFile(toJSON(requests), `samgpt-dev-${ts()}.json`, 'application/json');
        break;
      case 'md':
        downloadFile(toMarkdown(requests), `samgpt-dev-${ts()}.md`, 'text/markdown');
        break;
      case 'txt':
        downloadFile(toTXT(requests), `samgpt-dev-${ts()}.txt`, 'text/plain');
        break;
    }
  }, [requests]);

  return (
    <div className="dc-export-menu" ref={menuRef}>
      <button
        id="dc-export-btn"
        className="dc-icon-btn"
        onClick={() => setOpen(v => !v)}
        title="Export session"
      >
        ⬇
      </button>

      {open && (
        <div className="dc-export-dropdown">
          <button className="dc-export-item" onClick={() => handleExport('json')}>
            <span>{ }</span> Export as JSON
          </button>
          <button className="dc-export-item" onClick={() => handleExport('md')}>
            <span>#</span> Export as Markdown
          </button>
          <button className="dc-export-item" onClick={() => handleExport('txt')}>
            <span>≡</span> Export as TXT
          </button>
        </div>
      )}
    </div>
  );
}
