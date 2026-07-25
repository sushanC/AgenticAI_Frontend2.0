import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import DesktopSettingsSection from '../../desktop/DesktopSettingsSection';
import {
  Settings,
  Cpu,
  Mic,
  Palette,
  GitFork,
  Database,
  Shield,
  Keyboard,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
  Volume2,
  Sliders,
  Download,
  Upload,
  Lock,
  Sparkles,
  Server,
  Activity,
  Radio,
  Clock,
  FlaskConical,
  DollarSign,
  Maximize2,
} from 'lucide-react';

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
      <span className="status-dot" />
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
// ModelCard — Compact modern layout
// ─────────────────────────────────────────────────────────────────────────────
function ModelCard({ model, health }) {
  const [testing, setTesting] = useState(false);
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
        error: err.response?.data?.error || err.message,
      });
    } finally {
      setTesting(false);
    }
  }

  const isDisabled = !model.enabled || model.status === 'disabled';
  const costLabel = model.estimatedCostPer1kTokens > 0
    ? `$${model.estimatedCostPer1kTokens}/1K`
    : 'Free';

  return (
    <div className={`settings-model-card ${isDisabled ? 'disabled' : ''}`}>
      {/* Header */}
      <div className="model-card-header">
        <div className="model-card-title-group">
          <div className="model-card-name">{model.displayName}</div>
          <div className="model-card-provider">{model.provider} · {model.modelId}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Description */}
      {model.description && (
        <div className="model-card-desc">{model.description}</div>
      )}

      {/* Capability chips */}
      {model.capabilities?.length > 0 && (
        <div className="capability-chips">
          {model.capabilities.map(c => (
            <span key={c} className="capability-chip">
              {c.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Meta Pills */}
      <div className="model-meta-row">
        <div className="model-meta-pill">
          <span>Latency</span>
          <strong>{LATENCY_LABELS[model.latency] ?? model.latency}</strong>
        </div>
        <div className="model-meta-pill">
          <span>Context</span>
          <strong>{CTX_LABEL(model.contextWindow)}</strong>
        </div>
        <div className="model-meta-pill">
          <span>Cost</span>
          <strong>{costLabel}</strong>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="model-flags">
        <FlagPill label="Streaming" value={model.supportsStreaming} />
        <FlagPill label="Vision" value={model.supportsVision} />
        <FlagPill label="Reasoning" value={model.supportsReasoning} />
        <FlagPill label="Long Context" value={model.supportsLongContext} />
        <FlagPill label="Tool Calling" value={model.supportsToolCalling} />
        <FlagPill label="PDF" value={model.supportsPDF} />
      </div>

      {/* Test Action */}
      <div className="model-card-actions">
        <button
          className="test-model-btn"
          onClick={handleTest}
          disabled={testing || isDisabled}
          id={`test-model-${model.key}`}
        >
          {testing ? (
            <>
              <span className="pdf-spinner" /> Testing…
            </>
          ) : (
            <>
              <FlaskConical size={13} /> Test Model
            </>
          )}
        </button>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`test-result test-result--${testResult.ok ? 'success' : 'error'}`}>
          {testResult.ok ? (
            <>
              <div className="test-result-title success">
                <Check size={14} /> Test Passed
              </div>
              <div className="test-result-row">
                <span>Latency</span>
                <strong>{testResult.latency}ms</strong>
              </div>
              <div className="test-result-row">
                <span>Provider</span>
                <strong>{testResult.provider}</strong>
              </div>
              <div className="test-result-row">
                <span>Tokens</span>
                <strong>{testResult.tokens}</strong>
              </div>
            </>
          ) : (
            <>
              <div className="test-result-title error">❌ Test Failed</div>
              <div className="test-result-err-text">{testResult.error}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CapabilityRoutingCards — Replacing legacy table with modern cards
// ─────────────────────────────────────────────────────────────────────────────
function CapabilityRoutingCards({ models, capabilityRoutes, onRouteChange }) {
  const [savedKeys, setSavedKeys] = useState({});
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
      toast.success(`${capabilityKey.replace(/_/g, ' ')} → ${modelKey || 'Auto'}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save routing');
    }
  }

  return (
    <div className="capability-routing-grid">
      {CAPABILITIES.map(cap => {
        const currentValue = capabilityRoutes[cap.key] || '';
        return (
          <div key={cap.key} className="capability-route-card">
            <div className="capability-card-left">
              <span className="capability-card-icon">{cap.icon}</span>
              <div className="capability-card-info">
                <div className="capability-card-title">{cap.label}</div>
                <div className="capability-card-desc">{cap.desc}</div>
              </div>
            </div>

            <div className="capability-card-right">
              <select
                className="settings-select route-select"
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
                <span className="route-saved-badge">
                  <Check size={12} /> Saved
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main SettingsPage Component
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [models, setModels] = useState([]);
  const [health, setHealth] = useState({});
  const [capabilityRoutes, setCapabilityRoutes] = useState({});
  const [globalModel, setGlobalModel] = useState('auto');
  const [loadingModels, setLoadingModels] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef(null);

  // Accordion section collapse state for Voice Assistant
  const [voiceAccordions, setVoiceAccordions] = useState({
    general: true,
    speech: false,
    devices: false,
    advanced: false,
  });

  const toggleAccordion = section => {
    setVoiceAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [voiceSettings, setVoiceSettings] = useState({
    enableVoice: false,
    pushToTalk: false,
    conversationMode: false,
    voiceSelection: 'en-IN-NeerjaNeural',
    speechSpeed: '+0%',
    speechPitch: '+0Hz',
    speechVolume: '+0%',
    microphoneSelection: 'default',
    speakerSelection: 'default',
    language: 'en',
    autoListenAfterResponse: false,
    conversationTimeout: 30,
    silenceTimeout: 2.0,
    noiseTolerance: 300,
    maxRecordingTime: 15,
    noSpeechTimeout: 5.0,
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
            voiceSelection: settingsRes.data.voiceSelection || 'en-IN-NeerjaNeural',
            speechSpeed: settingsRes.data.speechSpeed || '+0%',
            speechPitch: settingsRes.data.speechPitch || '+0Hz',
            speechVolume: settingsRes.data.speechVolume || '+0%',
            microphoneSelection: settingsRes.data.microphoneSelection || 'default',
            speakerSelection: settingsRes.data.speakerSelection || 'default',
            language: settingsRes.data.language || 'en',
            autoListenAfterResponse: settingsRes.data.autoListenAfterResponse ?? false,
            conversationTimeout: settingsRes.data.conversationTimeout ?? 30,
            silenceTimeout: settingsRes.data.silenceTimeout ?? 2.0,
            noiseTolerance: settingsRes.data.noiseTolerance ?? 300,
            maxRecordingTime: settingsRes.data.maxRecordingTime ?? 15,
            noSpeechTimeout: settingsRes.data.noSpeechTimeout ?? 5.0,
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
      toast.success('Voice preference saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save voice setting');
    }
  }

  // ── Async health check ──────────────────────────────────────────────────
  useEffect(() => {
    if (models.length === 0) return;
    const initial = {};
    models.forEach(m => { initial[m.key] = 'checking'; });
    setHealth(initial);

    axios.get(`${API}/models/health`)
      .then(res => setHealth(res.data || {}))
      .catch(() => {
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
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
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

  // Computed values
  const onlineCount = Object.values(health).filter(s => s === 'online').length;
  const enabledModels = models.filter(m => m.enabled);
  const allModelNames = models.map(m => m.displayName).join(' · ');

  return (
    <div className="settings-page-layout">
      <div className="settings-page-content">
        {/* ── HERO HEADER ─────────────── */}
        <div className="settings-hero-header">
          <div className="settings-hero-badge">
            <Settings size={18} />
            <span>Preferences</span>
          </div>
          <h1 className="settings-hero-title">⚙️ Settings</h1>
          <p className="settings-hero-subtitle">
            Manage AI models, voice assistant, application preferences, capability routing, and system data.
          </p>
        </div>

        {/* ── STATS CARDS ─────────────── */}
        <div className="settings-stats-grid">
          <div className="settings-stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Registered Models</span>
              <Cpu size={16} className="stat-icon" />
            </div>
            <div className="stat-val">{models.length}</div>
            <div className="stat-sub">{enabledModels.length} active in registry</div>
          </div>

          <div className="settings-stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Online Models</span>
              <Activity size={16} className="stat-icon success" />
            </div>
            <div className="stat-val success">
              <span className="health-pulse-dot" /> {onlineCount}
            </div>
            <div className="stat-sub">Real-time health verified</div>
          </div>

          <div className="settings-stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Voice Assistant</span>
              <Mic size={16} className="stat-icon" />
            </div>
            <div className="stat-val">
              {voiceSettings.enableVoice ? 'Active' : 'Disabled'}
            </div>
            <div className="stat-sub">
              {voiceSettings.conversationMode ? 'Continuous Mode' : 'Push-to-Talk'}
            </div>
          </div>

          <div className="settings-stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Smart Routing</span>
              <GitFork size={16} className="stat-icon" />
            </div>
            <div className="stat-val">
              {globalModel === 'auto' ? 'Auto' : 'Override'}
            </div>
            <div className="stat-sub">
              {globalModel === 'auto' ? 'Per-capability rules' : globalModel}
            </div>
          </div>
        </div>

        {/* Desktop Settings (Shown inside Electron app) */}
        <DesktopSettingsSection />

        {/* ── SECTION 1: AI MODELS ─────────────── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="section-title">
              <Cpu size={18} />
              <span>1. AI Models</span>
            </div>
            <span className="section-badge">{models.length} Models</span>
          </div>

          {/* Combined Global Override Header Bar */}
          <div className="settings-card global-override-bar">
            <div className="global-override-info">
              <h3>🤖 Current Global AI Model</h3>
              <p>Override smart routing for all requests or leave on Auto to let the Model Registry route dynamically.</p>
            </div>
            <div className="global-override-controls">
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

          {/* Model Cards Grid */}
          {loadingModels ? (
            <div className="settings-loading-state">Loading registered models…</div>
          ) : (
            <div className="models-grid">
              {models.map(model => (
                <ModelCard key={model.key} model={model} health={health} />
              ))}
            </div>
          )}
        </div>

        {/* ── SECTION 2: VOICE ASSISTANT ─────────────── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="section-title">
              <Mic size={18} />
              <span>2. Voice Assistant</span>
            </div>
            <span className="section-badge">Jarvis Voice Engine</span>
          </div>

          <div className="voice-accordions-container">
            {/* Accordion Group 1: General */}
            <div className="accordion-card">
              <button
                type="button"
                className="accordion-header"
                onClick={() => toggleAccordion('general')}
              >
                <div className="accordion-header-left">
                  <Radio size={16} />
                  <span>General Preferences</span>
                </div>
                {voiceAccordions.general ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <AnimatePresence>
                {voiceAccordions.general && (
                  <motion.div
                    className="accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="toggles-grid">
                      <label className="settings-toggle-label">
                        <input
                          type="checkbox"
                          checked={voiceSettings.enableVoice}
                          onChange={e => saveVoiceSetting('enableVoice', e.target.checked)}
                        />
                        <span>Enable Voice Assistant</span>
                      </label>

                      <label className="settings-toggle-label">
                        <input
                          type="checkbox"
                          checked={voiceSettings.pushToTalk}
                          onChange={e => saveVoiceSetting('pushToTalk', e.target.checked)}
                        />
                        <span>Push To Talk</span>
                      </label>

                      <label className="settings-toggle-label">
                        <input
                          type="checkbox"
                          checked={voiceSettings.conversationMode}
                          onChange={e => saveVoiceSetting('conversationMode', e.target.checked)}
                        />
                        <span>Continuous Conversation</span>
                      </label>

                      <label className="settings-toggle-label">
                        <input
                          type="checkbox"
                          checked={voiceSettings.autoListenAfterResponse}
                          onChange={e => saveVoiceSetting('autoListenAfterResponse', e.target.checked)}
                        />
                        <span>Auto Listen After Response</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion Group 2: Speech */}
            <div className="accordion-card">
              <button
                type="button"
                className="accordion-header"
                onClick={() => toggleAccordion('speech')}
              >
                <div className="accordion-header-left">
                  <Volume2 size={16} />
                  <span>Speech & Synthesis</span>
                </div>
                {voiceAccordions.speech ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <AnimatePresence>
                {voiceAccordions.speech && (
                  <motion.div
                    className="accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="form-fields-grid">
                      <div className="field-group">
                        <label>Voice Selection</label>
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

                      <div className="field-group">
                        <label>Language</label>
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

                      <div className="field-group">
                        <label>Speech Speed</label>
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

                      <div className="field-group">
                        <label>Speech Pitch</label>
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

                      <div className="field-group">
                        <label>Speech Volume</label>
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion Group 3: Devices */}
            <div className="accordion-card">
              <button
                type="button"
                className="accordion-header"
                onClick={() => toggleAccordion('devices')}
              >
                <div className="accordion-header-left">
                  <Sliders size={16} />
                  <span>Physical Audio Devices</span>
                </div>
                {voiceAccordions.devices ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <AnimatePresence>
                {voiceAccordions.devices && (
                  <motion.div
                    className="accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="form-fields-grid">
                      <div className="field-group">
                        <label>Microphone Input</label>
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

                      <div className="field-group">
                        <label>Speaker Output</label>
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion Group 4: Advanced */}
            <div className="accordion-card">
              <button
                type="button"
                className="accordion-header"
                onClick={() => toggleAccordion('advanced')}
              >
                <div className="accordion-header-left">
                  <Clock size={16} />
                  <span>Advanced VAD & Timeouts</span>
                </div>
                {voiceAccordions.advanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <AnimatePresence>
                {voiceAccordions.advanced && (
                  <motion.div
                    className="accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="form-fields-grid">
                      <div className="field-group">
                        <label>Conversation Timeout (s)</label>
                        <input
                          type="number"
                          className="settings-input"
                          value={voiceSettings.conversationTimeout}
                          min="5"
                          max="300"
                          onChange={e => saveVoiceSetting('conversationTimeout', parseInt(e.target.value) || 30)}
                        />
                      </div>

                      <div className="field-group">
                        <label>Silence Timeout (s)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="settings-input"
                          value={voiceSettings.silenceTimeout}
                          min="0.5"
                          max="10"
                          onChange={e => saveVoiceSetting('silenceTimeout', parseFloat(e.target.value) || 2.0)}
                        />
                      </div>

                      <div className="field-group">
                        <label>Noise Tolerance (RMS)</label>
                        <input
                          type="number"
                          className="settings-input"
                          value={voiceSettings.noiseTolerance}
                          min="50"
                          max="2000"
                          onChange={e => saveVoiceSetting('noiseTolerance', parseInt(e.target.value) || 300)}
                        />
                      </div>

                      <div className="field-group">
                        <label>Max Recording Time (s)</label>
                        <input
                          type="number"
                          className="settings-input"
                          value={voiceSettings.maxRecordingTime}
                          min="2"
                          max="60"
                          onChange={e => saveVoiceSetting('maxRecordingTime', parseInt(e.target.value) || 15)}
                        />
                      </div>

                      <div className="field-group">
                        <label>No-Speech Timeout (s)</label>
                        <input
                          type="number"
                          className="settings-input"
                          value={voiceSettings.noSpeechTimeout}
                          min="2"
                          max="30"
                          onChange={e => saveVoiceSetting('noSpeechTimeout', parseFloat(e.target.value) || 5.0)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: APPEARANCE ─────────────── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="section-title">
              <Palette size={18} />
              <span>3. Appearance</span>
            </div>
            <span className="section-badge">UI & Themes</span>
          </div>

          <div className="appearance-grid">
            <div className="settings-card appearance-card">
              <div className="appearance-card-left">
                <div className="appearance-title">Theme</div>
                <div className="appearance-desc">Dark mode interface enabled by default</div>
              </div>
              <div className="appearance-card-right">
                <select className="settings-select" disabled value="dark">
                  <option value="dark">Dark Theme (Active)</option>
                  <option value="light">Light Theme</option>
                  <option value="system">System Preference</option>
                </select>
              </div>
            </div>

            <div className="settings-card appearance-card">
              <div className="appearance-card-left">
                <div className="appearance-title">Accent Color</div>
                <div className="appearance-desc">Monochrome white accent system</div>
              </div>
              <div className="appearance-card-right">
                <div className="accent-color-preview">
                  <span className="color-swatch active" />
                  <span className="color-swatch coming-soon" title="Coming Soon" />
                  <span className="color-swatch coming-soon" title="Coming Soon" />
                </div>
              </div>
            </div>

            <div className="settings-card appearance-card">
              <div className="appearance-card-left">
                <div className="appearance-title">Animations & Transitions</div>
                <div className="appearance-desc">Smooth 180ms ease-out transitions</div>
              </div>
              <div className="appearance-card-right">
                <label className="settings-toggle-label">
                  <input type="checkbox" checked readOnly />
                  <span>Enabled</span>
                </label>
              </div>
            </div>

            <div className="settings-card appearance-card">
              <div className="appearance-card-left">
                <div className="appearance-title">Compact Mode</div>
                <div className="appearance-desc">Denser padding for smaller screens</div>
              </div>
              <div className="appearance-card-right">
                <span className="coming-soon-badge">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: CAPABILITY ROUTING ─────────────── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="section-title">
              <GitFork size={18} />
              <span>4. Capability Routing</span>
            </div>
            <span className="section-badge">Per-Task Rules</span>
          </div>

          <div className="settings-card">
            <CapabilityRoutingCards
              models={models}
              capabilityRoutes={capabilityRoutes}
              onRouteChange={handleRouteChange}
            />
          </div>
        </div>

        {/* ── SECTION 5: DATA MANAGEMENT ─────────────── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="section-title">
              <Database size={18} />
              <span>5. Data Management</span>
            </div>
            <span className="section-badge">Backup & Sync</span>
          </div>

          <div className="data-action-cards-grid">
            <div className="settings-card data-action-card">
              <div className="data-card-icon">
                <Download size={22} />
              </div>
              <div className="data-card-body">
                <h3>Export Backup</h3>
                <p>Download a full snapshot of your tasks, notes, memory facts, chat history, and settings.</p>
                <button
                  id="export-backup-btn"
                  type="button"
                  className="settings-action-btn primary"
                  onClick={exportBackup}
                >
                  <Download size={14} /> Export Backup JSON
                </button>
              </div>
            </div>

            <div className="settings-card data-action-card">
              <div className="data-card-icon">
                <Upload size={22} />
              </div>
              <div className="data-card-body">
                <h3>Restore Backup</h3>
                <p>Restore your environment from a previously exported backup file.</p>
                <button
                  id="restore-backup-btn"
                  type="button"
                  className="settings-action-btn secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={restoring}
                >
                  <Upload size={14} /> {restoring ? 'Restoring Data…' : 'Choose Backup File'}
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
        </div>

        {/* ── SECTION 6: PRIVACY ─────────────── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="section-title">
              <Shield size={18} />
              <span>6. Privacy & Security</span>
            </div>
            <span className="section-badge">Local First</span>
          </div>

          <div className="privacy-grid">
            <div className="settings-card privacy-card">
              <div className="privacy-card-left">
                <div className="privacy-title">Local Mode & Data Isolation</div>
                <div className="privacy-desc">All tasks, notes, and memory are stored locally on your machine</div>
              </div>
              <span className="privacy-active-badge">
                <Check size={12} /> Active
              </span>
            </div>

            <div className="settings-card privacy-card">
              <div className="privacy-card-left">
                <div className="privacy-title">Telemetry & Usage Analytics</div>
                <div className="privacy-desc">Anonymous app metrics reporting</div>
              </div>
              <span className="coming-soon-badge">Disabled</span>
            </div>

            <div className="settings-card privacy-card">
              <div className="privacy-card-left">
                <div className="privacy-title">Encrypted Cloud Sync</div>
                <div className="privacy-desc">End-to-end encrypted backup sync</div>
              </div>
              <span className="coming-soon-badge">Coming Soon</span>
            </div>
          </div>
        </div>

        {/* ── SECTION 7: KEYBOARD SHORTCUTS ─────────────── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="section-title">
              <Keyboard size={18} />
              <span>7. Keyboard Shortcuts</span>
            </div>
            <span className="section-badge">Hotkeys</span>
          </div>

          <div className="shortcuts-grid">
            <div className="settings-card shortcut-card">
              <span className="shortcut-desc">Open Command Palette</span>
              <kbd className="shortcut-key">Ctrl + K</kbd>
            </div>
            <div className="settings-card shortcut-card">
              <span className="shortcut-desc">New Chat Session</span>
              <kbd className="shortcut-key">Ctrl + N</kbd>
            </div>
            <div className="settings-card shortcut-card">
              <span className="shortcut-desc">Voice Assistant Trigger</span>
              <kbd className="shortcut-key">Ctrl + Shift + V</kbd>
            </div>
            <div className="settings-card shortcut-card">
              <span className="shortcut-desc">Open Settings</span>
              <kbd className="shortcut-key">Ctrl + ,</kbd>
            </div>
          </div>
        </div>

        {/* ── SECTION 8: ABOUT ─────────────── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="section-title">
              <Info size={18} />
              <span>8. About samGPT</span>
            </div>
            <span className="section-badge">Version Specs</span>
          </div>

          <div className="settings-card about-info-card">
            <div className="about-header">
              <div className="about-logo">
                <Sparkles size={24} />
              </div>
              <div className="about-title-group">
                <h2>samGPT Desktop AI Assistant</h2>
                <p>Commercial-grade agentic AI assistant platform</p>
              </div>
            </div>

            <div className="about-specs-grid">
              <div className="about-spec-row">
                <span className="spec-label">Application Version</span>
                <span className="spec-val">v1.0.0</span>
              </div>
              <div className="about-spec-row">
                <span className="spec-label">Electron Framework</span>
                <span className="spec-val">v28.0.0 (Chromium 120)</span>
              </div>
              <div className="about-spec-row">
                <span className="spec-label">React UI Engine</span>
                <span className="spec-val">v18.2.0</span>
              </div>
              <div className="about-spec-row">
                <span className="spec-label">Backend API Host</span>
                <span className="spec-val">{API}</span>
              </div>
              <div className="about-spec-row">
                <span className="spec-label">Storage Path</span>
                <span className="spec-val">~/.personal-agent/</span>
              </div>
              <div className="about-spec-row">
                <span className="spec-label">Model Registry</span>
                <span className="spec-val">{models.length} registered ({onlineCount} online)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}