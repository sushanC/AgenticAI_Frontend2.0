
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_MAP = {
  idle:       { primary: 'IDLE',       secondary: 'samGPT · VOICE CORE' },
  starting:   { primary: 'STARTING',   secondary: 'Preparing speech services' },
  greeting:   { primary: 'ONLINE',     secondary: 'Playing wake-up greeting' },
  listening:  { primary: 'LISTENING',  secondary: 'Receiving input' },
  transcribing:{ primary: 'TRANSCRIBING', secondary: 'Converting speech to text' },
  thinking:   { primary: 'THINKING',   secondary: 'Processing request' },
  processing: { primary: 'THINKING',   secondary: 'Processing request' },
  speaking:   { primary: 'SPEAKING',   secondary: 'Synthesizing response' },
  interrupted:{ primary: 'INTERRUPTED',secondary: 'Voice session stopped' },
  stopping:   { primary: 'STOPPING',   secondary: 'Releasing microphone and audio' },
  error:      { primary: 'ERROR',      secondary: 'State disrupted' },
};

export default function VoiceStatus({ status }) {
  const { primary, secondary } = STATUS_MAP[status] || STATUS_MAP.idle;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        className="voice-status-block"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="voice-status-telemetry-row">
          {/* Live state indicator dot */}
          <span
            className={`voice-status-dot ${status}`}
            aria-hidden="true"
          />
          {/* Primary state label */}
          <span className={`voice-status-primary ${status}`}>
            {primary}
          </span>
        </div>
        {/* Secondary identity */}
        <p className="voice-status-secondary">{secondary}</p>
      </motion.div>
    </AnimatePresence>
  );
}
