import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDesktopBridge } from './useDesktopBridge';

/**
 * CommandPalette.jsx
 *
 * VS Code-style command palette overlay.
 *
 * Features:
 *   • Full-screen frosted-glass backdrop
 *   • Real-time fuzzy search across id, label, and description
 *   • Keyboard navigation (↑ ↓ Enter ESC)
 *   • Mouse hover selection
 *   • Smooth framer-motion animations
 *   • Commands fetched once via IPC, cached for session
 *   • Graceful degradation when not in Electron
 *
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export default function CommandPalette({ isOpen, onClose }) {
  const { desktopAPI } = useDesktopBridge();

  const [query,         setQuery]         = useState('');
  const [commands,      setCommands]      = useState([]);
  const [activeIndex,   setActiveIndex]   = useState(0);
  const [isExecuting,   setIsExecuting]   = useState(false);

  const inputRef    = useRef(null);
  const listRef     = useRef(null);
  const commandsRef = useRef([]);  // Cache — only fetched once

  // ── Load commands once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || commandsRef.current.length > 0) return;
    desktopAPI.getCommands().then(cmds => {
      commandsRef.current = cmds;
      setCommands(cmds);
    });
  }, [isOpen, desktopAPI]);

  // ── Filter on query change ────────────────────────────────────────────────
  const filtered = query.trim() === ''
    ? commandsRef.current
    : commandsRef.current.filter(cmd => {
        const q = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.id.toLowerCase().includes(q) ||
          (cmd.description && cmd.description.toLowerCase().includes(q))
        );
      });

  // ── Reset state when opening ──────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setIsExecuting(false);
      setCommands(commandsRef.current);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  // ── Keep active item in view ──────────────────────────────────────────────
  useEffect(() => {
    const item = listRef.current?.children[activeIndex];
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // ── Reset activeIndex when filter changes ─────────────────────────────────
  useEffect(() => setActiveIndex(0), [query]);

  // ── Execute ───────────────────────────────────────────────────────────────
  const execute = useCallback(async (id) => {
    if (!id || isExecuting) return;
    setIsExecuting(true);
    onClose();
    await desktopAPI.executeCommand(id);
  }, [isExecuting, onClose, desktopAPI]);

  // ── Keyboard handler ──────────────────────────────────────────────────────
  function handleKeyDown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[activeIndex]) execute(filtered[activeIndex].id);
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      default: break;
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cp-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onClick={onClose}
        >
          <motion.div
            className="cp-panel"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Search bar ───────────────────────────────────────────── */}
            <div className="cp-search-row">
              <span className="cp-search-icon">⌘</span>
              <input
                ref={inputRef}
                className="cp-search-input"
                placeholder="Type a command or search…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button className="cp-clear-btn" onClick={() => setQuery('')}>✕</button>
              )}
            </div>

            {/* ── Divider ─────────────────────────────────────────────── */}
            <div className="cp-divider" />

            {/* ── Command List ─────────────────────────────────────────── */}
            <div className="cp-list" ref={listRef}>
              {filtered.length === 0 ? (
                <div className="cp-empty">
                  <span className="cp-empty-icon">🔍</span>
                  No commands match &ldquo;{query}&rdquo;
                </div>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    className={`cp-item ${i === activeIndex ? 'cp-item--active' : ''}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => execute(cmd.id)}
                  >
                    <span className="cp-item-icon">{cmd.icon}</span>
                    <span className="cp-item-label">{cmd.label}</span>
                    {cmd.description && (
                      <span className="cp-item-desc">{cmd.description}</span>
                    )}
                    {i === activeIndex && (
                      <span className="cp-item-enter">↵</span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <div className="cp-footer">
              <span className="cp-hint"><kbd>↑↓</kbd> Navigate</span>
              <span className="cp-hint"><kbd>↵</kbd> Execute</span>
              <span className="cp-hint"><kbd>ESC</kbd> Close</span>
              <span className="cp-hint-spacer" />
              <span className="cp-count">{filtered.length} commands</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
