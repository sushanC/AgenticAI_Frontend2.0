import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDesktopBridge } from '../desktop/useDesktopBridge';

// Modular Voice Experience Subcomponents
import VoiceHeader from './voice/VoiceHeader';
import VoiceOrb from './voice/VoiceOrb';
import VoiceStatus from './voice/VoiceStatus';
import VoiceWaveform from './voice/VoiceWaveform';
import VoiceConversation from './voice/VoiceConversation';
import VoiceControls from './voice/VoiceControls';
import VoiceSessionInfo from './voice/VoiceSessionInfo';

import './VoiceExperience.css';

const API = 'http://localhost:3001';
const VOICE_ERRORS = {
  SETTINGS_LOAD_FAILED: 'Voice settings could not be loaded. Check the backend and try again.',
  GREETING_FAILED: 'The wake-up greeting could not be generated or played. Check Edge TTS and ffplay.',
  EDGE_TTS_HTTP_403: 'Edge TTS rejected the synthesis handshake. Confirm edge-tts 7.3.0 or newer is installed in the backend voice environment, then retry.',
  EDGE_TTS_GENERATION_FAILED: 'Edge TTS could not generate the audio. Check its service availability and voice settings, then retry.',
  EDGE_TTS_INVALID_INPUT: 'The configured speech request is invalid. Check the voice and synthesis settings, then retry.',
  EDGE_TTS_DEPENDENCY_MISSING: 'Edge TTS is missing from the backend voice environment. Install the voice requirements, then retry.',
  EDGE_TTS_NETWORK_FAILED: 'Edge TTS could not reach its service. Check the network connection, then retry.',
  PYTHON_EXECUTABLE_MISSING: 'The configured backend Python interpreter was not found. Check the voice environment path.',
  TTS_SCRIPT_MISSING: 'The backend TTS script was not found. Check the backend installation, then retry.',
  TTS_SPAWN_FAILED: 'The Python speech process could not start. Check the backend Python environment, then retry.',
  EDGE_TTS_TIMEOUT: 'Edge TTS took too long to respond. Check the network connection, then retry.',
  TTS_TIMEOUT: 'Speech synthesis timed out. Check the network connection, then retry.',
  TTS_CANCELLED: 'Speech synthesis was cancelled.',
  TTS_INVALID_AUDIO: 'Speech synthesis returned an invalid audio file. Retry, and check the local voice setup if it continues.',
  FFPLAY_NOT_FOUND: 'Audio playback is unavailable because ffplay was not found. Install FFmpeg, then retry.',
  FFPLAY_SPAWN_FAILED: 'The audio player could not start. Check the local FFmpeg installation, then retry.',
  FFPLAY_TIMEOUT: 'Audio playback did not finish before its timeout. Check the selected output device, then retry.',
  AUDIO_OUTPUT_UNAVAILABLE: 'The selected audio output device is unavailable. Choose an active speaker and retry.',
  AUDIO_PLAYBACK_FAILED: 'Audio playback failed. Check ffplay and the selected output device.',
  MICROPHONE_FAILED: 'Microphone capture failed. Check Linux microphone permissions, the selected ALSA input, and that arecord is installed.',
  TRANSCRIPTION_FAILED: 'Speech could not be transcribed. Check the Whisper model and Python environment.',
  REQUEST_FAILED: 'SamGPT could not complete the voice request. Try again or use text chat.',
  TTS_FAILED: 'The response could not be synthesized. Check Edge TTS and network access.',
};

export default function VoiceExperience({ onClose, autoStart = false, onAutoStart = () => {} }) {
  const { isElectron, desktopAPI } = useDesktopBridge();
  const [status, setStatus] = useState('idle');
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [settings, setSettings] = useState(null);
  const [devices, setDevices] = useState({ inputs: [], outputs: [] });
  const [transcript, setTranscript] = useState([]);
  const [showTranscript, setShowTranscript] = useState(true);
  const [modelName, setModelName] = useState('Auto');
  const [errorMessage, setErrorMessage] = useState('');
  const autoStartSent = useRef(false);
  const displayStatus = autoStart && status === 'idle'
    ? (isElectron ? 'starting' : 'error')
    : status;
  const displayErrorMessage = autoStart && !isElectron
    ? 'Voice capture is available in the SamGPT desktop app.'
    : errorMessage;

  // ── Load Settings & Devices ──────────────────────────────────────────────
  useEffect(() => {
    let isCurrent = true;

    Promise.all([
      axios.get(`${API}/settings`),
      axios.get(`${API}/audio/devices`),
    ])
      .then(([settingsRes, devicesRes]) => {
        if (!isCurrent) return;
        setSettings(settingsRes.data);
        setDevices(devicesRes.data);
        if (settingsRes.data?.model) setModelName(settingsRes.data.model);
      })
      .catch(err => console.error('[VoiceExperience] Failed to load initial data:', err));

    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    if (!autoStart) { autoStartSent.current = false; return; }
    if (autoStartSent.current) return;
    autoStartSent.current = true;
    if (isElectron) desktopAPI.startListening();
  }, [autoStart, desktopAPI, isElectron]);

  // Clean exit: deactivates the existing voice session before closing the overlay.
  // Keep this callback stable because it is also used by the keyboard listener.
  const handleClose = useCallback(() => {
    desktopAPI.cancelListening?.();
    desktopAPI.stopSpeaking?.();
    onClose();
  }, [desktopAPI, onClose]);

  // ── Keyboard Listener (Esc exit, Space bar start/stop) ───────────────────
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // ── Save Setting Helper ──────────────────────────────────────────────────
  const updateSetting = async (key, value) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    try {
      await axios.post(`${API}/settings`, { [key]: value });
      if (desktopAPI && desktopAPI.voiceSettingsChanged) {
        desktopAPI.voiceSettingsChanged();
      }
    } catch (err) {
      console.error('[VoiceExperience] Failed to save setting:', err);
      toast.error('Failed to save preference');
    }
  };

  // ── Toggle Mute ──────────────────────────────────────────────────────────
  const toggleMute = () => {
    if (isMuted) {
      desktopAPI.resumeSpeaking();
      setIsMuted(false);
      toast.success('Audio output resumed');
    } else {
      desktopAPI.pauseSpeaking();
      setIsMuted(true);
      toast.success('Audio output paused');
    }
  };

  // ── Pause / Resume Speaking ──────────────────────────────────────────────
  const handlePauseResume = () => {
    if (isPaused) {
      desktopAPI.resumeSpeaking();
      setIsPaused(false);
    } else {
      desktopAPI.pauseSpeaking();
      setIsPaused(true);
    }
  };

  const toggleMicrophoneMute = () => {
    const next = !isMicrophoneMuted;
    desktopAPI.setMicrophoneMuted?.(next);
    setIsMicrophoneMuted(next);
  };

  // ── Mic Button Action based on State ─────────────────────────────────────
  const handleMicClick = useCallback(() => {
    if (displayStatus === 'idle' || displayStatus === 'error') {
      if (!isElectron) {
        setErrorMessage('Voice capture is available in the SamGPT desktop app.');
        setStatus('error');
        return;
      }
      setErrorMessage('');
      setIsMicrophoneMuted(false);
      setStatus('starting');
      desktopAPI.startListening();
    } else if (['starting', 'greeting', 'listening', 'transcribing', 'thinking', 'speaking'].includes(displayStatus)) {
      desktopAPI.cancelListening?.();
      desktopAPI.stopSpeaking?.();
      setStatus('interrupted');
    }
  }, [desktopAPI, displayStatus, isElectron]);

  // ── IPC Listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isElectron) return;

    const unsubState = desktopAPI.onVoiceStateChange(payload => {
      const { state, text, reply } = payload;
      setStatus(state);
      if (state === 'starting') onAutoStart();
      if (state === 'idle' || state === 'starting') setIsMicrophoneMuted(false);
      if (state === 'error') setErrorMessage(VOICE_ERRORS[payload.error] || 'Voice session failed. Check microphone and speech service settings, then try again.');
      else if (state === 'starting') setErrorMessage('');

      if (state === 'speaking') {
        setIsPaused(false);
      }

      if (text) {
        setTranscript(prev => [...prev, { role: 'user', text }]);
      }

      if (reply) {
        setTranscript(prev => [...prev, { role: 'jarvis', text: reply }]);
      }
    });

    return () => {
      unsubState();
    };
  }, [isElectron, desktopAPI, onAutoStart]);

  useEffect(() => {
    if (displayStatus !== 'starting') return undefined;
    const timeout = window.setTimeout(() => {
      setErrorMessage('Voice setup is taking too long. Check the backend process, Python model startup, and Edge TTS connectivity.');
      desktopAPI.cancelListening?.();
      desktopAPI.stopSpeaking?.();
      setStatus('error');
    }, 135000);
    return () => window.clearTimeout(timeout);
  }, [desktopAPI, displayStatus]);

  const activeMic =
    devices.inputs.find(d => d.id === settings?.microphoneSelection)?.name ||
    'Default Microphone';
  const activeSpeaker =
    devices.outputs.find(d => d.id === settings?.speakerSelection)?.name ||
    'Default Speaker';

  return (
    <div className="voice-experience-overlay">
      <div className="voice-exp-backdrop-blur" />

      {/* Spatial ambient environment lights */}
      <div className="voice-env-ambient-left" aria-hidden="true" />
      <div className="voice-env-ambient-right" aria-hidden="true" />

      <div className="voice-exp-window-container">
        {/* Top Header */}
        <VoiceHeader onClose={handleClose} />

        {/* Center Main Stage */}
        <div className="voice-exp-main-stage">
          {/* Animated Voice Orb */}
          <VoiceOrb status={displayStatus} onClick={handleMicClick} />

          {/* Status Display */}
          <VoiceStatus status={displayStatus} />
          {displayStatus === 'error' && <p className="voice-error-message" role="alert">{displayErrorMessage}</p>}

          {/* Fluid Waveform */}
          <VoiceWaveform status={displayStatus} />

          {/* Conversation Bubbles */}
          {showTranscript && <VoiceConversation transcript={transcript} />}

          {/* Contextual Controls */}
          <VoiceControls
            status={displayStatus}
            isPaused={isPaused}
            isMuted={isMuted}
            settings={settings}
            onMicClick={handleMicClick}
            onPauseResume={handlePauseResume}
            onToggleMute={toggleMute}
            onCancelListening={() => { desktopAPI.cancelListening?.(); desktopAPI.stopSpeaking?.(); }}
            onStopSpeaking={() => desktopAPI.stopSpeaking()}
            onToggleContinuous={val => updateSetting('conversationMode', val)}
            onRepeat={() => desktopAPI.repeatLastResponse?.()}
            hasLastResponse={transcript.some(item => item.role === 'jarvis')}
            isMicrophoneMuted={isMicrophoneMuted}
            onToggleMicrophoneMute={toggleMicrophoneMute}
            showTranscript={showTranscript}
            onToggleTranscript={() => setShowTranscript(value => !value)}
          />
        </div>

        {/* Footer Collapsible Session Info Drawer */}
        <VoiceSessionInfo
          modelName={modelName}
          settings={settings}
          activeMic={activeMic}
          activeSpeaker={activeSpeaker}
          status={displayStatus}
        />
      </div>
    </div>
  );
}
