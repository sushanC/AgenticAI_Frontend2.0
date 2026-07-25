import React from 'react';
import { motion } from 'framer-motion';

export default function VoiceStatus({ status }) {
  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return {
          title: "I'm listening.",
          subtitle: 'Take your time.',
        };
      case 'processing':
        return {
          title: 'Thinking...',
          subtitle: 'Working on that...',
        };
      case 'speaking':
        return {
          title: "Here's what I found.",
          subtitle: 'Synthesizing response...',
        };
      case 'error':
        return {
          title: 'Something went wrong.',
          subtitle: "Let's try again.",
        };
      case 'idle':
      default:
        return {
          title: 'Ask me anything.',
          subtitle: 'Tap the orb or start speaking',
        };
    }
  };

  const { title, subtitle } = getStatusText();

  return (
    <motion.div
      key={status}
      className="voice-status-block"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <h2 className="voice-status-title">{title}</h2>
      <p className="voice-status-subtitle">{subtitle}</p>
    </motion.div>
  );
}
