import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="typing-indicator-container">
      <div className="typing-indicator">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="typing-dot"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

