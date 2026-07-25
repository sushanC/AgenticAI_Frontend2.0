import React from 'react';
import { Play, Pause, Volume2, VolumeX, Square, X, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

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
      {/* Idle / Error State Controls */}
      {(status === 'idle' || status === 'error') && (
        <motion.button
          type="button"
          className="voice-control-btn primary"
          onClick={onMicClick}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Play size={15} />
          <span>Start Conversation</span>
        </motion.button>
      )}

      {/* Listening State Controls */}
      {status === 'listening' && (
        <motion.button
          type="button"
          className="voice-control-btn danger"
          onClick={onCancelListening}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <X size={15} />
          <span>Cancel Listening</span>
        </motion.button>
      )}

      {/* Speaking State Controls */}
      {status === 'speaking' && (
        <>
          <motion.button
            type="button"
            className="voice-control-btn secondary"
            onClick={onPauseResume}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </motion.button>

          <motion.button
            type="button"
            className={`voice-control-btn secondary ${isMuted ? 'muted' : ''}`}
            onClick={onToggleMute}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </motion.button>

          <motion.button
            type="button"
            className="voice-control-btn danger"
            onClick={onStopSpeaking}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Square size={15} />
            <span>Stop</span>
          </motion.button>
        </>
      )}

      {/* Continuous Mode Toggle */}
      {settings && (
        <motion.button
          type="button"
          className={`voice-control-btn toggle-btn ${settings.conversationMode ? 'active' : ''}`}
          onClick={() => onToggleContinuous(!settings.conversationMode)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          title="Toggle Continuous Conversation Mode"
        >
          <MessageSquare size={14} />
          <span>Continuous Mode</span>
        </motion.button>
      )}
    </div>
  );
}
