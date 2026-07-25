import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { useDesktopBridge } from '../desktop/useDesktopBridge';
import './VoiceWidget.css';

const API = 'http://localhost:3001';

export default function VoiceWidget() {
  const { isElectron, desktopAPI } = useDesktopBridge();
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('idle');
  const [settings, setSettings] = useState(null);

  // ── Load Settings ────────────────────────────────────────────────────────
  const loadVoiceSettings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/settings`);
      setSettings(data);
    } catch (err) {
      console.error('[VoiceWidget] Failed to load settings:', err);
    }
  }, []);

  useEffect(() => {
    loadVoiceSettings();
  }, [loadVoiceSettings]);

  // ── Toggle Voice Activation ──────────────────────────────────────────────
  const toggleVoiceMode = useCallback(() => {
    if (!isElectron) return;

    if (isActive) {
      desktopAPI.stopSpeaking();
      desktopAPI.cancelListening();
      setIsActive(false);
      setStatus('idle');
      desktopAPI.toggleVoice(); // Notifies backend
      toast.success('Voice Assistant deactivated');
    } else {
      setIsActive(true);
      desktopAPI.toggleVoice();
      setTimeout(() => {
        desktopAPI.startListening();
      }, 150);
      toast.success('samGPT Voice Assistant active');
    }
  }, [isElectron, isActive, desktopAPI]);

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
      console.error('[VoiceWidget] Failed to update setting:', err);
    }
  };

  // ── IPC Handlers ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isElectron) return;

    const unsubState = desktopAPI.onVoiceStateChange(({ state }) => {
      setStatus(state);
    });

    const unsubCommand = desktopAPI.onVoiceCommand(async ({ action }) => {
      if (action === 'start-conversation') {
        if (!isActive) toggleVoiceMode();
        await updateSetting('conversationMode', true);
      } else if (action === 'stop-conversation') {
        if (isActive) toggleVoiceMode();
      } else if (action === 'push-to-talk') {
        if (!isActive) toggleVoiceMode();
        await updateSetting('pushToTalk', true);
      } else if (action === 'mute') {
        desktopAPI.stopSpeaking();
      } else if (action === 'unmute') {
        desktopAPI.resumeSpeaking();
      }
    });

    return () => {
      unsubState();
      unsubCommand();
    };
  }, [isElectron, desktopAPI, isActive, toggleVoiceMode]);

  if (!isElectron) return null;

  const handleMicClick = () => {
    if (!isActive) {
      toggleVoiceMode();
    } else {
      if (status === 'idle') {
        desktopAPI.startListening();
      } else if (status === 'listening') {
        desktopAPI.cancelListening();
      } else if (status === 'speaking') {
        desktopAPI.stopSpeaking();
      }
    }
  };

  return (
    <div className="voice-widget-launcher-container">
      <motion.button
        type="button"
        className={`voice-launcher-btn ${isActive ? 'active' : ''} ${status}`}
        onClick={handleMicClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isActive ? `Voice mode: ${status}` : 'Activate Voice Assistant'}
      >
        <div className={`voice-launcher-ring ${status}`} />
        <div className="voice-launcher-icon-box">
          {status === 'listening' ? (
            <Mic size={18} className="mic-icon-pulse" />
          ) : (
            <Sparkles size={18} />
          )}
        </div>
        <span className="voice-launcher-label">
          {status === 'listening' ? 'Listening' : status === 'speaking' ? 'Speaking' : 'Voice'}
        </span>
      </motion.button>
    </div>
  );
}
