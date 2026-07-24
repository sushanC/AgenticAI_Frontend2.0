/**
 * QuickAskApp.jsx — Quick Ask floating window
 *
 * Standalone React root — does NOT share state with the main app tree.
 *
 * UX (Raycast-style):
 *   • 600px wide floating window, dark themed, transparent background
 *   • samGPT logo + input + send button
 *   • ESC → hides window via IPC
 *   • Enter → submits (Shift+Enter = new line)
 *   • Response streams directly from the backend API
 *   • Window expands vertically as response grows (IPC resize)
 *   • Ctrl+A selects all in input
 *
 * Architecture:
 *   • Streams directly from http://localhost:3001/chat/stream — no IPC proxy
 *   • Window resize is done via desktopAPI.resizeQuickAsk() IPC
 *   • desktopAPI.closeQuickAsk() hides the window on ESC
 *
 * This file is the entry point — it imports its own CSS and mounts to
 * #quick-ask-root in quickask.html.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: 100%;
    height: 100%;
    background: transparent;
    overflow: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  #quick-ask-root {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .qa-shell {
    width: 100%;
    background: rgba(23, 23, 23, 0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.5),
      0 20px 60px rgba(0,0,0,0.7),
      0 4px 16px rgba(0,0,0,0.4);
    display: flex;
    flex-direction: column;
    -webkit-app-region: drag;
  }

  .qa-input-row {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    gap: 10px;
    -webkit-app-region: no-drag;
  }

  .qa-logo {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: #10A37F;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #fff;
    font-weight: 700;
    flex-shrink: 0;
    user-select: none;
  }

  .qa-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #ECECEC;
    font-family: inherit;
    font-size: 15px;
    line-height: 1.5;
    resize: none;
    overflow: hidden;
    caret-color: #10A37F;
    min-height: 22px;
    max-height: 88px;
    -webkit-app-region: no-drag;
  }

  .qa-input::placeholder { color: rgba(255,255,255,0.3); }

  .qa-send-btn {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: none;
    background: #10A37F;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 120ms ease;
    -webkit-app-region: no-drag;
  }
  .qa-send-btn:disabled { background: rgba(16,163,127,0.3); cursor: default; }
  .qa-send-btn:not(:disabled):hover { background: #0d8a6b; }

  .qa-divider {
    height: 1px;
    background: rgba(255,255,255,0.07);
    margin: 0 16px;
  }

  .qa-response-area {
    padding: 14px 16px 18px;
    -webkit-app-region: no-drag;
    overflow-y: auto;
    max-height: 380px;
    color: #ECECEC;
    font-size: 14px;
    line-height: 1.65;
  }

  .qa-response-area::-webkit-scrollbar { width: 4px; }
  .qa-response-area::-webkit-scrollbar-track { background: transparent; }
  .qa-response-area::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.12);
    border-radius: 4px;
  }

  .qa-thinking {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,0.5);
    font-size: 13px;
  }

  .qa-dots span {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #10A37F;
    margin: 0 1px;
    animation: qa-bounce 1.2s infinite;
  }
  .qa-dots span:nth-child(2) { animation-delay: 0.2s; }
  .qa-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes qa-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-4px); opacity: 1; }
  }

  .qa-footer {
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    -webkit-app-region: no-drag;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .qa-footer-hint {
    font-size: 11px;
    color: rgba(255,255,255,0.25);
    display: flex;
    gap: 12px;
  }

  .qa-footer-hint kbd {
    font-family: inherit;
    background: rgba(255,255,255,0.08);
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 10px;
  }

  .qa-clear-btn {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.25);
    font-size: 11px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    transition: color 100ms;
    -webkit-app-region: no-drag;
  }
  .qa-clear-btn:hover { color: rgba(255,255,255,0.6); }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
`;

// ─── Desktop API (safe) ───────────────────────────────────────────────────────

const desktopAPI = typeof window !== 'undefined' && window.desktopAPI
  ? window.desktopAPI
  : { closeQuickAsk: () => {}, resizeQuickAsk: () => {}, onQuickAskFocus: () => () => {} };

// ─── Main Component ───────────────────────────────────────────────────────────

function QuickAskApp() {
  const [text,      setText]      = useState('');
  const [response,  setResponse]  = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error,     setError]     = useState(null);

  const textareaRef   = useRef(null);
  const responseRef   = useRef(null);
  const shellRef      = useRef(null);
  const abortRef      = useRef(null);

  // ── Auto-resize textarea ─────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 88) + 'px';
  }, [text]);

  // ── Sync window height to content ────────────────────────────────────────
  useEffect(() => {
    if (!shellRef.current) return;
    const height = shellRef.current.scrollHeight + 2; // +2 for border
    desktopAPI.resizeQuickAsk(Math.min(Math.max(height, 60), 540));
  }, [text, response, streaming]);

  // ── Focus input when window appears ─────────────────────────────────────
  useEffect(() => {
    const unsub = desktopAPI.onQuickAskFocus(() => {
      setText('');
      setResponse('');
      setError(null);
      setStreaming(false);
      if (abortRef.current) abortRef.current.abort();
      setTimeout(() => textareaRef.current?.focus(), 30);
    });
    // Focus on mount
    setTimeout(() => textareaRef.current?.focus(), 60);
    return unsub;
  }, []);

  // ── ESC closes window ────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (streaming && abortRef.current) {
          abortRef.current.abort();
          setStreaming(false);
          return;
        }
        desktopAPI.closeQuickAsk();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [streaming]);

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const message = text.trim();
    if (!message || streaming) return;

    setResponse('');
    setError(null);
    setStreaming(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch('http://localhost:3001/chat/stream', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message }),
        signal:  abortRef.current.signal,
      });

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);

        // Strip timeline prefix if present
        let display = full;
        if (full.startsWith('__TIMELINE__:')) {
          const nl = full.indexOf('\n');
          if (nl !== -1) display = full.slice(nl + 1);
          else display = '';
        }

        // Strip special protocol prefixes
        if (!display.startsWith('__')) {
          setResponse(display);
          // Scroll to bottom of response area
          if (responseRef.current) {
            responseRef.current.scrollTop = responseRef.current.scrollHeight;
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Could not reach samGPT backend. Make sure it\'s running.');
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [text, streaming]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const hasResponse = response.length > 0 || streaming;

  return (
    <div className="qa-shell" ref={shellRef}>
      {/* ── Input Row ──────────────────────────────────────────────── */}
      <div className="qa-input-row">
        <div className="qa-logo">✦</div>
        <textarea
          ref={textareaRef}
          className="qa-input"
          placeholder={streaming ? 'Thinking…' : 'Ask samGPT anything…'}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={streaming}
          rows={1}
          autoFocus
        />
        <button
          className="qa-send-btn"
          onClick={handleSend}
          disabled={!text.trim() || streaming}
          title="Send (Enter)"
        >
          ↑
        </button>
      </div>

      {/* ── Response ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasResponse && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="qa-divider" />
            <div className="qa-response-area" ref={responseRef}>
              {streaming && !response && (
                <div className="qa-thinking">
                  <div className="qa-dots">
                    <span /><span /><span />
                  </div>
                  Thinking…
                </div>
              )}
              {response && (
                <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {response}
                </span>
              )}
              {error && (
                <span style={{ color: '#ef4444', fontSize: 13 }}>⚠️ {error}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div className="qa-footer">
        <div className="qa-footer-hint">
          <span><kbd>↵</kbd> Send</span>
          <span><kbd>ESC</kbd> {streaming ? 'Stop' : 'Close'}</span>
          <span><kbd>⇧↵</kbd> New line</span>
        </div>
        {hasResponse && !streaming && (
          <button
            className="qa-clear-btn"
            onClick={() => { setResponse(''); setError(null); setText(''); }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Mount ────────────────────────────────────────────────────────────────────

// Inject styles
const style = document.createElement('style');
style.textContent = STYLE;
document.head.appendChild(style);

createRoot(document.getElementById('quick-ask-root')).render(<QuickAskApp />);
