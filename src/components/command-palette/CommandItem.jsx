import React from 'react';
import { Pin, CornerDownLeft } from 'lucide-react';

export default function CommandItem({
  command,
  isActive,
  isPinned,
  onMouseEnter,
  onExecute,
  onTogglePin,
}) {
  const IconComponent = command.icon;

  return (
    <div
      className={`command-item-row ${isActive ? 'active' : ''} ${isPinned ? 'pinned' : ''}`}
      onMouseEnter={onMouseEnter}
      onClick={() => onExecute(command)}
    >
      <div className="command-item-left">
        <div className="command-item-icon-box">
          {typeof IconComponent === 'function' ? (
            <IconComponent size={16} />
          ) : typeof IconComponent === 'string' ? (
            <span className="command-item-emoji">{IconComponent}</span>
          ) : (
            <span>⚡</span>
          )}
        </div>
        <div className="command-item-text-group">
          <div className="command-item-label">{command.label}</div>
          {command.desc && (
            <div className="command-item-desc">{command.desc}</div>
          )}
        </div>
      </div>

      <div className="command-item-right">
        {/* Shortcut badge if present */}
        {command.shortcut && (
          <kbd className="command-item-shortcut">{command.shortcut}</kbd>
        )}

        {/* Pin Button */}
        <button
          type="button"
          className={`command-pin-btn ${isPinned ? 'pinned' : ''}`}
          onClick={e => {
            e.stopPropagation();
            onTogglePin(command.id);
          }}
          title={isPinned ? 'Unpin Command' : 'Pin Command'}
        >
          <Pin size={13} />
        </button>

        {/* Execute Arrow if active */}
        {isActive && (
          <span className="command-item-enter-hint">
            <CornerDownLeft size={13} />
          </span>
        )}
      </div>
    </div>
  );
}
