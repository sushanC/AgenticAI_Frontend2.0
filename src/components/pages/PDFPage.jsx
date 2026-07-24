import React from 'react';
import { usePDF } from '../../hooks/usePDF';
import PDFSidebar from '../pdf/PDFSidebar';
import PDFChatArea from '../pdf/PDFChatArea';
import PDFEmptyState from '../pdf/PDFEmptyState';

export default function PDFPage({ onBack }) {
  const {
    pdfs,
    selectedPDF,
    chatHistory,
    isLoading,
    isAsking,
    isActionLoading,
    uploadProgress,
    pdfMeta,
    uploadPDF,
    deletePDF,
    renamePDF,
    selectPDF,
    askQuestion,
    runAction,
    getDisplayName,
    getQuestionCount,
  } = usePDF();

  const handleUploadTrigger = () => {
    const input = document.querySelector('.pdf-sidebar-workspace input[type="file"]');
    if (input) input.click();
  };

  // Find active document chunk count to estimate pages/size
  const activeChunksCount = 24; // Standard fallback estimate

  return (
    <div className="pdf-workspace-layout">
      {/* Left Sidebar */}
      <PDFSidebar
        pdfs={pdfs}
        selectedPDF={selectedPDF}
        onSelectPDF={selectPDF}
        onUpload={uploadPDF}
        onDelete={deletePDF}
        onRename={renamePDF}
        getDisplayName={getDisplayName}
        pdfMeta={pdfMeta}
        uploading={uploadProgress}
      />

      {/* Main Workspace Panel */}
      <div className="pdf-workspace-main">
        {selectedPDF ? (
          <PDFChatArea
            selectedPDF={selectedPDF}
            pdfs={pdfs}
            getDisplayName={getDisplayName}
            pdfMeta={pdfMeta}
            chatHistory={chatHistory}
            isAsking={isAsking || isActionLoading}
            onSelectPDF={selectPDF}
            onSendMessage={askQuestion}
            onRunAction={runAction}
            getQuestionCount={getQuestionCount}
            docChunksCount={activeChunksCount}
            onBack={onBack}
          />
        ) : (
          /* Empty State if no PDF selected */
          <PDFEmptyState
            onUploadClick={handleUploadTrigger}
            uploading={uploadProgress}
            onBack={onBack}
          />
        )}
      </div>
    </div>
  );
}
