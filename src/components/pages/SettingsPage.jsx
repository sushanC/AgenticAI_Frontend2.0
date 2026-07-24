import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DesktopSettingsSection from '../../desktop/DesktopSettingsSection';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const API = 'http://localhost:3001';

const CAPABILITIES = [
  { key: 'general_chat',      icon: '💬', label: 'General Chat',    desc: 'Default conversational AI for everyday questions' },
  { key: 'coding',            icon: '💻', label: 'Programming',     desc: 'Code generation, debugging, and technical help' },
  { key: 'research',          icon: '🔬', label: 'Research',        desc: 'Deep analysis, comparison, and summarization' },
  { key: 'writing',           icon: '✍️',  label: 'Writing',        desc: 'Essays, emails, drafts, and creative content' },
  { key: 'planning',          icon: '🗺️',  label: 'Planning',       desc: 'Roadmaps, strategies, and structured plans' },
  { key: 'pdf',               icon: '📄', label: 'PDF QA',          desc: 'Question answering over uploaded documents' },
  { key: 'vision',            icon: '👁️',  label: 'Vision',         desc: 'Image analysis and visual understanding' },
  { key: 'memory_extraction', icon: '🧠', label: 'Memory',          desc: 'Extracting and storing long-term user facts' },
  { key: 'web_search',        icon: '🌐', label: 'Web Search',      desc: 'Summarizing live search results from the internet' },
  { key: 'offline',           icon: '⚡', label: 'Offline',         desc: 'Local fallback when no internet is available' },
  { key: 'agent_planning',    icon: '🤖', label: 'Agent Planning',  desc: 'Multi-step agentic task orchestration' },
];

const LATENCY_LABELS = {
  very_fast: '⚡ Very Fast',
  fast:      '🚀 Fast',
  medium:    '⏱ Medium',
  slow:      '🐢 Slow',
  variable:  '〰 Variable',
  unknown:   '? Unknown',
};

const CTX_LABEL = (n) => {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ctx`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K ctx`;
  return `${n} ctx`;
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    online:   { cls: 'online',   label: 'Online'   },
    offline:  { cls: 'offline',  label: 'Offline'  },
    disabled: { cls: 'disabled', label: 'Disabled' },
    local:    { cls: 'local',    label: 'Local'    },
    checking: { cls: 'checking', label: 'Checking' },
  };
  const s = map[status] || map.checking;
  return (
    <span className={`status-badge status-badge--${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FlagPill — shows a boolean capability flag
// ─────────────────────────────────────────────────────────────────────────────
function FlagPill({ label, value }) {
  return (
    <span className={`model-flag ${value ? 'model-flag--yes' : 'model-flag--no'}`}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ModelCard
// ─────────────────────────────────────────────────────────────────────────────
function ModelCard({ model, health }) {
  const [testing, setTesting]   = useState(false);
  const [testResult, setTestResult] = useState(null);

  const status = health?.[model.key] ?? model.status ?? 'checking';

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const { data } = await axios.post(`${API}/models/test/${model.key}`);
      setTestResult({ ok: true, ...data });
    } catch (err) {
      setTestResult({
        ok: false,
        error: err.response?.data?.error || err.message
      });
    } finally {
      setTesting(false);
    }
  }

  const isDisabled = !model.enabled || model.status === 'disabled';
  const costLabel  = model.estimatedCostPer1kTokens > 0
    ? `$${model.estimatedCostPer1kTokens}/1K`
    : 'Free';

  return (
    <div className={`model-card ${isDisabled ? 'model-card--disabled' : ''}`}>

      {/* Header */}
      <div className="model-card-header">
        <div>
          <div className="model-card-name">{model.displayName}</div>
          <div className="model-card-provider">{model.provider} · {model.modelId}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Description */}
      {model.description && (
        <div className="model-card-desc">{model.description}</div>
      )}

      {/* Capabilities */}
      {model.capabilities?.length > 0 && (
        <div className="capability-chips">
          {model.capabilities.map(c => (
            <span key={c} className="capability-chip capability-chip--active">
              {c.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Meta pills */}
      <div className="model-meta-row">
        <div className="model-meta-pill">
          Latency <span>{LATENCY_LABELS[model.latency] ?? model.latency}</span>
        </div>
        <div className="model-meta-pill">
          Context <span>{CTX_LABEL(model.contextWindow)}</span>
        </div>
        <div className="model-meta-pill">
          Cost <span>{costLabel}</span>
        </div>
        <div className="model-meta-pill">
          Priority <span>P{model.priority}</span>
        </div>
      </div>

      {/* Feature flags */}
      <div className="model-flags">
        <FlagPill label="Streaming"    value={model.supportsStreaming} />
        <FlagPill label="Vision"       value={model.supportsVision} />
        <FlagPill label="Reasoning"    value={model.supportsReasoning} />
        <FlagPill label="Long Context" value={model.supportsLongContext} />
        <FlagPill label="Tool Calling" value={model.supportsToolCalling} />
        <FlagPill label="PDF"          value={model.supportsPDF} />
        {model.reserved && (
          <span className="model-flag" style={{ background: 'rgba(251,191,36,0.1)', color: '#f59e0b' }}>
            Reserved
          </span>
        )}
      </div>

      {/* Fallback */}
      {model.fallback && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Fallback → <span style={{ color: 'var(--text-secondary)' }}>{model.fallback}</span>
        </div>
      )}

      {/* Actions */}
      <div className="model-card-actions">
        <button
          className="test-model-btn"
          onClick={handleTest}
          disabled={testing || isDisabled}
          id={`test-model-${model.key}`}
        >
          {testing ? (
            <><span style={{ fontSize: 13 }}>⏳</span> Testing…</>
          ) : (
            <><span style={{ fontSize: 13 }}>🧪</span> Test Model</>
          )}
        </button>
      </div>

      {/* Test result */}
      {testResult && (
        <div className={`test-result test-result--${testResult.ok ? 'success' : 'error'}`}>
          {testResult.ok ? (
            <>
              <div style={{ fontWeight: 600, color: '#10a37f', marginBottom: 6 }}>
                ✅ Test passed
              </div>
              <div className="test-result-row">
                <span className="test-result-label">Latency</span>
                <span className="test-result-value">{testResult.latency}ms</span>
              </div>
              <div className="test-result-row">
                <span className="test-result-label">Provider</span>
                <span className="test-result-value">{testResult.provider}</span>
              </div>
              <div className="test-result-row">
                <span className="test-result-label">Tokens</span>
                <span className="test-result-value">{testResult.tokens}</span>
              </div>
              {testResult.response && (
                <div className="test-result-row" style={{ marginTop: 4 }}>
                  <span className="test-result-label">Response</span>
                  <span className="test-result-value" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {testResult.response}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>❌ Test failed</div>
              <div style={{ wordBreak: 'break-word' }}>{testResult.error}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CapabilityRoutingTable
// ─────────────────────────────────────────────────────────────────────────────
function CapabilityRoutingTable({ models, capabilityRoutes, onRouteChange }) {
  const [savedKeys, setSavedKeys] = useState({});

  // Build list of models that are enabled (exclude GLM / reserved)
  const routeableModels = models.filter(m => m.enabled && !m.reserved);

  async function handleChange(capabilityKey, modelKey) {
    onRouteChange(capabilityKey, modelKey);
    try {
      await axios.post(`${API}/settings`, {
        capabilityRoutes: { [capabilityKey]: modelKey }
      });
      setSavedKeys(prev => ({ ...prev, [capabilityKey]: true }));
      setTimeout(() => {
        setSavedKeys(prev => { const n = { ...prev }; delete n[capabilityKey]; return n; });
      }, 1800);
      toast.success(`${capabilityKey.replace(/_/g, ' ')} → ${modelKey}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save routing');
    }
  }

  return (
    <table className="capability-routes-table">
      <thead>
        <tr>
          <th>Capability</th>
          <th>Model</th>
        </tr>
      </thead>
      <tbody>
        {CAPABILITIES.map(cap => {
          const currentValue = capabilityRoutes[cap.key] || '';
          return (
            <tr key={cap.key} className="capability-route-row">
              <td>
                <div className="capability-route-name">
                  <span className="capability-route-icon">{cap.icon}</span>
                  {cap.label}
                </div>
                <div className="capability-route-desc">{cap.desc}</div>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <select
                    className="route-select"
                    id={`route-select-${cap.key}`}
                    value={currentValue}
                    onChange={e => handleChange(cap.key, e.target.value)}
                  >
                    <option value="">Auto (Registry Default)</option>
                    {routeableModels.map(m => (
                      <option key={m.key} value={m.key}>
                        {m.displayName}
                      </option>
                    ))}
                  </select>
                  {savedKeys[cap.key] && (
                    <span className="route-saved-indicator">✓ Saved</span>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main SettingsPage
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [models,          setModels]          = useState([]);
  const [health,          setHealth]          = useState({});
  const [capabilityRoutes, setCapabilityRoutes] = useState({});
  const [globalModel,     setGlobalModel]     = useState('auto');
  const [loadingModels,   setLoadingModels]   = useState(true);
  const [restoring,       setRestoring]       = useState(false);
  const fileInputRef = useRef(null);

  const [voiceSettings, setVoiceSettings] = useState({
    enableVoice: false,
    pushToTalk: false,
    conversationMode: false,
    voiceSelection: "en-IN-NeerjaNeural",
    speechSpeed: "+0%",
    speechPitch: "+0Hz",
    speechVolume: "+0%",
    microphoneSelection: "default",
    speakerSelection: "default",
    language: "en",
    autoListenAfterResponse: false,
    conversationTimeout: 30,
    silenceTimeout: 2.0,
    noiseTolerance: 300,
    maxRecordingTime: 15,
    noSpeechTimeout: 5.0
  });

  const [mics, setMics] = useState([]);
  const [speakers, setSpeakers] = useState([]);

  // ── Load all data on mount ────────────────────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      try {
        const [modelsRes, settingsRes, devicesRes] = await Promise.all([
          axios.get(`${API}/models`),
          axios.get(`${API}/settings`),
          axios.get(`${API}/audio/devices`),
        ]);
        setModels(modelsRes.data || []);
        setGlobalModel(settingsRes.data?.model || 'auto');
        setCapabilityRoutes(settingsRes.data?.capabilityRoutes || {});
        
        setMics(devicesRes.data?.inputs || []);
        setSpeakers(devicesRes.data?.outputs || []);

        if (settingsRes.data) {
          setVoiceSettings({
            enableVoice: settingsRes.data.enableVoice ?? false,
            pushToTalk: settingsRes.data.pushToTalk ?? false,
            conversationMode: settingsRes.data.conversationMode ?? false,
            voiceSelection: settingsRes.data.voiceSelection || "en-IN-NeerjaNeural",
            speechSpeed: settingsRes.data.speechSpeed || "+0%",
            speechPitch: settingsRes.data.speechPitch || "+0Hz",
            speechVolume: settingsRes.data.speechVolume || "+0%",
            microphoneSelection: settingsRes.data.microphoneSelection || "default",
            speakerSelection: settingsRes.data.speakerSelection || "default",
            language: settingsRes.data.language || "en",
            autoListenAfterResponse: settingsRes.data.autoListenAfterResponse ?? false,
            conversationTimeout: settingsRes.data.conversationTimeout ?? 30,
            silenceTimeout: settingsRes.data.silenceTimeout ?? 2.0,
            noiseTolerance: settingsRes.data.noiseTolerance ?? 300,
            maxRecordingTime: settingsRes.data.maxRecordingTime ?? 15,
            noSpeechTimeout: settingsRes.data.noSpeechTimeout ?? 5.0
          });
        }
      } catch (err) {
        console.error('Settings load error:', err);
        toast.error('Failed to load settings');
      } finally {
        setLoadingModels(false);
      }
    }
    loadAll();
  }, []);

  async function saveVoiceSetting(key, value) {
    setVoiceSettings(prev => ({ ...prev, [key]: value }));
    try {
      await axios.post(`${API}/settings`, { [key]: value });
      if (window.desktopAPI && window.desktopAPI.voiceSettingsChanged) {
        window.desktopAPI.voiceSettingsChanged();
      }
      toast.success("Voice preference saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save voice setting");
    }
  }

  // ── Async health check (after models load) ────────────────────────────────
  useEffect(() => {
    if (models.length === 0) return;
    // Set all to "checking" first
    const initial = {};
    models.forEach(m => { initial[m.key] = 'checking'; });
    setHealth(initial);

    axios.get(`${API}/models/health`)
      .then(res => setHealth(res.data || {}))
      .catch(() => {
        // On failure, fall back to static status from registry
        const fallback = {};
        models.forEach(m => { fallback[m.key] = m.status || 'offline'; });
        setHealth(fallback);
      });
  }, [models]);

  // ── Global model override ─────────────────────────────────────────────────
  async function saveGlobalModel(value) {
    setGlobalModel(value);
    try {
      await axios.post(`${API}/settings`, { model: value });
      toast.success(`Global model set to ${value === 'auto' ? 'Auto (Smart Routing)' : value}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    }
  }

  // ── Per-capability route change ───────────────────────────────────────────
  const handleRouteChange = useCallback((cap, modelKey) => {
    setCapabilityRoutes(prev => ({ ...prev, [cap]: modelKey }));
  }, []);

  // ── Backup / Restore ──────────────────────────────────────────────────────
  async function exportBackup() {
    try {
      const { data } = await axios.get(`${API}/backup`);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `samgpt-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Backup failed');
    }
  }

  async function handleRestore(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoring(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await axios.post(`${API}/restore`, data);
      toast.success(`Restored: ${data.tasks?.length || 0} tasks, ${data.notes?.length || 0} notes`);
    } catch (err) {
      console.error(err);
      toast.error('Restore failed — invalid backup file');
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // ── Computed values ───────────────────────────────────────────────────────
  const onlineCount   = Object.values(health).filter(s => s === 'online').length;
  const enabledModels = models.filter(m => m.enabled);
  const allModelNames = models.map(m => m.displayName).join(' · ');

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-subtitle">
          Configure samGPT · {enabledModels.length} models active
          {Object.keys(health).length > 0 && ` · ${onlineCount} online`}
        </div>
      </div>

      <div className="settings-v2-container">

        {/* ── Desktop Settings (only shown inside Electron) ────────────── */}
        <DesktopSettingsSection />

        {/* ── Voice Assistant settings card ───────────────────────────── */}
        <div className="settings-v2-section">
          <div className="settings-v2-section-title">Voice Assistant</div>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: 8
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600 }}>🎙️ Jarvis Voice Settings</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              Configure speech-to-text, text-to-speech, and physical device preferences.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Toggles */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={voiceSettings.enableVoice}
                    onChange={e => saveVoiceSetting('enableVoice', e.target.checked)}
                  />
                  Enable Voice Assistant
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={voiceSettings.pushToTalk}
                    onChange={e => saveVoiceSetting('pushToTalk', e.target.checked)}
                  />
                  Push To Talk
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={voiceSettings.conversationMode}
                    onChange={e => saveVoiceSetting('conversationMode', e.target.checked)}
                  />
                  Continuous Conversation
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={voiceSettings.autoListenAfterResponse}
                    onChange={e => saveVoiceSetting('autoListenAfterResponse', e.target.checked)}
                  />
                  Auto Listen After Response
                </label>
              </div>

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Voice Selection</label>
                  <select
                    className="settings-select"
                    value={voiceSettings.voiceSelection}
                    onChange={e => saveVoiceSetting('voiceSelection', e.target.value)}
                  >
                    <option value="en-IN-NeerjaNeural">Neerja (India Female)</option>
                    <option value="en-IN-PrabhatNeural">Prabhat (India Male)</option>
                    <option value="en-US-GuyNeural">Guy (US Male)</option>
                    <option value="en-US-AriaNeural">Aria (US Female)</option>
                    <option value="en-GB-SoniaNeural">Sonia (UK Female)</option>
                    <option value="en-GB-RyanNeural">Ryan (UK Male)</option>
                    <option value="en-AU-NatashaNeural">Natasha (AU Female)</option>
                    <option value="en-AU-WilliamNeural">William (AU Male)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Speech Speed</label>
                  <select
                    className="settings-select"
                    value={voiceSettings.speechSpeed}
                    onChange={e => saveVoiceSetting('speechSpeed', e.target.value)}
                  >
                    <option value="-50%">-50% (Slower)</option>
                    <option value="-25%">-25%</option>
                    <option value="-10%">-10%</option>
                    <option value="+0%">Normal</option>
                    <option value="+10%">+10%</option>
                    <option value="+20%">+20% (Faster)</option>
                    <option value="+50%">+50%</option>
                    <option value="+100%">+100%</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Speech Pitch</label>
                  <select
                    className="settings-select"
                    value={voiceSettings.speechPitch}
                    onChange={e => saveVoiceSetting('speechPitch', e.target.value)}
                  >
                    <option value="-20Hz">-20Hz (Deeper)</option>
                    <option value="-10Hz">-10Hz</option>
                    <option value="-5Hz">-5Hz</option>
                    <option value="+0Hz">Normal</option>
                    <option value="+5Hz">+5Hz</option>
                    <option value="+10Hz">+10Hz</option>
                    <option value="+20Hz">+20Hz (Squeakier)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Speech Volume</label>
                  <select
                    className="settings-select"
                    value={voiceSettings.speechVolume}
                    onChange={e => saveVoiceSetting('speechVolume', e.target.value)}
                  >
                    <option value="-50%">-50% (Quieter)</option>
                    <option value="-20%">-20%</option>
                    <option value="-10%">-10%</option>
                    <option value="+0%">Normal</option>
                    <option value="+10%">+10%</option>
                    <option value="+20%">+20% (Louder)</option>
                    <option value="+50%">+50%</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Speech Language</label>
                  <select
                    className="settings-select"
                    value={voiceSettings.language}
                    onChange={e => saveVoiceSetting('language', e.target.value)}
                  >
                    <option value="en">English (en)</option>
                    <option value="auto">Auto Detect</option>
                    <option value="hi">Hindi (hi)</option>
                    <option value="es">Spanish (es)</option>
                    <option value="fr">French (fr)</option>
                    <option value="de">German (de)</option>
                    <option value="it">Italian (it)</option>
                    <option value="zh">Chinese (zh)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Microphone Input</label>
                  <select
                    className="settings-select"
                    value={voiceSettings.microphoneSelection}
                    onChange={e => saveVoiceSetting('microphoneSelection', e.target.value)}
                  >
                    <option value="default">Default Microphone</option>
                    {mics.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Speaker Output</label>
                  <select
                    className="settings-select"
                    value={voiceSettings.speakerSelection}
                    onChange={e => saveVoiceSetting('speakerSelection', e.target.value)}
                  >
                    <option value="default">Default Speaker</option>
                    {speakers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Conversation Timeout (s)</label>
                  <input
                    type="number"
                    className="settings-select"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    value={voiceSettings.conversationTimeout}
                    min="5"
                    max="300"
                    onChange={e => saveVoiceSetting('conversationTimeout', parseInt(e.target.value) || 30)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>VAD Silence Timeout (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="settings-select"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    value={voiceSettings.silenceTimeout}
                    min="0.5"
                    max="10"
                    onChange={e => saveVoiceSetting('silenceTimeout', parseFloat(e.target.value) || 2.0)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>VAD Noise Tolerance (RMS)</label>
                  <input
                    type="number"
                    className="settings-select"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    value={voiceSettings.noiseTolerance}
                    min="50"
                    max="2000"
                    onChange={e => saveVoiceSetting('noiseTolerance', parseInt(e.target.value) || 300)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Max Recording Time (s)</label>
                  <input
                    type="number"
                    className="settings-select"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    value={voiceSettings.maxRecordingTime}
                    min="2"
                    max="60"
                    onChange={e => saveVoiceSetting('maxRecordingTime', parseInt(e.target.value) || 15)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>No-Speech Timeout (s)</label>
                  <input
                    type="number"
                    className="settings-select"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    value={voiceSettings.noSpeechTimeout}
                    min="2"
                    max="30"
                    onChange={e => saveVoiceSetting('noSpeechTimeout', parseFloat(e.target.value) || 5.0)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 1: Global Model Override ─────────────────────────── */}
        <div className="settings-v2-section">
          <div className="settings-v2-section-title">Global Override</div>
          <div className="settings-data-card">
            <h3>🤖 Force Model</h3>
            <p>
              Override smart routing for all requests. Choose a specific model or leave on
              <strong style={{ color: 'var(--text-secondary)' }}> Auto</strong> to let the
              Model Registry route each request to the best model for the task.
            </p>
            <select
              id="global-model-select"
              className="settings-select"
              value={globalModel}
              onChange={e => saveGlobalModel(e.target.value)}
            >
              <option value="auto">Auto (Smart Routing)</option>
              {models.filter(m => m.enabled && !m.reserved).map(m => (
                <option key={m.key} value={m.key}>{m.displayName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Section 2: Model Cards ────────────────────────────────────── */}
        <div className="settings-v2-section">
          <div className="settings-v2-section-title">Registered Models</div>

          {loadingModels ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>
              Loading models…
            </div>
          ) : (
            <div className="models-grid">
              {models.map(model => (
                <ModelCard
                  key={model.key}
                  model={model}
                  health={health}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Section 3: Capability Routing ────────────────────────────── */}
        <div className="settings-v2-section">
          <div className="settings-v2-section-title">Capability Routing</div>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '4px 0',
            marginBottom: 8
          }}>
            <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                🔀 Per-Capability Model Selection
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                Choose which model handles each task type. Changes take effect immediately — no restart needed.
                Leave a dropdown on <em>Auto</em> to use the registry default.
              </div>
            </div>
            <div style={{ padding: '10px 20px 20px' }}>
              {models.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>
                  Loading models…
                </div>
              ) : (
                <CapabilityRoutingTable
                  models={models}
                  capabilityRoutes={capabilityRoutes}
                  onRouteChange={handleRouteChange}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Section 4: Data ──────────────────────────────────────────── */}
        <div className="settings-v2-section">
          <div className="settings-v2-section-title">Data</div>

          <div className="settings-data-card">
            <h3>💾 Export Backup</h3>
            <p>Download all your data — tasks, notes, memory, chat history, and settings.</p>
            <button id="export-backup-btn" className="settings-btn" onClick={exportBackup}>
              Export Backup
            </button>
          </div>

          <div className="settings-data-card">
            <h3>📥 Restore Backup</h3>
            <p>Restore from a previously exported backup file.</p>
            <div className="restore-zone">
              <button
                id="restore-backup-btn"
                className="settings-btn secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={restoring}
              >
                {restoring ? 'Restoring…' : 'Choose File'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestore}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* ── Section 5: About ──────────────────────────────────────────── */}
        <div className="settings-v2-section">
          <div className="settings-v2-section-title">About</div>
          <div className="settings-data-card" style={{ marginBottom: 0 }}>
            <div className="settings-info-row">
              <span className="settings-info-label">App</span>
              <span className="settings-info-value">samGPT v1.0.0</span>
            </div>
            <div className="settings-info-row">
              <span className="settings-info-label">Storage</span>
              <span className="settings-info-value">~/.personal-agent/</span>
            </div>
            <div className="settings-info-row">
              <span className="settings-info-label">Models</span>
              <span className="settings-info-value" style={{ fontSize: 11, maxWidth: '60%', textAlign: 'right', lineHeight: 1.5 }}>
                {allModelNames || 'Loading…'}
              </span>
            </div>
            <div className="settings-info-row">
              <span className="settings-info-label">Active</span>
              <span className="settings-info-value">{enabledModels.length} / {models.length} models</span>
            </div>
            <div className="settings-info-row">
              <span className="settings-info-label">Online</span>
              <span className="settings-info-value" style={{ color: '#10a37f' }}>
                {onlineCount} online
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}