import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <span className="typing-indicator">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="typing-dot"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}
    </span>
  );
}
