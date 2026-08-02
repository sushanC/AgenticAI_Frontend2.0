import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Mic, ArrowUp, ChevronDown, Check, X, FileText, Image as ImageIcon } from 'lucide-react';
import { normalizeAttachment } from '../../utils/attachmentNormalizer';

const MODELS = ['Auto', 'DeepSeek', 'Gemini', 'Groq', 'OpenRouter', 'Ollama'];

export default function MessageInput({
  onSend,
  isStreaming,
  initialValue = '',
  onVoiceTrigger = () => {},
  onFileUpload = null,
}) {
  const [text, setText] = useState(initialValue);
  const [selectedModel, setSelectedModel] = useState('Auto');
  const [showModels, setShowModels] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileChange = useCallback(
    e => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const normalizedList = files.map(normalizeAttachment).filter(Boolean);

      // Add to local state attachment chips
      setAttachments(prev => [...prev, ...normalizedList]);

      // Trigger unified file upload handler if passed
      if (typeof onFileUpload === 'function') {
        files.forEach(f => onFileUpload(f));
      }

      // Reset file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFileUpload]
  );

  const removeAttachment = useCallback(id => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  }, []);

  const handleSend = useCallback(() => {
    if ((!text.trim() && attachments.length === 0) || isStreaming) return;

    onSend({
      text: text.trim(),
      attachments,
      selectedModel,
    });

    setText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [text, attachments, selectedModel, isStreaming, onSend]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !isStreaming;

  return (
    <div className="input-area">
      {/* Hidden File Input for Paperclip Trigger */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,.pdf,.txt,.md,.json,.csv,.docx,.xlsx,.pptx,.zip"
        multiple
      />

      <div className="input-container">
        {/* Model Selector Dropdown */}
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
                  onClick={() => {
                    setSelectedModel(m);
                    setShowModels(false);
                  }}
                >
                  <span>{m}</span>
                  {m === selectedModel && <Check size={14} className="model-check-icon" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachment Chips Display */}
        {attachments.length > 0 && (
          <div className="attachment-chips-container">
            {attachments.map(att => (
              <div key={att.id} className="attachment-chip">
                {att.previewURL ? (
                  <img src={att.previewURL} alt={att.name} className="chip-preview-img" />
                ) : (
                  <FileText size={14} className="chip-file-icon" />
                )}
                <span className="chip-filename" title={att.name}>
                  {att.name}
                </span>
                <button
                  type="button"
                  className="chip-remove-btn"
                  onClick={() => removeAttachment(att.id)}
                  title="Remove attachment"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="input-box">
          <button
            type="button"
            className="input-left-btn"
            title="Attach file (Images, PDF, TXT, MD, CSV, JSON)"
            disabled={isStreaming}
            onClick={() => fileInputRef.current?.click()}
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
            placeholder={
              isStreaming
                ? 'Generating response...'
                : attachments.length > 0
                ? 'Add a message or press Enter to send attachment...'
                : 'Message samGPT...'
            }
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
          <span className="input-hint">
            Use <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for line break
          </span>
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
