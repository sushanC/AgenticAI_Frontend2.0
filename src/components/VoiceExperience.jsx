import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function VoiceExperience({ onClose }) {
  const { isElectron, desktopAPI } = useDesktopBridge();
  const [status, setStatus] = useState('idle');
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [settings, setSettings] = useState(null);
  const [devices, setDevices] = useState({ inputs: [], outputs: [] });
  const [transcript, setTranscript] = useState([]);
  const [modelName, setModelName] = useState('Auto');

  // ── Load Settings & Devices ──────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [settingsRes, devicesRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/audio/devices`),
      ]);
      setSettings(settingsRes.data);
      setDevices(devicesRes.data);
      if (settingsRes.data?.model) {
        setModelName(settingsRes.data.model);
      }
    } catch (err) {
      console.error('[VoiceExperience] Failed to load initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
  }, []);

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
      toast.success('Voice feedback unmuted');
    } else {
      desktopAPI.stopSpeaking();
      setIsMuted(true);
      toast.success('Voice feedback muted');
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

  // ── Mic Button Action based on State ─────────────────────────────────────
  const handleMicClick = () => {
    if (status === 'idle' || status === 'error') {
      desktopAPI.startListening();
    } else if (status === 'listening') {
      desktopAPI.cancelListening();
    } else if (status === 'speaking') {
      desktopAPI.stopSpeaking();
    }
  };

  // ── IPC Listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isElectron) return;

    const unsubState = desktopAPI.onVoiceStateChange(payload => {
      const { state, text, reply } = payload;
      setStatus(state);

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

    const unsubCommand = desktopAPI.onVoiceCommand(({ action }) => {
      if (action === 'mute') {
        setIsMuted(true);
      } else if (action === 'unmute') {
        setIsMuted(false);
      }
    });

    return () => {
      unsubState();
      unsubCommand();
    };
  }, [isElectron, desktopAPI]);

  // Clean exit: deactivates voice session on backend and calls parent onClose
  const handleClose = () => {
    desktopAPI.stopSpeaking();
    desktopAPI.cancelListening();
    onClose();
  };

  const activeMic =
    devices.inputs.find(d => d.id === settings?.microphoneSelection)?.name ||
    'Default Microphone';
  const activeSpeaker =
    devices.outputs.find(d => d.id === settings?.speakerSelection)?.name ||
    'Default Speaker';

  return (
    <div className="voice-experience-overlay">
      <div className="voice-exp-backdrop-blur" />

      <div className="voice-exp-window-container">
        {/* Top Header */}
        <VoiceHeader onClose={handleClose} />

        {/* Center Main Stage */}
        <div className="voice-exp-main-stage">
          {/* Animated Voice Orb */}
          <VoiceOrb status={status} onClick={handleMicClick} />

          {/* Status Display */}
          <VoiceStatus status={status} />

          {/* Fluid Waveform */}
          <VoiceWaveform status={status} />

          {/* Conversation Bubbles */}
          <VoiceConversation transcript={transcript} />

          {/* Contextual Controls */}
          <VoiceControls
            status={status}
            isPaused={isPaused}
            isMuted={isMuted}
            settings={settings}
            onMicClick={handleMicClick}
            onPauseResume={handlePauseResume}
            onToggleMute={toggleMute}
            onCancelListening={() => desktopAPI.cancelListening()}
            onStopSpeaking={() => desktopAPI.stopSpeaking()}
            onToggleContinuous={val => updateSetting('conversationMode', val)}
          />
        </div>

        {/* Footer Collapsible Session Info Drawer */}
        <VoiceSessionInfo
          modelName={modelName}
          settings={settings}
          activeMic={activeMic}
          activeSpeaker={activeSpeaker}
          status={status}
        />
      </div>
    </div>
  );
}
