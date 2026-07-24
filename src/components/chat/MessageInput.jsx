import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Mic, ArrowUp, ChevronDown, Check } from 'lucide-react';

const MODELS = ['Auto', 'DeepSeek', 'Gemini', 'Groq', 'OpenRouter', 'Ollama'];

export default function MessageInput({ onSend, isStreaming, initialValue = '', onVoiceTrigger = () => {} }) {
  const [text, setText] = useState(initialValue);
  const [selectedModel, setSelectedModel] = useState('Auto');
  const [showModels, setShowModels] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, [text]);

  useEffect(() => {
    if (initialValue) {
      setText(initialValue);
      textareaRef.current?.focus();
    }
  }, [initialValue]);

  const handleSend = useCallback(() => {
    if (!text.trim() || isStreaming) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [text, isStreaming, onSend]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = text.trim().length > 0 && !isStreaming;

  return (
    <div className="input-area">
      <div className="input-container">
        <AnimatePresence>
          {showModels && (
            <motion.div
              className="model-dropdown"
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <div className="model-dropdown-header">AI Model</div>
              {MODELS.map(m => (
                <button
                  key={m}
                  type="button"
                  className={`model-option ${m === selectedModel ? 'selected' : ''}`}
                  onClick={() => { setSelectedModel(m); setShowModels(false); }}
                >
                  <span>{m}</span>
                  {m === selectedModel && <Check size={14} className="model-check-icon" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="input-box">
          <button
            type="button"
            className="input-left-btn"
            title="Attach file"
            disabled={isStreaming}
          >
            <Paperclip size={18} />
          </button>
          
          <button
            type="button"
            className="input-left-btn"
            title="Voice Assistant (Ctrl+Shift+V)"
            onClick={onVoiceTrigger}
            disabled={isStreaming}
          >
            <Mic size={18} />
          </button>

          <textarea
            ref={textareaRef}
            className="input-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'Generating response...' : 'Message samGPT...'}
            disabled={isStreaming}
            rows={1}
          />

          <motion.button
            type="button"
            className="send-btn"
            onClick={handleSend}
            disabled={!canSend}
            whileHover={canSend ? { y: -1 } : {}}
            whileTap={canSend ? { scale: 0.98 } : {}}
            title="Send message"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </motion.button>
        </div>

        <div className="input-footer">
          <span className="input-hint">Use <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for line break</span>
          <button
            type="button"
            className="input-model-pill"
            onClick={() => setShowModels(s => !s)}
          >
            <span>{selectedModel}</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

