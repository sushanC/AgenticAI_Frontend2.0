import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PDFEmptyState({ onUploadClick, uploading, onBack }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = e => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    setIsDragOver(false);
    onUploadClick();
  };

  return (
    <div className="pdf-chat-area-container">
      {/* Header bar */}
      <div className="pdf-chat-header">
        <div className="pdf-header-left">
          <button className="pdf-back-btn" onClick={onBack} title="Back to main Chat">
            <ArrowLeft size={16} />
            <span>Back to Chat</span>
          </button>
        </div>
      </div>

      <div className="pdf-empty-state-workspace">
        <motion.div
          className={`pdf-dropzone-card ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="pdf-empty-icon-box">
            <Upload size={32} />
          </div>

          <h3 className="pdf-empty-title">Upload a PDF to Start Researching</h3>
          <p className="pdf-empty-desc">
            Analyze, summarize, and ask questions about your documents in samGPT's flagship Document Intelligence Platform.
          </p>

          <motion.button
            type="button"
            className="pdf-empty-upload-btn"
            onClick={onUploadClick}
            disabled={uploading}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            {uploading ? (
              <>
                <span className="pdf-spinner" />
                <span>Uploading & Vectorizing Document...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Browse Files or Drag & Drop PDF</span>
              </>
            )}
          </motion.button>

          <div className="pdf-supported-formats">
            <span className="format-badge">PDF Documents</span>
            <span className="format-badge">Vector Indexed</span>
            <span className="format-badge">Local Embeddings</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
