import React from 'react';
import { motion } from 'framer-motion';

export default function PDFFollowUps({ questions, onSelectQuestion }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="pdf-followups-section">
      <div className="pdf-followups-title">Suggested follow-up questions:</div>
      <div className="pdf-followups-grid">
        {questions.map((q, idx) => (
          <motion.button
            key={idx}
            className="pdf-followup-chip"
            onClick={() => onSelectQuestion(q)}
            whileHover={{ scale: 1.01, backgroundColor: 'var(--pdf-hover)' }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <span>{q}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chip-arrow">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
