import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDesktopBridge } from "../desktop/useDesktopBridge";
import "./VoiceWidget.css";

const API = "http://localhost:3001";

export default function VoiceWidget() {
  const { isElectron, desktopAPI } = useDesktopBridge();
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("idle");
  const [settings, setSettings] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // ── Load Settings ────────────────────────────────────────────────────────
  const loadVoiceSettings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/settings`);
      setSettings(data);
    } catch (err) {
      console.error("[VoiceWidget] Failed to load settings:", err);
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
      setStatus("idle");
      desktopAPI.toggleVoice(); // Notifies backend
      toast.success("Voice Assistant deactivated");
    } else {

    setIsActive(true);

    desktopAPI.toggleVoice();

    setTimeout(() => {
        desktopAPI.startListening();
    }, 150);

    toast.success("Jarvis Voice Assistant active");
}
  }, [isElectron, isActive, desktopAPI]);

  // ── Save Setting Helper ──────────────────────────────────────────────────
  const updateSetting = async (key, value) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    try {
      await axios.post(`${API}/settings`, { [key]: value });
      desktopAPI.voiceSettingsChanged(); // Reloads settings on backend
      toast.success(`Voice setting updated`);
    } catch (err) {
      console.error("[VoiceWidget] Failed to update setting:", err);
      toast.error("Failed to update setting");
    }
  };

  // ── IPC Handlers ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isElectron) return;

    // Listen to state changes from Backend/Main
    const unsubState = desktopAPI.onVoiceStateChange(({ state }) => {
      setStatus(state);
      if (state === "speaking") {
        setIsPaused(false);
      }
    });

    // Listen to Command Palette triggers
    const unsubCommand = desktopAPI.onVoiceCommand(async ({ action }) => {
      console.log("[VoiceWidget] Received voice command:", action);
      if (action === "start-conversation") {
        if (!isActive) toggleVoiceMode();
        await updateSetting("conversationMode", true);
      } else if (action === "stop-conversation") {
        if (isActive) toggleVoiceMode();
      } else if (action === "push-to-talk") {
        if (!isActive) toggleVoiceMode();
        await updateSetting("pushToTalk", true);
      } else if (action === "mute") {
        desktopAPI.stopSpeaking();
      } else if (action === "unmute") {
        // Edge-TTS resumes
        desktopAPI.resumeSpeaking();
      }
    });

    return () => {
      unsubState();
      unsubCommand();
    };
}, [isElectron, desktopAPI]);

  if (!isElectron) return null;

  const handleMicClick = () => {
    if (!isActive) {
      toggleVoiceMode();
    } else {
      if (status === "idle") {
        desktopAPI.startListening();
      } else if (status === "listening") {
        desktopAPI.cancelListening();
      } else if (status === "speaking") {
        desktopAPI.stopSpeaking();
      }
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      desktopAPI.resumeSpeaking();
      setIsPaused(false);
    } else {
      desktopAPI.pauseSpeaking();
      setIsPaused(true);
    }
  };

  return (
    <div className="voice-widget-container">
      {isActive && (
        <div className="voice-hud">
          <div className="voice-hud-header">
            <span className="voice-hud-title">Jarvis UI</span>
            <button className="voice-hud-close" onClick={toggleVoiceMode} title="Deactivate">
              ✕
            </button>
          </div>

          <div className="voice-status-block">
            <span className="voice-status-text">
              {status === "idle" && "🤖 Jarvis Idle"}
              {status === "listening" && "🎤 Listening..."}
              {status === "processing" && "⚙️ Thinking..."}
              {status === "speaking" && "🔊 Speaking..."}
              {status === "error" && "⚠️ Voice Error"}
            </span>
            <span className="voice-substatus">
              {status === "idle" && "Click mic to speak"}
              {status === "listening" && "Speak your command..."}
              {status === "processing" && "Processing pipeline..."}
              {status === "speaking" && "Synthesizing output..."}
              {status === "error" && "Failed to start pipeline"}
            </span>
          </div>

          {status === "speaking" && (
            <div className="voice-waves-container">
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar" />
            </div>
          )}

          <div className="voice-controls-grid">
            {status === "speaking" && (
              <button className="voice-control-btn" onClick={handlePauseResume}>
                {isPaused ? "▶️ Resume" : "⏸️ Pause"}
              </button>
            )}

            {status === "listening" && (
              <button className="voice-control-btn danger" onClick={() => desktopAPI.cancelListening()}>
                ✕ Cancel
              </button>
            )}

            {status === "speaking" && (
              <button className="voice-control-btn danger" onClick={() => desktopAPI.stopSpeaking()}>
                ⏹️ Stop
              </button>
            )}

            {status === "idle" && settings && (
              <button
                className={`voice-control-btn ${settings.conversationMode ? "active" : ""}`}
                onClick={() => updateSetting("conversationMode", !settings.conversationMode)}
              >
                💬 Continuous
              </button>
            )}

            {status === "idle" && (
              <button className="voice-control-btn" onClick={() => desktopAPI.startListening()}>
                🔄 Retry
              </button>
            )}
          </div>
        </div>
      )}

      <button
        className={`voice-mic-button ${status === "listening" ? "listening" : ""} ${
          status === "processing" ? "processing" : ""
        }`}
        onClick={handleMicClick}
        title={isActive ? `Voice mode: ${status}` : "Activate Voice Assistant"}
      >
        {status === "listening" ? "🎙️" : "🎤"}
      </button>
    </div>
  );
}
