import React from 'react';
import { Sparkles, X } from 'lucide-react';

export default function VoiceHeader({ onClose }) {
  return (
    <div className="voice-exp-header">
      <div className="voice-exp-logo-group">
        <div className="voice-header-logo-badge">
          <Sparkles size={16} className="voice-logo-icon" />
        </div>
        <div className="voice-header-title-group">
          <span className="voice-exp-title">samGPT Voice</span>
          <span className="voice-exp-subtitle">Desktop Assistant</span>
        </div>
      </div>

      <button
        type="button"
        className="voice-exp-close-btn"
        onClick={onClose}
        title="Close Voice Experience (Esc)"
      >
        <X size={16} />
      </button>
    </div>
  );
}
