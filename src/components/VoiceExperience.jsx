import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useDesktopBridge } from "../desktop/useDesktopBridge";
import "./VoiceExperience.css";

const API = "http://localhost:3001";

export default function VoiceExperience({ onClose }) {
  const { isElectron, desktopAPI } = useDesktopBridge();
  const [status, setStatus] = useState("idle");
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [settings, setSettings] = useState(null);
  const [devices, setDevices] = useState({ inputs: [], outputs: [] });
  const [transcript, setTranscript] = useState([]);
  const [modelName, setModelName] = useState("Auto");
  
  const transcriptEndRef = useRef(null);

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
      console.error("[VoiceExperience] Failed to load initial data:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Auto-scroll Transcript ───────────────────────────────────────────────
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // ── Save Setting Helper ──────────────────────────────────────────────────
  const updateSetting = async (key, value) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    try {
      await axios.post(`${API}/settings`, { [key]: value });
      desktopAPI.voiceSettingsChanged(); // Notify backend to reload
    } catch (err) {
      console.error("[VoiceExperience] Failed to save setting:", err);
      toast.error("Failed to save preference");
    }
  };

  // ── Toggle Mute (Stops active playback) ──────────────────────────────────
  const toggleMute = () => {
    if (isMuted) {
      desktopAPI.resumeSpeaking();
      setIsMuted(false);
      toast.success("Voice feedback unmuted");
    } else {
      desktopAPI.stopSpeaking();
      setIsMuted(true);
      toast.success("Voice feedback muted");
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
    if (status === "idle" || status === "error") {
      desktopAPI.startListening();
    } else if (status === "listening") {
      desktopAPI.cancelListening();
    } else if (status === "speaking") {
      desktopAPI.stopSpeaking();
    }
  };

  // ── IPC Listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isElectron) return;

    const unsubState = desktopAPI.onVoiceStateChange((payload) => {
      const { state, text, reply } = payload;
      setStatus(state);

      if (state === "speaking") {
        setIsPaused(false);
      }

      // Append recognized user speech to transcript
      if (text) {
        setTranscript((prev) => [...prev, { role: "user", text }]);
      }
      
      // Append Jarvis response to transcript
      if (reply) {
        setTranscript((prev) => [...prev, { role: "jarvis", text: reply }]);
      }
    });

    const unsubCommand = desktopAPI.onVoiceCommand(({ action }) => {
      if (action === "mute") {
        setIsMuted(true);
      } else if (action === "unmute") {
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

  const activeMic = devices.inputs.find(d => d.id === settings?.microphoneSelection)?.name || "Default Microphone";
  const activeSpeaker = devices.outputs.find(d => d.id === settings?.speakerSelection)?.name || "Default Speaker";

  return (
    <div className="voice-experience-overlay">
      <div className="voice-exp-particles" />

      {/* Header */}
      <div className="voice-exp-header">
        <div className="voice-exp-logo-group">
          <span className="voice-exp-logo">✦</span>
          <span className="voice-exp-title">Jarvis Voice Experience</span>
        </div>
        <button className="voice-exp-close-btn" onClick={handleClose} title="Exit Voice Mode">
          ✕
        </button>
      </div>

      {/* Center Animated Orb Area */}
      <div className="voice-exp-main">
        <div className="voice-orb-container">
          <div className={`voice-orb-glow ${status}`} />
          <motion.div 
            className={`voice-orb ${status}`}
            onClick={handleMicClick}
            whileTap={{ scale: 0.95 }}
            title="Click to interact"
          />
        </div>

        {/* Status indicator */}
        <div className="voice-exp-status-block">
          <span className="voice-exp-status-title">
            {status === "idle" && "Jarvis Idle"}
            {status === "listening" && "Listening..."}
            {status === "processing" && "Thinking..."}
            {status === "speaking" && "Speaking..."}
            {status === "error" && "Subsystem Error"}
          </span>
          <span className="voice-exp-status-subtitle">
            {status === "idle" && "Tap the orb to start speaking"}
            {status === "listening" && "Jarvis is listening; speak now"}
            {status === "processing" && "Analyzing with Context Intelligence Engine..."}
            {status === "speaking" && "Synthesizing vocal response..."}
            {status === "error" && "Recovering voice modules automatically..."}
          </span>
        </div>

        {/* Waveform Visualization */}
        <div className="voice-exp-waveform">
          {Array.from({ length: 7 }).map((_, i) => (
            <div 
              key={i} 
              className={`voice-exp-wave-bar ${status === "speaking" ? "speaking" : ""}`} 
            />
          ))}
        </div>

        {/* Transcript Box */}
        <div className="voice-exp-transcript-container">
          {transcript.length === 0 ? (
            <div style={{ color: "#475569", textAlign: "center", fontStyle: "italic", marginTop: 32 }}>
              Conversation transcript will appear here...
            </div>
          ) : (
            transcript.map((msg, index) => (
              <div key={index} className="voice-transcript-row">
                <span className={`voice-transcript-speaker voice-transcript-${msg.role}`}>
                  {msg.role === "user" ? "You:" : "Jarvis:"}
                </span>
                <span className="voice-transcript-text">{msg.text}</span>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* Controls HUD */}
        <div className="voice-exp-controls">
          {status === "speaking" && (
            <button className="voice-exp-btn" onClick={handlePauseResume}>
              {isPaused ? "▶️ Resume" : "⏸️ Pause"}
            </button>
          )}

          <button 
            className={`voice-exp-btn ${isMuted ? "danger" : ""}`}
            onClick={toggleMute}
          >
            {isMuted ? "🔇 Unmute" : "🔊 Mute"}
          </button>

          {status === "speaking" && (
            <button className="voice-exp-btn danger" onClick={() => desktopAPI.stopSpeaking()}>
              ⏹️ Stop
            </button>
          )}

          {status === "listening" && (
            <button className="voice-exp-btn danger" onClick={() => desktopAPI.cancelListening()}>
              ✕ Cancel
            </button>
          )}

          {settings && (
            <button 
              className={`voice-exp-btn ${settings.conversationMode ? "active" : ""}`}
              onClick={() => updateSetting("conversationMode", !settings.conversationMode)}
            >
              💬 Continuous
            </button>
          )}

          {(status === "idle" || status === "error") && (
            <button className="voice-exp-btn" onClick={() => desktopAPI.startListening()}>
              🔄 Retry
            </button>
          )}
        </div>
      </div>

      {/* Footer Meta Dashboard */}
      <div className="voice-exp-footer">
        <div className="voice-exp-meta-group">
          <div className="voice-exp-meta-item">
            <span className="voice-exp-meta-label">Model:</span>
            <span className="voice-exp-meta-value">{modelName}</span>
          </div>
          <div className="voice-exp-meta-item">
            <span className="voice-exp-meta-label">Mic:</span>
            <span className="voice-exp-meta-value">{activeMic}</span>
          </div>
          <div className="voice-exp-meta-item">
            <span className="voice-exp-meta-label">Speaker:</span>
            <span className="voice-exp-meta-value">{activeSpeaker}</span>
          </div>
          <div className="voice-exp-meta-item">
            <span className="voice-exp-meta-label">Language:</span>
            <span className="voice-exp-meta-value">{settings?.language || "en"}</span>
          </div>
        </div>

        <div className="voice-exp-status-indicator">
          <div className={`voice-status-led ${status === "error" ? "offline" : ""}`} />
          <span>Jarvis Server Online</span>
        </div>
      </div>
    </div>
  );
}
