import React from 'react';
import { motion } from 'framer-motion';

export default function PDFEmptyState({ onUploadClick, uploading, onBack }) {
  return (
    <div className="pdf-chat-area-container">
      {/* Consistent top header even when empty */}
      <div className="pdf-chat-header">
        <div className="header-left">
          <button className="pdf-back-btn" onClick={onBack} title="Back to main Chat">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Chat</span>
          </button>
        </div>
      </div>

      <div className="pdf-empty-state" style={{ flex: 1 }}>
        <motion.div 
          className="pdf-empty-icon-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="pdf-empty-icon">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </motion.div>
        
        <motion.h3 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Upload a PDF to start chatting
        </motion.h3>
        
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Analyze, summarize, and ask questions about your documents in a dedicated, premium AI workspace.
        </motion.p>

        <motion.button 
          className="pdf-empty-upload-btn"
          onClick={onUploadClick}
          disabled={uploading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {uploading ? (
            <>
              <span className="pdf-spinner"></span>
              Uploading document...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Upload PDF
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
