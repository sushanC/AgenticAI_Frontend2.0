import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';

export default function VoiceConversation({ transcript }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const isEmpty = transcript.length === 0;

  return (
    <motion.div
      className={`voice-conversation-container ${isEmpty ? 'empty' : 'has-messages'}`}
      layout
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="voice-conversation-scroll-inner" ref={scrollRef}>
        {isEmpty ? (
          <div className="voice-transcript-placeholder">
            <span>Conversation transcript will appear here...</span>
          </div>
        ) : (
          <div className="voice-transcript-list">
            <AnimatePresence initial={false}>
              {transcript.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={idx}
                    className={`voice-bubble-row ${isUser ? 'user' : 'assistant'}`}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={`voice-bubble-avatar ${isUser ? 'user' : 'assistant'}`}>
                      {isUser ? <User size={13} /> : <Sparkles size={13} />}
                    </div>

                    <div className={`voice-speech-bubble ${isUser ? 'user' : 'assistant'}`}>
                      <div className="bubble-speaker-label">
                        {isUser ? 'You' : 'samGPT'}
                      </div>
                      <div className="bubble-text-content">{msg.text}</div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
