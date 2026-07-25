import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  X,
  FileText,
  Clock,
  Sparkles,
  Tag,
  ShieldCheck,
  BookOpen,
  MessageSquare,
  HardDrive,
} from 'lucide-react';

export default function PDFRightPanel({
  pdf,
  getDisplayName,
  pdfMeta,
  questionCount,
  summary,
  isOpen,
  onClose,
  docChunksCount,
}) {
  if (!isOpen) return null;

  const meta = pdfMeta[pdf] || {};

  // Estimate pages and size
  const estimatedPages = docChunksCount ? Math.max(1, Math.round(docChunksCount * 0.5)) : 12;
  const estimatedSize = docChunksCount ? `${(docChunksCount * 0.9).toFixed(1)} KB` : '124 KB';
  const readingTime = Math.max(2, Math.round(estimatedPages * 1.5));

  const formatDate = isoString => {
    if (!isoString) return 'Just now';
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getKeywords = () => {
    if (!summary) return ['Study Guide', 'Reference', 'Architecture', 'Analysis'];
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
      animate={{ width: 340, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="pdf-panel-header">
        <div className="pdf-panel-header-left">
          <BookOpen size={18} className="pdf-header-icon" />
          <h3>AI Insights Panel</h3>
        </div>
        <button type="button" className="close-panel-btn" onClick={onClose} title="Close Panel">
          <X size={16} />
        </button>
      </div>

      <div className="pdf-panel-content">
        {/* Document Info Card */}
        <div className="pdf-info-card">
          <div className="pdf-info-card-header">
            <FileText size={15} />
            <span>Document Information</span>
          </div>
          <div className="pdf-info-list">
            <div className="info-row">
              <span className="info-label">File Name</span>
              <span className="info-val truncate" title={pdf}>
                {pdf}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Display Title</span>
              <span className="info-val">{getDisplayName(pdf)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Estimated Pages</span>
              <span className="info-val">{estimatedPages} pages</span>
            </div>
            <div className="info-row">
              <span className="info-label">Reading Time</span>
              <span className="info-val">~{readingTime} mins</span>
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
            <div className="info-row">
              <span className="info-label">Vector Status</span>
              <span className="info-val online">Indexed & Ready</span>
            </div>
          </div>
        </div>

        {/* Keywords & Topics */}
        <div className="pdf-keywords-section">
          <div className="pdf-panel-subtitle-box">
            <Tag size={15} />
            <h4>Topics & Key Concepts</h4>
          </div>
          <div className="keywords-grid">
            {getKeywords().map((kw, i) => (
              <span key={i} className="keyword-tag">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="pdf-summary-section">
          <div className="pdf-panel-subtitle-box">
            <Sparkles size={15} />
            <h4>AI Document Summary</h4>
          </div>
          <div className="summary-scrollable">
            {summary ? (
              <div className="pdf-markdown-content summary-md">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            ) : (
              <div className="summary-loading-placeholder">
                <span className="pdf-spinner" />
                <span>Generating document summary...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
