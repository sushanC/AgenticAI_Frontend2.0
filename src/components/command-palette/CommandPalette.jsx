import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CommandInput from './CommandInput';
import CommandGroup from './CommandGroup';
import CommandItem from './CommandItem';
import { commandRegistry } from '../../registry/commandRegistry';
import { Sparkles, Command, Search } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [registryVersion, setRegistryVersion] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Subscribe to registry updates
  useEffect(() => {
    const unsub = commandRegistry.subscribe(() => {
      setRegistryVersion(v => v + 1);
    });
    return unsub;
  }, []);

  // Focus input & reset query when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  const allCommands = commandRegistry.getAll();
  const recents = commandRegistry.getRecents();

  // Filter commands by query
  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  const filteredCommands = isSearching
    ? allCommands.filter(cmd => {
        const textMatch = cmd.label.toLowerCase().includes(q);
        const descMatch = cmd.desc && cmd.desc.toLowerCase().includes(q);
        const sectionMatch = cmd.section && cmd.section.toLowerCase().includes(q);
        const keywordMatch =
          cmd.keywords && cmd.keywords.some(k => k.toLowerCase().includes(q));
        return textMatch || descMatch || sectionMatch || keywordMatch;
      })
    : allCommands;

  // Flattened list for index navigation
  let flatResults = [];
  let groupedResults = {};

  if (isSearching) {
    // Group filtered items by section
    groupedResults = filteredCommands.reduce((acc, cmd) => {
      const sec = cmd.section || 'General';
      if (!acc[sec]) acc[sec] = [];
      acc[sec].push(cmd);
      return acc;
    }, {});
    flatResults = filteredCommands;
  } else {
    // Empty query mode: Show Pinned / Favorites -> Recents -> Sections
    const pinned = allCommands.filter(c => commandRegistry.isPinned(c.id));
    if (pinned.length > 0) {
      groupedResults['Favorites'] = pinned;
    }
    if (recents.length > 0) {
      groupedResults['Recent'] = recents;
    }

    // Group remaining items by section
    allCommands.forEach(cmd => {
      const sec = cmd.section || 'General';
      if (!groupedResults[sec]) groupedResults[sec] = [];
      // avoid duplicating if already in pinned/recent in empty state
      if (!groupedResults[sec].some(c => c.id === cmd.id)) {
        groupedResults[sec].push(cmd);
      }
    });

    // Build flat array for arrow key navigation
    flatResults = Object.values(groupedResults).flat();
  }

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keep active item scrolled into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('.command-item-row.active');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Execute selected command
  const handleExecute = useCallback(
    cmd => {
      if (!cmd) return;
      commandRegistry.recordExecution(cmd.id);
      onClose();
      if (typeof cmd.perform === 'function') {
        cmd.perform();
      }
    },
    [onClose]
  );

  const handleTogglePin = useCallback(id => {
    commandRegistry.togglePin(id);
    setRegistryVersion(v => v + 1);
  }, []);

  // Keyboard navigation listener
  const handleKeyDown = e => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, flatResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatResults[activeIndex]) {
          handleExecute(flatResults[activeIndex]);
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (flatResults[activeIndex]) {
          setQuery(flatResults[activeIndex].label);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="command-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="command-modal-panel"
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <CommandInput
              inputRef={inputRef}
              query={query}
              setQuery={setQuery}
              onKeyDown={handleKeyDown}
              placeholder="What would you like to do?"
            />

            <div className="command-modal-divider" />

            {/* Command Results Scroll List */}
            <div className="command-modal-scroll-area" ref={listRef}>
              {flatResults.length === 0 ? (
                <div className="command-empty-state">
                  <Search size={28} className="command-empty-icon" />
                  <div className="command-empty-title">No matching commands</div>
                  <div className="command-empty-desc">
                    No action or navigation found for &ldquo;{query}&rdquo;
                  </div>
                </div>
              ) : (
                Object.keys(groupedResults).map(sectionTitle => {
                  const sectionItems = groupedResults[sectionTitle];
                  if (!sectionItems || sectionItems.length === 0) return null;

                  return (
                    <CommandGroup
                      key={sectionTitle}
                      title={sectionTitle}
                      count={sectionItems.length}
                    >
                      {sectionItems.map(cmd => {
                        const globalIdx = flatResults.findIndex(c => c.id === cmd.id);
                        const isActive = globalIdx === activeIndex;
                        const isPinned = commandRegistry.isPinned(cmd.id);

                        return (
                          <CommandItem
                            key={cmd.id}
                            command={cmd}
                            isActive={isActive}
                            isPinned={isPinned}
                            onMouseEnter={() => setActiveIndex(globalIdx)}
                            onExecute={handleExecute}
                            onTogglePin={handleTogglePin}
                          />
                        );
                      })}
                    </CommandGroup>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="command-modal-footer">
              <div className="command-footer-hints">
                <span className="footer-hint">
                  <kbd>↑↓</kbd> Navigate
                </span>
                <span className="footer-hint">
                  <kbd>↵</kbd> Execute
                </span>
                <span className="footer-hint">
                  <kbd>Tab</kbd> Autocomplete
                </span>
                <span className="footer-hint">
                  <kbd>Esc</kbd> Close
                </span>
              </div>
              <div className="command-footer-meta">
                <Sparkles size={12} />
                <span>{flatResults.length} commands available</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
