import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function PDFFollowUps({ questions, onSelectQuestion }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="pdf-followups-section">
      <div className="pdf-followups-title">
        <Sparkles size={14} className="pdf-followup-sparkle" />
        <span>Suggested follow-up questions:</span>
      </div>
      <div className="pdf-followups-grid">
        {questions.map((q, idx) => (
          <motion.button
            key={idx}
            type="button"
            className="pdf-followup-chip"
            onClick={() => onSelectQuestion(q)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.18 }}
          >
            <span>{q}</span>
            <ArrowRight size={13} className="chip-arrow" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
