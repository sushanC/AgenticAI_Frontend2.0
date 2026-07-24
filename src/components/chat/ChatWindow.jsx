import { useEffect, useRef } from 'react';
import WelcomeScreen from './WelcomeScreen';
import MessageBubble from './MessageBubble';
import AgentActivityPanel from './AgentActivityPanel';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({
  messages, isStreaming, agentPhase, timeline, onQuickAction, onRegenerate,
  onConfirmed, onCancelled,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentPhase]);

  const showWelcome = messages.length === 0 && !isStreaming;
  const lastAssistantIdx = messages.map(m => m.role).lastIndexOf('assistant');

  return (
    <div className="chat-area">
      <div className="messages-container">
        {showWelcome ? (
          <WelcomeScreen onAction={onQuickAction} />
        ) : (
          <div className="messages-inner">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id || i}
                message={msg}
                isLast={i === lastAssistantIdx}
                onRegenerate={i === lastAssistantIdx ? onRegenerate : null}
                onConfirmed={onConfirmed}
                onCancelled={onCancelled}
              />
            ))}

            {isStreaming && timeline && (
              <div className="streaming-activity-wrapper">
                <AgentActivityPanel timeline={timeline} isStreaming={isStreaming} />
                <TypingIndicator />
              </div>
            )}

            <div ref={bottomRef} className="messages-bottom-anchor" />
          </div>
        )}
      </div>
    </div>
  );
}

