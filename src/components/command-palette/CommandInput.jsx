import React from 'react';
import { Search, X } from 'lucide-react';

export default function CommandInput({
  inputRef,
  query,
  setQuery,
  onKeyDown,
  placeholder = 'What would you like to do?',
}) {
  return (
    <div className="command-input-row">
      <Search size={18} className="command-search-icon" />
      <input
        ref={inputRef}
        type="text"
        className="command-search-input"
        placeholder={placeholder}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        spellCheck={false}
      />
      {query && (
        <button
          type="button"
          className="command-clear-btn"
          onClick={() => setQuery('')}
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
      <div className="command-input-shortcut-hint">
        <kbd className="command-kbd">Esc</kbd> to close
      </div>
    </div>
  );
}
