
import { Play, Pause, Volume2, VolumeX, Square, X, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

// Glass capsule control button
function ControlCapsule({ icon, label, onClick, variant = 'default', isActive = false, ariaLabel }) {
  return (
    <motion.button
      type="button"
      className={`voice-capsule-btn ${variant} ${isActive ? 'active' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.95, y: 0 }}
      title={label}
      aria-label={ariaLabel || label}
    >
      {icon}
      <span className="voice-capsule-label">{label}</span>
    </motion.button>
  );
}

export default function VoiceControls({
  status,
  isPaused,
  isMuted,
  settings,
  onMicClick,
  onPauseResume,
  onToggleMute,
  onCancelListening,
  onStopSpeaking,
  onToggleContinuous,
}) {
  return (
    <div className="voice-controls-container">
      <div className="voice-controls-row">
        {/* Idle / Error — Start */}
        {(status === 'idle' || status === 'error') && (
          <ControlCapsule
            icon={<Play size={13} strokeWidth={2} />}
            label="Start"
            onClick={onMicClick}
            variant="primary"
            ariaLabel="Start voice conversation"
          />
        )}

        {/* Listening — Cancel */}
        {status === 'listening' && (
          <ControlCapsule
            icon={<X size={13} strokeWidth={2} />}
            label="Cancel"
            onClick={onCancelListening}
            variant="ghost"
            ariaLabel="Cancel listening"
          />
        )}

        {/* Speaking — Pause / Mute / Stop */}
        {status === 'speaking' && (
          <>
            <ControlCapsule
              icon={isPaused ? <Play size={13} strokeWidth={2} /> : <Pause size={13} strokeWidth={2} />}
              label={isPaused ? 'Resume' : 'Pause'}
              onClick={onPauseResume}
              variant="ghost"
              ariaLabel={isPaused ? 'Resume speaking' : 'Pause speaking'}
            />
            <ControlCapsule
              icon={isMuted ? <VolumeX size={13} strokeWidth={2} /> : <Volume2 size={13} strokeWidth={2} />}
              label={isMuted ? 'Unmute' : 'Mute'}
              onClick={onToggleMute}
              variant="ghost"
              isActive={isMuted}
              ariaLabel={isMuted ? 'Unmute voice' : 'Mute voice'}
            />
            <ControlCapsule
              icon={<Square size={13} strokeWidth={2} />}
              label="Stop"
              onClick={onStopSpeaking}
              variant="ghost"
              ariaLabel="Stop speaking"
            />
          </>
        )}

        {/* Continuous mode toggle — always visible when settings loaded */}
        {settings && (
          <ControlCapsule
            icon={<MessageSquare size={13} strokeWidth={1.8} />}
            label="Continuous"
            onClick={() => onToggleContinuous(!settings.conversationMode)}
            variant="toggle"
            isActive={!!settings.conversationMode}
            ariaLabel="Toggle continuous conversation mode"
          />
        )}
      </div>
    </div>
  );
}
