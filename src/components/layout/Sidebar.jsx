import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  PanelsTopLeft,
  Notebook,
  CheckSquare,
  FileText,
  Brain,
  Settings,
  Plus,
  Sparkles,
  Mic,
} from 'lucide-react';
import axios from 'axios';
import { useDesktopBridge } from '../../desktop/useDesktopBridge';

const NAV_GROUPS = [
  {
    group: 'GENERAL',
    items: [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'chat', icon: MessageSquare, label: 'Chat' },
      { id: 'workspace', icon: PanelsTopLeft, label: 'Workspace' },
    ],
  },
  {
    group: 'KNOWLEDGE',
    items: [
      { id: 'notes', icon: Notebook, label: 'Notes' },
      { id: 'pdfs', icon: FileText, label: 'PDFs' },
      { id: 'memory', icon: Brain, label: 'Memory' },
    ],
  },
  {
    group: 'PRODUCTIVITY',
    items: [{ id: 'tasks', icon: CheckSquare, label: 'Tasks' }],
  },
  {
    group: 'SYSTEM',
    items: [{ id: 'settings', icon: Settings, label: 'Settings' }],
  },
];

export default function Sidebar({
  page,
  setPage,
  onNewChat,
  taskCount = 0,
  memoryCount = 0,
}) {
  const { isElectron, desktopAPI } = useDesktopBridge();
  const [activeModel, setActiveModel] = useState('Gemini 2.5 Flash');
  const [voiceStatus, setVoiceStatus] = useState('idle');

  useEffect(() => {
    axios
      .get('http://localhost:3001/settings')
      .then(res => {
        if (res.data?.model) setActiveModel(res.data.model);
      })
      .catch(() => {});
  }, []);

  // Subscribe to live voice state
  useEffect(() => {
    if (!isElectron) return;
    const unsubState = desktopAPI.onVoiceStateChange(({ state }) => {
      setVoiceStatus(state);
    });
    return () => unsubState();
  }, [isElectron, desktopAPI]);

  return (
    <div className="sidebar">
      {/* App Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Sparkles size={16} />
        </div>
        <div>
          <div className="sidebar-title">samGPT</div>
          <div className="sidebar-sub">Desktop Assistant</div>
        </div>
      </div>

      {/* New Chat Button */}
      <button className="new-chat-btn" onClick={onNewChat}>
        <Plus size={15} />
        <span>New chat</span>
      </button>

      {/* Grouped Navigation List */}
      <nav className="sidebar-nav-grouped">
        {NAV_GROUPS.map(groupObj => (
          <div key={groupObj.group} className="nav-group-section">
            <div className="nav-group-label">{groupObj.group}</div>
            <div className="nav-group-items">
              {groupObj.items.map(item => {
                const Icon = item.icon;
                const isActive = page === item.id;
                return (
                  <motion.button
                    key={item.id}
                    className={`nav-item-row ${isActive ? 'active' : ''}`}
                    onClick={() => setPage(item.id)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isActive && (
                      <motion.div
                        className="nav-active-pill"
                        layoutId="navActiveHighlight"
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                    <span className="nav-icon">
                      <Icon size={16} />
                    </span>
                    <span className="nav-label">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Footer Info & Model Pill */}
      <div className="sidebar-bottom-v2">
        <div className="model-pill-v2">
          <span className="model-dot-emerald" />
          <div className="model-pill-text">
            <span className="model-name">{activeModel}</span>
            <span className="model-sub">Auto Routing</span>
          </div>
        </div>

        <div className="sidebar-meta-list">
          <div className="sidebar-info-row">
            <span className="info-label">
              <Mic size={11} /> Voice
            </span>
            <span className="info-val highlight">
              {voiceStatus === 'idle' && 'Ready'}
              {voiceStatus === 'listening' && 'Listening'}
              {voiceStatus === 'processing' && 'Thinking'}
              {voiceStatus === 'speaking' && 'Speaking'}
              {voiceStatus === 'error' && 'Error'}
            </span>
          </div>

          <div className="sidebar-info-row">
            <span className="info-label">Memory</span>
            <span className="info-val">{memoryCount} facts</span>
          </div>

          <div className="sidebar-info-row">
            <span className="info-label">Tasks</span>
            <span className="info-val">{taskCount} pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
