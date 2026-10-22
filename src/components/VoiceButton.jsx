import { useEffect, useState } from 'react';
import { useDesktopBridge } from '../desktop/useDesktopBridge';

const ACTIVE_STATES = new Set(['starting', 'greeting', 'listening', 'transcribing', 'thinking', 'speaking']);

export default function VoiceButton() {
  const { isElectron, desktopAPI } = useDesktopBridge();
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!isElectron || !desktopAPI.onVoiceStateChange) return undefined;
    return desktopAPI.onVoiceStateChange(({ state }) => setStatus(state));
  }, [desktopAPI, isElectron]);

  function toggleVoice() {
    if (!isElectron) {
      setStatus('error');
      return;
    }
    if (ACTIVE_STATES.has(status)) {
      desktopAPI.cancelListening();
      desktopAPI.stopSpeaking();
    } else {
      setStatus('starting');
      desktopAPI.startListening();
    }
  }

  const labels = {
    idle: '🎤 Voice Assistant', starting: '⏳ Starting…', greeting: '🔊 SamGPT online',
    listening: '🎙 Listening…', transcribing: '⌛ Transcribing…', thinking: '✦ Thinking…',
    speaking: '🔊 Speaking…', interrupted: 'Voice stopped', error: isElectron ? 'Voice unavailable — retry' : 'Open in SamGPT desktop',
  };

  return (
    <button
      type="button"
      onClick={toggleVoice}
      aria-label={labels[status] || 'Voice assistant'}
      title={isElectron ? 'Start or stop the SamGPT voice session' : 'Voice capture requires the SamGPT desktop app'}
      style={{
        width: '100%', height: '56px', border: 'none', borderRadius: '18px',
        cursor: 'pointer', color: 'white', fontSize: 'var(--type-body)', fontWeight: '600',
        background: ACTIVE_STATES.has(status) ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
        transition: 'all .25s ease',
      }}
    >
      {labels[status] || '🎤 Voice Assistant'}
    </button>
  );
}
