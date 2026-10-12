
import { X } from 'lucide-react';

export default function VoiceHeader({ onClose }) {
  return (
    <div className="voice-exp-header">
      {/* Floating identity — minimal wordmark */}
      <div className="voice-header-identity">
        <span className="voice-header-wordmark">samGPT</span>
        <span className="voice-header-label">INTELLIGENCE CORE</span>
      </div>

      {/* Glass close capsule */}
      <button
        type="button"
        className="voice-exp-close-btn"
        onClick={onClose}
        title="Close (Esc)"
        aria-label="Close Voice Experience"
      >
        <X size={13} strokeWidth={1.8} />
      </button>
    </div>
  );
}
