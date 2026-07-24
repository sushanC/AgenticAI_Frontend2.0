import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PDFSidebar({ 
  pdfs, 
  selectedPDF, 
  onSelectPDF, 
  onUpload, 
  onDelete, 
  onRename, 
  getDisplayName,
  pdfMeta,
  uploading
}) {
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const filteredPdfs = pdfs.filter(pdf => 
    pdf.toLowerCase().includes(searchQuery.toLowerCase()) || 
    getDisplayName(pdf).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  const startRename = (pdf, e) => {
    e.stopPropagation();
    setEditingId(pdf);
    setRenameValue(getDisplayName(pdf));
  };

  const saveRename = (pdf, e) => {
    e.stopPropagation();
    if (renameValue.trim()) {
      onRename(pdf, renameValue.trim());
    }
    setEditingId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const pdfFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
      if (pdfFiles.length > 0) {
        onUpload(pdfFiles);
      }
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className={`pdf-sidebar-workspace ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".pdf" 
        multiple
        onChange={handleFileChange}
      />
      
      <div className="pdf-sidebar-header">
        <button 
          className="pdf-upload-trigger-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <span className="pdf-spinner"></span>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          )}
          <span>{uploading ? 'Uploading...' : 'Upload PDF'}</span>
        </button>
      </div>

      <div className="pdf-sidebar-search">
        <div className="pdf-search-wrapper">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon-svg">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="pdf-sidebar-list-container">
        <div className="pdf-list-title">Documents ({filteredPdfs.length})</div>
        <div className="pdf-sidebar-scrollable">
          {filteredPdfs.length === 0 ? (
            <div className="pdf-sidebar-empty-search">
              {searchQuery ? 'No matching PDFs' : 'No documents uploaded'}
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredPdfs.map(pdf => {
                const isSelected = selectedPDF === pdf;
                const isEditing = editingId === pdf;
                const meta = pdfMeta[pdf] || {};
                
                return (
                  <motion.div
                    key={pdf}
                    layoutId={`pdf-card-${pdf}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`pdf-doc-card ${isSelected ? 'active' : ''}`}
                    onClick={() => !isEditing && onSelectPDF(pdf)}
                  >
                    <div className="pdf-doc-icon-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pdf-file-icon">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>

                    <div className="pdf-doc-info-wrapper">
                      {isEditing ? (
                        <div className="pdf-rename-input-wrapper" onClick={e => e.stopPropagation()}>
                          <input 
                            type="text" 
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveRename(pdf, e);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                          />
                          <button className="save-rename-btn" onClick={(e) => saveRename(pdf, e)}>✓</button>
                        </div>
                      ) : (
                        <div className="pdf-doc-name-text" title={getDisplayName(pdf)}>
                          {getDisplayName(pdf)}
                        </div>
                      )}
                      
                      <div className="pdf-doc-metadata">
                        <span>{formatDate(meta.uploadedAt)}</span>
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="pdf-doc-actions">
                        <button 
                          className="pdf-action-icon-btn" 
                          onClick={(e) => startRename(pdf, e)}
                          title="Rename"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
                          </svg>
                        </button>
                        <button 
                          className="pdf-action-icon-btn delete-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete "${getDisplayName(pdf)}"?`)) {
                              onDelete(pdf);
                            }
                          }}
                          title="Delete"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
