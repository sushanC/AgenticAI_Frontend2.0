import { motion } from 'framer-motion';
import './AgentActivityPanel.css';

const TOOL_MAP = {
  'web_search': { label: 'Web Search', icon: '🔍' },
  'web': { label: 'Web Search', icon: '🔍' },
  'memory_lookup': { label: 'Memory Lookup', icon: '👤' },
  'memory': { label: 'Memory Lookup', icon: '👤' },
  'pdf_search': { label: 'PDF Search', icon: '📄' },
  'planner': { label: 'Planner', icon: '🧠' },
  'planning': { label: 'Planning', icon: '🧠' },
  'task_manager': { label: 'Task Manager', icon: '📋' },
  'task': { label: 'Task Manager', icon: '📋' },
  'notes': { label: 'Notes', icon: '📝' },
  'note': { label: 'Notes', icon: '📝' },
  'save_note': { label: 'Notes', icon: '📝' },
  'save_research_note': { label: 'Notes', icon: '📝' },
  'email_draft': { label: 'Email Draft', icon: '📧' },
  'email_send': { label: 'Email Send', icon: '📧' },
  'calendar': { label: 'Calendar', icon: '📅' },
  'filesystem': { label: 'Filesystem', icon: '📁' },
  'browser': { label: 'Browser', icon: '🌐' },
  'vision': { label: 'Vision', icon: '👁' },
  'ocr': { label: 'OCR', icon: '🔍' },
  'research': { label: 'Research', icon: '🔍' },
  'agent': { label: 'Agent', icon: '🤖' },
  'confirmation': { label: 'Confirmation', icon: '🔒' },
  'waiting_input': { label: 'Waiting Input', icon: '📧' }
};

export default function AgentActivityPanel({ timeline }) {
  if (!timeline || !timeline.steps || timeline.steps.length === 0) return null;

  return (
    <motion.div
      className="agent-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {timeline.steps.map((step, idx) => {
        const key = step.name.toLowerCase().replace(/\s+/g, '_');
        const toolInfo = TOOL_MAP[key] || { label: step.name, icon: step.isModel ? '🤖' : '⚙️' };

        // Determine icon and label
        const displayIcon = step.isModel ? '🤖' : toolInfo.icon;
        const displayLabel = step.isModel ? step.name : toolInfo.label;

        return (
          <motion.div
            key={idx}
            className={`agent-step agent-step--${step.status || 'pending'}`}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
          >
            <span className="agent-step-icon">
              {displayIcon}
            </span>
            <span className="agent-step-text">
              {displayLabel}
            </span>
            <span className="agent-step-status">
              {step.status === 'completed' && (
                <span className="agent-status agent-status--completed">✓ Complete</span>
              )}
              {step.status === 'running' && (
                <span className="agent-status agent-status--running">
                  <span className="agent-status-pulse" aria-hidden="true" />
                  {step.isModel ? 'Generating…' : 'Running…'}
                </span>
              )}
              {step.status === 'pending' && (
                <span className="agent-status agent-status--pending" aria-label="Pending">
                  <svg className="agent-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              )}
              {step.status === 'failed' && (
                <span className="agent-status agent-status--failed">Failed</span>
              )}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
