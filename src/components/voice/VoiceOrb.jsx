import React from 'react';
import { motion } from 'framer-motion';

export default function VoiceOrb({ status, onClick }) {
  // Organic animation variants per voice state (200-300ms easing transitions)
  const orbVariants = {
    idle: {
      scale: [1, 1.05, 1],
      y: [0, -6, 0],
      rotate: [0, 3, -3, 0],
      transition: {
        duration: 4.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    listening: {
      scale: [1.04, 1.12, 1.04],
      transition: {
        duration: 1.4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    processing: {
      rotate: 360,
      scale: [1, 1.06, 1],
      transition: {
        rotate: { duration: 7, repeat: Infinity, ease: 'linear' },
        scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
      },
    },
    speaking: {
      scale: [1, 1.09, 0.97, 1.06, 1],
      transition: {
        duration: 1.25,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    error: {
      x: [0, -10, 10, -6, 6, 0],
      transition: { duration: 0.45 },
    },
  };

  return (
    <div className="voice-orb-wrapper">
      {/* Soft Ambient Backdrop Bloom */}
      <div className={`voice-orb-glow-backdrop ${status}`} />
      
      {/* Main Glassmorphic Orb (220px diameter) */}
      <motion.div
        className={`voice-orb-core ${status}`}
        variants={orbVariants}
        animate={status}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        title="Tap orb to speak or interact"
      >
        <div className="voice-orb-glass-specular" />
        <div className="voice-orb-inner-glow" />
        <div className="voice-orb-center-pulse" />
      </motion.div>
    </div>
  );
}
