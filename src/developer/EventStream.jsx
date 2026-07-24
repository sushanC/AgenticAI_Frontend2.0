/**
 * EventStream.jsx
 *
 * Displays the raw event timeline for the selected request.
 * Events are sorted by timestamp, newest at the bottom (chronological).
 * Each event shows its type pill, timestamp, and a one-line payload summary.
 */

import { useRef, useEffect } from 'react';

// ─── Payload summarizer ──────────────────────────────────────────────────────

function summarizePayload(type, payload) {
  if (!payload) return '';
  switch (type) {
    case 'IntentDetected':
      return `intent=${payload.intent} tool=${payload.tool}`;
    case 'MemoryRetrieved':
      return `keys=${(payload.keys || []).join(', ')} count=${(payload.keys || []).length}`;
    case 'PromptBuilt':
      return `tokens≈${payload.estimatedTokens || '?'} chars=${payload.finalPrompt?.length || '?'}`;
    case 'ModelSelected':
      return `selected=${payload.selected?.name || '?'} score=${payload.selected?.score ?? '?'}`;
    case 'ProviderCalled':
      return `${payload.provider}/${payload.model}`;
    case 'ProviderSucceeded':
      return `${payload.provider} ${payload.latencyMs}ms`;
    case 'ProviderFailed':
      return `${payload.provider} status=${payload.statusCode || payload.error || 'error'}`;
    case 'RetryStarted':
      return `attempt=${payload.attempt}/${payload.maxAttempts} reason=${payload.reason}`;
    case 'FallbackStarted':
      return `${payload.fromProvider} → ${payload.toProvider}`;
    case 'ToolStarted':
    case 'ToolFinished':
      return `tool=${payload.tool || payload.stage} stage=${payload.stage}`;
    case 'FullRequestSummary':
      if (payload.listeningLatency !== undefined) {
        return `total=${payload.totalDuration}ms (stt=${payload.listeningLatency}ms, ai=${payload.aiLatency}ms, tts=${payload.ttsLatency}ms, play=${payload.playbackDuration}ms)`;
      }
      return `latency=${payload.latencyMs}ms success=${payload.success}`;
    case 'VoiceStarted':
      return "Jarvis voice assistant active";
    case 'VoiceStopped':
      return `reason="${payload.reason}"`;
    case 'ListeningStarted':
      return "Microphone recording started";
    case 'ListeningFinished':
      return `latency=${payload.latencyMs}ms`;
    case 'SpeechRecognized':
      return `recognized="${payload.text}"`;
    case 'SpeechRecognitionFailed':
      return `error="${payload.error}"`;
    case 'AIStarted':
      return `query="${payload.prompt}"`;
    case 'AIFinished':
      return `latency=${payload.latencyMs}ms`;
    case 'TTSStarted':
      return `synthesizing="${payload.text.slice(0, 40)}..."`;
    case 'TTSFinished':
      return `latency=${payload.latencyMs}ms chars=${payload.characters}`;
    case 'PlaybackCancelled':
      return `reason="${payload.reason}"`;
    case 'ConversationStarted':
      return "Continuous conversation loop active";
    case 'ConversationEnded':
      return `reason="${payload.reason}"`;
    default:
      try {
        const str = JSON.stringify(payload);
        return str.length > 80 ? str.slice(0, 80) + '…' : str;
      } catch {
        return '';
      }
  }
}

function formatTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {{ request: object }} props
 */
export default function EventStream({ request }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [request?.events?.length]);

  if (!request) {
    return (
      <div className="dc-no-selection">
        <span className="dc-no-selection-icon">📡</span>
        Select a request to see its event stream.
      </div>
    );
  }

  const events = request.events || [];

  if (events.length === 0) {
    return (
      <div className="dc-panel-content">
        <div className="dc-section-label">Event Stream</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '12px 0' }}>
          No raw events captured for this request.
        </div>
      </div>
    );
  }

  // Chronological order (oldest first)
  const sorted = [...events].sort((a, b) =>
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  return (
    <div className="dc-panel-content">
      <div className="dc-section-label">Event Stream ({events.length})</div>
      <div className="dc-event-stream">
        {sorted.map((event, i) => {
          const typeClass = `dc-evt--${event.type}`;
          const summary   = summarizePayload(event.type, event.payload);

          return (
            <div key={event.id || i} className="dc-event-item">
              <span className="dc-event-time">{formatTime(event.timestamp)}</span>
              <span className={`dc-event-type-pill ${typeClass}`}>{event.type}</span>
              <span className="dc-event-payload" title={summary}>{summary}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
