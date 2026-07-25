import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Sliders, Mic, Volume2, Globe, Cpu, ShieldCheck } from 'lucide-react';

export default function VoiceSessionInfo({
  modelName,
  settings,
  activeMic,
  activeSpeaker,
  status,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="voice-session-inspector-container">
      <button
        type="button"
        className="voice-session-inspector-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="inspector-trigger-left">
          <Sliders size={13} />
          <span>Session Info & Device Status</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="voice-session-inspector-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inspector-info-grid">
              <div className="inspector-info-item">
                <span className="inspector-info-label">
                  <Cpu size={11} /> AI Model
                </span>
                <span className="inspector-info-val">{modelName}</span>
              </div>

              <div className="inspector-info-item">
                <span className="inspector-info-label">
                  <Volume2 size={11} /> Voice Profile
                </span>
                <span className="inspector-info-val">
                  {settings?.voiceSelection || 'Neerja (India)'}
                </span>
              </div>

              <div className="inspector-info-item">
                <span className="inspector-info-label">
                  <Globe size={11} /> Language
                </span>
                <span className="inspector-info-val">
                  {settings?.language || 'en'}
                </span>
              </div>

              <div className="inspector-info-item">
                <span className="inspector-info-label">
                  <Mic size={11} /> Microphone Input
                </span>
                <span className="inspector-info-val" title={activeMic}>
                  {activeMic}
                </span>
              </div>

              <div className="inspector-info-item">
                <span className="inspector-info-label">
                  <Volume2 size={11} /> Speaker Output
                </span>
                <span className="inspector-info-val" title={activeSpeaker}>
                  {activeSpeaker}
                </span>
              </div>

              <div className="inspector-info-item">
                <span className="inspector-info-label">
                  <ShieldCheck size={11} /> Connection State
                </span>
                <span className="inspector-info-val success">
                  {settings?.conversationMode ? 'Continuous Mode' : 'Push-to-Talk'} · Online
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
