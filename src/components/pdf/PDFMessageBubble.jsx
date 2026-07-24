import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={lang}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#0F0F0F',
          fontSize: '13.5px',
          fontFamily: 'var(--font-mono)',
          padding: '16px',
          lineHeight: '1.5'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function PDFMessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`pdf-message-row ${isUser ? 'user' : 'assistant'}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className={`pdf-message-bubble ${isUser ? 'user' : 'assistant'}`}>
        {message.loading ? (
          <div className="pdf-message-loading">
            <span className="pdf-spinner"></span>
            <span>Thinking...</span>
          </div>
        ) : (
          <div className="pdf-markdown-content">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  if (inline) return <code className="pdf-inline-code" {...props}>{children}</code>;
                  return <CodeBlock className={className}>{children}</CodeBlock>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
