import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import MessageInput from '../components/chat/MessageInput';
import DashboardPage from '../components/pages/DashboardPage';
import MemoryPage from '../components/pages/MemoryPage';
import TasksPage from '../components/pages/TasksPage';
import NotesPage from '../components/pages/NotesPage';
import PDFPage from '../components/pages/PDFPage';
import SettingsPage from '../components/pages/SettingsPage';
import WorkspacePage from '../components/pages/WorkspacePage';

// Desktop layer (gracefully no-ops outside Electron)
import CommandPalette from '../desktop/CommandPalette';
import DragDropOverlay from '../desktop/DragDropOverlay';
import { useDesktopBridge } from '../desktop/useDesktopBridge';

// Developer Console (Electron-only observability, zero UX impact)
import DeveloperConsole from '../developer/DeveloperConsole';
import VoiceExperience from '../components/VoiceExperience';

import { useChat } from '../hooks/useChat';
import { useTasks } from '../hooks/useTasks';
import { useMemory } from '../hooks/useMemory';

import { initDefaultCommands } from '../registry/commandRegistry';

export default function Home() {
  const [page, setPage] = useState('chat');
  const [quickActionPrompt, setQuickActionPrompt] = useState('');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [devConsoleOpen, setDevConsoleOpen] = useState(false);
  const [voiceExperienceOpen, setVoiceExperienceOpen] = useState(false);

  const { messages, isStreaming, agentPhase, timeline, sendMessage, clearMessages, handleConfirmed, handleCancelled } = useChat();
  const { tasks }  = useTasks();
  const { facts }  = useMemory();
  const { isElectron, desktopAPI } = useDesktopBridge();

  const chatInputFocusRef = useRef(null); // set by MessageInput via callback

  const pendingTasks = tasks.filter(t => !t.completed).length;

  // ── Quick actions ─────────────────────────────────────────────────────────
  const handleQuickAction = useCallback((prompt) => {
    setQuickActionPrompt('');
  }, [clearMessages]);

  // ── File drop handler (from DragDropOverlay) ──────────────────────────────
  const handleFilesAccepted = useCallback((files) => {
    if (files.length === 0) return;

    const pdfFiles   = files.filter(f => f.ext === 'pdf');
    const otherFiles = files.filter(f => f.ext !== 'pdf');

    if (pdfFiles.length > 0) {
      // Navigate to PDF workspace for PDF files
      setPage('pdfs');
      toast.success(`${pdfFiles.length} PDF${pdfFiles.length > 1 ? 's' : ''} ready to upload`);
    }

    if (otherFiles.length > 0) {
      // Attach other files as context in chat
      const names = otherFiles.map(f => f.name).join(', ');
      sendMessage(`[Dropped files: ${names}]\nPlease analyze these files.`);
      setPage('chat');
    }
  }, [sendMessage]);

  // ── Desktop IPC event subscriptions ──────────────────────────────────────
  useEffect(() => {
    if (!isElectron) return;

    // Main → Renderer: clear conversation
    const unsubNewChat = desktopAPI.onNewChat(() => {
      handleNewChat();
    });

    // Main → Renderer: navigate to a page
    const unsubNavigate = desktopAPI.onNavigate(({ page: targetPage }) => {
      if (targetPage) setPage(targetPage);
    });

    // Main → Renderer: open command palette
    const unsubPalette = desktopAPI.onOpenCommandPalette(() => {
      setCommandPaletteOpen(true);
    });

    // Main → Renderer: focus the chat textarea
    const unsubFocus = desktopAPI.onFocusChatInput(() => {
      chatInputFocusRef.current?.();
    });

    // IPC: open developer console (Ctrl+Shift+D or command palette)
    const unsubDev = desktopAPI.onOpenDeveloperConsole?.(() => setDevConsoleOpen(true)) || (() => {});

    // Main → Renderer: toggle voice experience overlay
    const unsubToggleVoice = desktopAPI.onToggleVoice?.(() => {
      setVoiceExperienceOpen(prev => !prev);
    }) || (() => {});

    // Main → Renderer: receive command palette action
    const unsubVoiceCommand = desktopAPI.onVoiceCommand?.((payload) => {
      if (payload.action === "start-conversation" || payload.action === "push-to-talk") {
        setVoiceExperienceOpen(true);
      } else if (payload.action === "stop-conversation") {
        setVoiceExperienceOpen(false);
      }
    }) || (() => {});

    return () => {
      unsubNewChat();
      unsubNavigate();
      unsubPalette();
      unsubFocus();
      unsubDev();
      unsubToggleVoice();
      unsubVoiceCommand();
    };
  }, [isElectron, desktopAPI, handleNewChat]);

  // ── Command Registry Initialization ────────────────────────────────────────
  useEffect(() => {
    initDefaultCommands({
      setPage,
      handleNewChat,
      setVoiceOpen: setVoiceExperienceOpen,
      setDevOpen: setDevConsoleOpen,
    });
  }, [handleNewChat]);

  // ── Global Ctrl+K Shortcut Listener ───────────────────────────────────────
  useEffect(() => {
    const handleGlobalKeyDown = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // ── ESC: exit PDF Workspace ───────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && page === 'pdfs') {
        if (
          document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA' &&
          !document.activeElement.isContentEditable
        ) {
          e.preventDefault();
          setPage('chat');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page]);

  return (
    <div className="app-shell" style={{ position: 'relative' }}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid rgba(148,163,184,0.12)',
            borderRadius: '8px',
            fontSize: '14px',
          },
        }}
      />

      {/* ── Command Palette (desktop only, graceful no-op in browser) ── */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* ── Universal Drag & Drop overlay ────────────────────────────── */}
      <DragDropOverlay onFilesAccepted={handleFilesAccepted} />

      <Sidebar
        page={page}
        setPage={setPage}
        onNewChat={handleNewChat}
        taskCount={pendingTasks}
        memoryCount={facts.length}
      />

      <div className="main-content">
        <AnimatePresence mode="wait">
          {page !== 'pdfs' && (
            <motion.div
              key={page}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {page === 'dashboard' && <DashboardPage setPage={setPage} onQuickAction={handleQuickAction} />}
              {page === 'workspace' && (
                <WorkspacePage
                  setPage={setPage}
                  setVoiceOpen={setVoiceExperienceOpen}
                  setDevOpen={setDevConsoleOpen}
                />
              )}
              {page === 'notes'     && <NotesPage />}
              {page === 'tasks'     && <TasksPage />}
              {page === 'memory'    && <MemoryPage />}
              {page === 'settings'  && <SettingsPage />}
              {page === 'chat' && (
                <>
                  <ChatWindow
                    messages={messages}
                    isStreaming={isStreaming}
                    agentPhase={agentPhase}
                    timeline={timeline}
                    onQuickAction={handleQuickAction}
                    onConfirmed={handleConfirmed}
                    onCancelled={handleCancelled}
                    onRegenerate={() => {
                      const lastUser = [...messages].reverse().find(m => m.role === 'user');
                      if (lastUser) sendMessage(lastUser.content);
                    }}
                  />
                  <MessageInput
                    onSend={sendMessage}
                    isStreaming={isStreaming}
                    initialValue={quickActionPrompt}
                    key={quickActionPrompt}
                    onFocusRef={chatInputFocusRef}
                    onVoiceTrigger={() => {
                      setVoiceExperienceOpen(true);
                      if (isElectron) {
                        desktopAPI.toggleVoice();
                      }
                    }}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/*
        PDF Workspace Overlay
        Keeps PDFPage permanently mounted so selected document, loaded PDFs,
        conversation history, and scroll positions are fully preserved without reloads.
        Animate using Framer Motion (Fade + Slide from the right).
      */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          zIndex: page === 'pdfs' ? 50 : -1,
          pointerEvents: page === 'pdfs' ? 'auto' : 'none',
          background: 'var(--pdf-bg)',
        }}
        initial={{ opacity: 0, x: 40 }}
        animate={{
          opacity: page === 'pdfs' ? 1 : 0,
          x:       page === 'pdfs' ? 0 : 40,
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <PDFPage onBack={() => setPage('chat')} />
      </motion.div>

      {/* Developer Console — Electron-only AI observability overlay */}
      <DeveloperConsole
        isOpen={devConsoleOpen}
        onClose={() => setDevConsoleOpen(false)}
      />

      {/* Full-Screen Glassmorphic Jarvis Voice Experience Page Overlay */}
      <AnimatePresence>
        {voiceExperienceOpen && (
          <motion.div
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              zIndex: 9999,
            }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <VoiceExperience onClose={() => setVoiceExperienceOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}