import React from 'react';
import { motion } from 'framer-motion';

export default function VoiceWaveform({ status }) {
  const bars = 9;

  return (
    <div className={`voice-waveform-container ${status}`}>
      {Array.from({ length: bars }).map((_, i) => {
        const baseHeight = 8 + (i % 3) * 4;
        let animateTarget = [baseHeight, baseHeight, baseHeight];

        if (status === 'listening') {
          animateTarget = [baseHeight, 32 + (i % 4) * 8, baseHeight];
        } else if (status === 'speaking') {
          animateTarget = [baseHeight, 42 - (i % 3) * 10, baseHeight];
        } else if (status === 'processing') {
          animateTarget = [baseHeight, 18 + (i % 2) * 4, baseHeight];
        }

        return (
          <motion.div
            key={i}
            className={`voice-wave-bar bar-${i} ${status}`}
            animate={{
              height: animateTarget,
            }}
            transition={{
              duration: status === 'speaking' ? 0.55 + (i % 3) * 0.12 : 1.2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: i * 0.06,
            }}
          />
        );
      })}
    </div>
  );
}
