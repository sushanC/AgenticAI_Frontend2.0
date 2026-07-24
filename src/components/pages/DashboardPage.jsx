import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  MessageSquare,
  CheckSquare,
  NotebookPen,
  FileText,
  Brain,
  MessageSquarePlus,
  Search,
  Activity,
  Cpu,
  Zap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  TrendingUp,
  BarChart3,
  Layers,
} from 'lucide-react';

const STAT_CARDS = [
  { key: 'messages', icon: MessageSquare, label: 'Messages Sent', badge: 'Active' },
  { key: 'tasks_created', icon: CheckSquare, label: 'Tasks Created', badge: 'Tracked' },
  { key: 'notes_saved', icon: NotebookPen, label: 'Notes Saved', badge: 'Captured' },
  { key: 'pdf_queries', icon: FileText, label: 'PDF Queries', badge: 'Indexed' },
  { key: 'memory_updates', icon: Brain, label: 'Memory Facts', badge: 'Learned' },
];

const MODEL_INFO = {
  groq: { label: 'Groq Llama 3', icon: Zap, color: '#22C55E' },
  gemini: { label: 'Gemini Flash', icon: Sparkles, color: '#3B82F6' },
  deepseek: { label: 'DeepSeek R1', icon: Cpu, color: '#8B5CF6' },
  openrouter: { label: 'OpenRouter', icon: Layers, color: '#F59E0B' },
  ollama: { label: 'Ollama Local', icon: Activity, color: '#EC4899' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DashboardPage({ setPage, onQuickAction }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('http://localhost:3001/stats')
      .then(res => setStats(res.data))
      .catch(() =>
        setStats({
          messages: 0,
          tasks_created: 0,
          notes_saved: 0,
          pdf_queries: 0,
          memory_updates: 0,
          model_usage: {},
        })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dash-container">
        <div className="dash-hero">
          <div className="dash-hero-title-skeleton" />
          <div className="dash-hero-sub-skeleton" />
        </div>
        <div className="dash-body">
          <div className="dash-grid-stats">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="dash-card dash-skeleton" style={{ height: 110 }} />
            ))}
          </div>
          <div className="dash-grid-two-col" style={{ marginTop: 20 }}>
            <div className="dash-card dash-skeleton" style={{ height: 220 }} />
            <div className="dash-card dash-skeleton" style={{ height: 220 }} />
          </div>
        </div>
      </div>
    );
  }

  const modelUsage = stats?.model_usage || {};
  const maxUsage = Math.max(1, ...Object.values(modelUsage));

  const totalActions =
    (stats?.messages || 0) +
    (stats?.tasks_created || 0) +
    (stats?.notes_saved || 0) +
    (stats?.pdf_queries || 0) +
    (stats?.memory_updates || 0);

  const QUICK_ACTIONS = [
    {
      id: 'chat',
      icon: MessageSquarePlus,
      title: 'New Chat',
      desc: 'Start a fresh conversation',
      onClick: () => setPage && setPage('chat'),
    },
    {
      id: 'research',
      icon: Search,
      title: 'Deep Research',
      desc: 'Search & summarize information',
      onClick: () => {
        if (setPage) setPage('chat');
        if (onQuickAction) onQuickAction('Research the topic: ');
      },
    },
    {
      id: 'pdf',
      icon: FileText,
      title: 'Search PDFs',
      desc: 'Query document library',
      onClick: () => setPage && setPage('pdfs'),
    },
    {
      id: 'task',
      icon: CheckSquare,
      title: 'Create Task',
      desc: 'Track pending action items',
      onClick: () => setPage && setPage('tasks'),
    },
    {
      id: 'note',
      icon: NotebookPen,
      title: 'New Note',
      desc: 'Capture thoughts & notes',
      onClick: () => setPage && setPage('notes'),
    },
  ];

  return (
    <div className="dash-container">
      {/* ── HERO HEADER ─────────────── */}
      <div className="dash-hero">
        <div className="dash-hero-left">
          <h1 className="dash-hero-title">{getGreeting()}👋</h1>
          <p className="dash-hero-subtitle">Your AI workspace is ready.</p>
        </div>
        <div className="dash-hero-date-badge">
          <Clock size={14} />
          <span>{getFormattedDate()}</span>
        </div>
      </div>

      <div className="dash-body">
        {/* ── QUICK ACTIONS ─────────────── */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Quick Actions</h2>
            <span className="dash-section-tag">Interactive</span>
          </div>
          <div className="dash-quick-grid">
            {QUICK_ACTIONS.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.button
                  key={a.id}
                  type="button"
                  className="dash-quick-card"
                  onClick={a.onClick}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.03 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="dash-quick-header">
                    <div className="dash-quick-icon-box">
                      <Icon size={18} />
                    </div>
                    <ArrowUpRight size={14} className="dash-quick-arrow" />
                  </div>
                  <div className="dash-quick-text">
                    <div className="dash-quick-title">{a.title}</div>
                    <div className="dash-quick-desc">{a.desc}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── METRICS OVERVIEW ─────────────── */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">System Metrics</h2>
            <span className="dash-section-tag">Real-time</span>
          </div>
          <div className="dash-grid-stats">
            {STAT_CARDS.map((card, i) => {
              const Icon = card.icon;
              const val = stats?.[card.key] ?? 0;
              return (
                <motion.div
                  key={card.key}
                  className="dash-stat-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.04 }}
                  whileHover={{ y: -1 }}
                >
                  <div className="dash-stat-top">
                    <div className="dash-stat-icon-box">
                      <Icon size={18} />
                    </div>
                    <span className="dash-stat-badge">{card.badge}</span>
                  </div>
                  <div className="dash-stat-value">{val}</div>
                  <div className="dash-stat-label">{card.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── SYSTEM STATUS & PRODUCTIVITY SUMMARY ─────────────── */}
        <div className="dash-grid-two-col">
          {/* System Status Panel */}
          <motion.div
            className="dash-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <div className="dash-card-header">
              <div className="dash-card-header-left">
                <ShieldCheck size={18} className="dash-header-icon" />
                <h3 className="dash-card-title">System Health & Status</h3>
              </div>
              <span className="dash-status-pill online">
                <span className="dash-status-dot" />
                <span>Operational</span>
              </span>
            </div>

            <div className="dash-status-list">
              <div className="dash-status-row">
                <span className="dash-status-label">Backend API Engine</span>
                <span className="dash-status-val online">
                  <CheckCircle2 size={13} /> Online
                </span>
              </div>
              <div className="dash-status-row">
                <span className="dash-status-label">Memory Store</span>
                <span className="dash-status-val online">
                  <CheckCircle2 size={13} /> Ready
                </span>
              </div>
              <div className="dash-status-row">
                <span className="dash-status-label">PDF Vector Search</span>
                <span className="dash-status-val online">
                  <CheckCircle2 size={13} /> Ready
                </span>
              </div>
              <div className="dash-status-row">
                <span className="dash-status-label">Voice Assistant</span>
                <span className="dash-status-val online">
                  <CheckCircle2 size={13} /> Available
                </span>
              </div>
              <div className="dash-status-row">
                <span className="dash-status-label">Active AI Model</span>
                <span className="dash-status-val active-model">Auto Select</span>
              </div>
            </div>
          </motion.div>

          {/* Productivity Insights Panel */}
          <motion.div
            className="dash-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.24 }}
          >
            <div className="dash-card-header">
              <div className="dash-card-header-left">
                <TrendingUp size={18} className="dash-header-icon" />
                <h3 className="dash-card-title">Productivity Insights</h3>
              </div>
              <span className="dash-section-tag">Overview</span>
            </div>

            <div className="dash-insights-grid">
              <div className="dash-insight-item">
                <span className="dash-insight-num">{totalActions}</span>
                <span className="dash-insight-lbl">Total AI Operations</span>
              </div>
              <div className="dash-insight-item">
                <span className="dash-insight-num">{stats?.notes_saved || 0}</span>
                <span className="dash-insight-lbl">Notes Captured</span>
              </div>
              <div className="dash-insight-item">
                <span className="dash-insight-num">{stats?.tasks_created || 0}</span>
                <span className="dash-insight-lbl">Tasks Managed</span>
              </div>
              <div className="dash-insight-item">
                <span className="dash-insight-num">{stats?.memory_updates || 0}</span>
                <span className="dash-insight-lbl">Facts Memorized</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── MODEL USAGE BREAKDOWN ─────────────── */}
        <motion.div
          className="dash-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.28 }}
        >
          <div className="dash-card-header">
            <div className="dash-card-header-left">
              <BarChart3 size={18} className="dash-header-icon" />
              <h3 className="dash-card-title">AI Model Utilization</h3>
            </div>
            <span className="dash-section-tag">Distribution</span>
          </div>

          <div className="dash-model-list">
            {Object.entries(MODEL_INFO).map(([key, info]) => {
              const Icon = info.icon;
              const count = modelUsage[key] || 0;
              const percent = maxUsage > 0 ? (count / maxUsage) * 100 : 0;
              return (
                <div key={key} className="dash-model-row">
                  <div className="dash-model-info">
                    <div className="dash-model-icon-box">
                      <Icon size={14} style={{ color: info.color }} />
                    </div>
                    <span className="dash-model-name">{info.label}</span>
                  </div>
                  <div className="dash-model-bar-track">
                    <motion.div
                      className="dash-model-bar-fill"
                      style={{ background: info.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="dash-model-count">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── RECENT ACTIVITY LOG ─────────────── */}
        <motion.div
          className="dash-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.32 }}
        >
          <div className="dash-card-header">
            <div className="dash-card-header-left">
              <Activity size={18} className="dash-header-icon" />
              <h3 className="dash-card-title">Recent Activity</h3>
            </div>
            <span className="dash-section-tag">Log</span>
          </div>

          <div className="dash-activity-empty">
            <Activity size={24} className="dash-empty-icon" />
            <p className="dash-empty-text">No recent activity recorded yet.</p>
            <span className="dash-empty-sub">Actions taken across Chat, Notes, Tasks, and Memory will appear here.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
