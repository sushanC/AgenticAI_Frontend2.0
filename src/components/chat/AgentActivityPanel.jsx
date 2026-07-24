import { motion } from 'framer-motion';
import {
  Search,
  User,
  FileText,
  Brain,
  CheckSquare,
  Notebook,
  Mail,
  Calendar,
  Folder,
  Globe,
  Eye,
  Bot,
  Shield,
  Check,
  Loader2,
  AlertCircle,
  Cpu,
} from 'lucide-react';

const TOOL_MAP = {
  'web_search': { label: 'Web Search', icon: Search },
  'web': { label: 'Web Search', icon: Search },
  'memory_lookup': { label: 'Memory Lookup', icon: User },
  'memory': { label: 'Memory Lookup', icon: User },
  'pdf_search': { label: 'PDF Search', icon: FileText },
  'pdf': { label: 'PDF Search', icon: FileText },
  'planner': { label: 'Planner', icon: Brain },
  'planning': { label: 'Planning', icon: Brain },
  'task_manager': { label: 'Task Manager', icon: CheckSquare },
  'task': { label: 'Task Manager', icon: CheckSquare },
  'notes': { label: 'Notes', icon: Notebook },
  'note': { label: 'Notes', icon: Notebook },
  'save_note': { label: 'Notes', icon: Notebook },
  'save_research_note': { label: 'Notes', icon: Notebook },
  'email_draft': { label: 'Email Draft', icon: Mail },
  'email_send': { label: 'Email Send', icon: Mail },
  'calendar': { label: 'Calendar', icon: Calendar },
  'filesystem': { label: 'Filesystem', icon: Folder },
  'browser': { label: 'Browser', icon: Globe },
  'vision': { label: 'Vision', icon: Eye },
  'ocr': { label: 'OCR', icon: Search },
  'research': { label: 'Research', icon: Search },
  'agent': { label: 'Agent', icon: Bot },
  'confirmation': { label: 'Confirmation', icon: Shield },
  'waiting_input': { label: 'Waiting Input', icon: Mail }
};

export default function AgentActivityPanel({ timeline }) {
  if (!timeline || !timeline.steps || timeline.steps.length === 0) return null;

  return (
    <motion.div
      className="agent-panel"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      {timeline.steps.map((step, idx) => {
        const key = step.name.toLowerCase().replace(/\s+/g, '_');
        const toolInfo = TOOL_MAP[key] || { label: step.name, icon: step.isModel ? Bot : Cpu };
        const IconComponent = step.isModel ? Bot : toolInfo.icon;
        const displayLabel = step.isModel ? step.name : toolInfo.label;

        return (
          <motion.div
            key={idx}
            className="agent-step"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18, delay: idx * 0.04 }}
          >
            <div className="agent-step-icon-box">
              <IconComponent size={14} />
            </div>
            <span className="agent-step-title">{displayLabel}</span>

            <div className="agent-step-badge-wrapper">
              {step.status === 'completed' && (
                <span className="agent-badge completed">
                  <Check size={12} />
                  <span>Completed</span>
                </span>
              )}
              {step.status === 'running' && (
                <span className="agent-badge running">
                  <span className="agent-pulse-dot" />
                  <span>{step.isModel ? 'Generating' : 'Running'}</span>
                </span>
              )}
              {step.status === 'pending' && (
                <span className="agent-badge pending">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Pending</span>
                </span>
              )}
              {step.status === 'failed' && (
                <span className="agent-badge failed">
                  <AlertCircle size={12} />
                  <span>Failed</span>
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

