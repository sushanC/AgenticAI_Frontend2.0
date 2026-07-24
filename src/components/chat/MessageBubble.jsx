import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Sparkles, Copy, Check, RotateCcw, Mail, HelpCircle } from 'lucide-react';
import ConfirmationCard from './ConfirmationCard';

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const lang = className ? className.replace('language-', '') : 'text';
  const code = String(children).replace(/\n$/, '');

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{lang}</span>
        <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
          {copied ? (
            <>
              <Check size={13} /> <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} /> <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={lang}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#0B0B0B',
          fontSize: '13px',
          fontFamily: 'JetBrains Mono, monospace',
          padding: '16px',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function formatTime(t) {
  if (!t) return '';
  return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isLast, onRegenerate, onConfirmed, onCancelled }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isStreaming = message.streaming;

  // ── Phase 5: Waiting Input Card ───────────────────────────────────────
  // Renders when the email tool is waiting for a missing email address.
  // The user's next typed message is routed to /email/provide-input by useChat.
  if (message.type === 'waiting_input' && message.waitingData) {
    const { question, draft } = message.waitingData;
    return (
      <motion.div
        className="message-row assistant"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        <div className="msg-avatar assistant">
          <Mail size={14} />
        </div>
        <div className="msg-content">
          <div className="msg-name">
            samGPT
            <span className="msg-time">{formatTime(message.timestamp)}</span>
          </div>
          <div className="waiting-input-card">
            <div className="waiting-input-header">
              <div className="waiting-input-icon-box">
                <Mail size={16} />
              </div>
              <span className="waiting-input-label">Email Draft — Action Required</span>
            </div>
            {draft?.subject && (
              <div className="waiting-input-draft-preview">
                <span className="waiting-field-label">Subject</span>
                <span className="waiting-field-value">{draft.subject}</span>
              </div>
            )}
            <p className="waiting-input-question">{question}</p>
            <div className="waiting-input-hint">
              <HelpCircle size={14} />
              <span>Type the required information below and press Enter to continue.</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  // ───────────────────────────────────────────────────────────────────────────

  // ── Phase 3: Confirmation Card ───────────────────────────────────────────
  // If this message carries a confirmation payload, render the ConfirmationCard
  // instead of the normal markdown bubble. All other message types are unchanged.
  if (message.type === 'confirmation' && message.confirmationData) {
    return (
      <motion.div
        className="message-row assistant"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        <div className="msg-avatar assistant">
          <Sparkles size={14} />
        </div>
        <div className="msg-content">
          <div className="msg-name">
            samGPT
            <span className="msg-time">{formatTime(message.timestamp)}</span>
          </div>
          <ConfirmationCard
            data={message.confirmationData}
            onConfirmed={(result) =>
              onConfirmed && onConfirmed(result, message.confirmationData.confirmationId)
            }
            onCancelled={() =>
              onCancelled && onCancelled(message.confirmationData.confirmationId)
            }
          />
        </div>
      </motion.div>
    );
  }
  // ────────────────────────────────────────────────────────────────────────────

  function handleCopy() {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      className={`message-row ${isUser ? 'user' : 'assistant'}`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      {!isUser && (
        <div className="msg-avatar assistant">
          <Sparkles size={14} />
        </div>
      )}

      <div className={`msg-content ${isUser ? 'user' : ''}`}>
        {!isUser && (
          <div className="msg-name">
            samGPT
            <span className="msg-time">{formatTime(message.timestamp)}</span>
          </div>
        )}

        <div className="msg-body">
          {isUser ? (
            <div className="user-bubble">
              {message.content}
            </div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    if (inline) return <code className={className} {...props}>{children}</code>;
                    return <CodeBlock className={className}>{children}</CodeBlock>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && <span className="streaming-cursor" />}
            </div>
          )}
        </div>

        {message.content && (
          <div className="msg-actions">
            <button className="msg-action-btn" onClick={handleCopy} title="Copy content">
              {copied ? (
                <>
                  <Check size={13} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>
            {!isUser && isLast && onRegenerate && (
              <button className="msg-action-btn" onClick={onRegenerate} title="Regenerate response">
                <RotateCcw size={13} />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

