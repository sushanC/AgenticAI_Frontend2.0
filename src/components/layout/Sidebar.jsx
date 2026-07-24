import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Notebook,
  CheckSquare,
  FileText,
  Brain,
  Settings,
  Plus,
  Sparkles,
} from 'lucide-react';
import axios from 'axios';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'notes', icon: Notebook, label: 'Notes' },
  { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { id: 'pdfs', icon: FileText, label: 'PDFs' },
  { id: 'memory', icon: Brain, label: 'Memory' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ page, setPage, onNewChat, taskCount = 0, memoryCount = 0 }) {
  const [activeModel, setActiveModel] = useState('Auto');

  useEffect(() => {
    axios.get('http://localhost:3001/settings')
      .then(res => {
        if (res.data?.model) setActiveModel(res.data.model);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Sparkles size={16} />
        </div>
        <div>
          <div className="sidebar-title">samGPT</div>
          <div className="sidebar-sub">Desktop Assistant</div>
        </div>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <Plus size={16} />
        <span>New chat</span>
      </button>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
              whileTap={{ scale: 0.98 }}
            >
              <span className="nav-icon">
                <Icon size={16} />
              </span>
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="model-pill">
          <span className="model-dot" />
          <span>{activeModel}</span>
        </div>
        <div className="sidebar-info">
          <span>Memory</span>
          <span className="sidebar-info-value">{memoryCount} facts</span>
        </div>
        <div className="sidebar-info">
          <span>Tasks</span>
          <span className="sidebar-info-value">{taskCount} pending</span>
        </div>
      </div>
    </div>
  );
}

