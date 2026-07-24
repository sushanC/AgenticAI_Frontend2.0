import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDesktopBridge } from './useDesktopBridge';

/**
 * DragDropOverlay.jsx
 *
 * Universal drag & drop handler for the main chat window.
 *
 * Architecture:
 *   • Listens to native browser dragenter/dragleave/dragover/drop events
 *     on the document root
 *   • Shows an animated full-screen overlay while files are being dragged
 *   • On drop, normalises file metadata and reports to main process via IPC
 *   • Main process filters by extension and relays accepted files back via
 *     desktop:files-accepted
 *   • Final accepted files are passed to the parent via onFilesAccepted()
 *     for chat/PDF processing
 *
 * Supported types are displayed in the overlay so the user knows what they
 * can drop. Adding a new type only requires updating dragDropManager.js on
 * the main process side — no UI changes needed here.
 *
 * @param {{ onFilesAccepted: (files: object[]) => void }} props
 */

const DISPLAY_TYPES = [
  { ext: 'PDF',   icon: '📄' },
  { ext: 'TXT',   icon: '📝' },
  { ext: 'MD',    icon: '🗒️' },
  { ext: 'Image', icon: '🖼️' },
  { ext: 'DOCX',  icon: '📃' },
  { ext: 'PPTX',  icon: '📊' },
  { ext: 'XLSX',  icon: '📈' },
  { ext: 'CSV',   icon: '🗃️' },
  { ext: 'ZIP',   icon: '🗜️' },
];

export default function DragDropOverlay({ onFilesAccepted }) {
  const { isElectron, desktopAPI } = useDesktopBridge();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0); // track nested dragenter/dragleave pairs

  // ── Subscribe to main-process filtered file events ────────────────────────
  useEffect(() => {
    if (!isElectron) return;
    const unsub = desktopAPI.onFilesAccepted((files) => {
      if (onFilesAccepted && files.length > 0) {
        onFilesAccepted(files);
      }
    });
    return unsub;
  }, [isElectron, desktopAPI, onFilesAccepted]);

  // ── Native drag event listeners ───────────────────────────────────────────
  useEffect(() => {
    if (!isElectron) return;

    function onDragEnter(e) {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      dragCounterRef.current++;
      if (dragCounterRef.current === 1) setIsDragging(true);
    }

    function onDragLeave(e) {
      e.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) setIsDragging(false);
    }

    function onDragOver(e) {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }

    function onDrop(e) {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const rawFiles = Array.from(e.dataTransfer?.files || []);
      if (rawFiles.length === 0) return;

      // Normalise file metadata — only path-like info, no File object over IPC
      const fileList = rawFiles.map(f => ({
        // In Electron, File.path gives the absolute filesystem path
        path: f.path || '',
        name: f.name,
        ext:  f.name.includes('.') ? f.name.split('.').pop().toLowerCase() : '',
        size: f.size,
        type: f.type,
      }));

      // Report to main for extension filtering
      desktopAPI.reportDroppedFiles(fileList);
    }

    document.addEventListener('dragenter', onDragEnter);
    document.addEventListener('dragleave', onDragLeave);
    document.addEventListener('dragover',  onDragOver);
    document.addEventListener('drop',      onDrop);

    return () => {
      document.removeEventListener('dragenter', onDragEnter);
      document.removeEventListener('dragleave', onDragLeave);
      document.removeEventListener('dragover',  onDragOver);
      document.removeEventListener('drop',      onDrop);
    };
  }, [isElectron, desktopAPI]);

  if (!isElectron) return null;

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          className="dnd-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="dnd-panel"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="dnd-icon-ring">
              <span className="dnd-icon">⬆</span>
            </div>
            <h2 className="dnd-title">Drop files to upload</h2>
            <p className="dnd-subtitle">Files will be sent to samGPT for analysis</p>
            <div className="dnd-types">
              {DISPLAY_TYPES.map(t => (
                <span key={t.ext} className="dnd-type-pill">
                  {t.icon} {t.ext}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
