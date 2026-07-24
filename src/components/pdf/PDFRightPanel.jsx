import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function PDFRightPanel({ 
  pdf, 
  getDisplayName, 
  pdfMeta, 
  questionCount, 
  summary, 
  isOpen, 
  onClose,
  docChunksCount
}) {
  if (!isOpen) return null;

  const meta = pdfMeta[pdf] || {};
  
  // Estimate pages and size
  const estimatedPages = docChunksCount ? Math.max(1, Math.round(docChunksCount * 0.5)) : 12;
  const estimatedSize = docChunksCount ? `${(docChunksCount * 0.9).toFixed(1)} KB` : '124 KB';

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    return new Date(isoString).toLocaleDateString(undefined, { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Extract keywords from summary or use default academic topics
  const getKeywords = () => {
    if (!summary) return ['Study Guide', 'Reference', 'Notes'];
    
    // Simple heuristic to extract words that are capitalized or in lists
    const matches = summary.match(/\*\*(.*?)\*\*/g);
    if (matches && matches.length > 0) {
      return matches
        .map(m => m.replace(/\*\*/g, '').trim())
        .filter(w => w.length > 2 && w.length < 25 && !w.includes(':'))
        .slice(0, 6);
    }
    return ['Key Concepts', 'Core Ideas', 'Analysis', 'Overview'];
  };

  return (
    <motion.div 
      className="pdf-right-panel"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="pdf-panel-header">
        <h3>Document Details</h3>
        <button className="close-panel-btn" onClick={onClose} title="Close Panel">
          ✕
        </button>
      </div>

      <div className="pdf-panel-content">
        {/* File Metadata */}
        <div className="pdf-info-section">
          <div className="info-row">
            <span className="info-label">File Name</span>
            <span className="info-val truncate" title={pdf}>{pdf}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Display Name</span>
            <span className="info-val">{getDisplayName(pdf)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Approx. Pages</span>
            <span className="info-val">{estimatedPages}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Upload Date</span>
            <span className="info-val">{formatDate(meta.uploadedAt)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">File Size</span>
            <span className="info-val">{estimatedSize}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Questions Asked</span>
            <span className="info-val">{questionCount}</span>
          </div>
        </div>

        {/* Keywords */}
        <div className="pdf-keywords-section">
          <h4>Keywords & Topics</h4>
          <div className="keywords-grid">
            {getKeywords().map((kw, i) => (
              <span key={i} className="keyword-tag">{kw}</span>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="pdf-summary-section">
          <h4>AI Document Summary</h4>
          <div className="summary-scrollable">
            {summary ? (
              <div className="pdf-markdown-content summary-md">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            ) : (
              <div className="summary-loading-placeholder">
                <span className="pdf-spinner"></span>
                <span>Generating document summary...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
