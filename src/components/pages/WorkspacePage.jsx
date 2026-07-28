import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Mic,
  Command,
  Search,
  Monitor,
  Cpu,
  Terminal,
  Server,
  Play,
  Sliders,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useDesktopBridge } from '../../desktop/useDesktopBridge';
import { commandRegistry } from '../../registry/commandRegistry';

const API = 'http://localhost:3001';

export default function WorkspacePage({
  setPage,
  setVoiceOpen,
  setDevOpen,
}) {
  const { isElectron, desktopAPI } = useDesktopBridge();
  const [voiceStatus, setVoiceStatus] = useState('idle');
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [commandCount, setCommandCount] = useState(15);

  useEffect(() => {
    // Fetch Settings & Stats
    Promise.all([
      axios.get(`${API}/settings`).catch(() => ({ data: {} })),
      axios.get(`${API}/stats`).catch(() => ({ data: {} })),
    ]).then(([settingsRes, statsRes]) => {
      if (settingsRes.data) setSettings(settingsRes.data);
      if (statsRes.data) setStats(statsRes.data);
    });

    setCommandCount(commandRegistry.getAll().length);
  }, []);

  // Live Voice State subscription
  useEffect(() => {
    if (!isElectron) return;
    const unsubState = desktopAPI.onVoiceStateChange(({ state }) => {
      setVoiceStatus(state);
    });
    return () => unsubState();
  }, [isElectron, desktopAPI]);

  const handleLaunchVoice = () => {
    if (setVoiceOpen) setVoiceOpen(true);
    else if (desktopAPI.toggleVoice) desktopAPI.toggleVoice();
  };

  const handleLaunchCommandPalette = () => {
    if (desktopAPI.openCommandPalette) desktopAPI.openCommandPalette();
  };

  const handleLaunchQuickAsk = () => {
    if (desktopAPI.openQuickAsk) desktopAPI.openQuickAsk();
  };

  return (
    <div className="workspace-page-layout">
      <div className="workspace-page-header">
        <div className="workspace-header-title-group">
          <div className="workspace-badge">
            <Monitor size={14} />
            <span>AI Command Center & Desktop Engine</span>
          </div>
          <h1 className="workspace-title">Workspace</h1>
          <p className="workspace-subtitle">
            Manage your native desktop capabilities, system intelligence, voice assistant, and AI engine shortcuts.
          </p>
        </div>
      </div>

      <div className="workspace-cards-grid">
        {/* CARD 1: Voice Assistant */}
        <motion.div
          className="workspace-card"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.18 }}
        >
          <div className="workspace-card-header">
            <div className="workspace-card-icon-box voice">
              <Mic size={18} />
            </div>
            <div className="workspace-card-status-badge success">
              <span className={`status-dot ${voiceStatus}`} />
              <span className="status-label">
                {voiceStatus === 'idle' && 'Ready'}
                {voiceStatus === 'listening' && 'Listening'}
                {voiceStatus === 'processing' && 'Thinking'}
                {voiceStatus === 'speaking' && 'Speaking'}
                {voiceStatus === 'error' && 'Offline'}
              </span>
            </div>
          </div>

          <h3 className="workspace-card-title">Jarvis Voice Assistant</h3>
          <p className="workspace-card-desc">
            Hands-free conversational AI with real-time speech synthesis and VAD listening.
          </p>

          <div className="workspace-card-actions">
            <button
              type="button"
              className="workspace-btn primary"
              onClick={handleLaunchVoice}
            >
              <Play size={13} />
              <span>Launch Voice Assistant</span>
            </button>
            <button
              type="button"
              className="workspace-btn secondary"
              onClick={() => setPage && setPage('settings')}
            >
              <Sliders size={13} />
              <span>Voice Settings</span>
            </button>
          </div>
        </motion.div>

        {/* CARD 2: Quick Ask */}
        <motion.div
          className="workspace-card"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.18 }}
        >
          <div className="workspace-card-header">
            <div className="workspace-card-icon-box quickask">
              <Search size={18} />
            </div>
            <kbd className="workspace-shortcut-kbd">Ctrl + Shift + Space</kbd>
          </div>

          <h3 className="workspace-card-title">Quick Ask Overlay</h3>
          <p className="workspace-card-desc">
            Spotlight-style floating query bar for quick AI answers from any application window.
          </p>

          <div className="workspace-card-actions">
            <button
              type="button"
              className="workspace-btn primary"
              onClick={handleLaunchQuickAsk}
            >
              <Zap size={13} />
              <span>Launch Quick Ask</span>
            </button>
          </div>
        </motion.div>

        {/* CARD 3: Command Palette */}
        <motion.div
          className="workspace-card"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.18 }}
        >
          <div className="workspace-card-header">
            <div className="workspace-card-icon-box command">
              <Command size={18} />
            </div>
            <kbd className="workspace-shortcut-kbd">Ctrl + K</kbd>
          </div>

          <h3 className="workspace-card-title">Global Command Palette</h3>
          <p className="workspace-card-desc">
            Raycast-style unified action launcher. Access all app features and AI actions instantly.
          </p>

          <div className="workspace-card-meta-row">
            <span className="meta-pill">{commandCount} Registered Commands</span>
          </div>

          <div className="workspace-card-actions">
            <button
              type="button"
              className="workspace-btn primary"
              onClick={handleLaunchCommandPalette}
            >
              <Command size={13} />
              <span>Open Command Palette</span>
            </button>
          </div>
        </motion.div>

        {/* CARD 4: Desktop Integration Features */}
        <motion.div
          className="workspace-card"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.18 }}
        >
          <div className="workspace-card-header">
            <div className="workspace-card-icon-box desktop">
              <ShieldCheck size={18} />
            </div>
            <span className="workspace-badge-sm">Native Desktop API</span>
          </div>

          <h3 className="workspace-card-title">Desktop Features</h3>
          <p className="workspace-card-desc">
            Deep operating system integrations providing global hotkeys, notifications, and drag & drop.
          </p>

          <div className="workspace-feature-list">
            <div className="feature-item">
              <CheckCircle2 size={13} className="text-success" />
              <span>Global Shortcuts</span>
              <span className="feature-state active">Enabled</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={13} className="text-success" />
              <span>Tray Integration</span>
              <span className="feature-state active">Enabled</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={13} className="text-success" />
              <span>Native Notifications</span>
              <span className="feature-state active">Enabled</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={13} className="text-success" />
              <span>Drag & Drop PDF Dropzone</span>
              <span className="feature-state active">Enabled</span>
            </div>
            <div className="feature-item">
              <XCircle size={13} className="text-muted" />
              <span>Launch at Startup</span>
              <span className="feature-state disabled">Disabled</span>
            </div>
          </div>
        </motion.div>

        {/* CARD 5: AI Engine Summary */}
        <motion.div
          className="workspace-card"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.18 }}
        >
          <div className="workspace-card-header">
            <div className="workspace-card-icon-box engine">
              <Cpu size={18} />
            </div>
            <span className="workspace-badge-sm">Active Pipeline</span>
          </div>

          <h3 className="workspace-card-title">AI Engine Summary</h3>
          <p className="workspace-card-desc">
            Real-time pipeline metrics and model capability routing overview.
          </p>

          <div className="workspace-engine-stats">
            <div className="engine-stat-item">
              <span className="stat-label">Model:</span>
              <span className="stat-val">{settings?.model || 'Auto (Gemini 2.5)'}</span>
            </div>
            <div className="engine-stat-item">
              <span className="stat-label">Provider:</span>
              <span className="stat-val">Google DeepMind</span>
            </div>
            <div className="engine-stat-item">
              <span className="stat-label">Conversation Mode:</span>
              <span className="stat-val">
                {settings?.conversationMode ? 'Continuous' : 'Push-to-Talk'}
              </span>
            </div>
            <div className="engine-stat-item">
              <span className="stat-label">Memory Facts:</span>
              <span className="stat-val">{stats?.memory_updates || 0} facts saved</span>
            </div>
          </div>

          <div className="workspace-card-actions">
            <button
              type="button"
              className="workspace-btn secondary"
              onClick={() => setPage && setPage('settings')}
            >
              <span>Manage Models</span>
            </button>
          </div>
        </motion.div>

        {/* CARD 6: Developer Console */}
        <motion.div
          className="workspace-card"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.18 }}
        >
          <div className="workspace-card-header">
            <div className="workspace-card-icon-box dev">
              <Terminal size={18} />
            </div>
            <kbd className="workspace-shortcut-kbd">Ctrl + Shift + D</kbd>
          </div>

          <h3 className="workspace-card-title">Developer Console</h3>
          <p className="workspace-card-desc">
            IPC event stream, performance benchmarks, and real-time backend telemetry logs.
          </p>

          <div className="workspace-card-actions">
            <button
              type="button"
              className="workspace-btn secondary"
              onClick={() => setDevOpen && setDevOpen(true)}
            >
              <Terminal size={13} />
              <span>Open Developer Console</span>
            </button>
          </div>
        </motion.div>

        {/* CARD 7: System & Environment */}
        <motion.div
          className="workspace-card system-card"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.18 }}
        >
          <div className="workspace-card-header">
            <div className="workspace-card-icon-box system">
              <Server size={18} />
            </div>
            <span className="workspace-badge-sm">Environment</span>
          </div>

          <h3 className="workspace-card-title">System Information</h3>
          <p className="workspace-card-desc">
            Local runtime execution parameters and application environment.
          </p>

          <div className="workspace-system-grid">
            <div className="sys-item">
              <span className="sys-label">App Version</span>
              <span className="sys-val">v1.0.0</span>
            </div>
            <div className="sys-item">
              <span className="sys-label">Electron Engine</span>
              <span className="sys-val">v28.0.0</span>
            </div>
            <div className="sys-item">
              <span className="sys-label">Node.js Runtime</span>
              <span className="sys-val">v18.18.0</span>
            </div>
            <div className="sys-item">
              <span className="sys-label">Platform OS</span>
              <span className="sys-val">Linux x64</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
