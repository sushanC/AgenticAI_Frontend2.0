import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit3,
  Check,
  X,
  Upload,
  BookOpen,
} from 'lucide-react';

export default function PDFSidebar({
  pdfs,
  selectedPDF,
  onSelectPDF,
  onUpload,
  onDelete,
  onRename,
  getDisplayName,
  pdfMeta,
  uploading,
}) {
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const filteredPdfs = pdfs.filter(
    pdf =>
      pdf.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getDisplayName(pdf).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = e => {
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const pdfFiles = Array.from(e.dataTransfer.files).filter(
        f => f.type === 'application/pdf' || f.name.endsWith('.pdf')
      );
      if (pdfFiles.length > 0) {
        onUpload(pdfFiles);
      }
    }
  };

  const formatDate = isoString => {
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
        onChange={handleFileChange}
        accept="application/pdf"
        multiple
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div className="pdf-sidebar-header">
        <div className="pdf-sidebar-logo">
          <BookOpen size={18} />
        </div>
        <div className="pdf-sidebar-title-text">
          <span className="pdf-sidebar-title">PDF Research</span>
          <span className="pdf-sidebar-sub">Document Intelligence</span>
        </div>
      </div>

      {/* Upload Button */}
      <button
        type="button"
        className="pdf-upload-trigger-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <span className="pdf-spinner" />
            <span>Uploading PDF...</span>
          </>
        ) : (
          <>
            <Plus size={16} />
            <span>Upload New PDF</span>
          </>
        )}
      </button>

      {/* Search Input */}
      <div className="pdf-sidebar-search">
        <div className="pdf-search-wrapper">
          <Search size={14} className="pdf-search-icon" />
          <input
            type="text"
            placeholder="Search document library..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="pdf-clear-search"
              onClick={() => setSearchQuery('')}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Document List */}
      <div className="pdf-sidebar-list-container">
        <div className="pdf-list-title">Library ({filteredPdfs.length})</div>
        <div className="pdf-sidebar-scrollable">
          {filteredPdfs.length === 0 ? (
            <div className="pdf-sidebar-empty-search">
              <span>{searchQuery ? 'No matching documents' : 'No documents uploaded'}</span>
            </div>
          ) : (
            <AnimatePresence>
              {filteredPdfs.map(pdf => {
                const isSelected = selectedPDF === pdf;
                const isEditing = editingId === pdf;
                const meta = pdfMeta[pdf] || {};

                return (
                  <motion.div
                    key={pdf}
                    className={`pdf-doc-card ${isSelected ? 'active' : ''}`}
                    onClick={() => onSelectPDF(pdf)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="pdf-doc-icon">
                      <FileText size={16} />
                    </div>

                    <div className="pdf-doc-details">
                      {isEditing ? (
                        <div
                          className="pdf-rename-input-box"
                          onClick={e => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveRename(pdf, e)}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="pdf-rename-confirm"
                            onClick={e => saveRename(pdf, e)}
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="pdf-doc-name" title={getDisplayName(pdf)}>
                            {getDisplayName(pdf)}
                          </div>
                          <div className="pdf-doc-meta">
                            <span>{formatDate(meta.uploadedAt)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="pdf-doc-actions">
                        <button
                          type="button"
                          className="pdf-doc-action-btn"
                          onClick={e => startRename(pdf, e)}
                          title="Rename display title"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          className="pdf-doc-action-btn danger"
                          onClick={e => {
                            e.stopPropagation();
                            onDelete(pdf);
                          }}
                          title="Delete document"
                        >
                          <Trash2 size={13} />
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
