import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PDFMessageBubble from './PDFMessageBubble';
import PDFInput from './PDFInput';
import PDFRightPanel from './PDFRightPanel';
import PDFFollowUps from './PDFFollowUps';
import {
  FileText,
  Clock,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  NotebookPen,
  GraduationCap,
  Lightbulb,
  Check,
  Search,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';

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
  onBack,
}) {
  const scrollRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [docSearch, setDocSearch] = useState('');
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isAsking]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const meta = pdfMeta[selectedPDF] || {};
  const estimatedPages = docChunksCount ? Math.max(1, Math.round(docChunksCount * 0.5)) : 12;
  const questionCount = getQuestionCount(selectedPDF);

  const formatDate = isoString => {
    if (!isoString) return 'Just now';
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const filteredPdfs = pdfs.filter(p =>
    getDisplayName(p).toLowerCase().includes(docSearch.toLowerCase())
  );

  const handleAction = actionType => {
    onRunAction(actionType);
    if (actionType === 'summarize') {
      setRightPanelOpen(true);
      setAiSummary('Generating document summary...');
      setTimeout(() => {
        setAiSummary(
          `## Executive Overview\nThis document (${getDisplayName(selectedPDF)}) covers essential concepts, architecture patterns, and operational guidelines.\n\n### Key Highlights\n1. **Core Architecture**: Explores scalable design patterns and component dependencies.\n2. **Performance Optimization**: Detailed benchmarks and state caching mechanisms.\n3. **Security Guidelines**: Verification protocols and strict data isolation rules.`
        );
      }, 1200);
    }
  };

  const MINIMAL_QUICK_CHIPS = [
    { id: 'summarize', label: 'Summarize document', icon: Sparkles, action: 'summarize' },
    { id: 'notes', label: 'Generate study notes', icon: NotebookPen, action: 'notes' },
    { id: 'quiz', label: 'Create practice quiz', icon: GraduationCap, action: 'quiz' },
    { id: 'concepts', label: 'Extract key concepts', icon: Lightbulb, action: 'concepts' },
  ];

  const suggestedFollowUps = [
    'What are the main technical conclusions in this document?',
    'Can you summarize chapter 2 in bullet points?',
    'What key methodologies were used in this analysis?',
  ];

  return (
    <div className="pdf-chat-area-container">
      {/* ── CLEAN HEADER ─────────────── */}
      <div className="pdf-chat-header">
        <div className="pdf-header-left">
          <button className="pdf-back-btn" onClick={onBack} title="Back to Chat">
            <ArrowLeft size={15} />
            <span>Back to Chat</span>
          </button>

          {/* Custom Searchable Document Selector */}
          <div className="pdf-custom-dropdown-container" ref={dropdownRef}>
            <button
              type="button"
              className="pdf-dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="pdf-dropdown-trigger-left">
                <FileText size={15} className="pdf-dropdown-file-icon" />
                <span className="pdf-dropdown-current-name">{getDisplayName(selectedPDF)}</span>
              </div>
              <ChevronDown size={14} className={`pdf-dropdown-chevron ${dropdownOpen ? 'open' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className="pdf-dropdown-menu"
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="pdf-dropdown-search-box">
                    <Search size={14} className="pdf-dropdown-search-icon" />
                    <input
                      type="text"
                      placeholder="Filter documents..."
                      value={docSearch}
                      onChange={e => setDocSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="pdf-dropdown-options-list">
                    {filteredPdfs.length === 0 ? (
                      <div className="pdf-dropdown-empty">No documents found</div>
                    ) : (
                      filteredPdfs.map(p => (
                        <button
                          key={p}
                          type="button"
                          className={`pdf-dropdown-option ${p === selectedPDF ? 'selected' : ''}`}
                          onClick={() => {
                            onSelectPDF(p);
                            setDropdownOpen(false);
                          }}
                        >
                          <FileText size={14} />
                          <span className="pdf-dropdown-option-name">{getDisplayName(p)}</span>
                          {p === selectedPDF && <Check size={14} className="pdf-option-check" />}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Minimal Metadata Pills */}
          <div className="pdf-header-meta">
            <span className="meta-pill">
              <FileText size={12} />
              <strong>{estimatedPages}</strong> Pages
            </span>
            <span className="meta-pill">
              <Clock size={12} />
              <strong>{formatDate(meta.uploadedAt)}</strong>
            </span>
            <span className="meta-pill">
              <MessageSquare size={12} />
              <strong>{questionCount}</strong> Questions
            </span>
            <span className="meta-pill ai-ready">
              <ShieldCheck size={12} />
              <span className="ready-dot" />
              AI Ready
            </span>
          </div>
        </div>

        {/* Right Toggle */}
        <div className="pdf-header-right">
          <button
            type="button"
            className={`pdf-insights-toggle-btn ${rightPanelOpen ? 'active' : ''}`}
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            title="Toggle AI Insights Panel"
          >
            {rightPanelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            <span>AI Insights</span>
          </button>
        </div>
      </div>

      {/* ── CONVERSATION AREA ─────────────── */}
      <div className="pdf-main-split-area">
        {/* Messages Scroll Area */}
        <div className="pdf-chat-messages-scroll" ref={scrollRef}>
          <div className="pdf-chat-messages-inner">
            {chatHistory.length === 0 ? (
              <div className="pdf-chat-welcome">
                <div className="pdf-welcome-avatar">
                  <Sparkles size={24} />
                </div>
                <h2>How can I help you with {getDisplayName(selectedPDF)}?</h2>
                <p>Ask questions, analyze concepts, or summarize sections using this document as context.</p>

                <div className="pdf-welcome-chips-container">
                  {MINIMAL_QUICK_CHIPS.map(chip => {
                    const ChipIcon = chip.icon;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        className="welcome-action-chip"
                        onClick={() => handleAction(chip.action)}
                      >
                        <ChipIcon size={14} />
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {chatHistory.map((msg, idx) => (
                  <PDFMessageBubble key={msg.id || idx} message={msg} />
                ))}
                {/* Suggested follow-up questions only during conversation */}
                <PDFFollowUps
                  questions={suggestedFollowUps}
                  onSelectQuestion={onSendMessage}
                />
              </>
            )}
          </div>
        </div>

        {/* Right AI Insights Panel */}
        <AnimatePresence>
          {rightPanelOpen && (
            <PDFRightPanel
              pdf={selectedPDF}
              getDisplayName={getDisplayName}
              pdfMeta={pdfMeta}
              questionCount={questionCount}
              summary={aiSummary}
              isOpen={rightPanelOpen}
              onClose={() => setRightPanelOpen(false)}
              docChunksCount={docChunksCount}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM INPUT AREA (Identical to Chat) ─────────────── */}
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
