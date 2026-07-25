import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function PDFInput({ onSend, isAsking, placeholder }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (text.trim() && !isAsking) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className="pdf-input-container">
      <div className="pdf-input-box">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Ask anything about this document...'}
          disabled={isAsking}
        />
        <motion.button
          type="button"
          className="pdf-send-btn"
          onClick={handleSubmit}
          disabled={!text.trim() || isAsking}
          whileHover={text.trim() && !isAsking ? { scale: 1.05 } : {}}
          whileTap={text.trim() && !isAsking ? { scale: 0.95 } : {}}
        >
          {isAsking ? (
            <span className="pdf-spinner" />
          ) : (
            <ArrowUp size={18} />
          )}
        </motion.button>
      </div>
      <div className="pdf-input-footer">
        <span>Press Enter to send, Shift + Enter for new line</span>
      </div>
    </div>
  );
}
