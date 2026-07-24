import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const STAT_CARDS = [
  { key: 'messages', icon: '💬', label: 'Messages' },
  { key: 'tasks_created', icon: '✅', label: 'Tasks Created' },
  { key: 'notes_saved', icon: '📝', label: 'Notes Saved' },
  { key: 'pdf_queries', icon: '📄', label: 'PDF Queries' },
  { key: 'memory_updates', icon: '🧠', label: 'Memory Updates' },
];

const MODEL_COLORS = {
  groq: { color: '#22C55E', label: 'Groq' },
  gemini: { color: '#3B82F6', label: 'Gemini' },
  deepseek: { color: '#8B5CF6', label: 'DeepSeek' },
  openrouter: { color: '#F59E0B', label: 'OpenRouter' },
  ollama: { color: '#EC4899', label: 'Ollama' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3001/stats')
      .then(res => setStats(res.data))
      .catch(() => setStats({ messages: 0, tasks_created: 0, notes_saved: 0, pdf_queries: 0, memory_updates: 0, model_usage: {} }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Loading...</div>
        </div>
        <div className="page-body">
          <div className="dashboard-grid">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton dash-card" style={{height:100}} />)}
          </div>
        </div>
      </div>
    );
  }

  const modelUsage = stats?.model_usage || {};
  const maxUsage = Math.max(1, ...Object.values(modelUsage));

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-subtitle">Your samGPT usage overview</div>
      </div>
      <div className="page-body">
        <div className="dashboard-grid">
          {STAT_CARDS.map((card, i) => (
            <motion.div
              key={card.key}
              className="dash-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <div className="dash-card-icon">{card.icon}</div>
              <div className="dash-card-value">{stats?.[card.key] ?? 0}</div>
              <div className="dash-card-label">{card.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="content-card" style={{ marginTop: 8 }}>
          <div className="model-usage-title">Model Usage</div>
          {Object.entries(MODEL_COLORS).map(([key, info]) => (
            <div key={key} className="usage-row">
              <span className="usage-label">{info.label}</span>
              <div className="usage-bar">
                <motion.div
                  className={`usage-fill ${key}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${((modelUsage[key] || 0) / maxUsage) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="usage-count">{modelUsage[key] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
