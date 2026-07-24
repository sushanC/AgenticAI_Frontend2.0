import React, { useEffect, useRef } from 'react';
import PDFMessageBubble from './PDFMessageBubble';
import PDFInput from './PDFInput';

export default function PDFChatArea({
  selectedPDF,
  pdfs,
  getDisplayName,
  pdfMeta,
  chatHistory,
  isAsking,
  onSelectPDF,
  onSendMessage,
  onRunAction,
  getQuestionCount,
  docChunksCount,
  onBack
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isAsking]);

  const meta = pdfMeta[selectedPDF] || {};
  const estimatedPages = docChunksCount ? Math.max(1, Math.round(docChunksCount * 0.5)) : 12;
  const questionCount = getQuestionCount(selectedPDF);

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="pdf-chat-area-container">
      {/* Top Header */}
      <div className="pdf-chat-header">
        <div className="header-left">
          <button className="pdf-back-btn" onClick={onBack} title="Back to main Chat">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Chat</span>
          </button>

          <div className="pdf-dropdown-wrapper">
            <select 
              value={selectedPDF || ''} 
              onChange={(e) => onSelectPDF(e.target.value)}
              className="pdf-select-dropdown"
            >
              {pdfs.map(p => (
                <option key={p} value={p}>
                  📄 {getDisplayName(p)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="pdf-header-meta">
            <span className="meta-pill">
              <strong>Pages:</strong> {estimatedPages}
            </span>
            <span className="meta-pill">
              <strong>Modified:</strong> {formatDate(meta.uploadedAt)}
            </span>
            <span className="meta-pill">
              <strong>Questions:</strong> {questionCount}
            </span>
            <span className="meta-pill ai-ready">
              <span className="ready-dot"></span>
              AI Ready
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="pdf-chat-messages-scroll" ref={scrollRef}>
        <div className="pdf-chat-messages-inner">
          {chatHistory.length === 0 ? (
            <div className="pdf-chat-welcome">
              <div className="welcome-avatar">✦</div>
              <h2>How can I help you study {getDisplayName(selectedPDF)}?</h2>
              <p>Ask questions, analyze concepts, or solve problems using the document as context.</p>
              
              <div className="pdf-welcome-actions">
                <button className="welcome-action-chip" onClick={() => onRunAction('summarize')}>
                  📝 Summarize Document
                </button>
                <button className="welcome-action-chip" onClick={() => onRunAction('notes')}>
                  📓 Generate Study Notes
                </button>
              </div>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <PDFMessageBubble
                key={msg.id || idx}
                message={msg}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="pdf-chat-bottom-area">
        <PDFInput 
          onSend={onSendMessage} 
          isAsking={isAsking} 
          placeholder={`Ask anything about ${getDisplayName(selectedPDF)}...`}
        />
      </div>
    </div>
  );
}
