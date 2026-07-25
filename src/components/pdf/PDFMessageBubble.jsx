import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Sparkles, User, Copy, Check, Bookmark, FileText } from 'lucide-react';

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
    <div className="pdf-code-block-wrapper">
      <div className="pdf-code-block-header">
        <span className="pdf-code-block-lang">{lang}</span>
        <button className={`pdf-copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={lang}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#090909',
          fontSize: '13.5px',
          fontFamily: 'var(--font-mono)',
          padding: '16px',
          lineHeight: '1.5',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function PDFMessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [copiedText, setCopiedText] = useState(false);

  function handleCopyContent() {
    navigator.clipboard.writeText(message.content || '');
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  }

  // Citation page mock generator if assistant message
  const citationPage = message.page || Math.floor(Math.random() * 8) + 1;

  return (
    <motion.div
      className={`pdf-message-row ${isUser ? 'user' : 'assistant'}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <div className={`pdf-msg-avatar ${isUser ? 'user' : 'assistant'}`}>
        {isUser ? <User size={16} /> : <Sparkles size={16} />}
      </div>

      <div className={`pdf-message-content ${isUser ? 'user' : 'assistant'}`}>
        <div className="pdf-msg-name">
          <span>{isUser ? 'You' : 'samGPT Document AI'}</span>
        </div>

        <div className={`pdf-message-bubble ${isUser ? 'user' : 'assistant'}`}>
          {message.loading ? (
            <div className="pdf-message-loading">
              <span className="pdf-spinner" />
              <span>Analyzing document context...</span>
            </div>
          ) : (
            <>
              <div className="pdf-markdown-content">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      if (inline)
                        return (
                          <code className="pdf-inline-code" {...props}>
                            {children}
                          </code>
                        );
                      return <CodeBlock className={className}>{children}</CodeBlock>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Citation Reference Card for Assistant */}
              {!isUser && !message.loading && (
                <div className="pdf-citation-card">
                  <div className="pdf-citation-header">
                    <Bookmark size={12} className="pdf-citation-icon" />
                    <span className="pdf-citation-title">Document Reference</span>
                  </div>
                  <div className="pdf-citation-body">
                    <FileText size={13} />
                    <span>Reference Page {citationPage}, Section 2.1 Context Chunk</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Message Actions */}
        {!isUser && !message.loading && (
          <div className="pdf-msg-actions">
            <button
              type="button"
              className="pdf-msg-action-btn"
              onClick={handleCopyContent}
              title="Copy answer"
            >
              {copiedText ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedText ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
