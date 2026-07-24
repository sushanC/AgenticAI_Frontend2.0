import { motion } from 'framer-motion';
import { Search, Code, FileText, CheckSquare, Sparkles } from 'lucide-react';

const ACTIONS = [
  {
    id: 'research',
    icon: Search,
    title: 'Research',
    description: 'Search the web and summarize information',
    prompt: 'Research the topic: ',
  },
  {
    id: 'code',
    icon: Code,
    title: 'Write Code',
    description: 'Generate production-ready code',
    prompt: 'Write code for: ',
  },
  {
    id: 'pdf',
    icon: FileText,
    title: 'Search PDFs',
    description: 'Search your uploaded documents',
    prompt: 'Search my PDFs for: ',
  },
  {
    id: 'task',
    icon: CheckSquare,
    title: 'Tasks',
    description: 'Create and manage tasks',
    prompt: 'Help me create a task for: ',
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export default function WelcomeScreen({ onAction }) {
  return (
    <div className="welcome-screen">
      <motion.div
        className="welcome-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <div className="welcome-logo-wrapper">
          <div className="welcome-logo">
            <Sparkles size={28} strokeWidth={2} />
          </div>
        </div>

        <h1 className="welcome-greeting">{getGreeting()}</h1>
        <p className="welcome-subtitle">What would you like to accomplish today?</p>

        <div className="quick-actions">
          {ACTIONS.map((a, idx) => {
            const Icon = a.icon;
            return (
              <motion.button
                key={a.id}
                type="button"
                className="quick-action"
                onClick={() => onAction(a.prompt)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: 0.04 * idx }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="quick-action-header">
                  <div className="quick-action-icon-box">
                    <Icon size={20} />
                  </div>
                  <span className="quick-action-arrow">↗</span>
                </div>
                <div className="quick-action-text">
                  <div className="quick-action-title">{a.title}</div>
                  <div className="quick-action-desc">{a.description}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}


