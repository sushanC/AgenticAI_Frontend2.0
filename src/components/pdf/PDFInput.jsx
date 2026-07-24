import React, { useRef, useEffect, useState } from 'react';

export default function PDFInput({ onSend, isAsking, placeholder }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleKeyDown = (e) => {
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
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask a question about this document..."}
          disabled={isAsking}
        />
        <button 
          className="pdf-send-btn" 
          onClick={handleSubmit} 
          disabled={!text.trim() || isAsking}
        >
          {isAsking ? (
            <span className="pdf-spinner"></span>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </div>
      <div className="pdf-input-footer">
        <span>Press Enter to send, Shift + Enter for new line</span>
      </div>
    </div>
  );
}
