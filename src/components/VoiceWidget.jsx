import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useDesktopBridge } from '../desktop/useDesktopBridge';
import './VoiceWidget.css';

const API = 'http://localhost:3001';

// ─── Mini Intelligence Core (canvas) ─────────────────────────────────────────

const TWO_PI = Math.PI * 2;

function drawMiniCore(ctx, w, h, status, t) {
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) * 0.42;

  // State parameters
  let breathAmp, breathSpeed, particleOpacity, particleSpeed, highlightAlpha;
  switch (status) {
    case 'listening':
      breathAmp = 0.06; breathSpeed = 0.0014; particleOpacity = 0.72; particleSpeed = 0.6; highlightAlpha = 0.22;
      break;
    case 'speaking':
      breathAmp = 0.07; breathSpeed = 0.0016; particleOpacity = 0.78; particleSpeed = 0.55; highlightAlpha = 0.28;
      break;
    case 'processing':
      breathAmp = 0.04; breathSpeed = 0.001; particleOpacity = 0.58; particleSpeed = 0.42; highlightAlpha = 0.18;
      break;
    case 'error':
      breathAmp = 0.025; breathSpeed = 0.0008; particleOpacity = 0.3; particleSpeed = 0.2; highlightAlpha = 0.08;
      break;
    default: // idle
      breathAmp = 0.025; breathSpeed = 0.0005; particleOpacity = 0.38; particleSpeed = 0.15; highlightAlpha = 0.1;
  }

  const radius = maxR * (0.8 + Math.sin(t * breathSpeed * 1000) * breathAmp);

  // Atmospheric glow
  const atmGrad = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.5);
  atmGrad.addColorStop(0, `rgba(180,180,180,${highlightAlpha * 0.3})`);
  atmGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = atmGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.5, 0, TWO_PI);
  ctx.fill();

  // Organic boundary (simplified — just 2 noise waves)
  ctx.save();
  ctx.globalAlpha = 0.18;
  const shellGrad = ctx.createRadialGradient(cx, cy, radius * 0.65, cx, cy, radius * 1.05);
  shellGrad.addColorStop(0, 'rgba(255,255,255,0)');
  shellGrad.addColorStop(0.7, `rgba(200,200,200,${highlightAlpha})`);
  shellGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const ang = (i / steps) * TWO_PI;
    const n1 = Math.sin(ang * 2.3 + t * 0.00025 * 60) * 0.06;
    const n2 = Math.sin(ang * 4.1 + t * 0.00018 * 60) * 0.028;
    const pr = radius * (1 + n1 + n2);
    const px = cx + Math.cos(ang) * pr;
    const py = cy + Math.sin(ang) * pr;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = shellGrad;
  ctx.fill();
  ctx.restore();

  // Particles (~30 for mini widget)
  const seed = 42;
  for (let i = 0; i < 30; i++) {
    const baseAngle = (i / 30) * TWO_PI + seed;
    const angle = baseAngle + Math.sin(t * particleSpeed * 0.0004 + i * 0.8) * 0.3;
    const layerFrac = 0.52 + (i % 5) * 0.1;
    const r = radius * layerFrac;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    const distFromCenter = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    const voidR = radius * 0.32;
    if (distFromCenter < voidR) continue;
    const particleSize = 0.5 + (i % 3) * 0.3;
    const opacityMod = 0.4 + 0.6 * Math.abs(Math.sin(i * 1.3 + t * 0.0008));
    ctx.fillStyle = `rgba(200,200,200,${particleOpacity * opacityMod})`;
    ctx.beginPath();
    ctx.arc(px, py, particleSize, 0, TWO_PI);
    ctx.fill();
  }

  // Specular highlight
  const specGrad = ctx.createRadialGradient(
    cx - radius * 0.18, cy - radius * 0.22, 0,
    cx - radius * 0.18, cy - radius * 0.22, radius * 0.32
  );
  specGrad.addColorStop(0, `rgba(255,255,255,${highlightAlpha * 1.2})`);
  specGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.fill();
  ctx.restore();

  // Deep void (re-darken center)
  const voidGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.4);
  voidGrad.addColorStop(0, 'rgba(0,0,0,0.95)');
  voidGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.4, 0, TWO_PI);
  ctx.fill();
}

// ─── VoiceWidget Component ────────────────────────────────────────────────────

export default function VoiceWidget() {
  const { isElectron, desktopAPI } = useDesktopBridge();
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('idle');
  const [settings, setSettings] = useState(null);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const statusRef = useRef(status);
  const listenTimerRef = useRef(null);

  useEffect(() => { statusRef.current = status; }, [status]);

  // ── Load Settings ────────────────────────────────────────────────────────
  useEffect(() => {
    let isCurrent = true;

    axios.get(`${API}/settings`)
      .then(({ data }) => {
        if (isCurrent) setSettings(data);
      })
      .catch(err => console.error('[VoiceWidget] Failed to load settings:', err));

    return () => { isCurrent = false; };
  }, []);

  useEffect(() => () => {
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
  }, []);

  // ── Mini core canvas loop ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const t = ts - startRef.current;
      const ctx2 = canvas.getContext('2d');
      const r2 = canvas.getBoundingClientRect();
      if (!ctx2) {
        rafRef.current = null;
        return;
      }
      try {
        drawMiniCore(ctx2, r2.width, r2.height, statusRef.current, reducedMotion ? 0 : t);
      } catch (e) {
        console.warn('[VoiceWidget] canvas draw error:', e);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // ── Toggle Voice Activation ──────────────────────────────────────────────
  const toggleVoiceMode = useCallback(() => {
    if (!isElectron) return;
    if (isActive) {
      desktopAPI.stopSpeaking();
      desktopAPI.cancelListening();
      setIsActive(false);
      setStatus('idle');
      desktopAPI.toggleVoice();
      toast.success('Voice Assistant deactivated');
    } else {
      setIsActive(true);
      desktopAPI.toggleVoice();
      listenTimerRef.current = setTimeout(() => {
        desktopAPI.startListening();
        listenTimerRef.current = null;
      }, 150);
      toast.success('samGPT Voice Assistant active');
    }
  }, [isElectron, isActive, desktopAPI]);

  // ── Save Setting Helper ──────────────────────────────────────────────────
  const updateSetting = useCallback(async (key, value) => {
    if (!settings) return;
    setSettings(prev => ({ ...prev, [key]: value }));
    try {
      await axios.post(`${API}/settings`, { [key]: value });
      if (desktopAPI?.voiceSettingsChanged) desktopAPI.voiceSettingsChanged();
    } catch (err) {
      console.error('[VoiceWidget] Failed to update setting:', err);
    }
  }, [desktopAPI, settings]);

  // ── IPC Handlers ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isElectron) return;

    const unsubState = desktopAPI.onVoiceStateChange(({ state }) => {
      setStatus(state);
    });

    const unsubCommand = desktopAPI.onVoiceCommand(async ({ action }) => {
      if (action === 'start-conversation') {
        if (!isActive) toggleVoiceMode();
        await updateSetting('conversationMode', true);
      } else if (action === 'stop-conversation') {
        if (isActive) toggleVoiceMode();
      } else if (action === 'push-to-talk') {
        if (!isActive) toggleVoiceMode();
        await updateSetting('pushToTalk', true);
      } else if (action === 'mute') {
        desktopAPI.stopSpeaking();
      } else if (action === 'unmute') {
        desktopAPI.resumeSpeaking();
      }
    });

    return () => { unsubState(); unsubCommand(); };
  }, [isElectron, desktopAPI, isActive, toggleVoiceMode, updateSetting]);

  if (!isElectron) return null;

  const handleMicClick = () => {
    if (!isActive) {
      toggleVoiceMode();
    } else {
      if (status === 'idle') {
        desktopAPI.startListening();
      } else if (status === 'listening') {
        desktopAPI.cancelListening();
      } else if (status === 'speaking') {
        desktopAPI.stopSpeaking();
      }
    }
  };

  return (
    <div className="voice-widget-launcher-container">
      <motion.button
        type="button"
        className={`voice-launcher-btn ${isActive ? 'active' : ''} ${status}`}
        onClick={handleMicClick}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        title={isActive ? `Voice mode: ${status}` : 'Activate Voice Assistant'}
      >
        {/* Mini intelligence core canvas */}
        <canvas
          ref={canvasRef}
          className="voice-widget-mini-canvas"
          aria-hidden="true"
          width={36}
          height={36}
          style={{ width: 36, height: 36 }}
        />
        {/* Outer glow ring */}
        <span className={`voice-widget-ring ${status}`} aria-hidden="true" />
        {/* Status label */}
        <span className="voice-launcher-label" aria-label={`Voice: ${status}`}>
          {status === 'listening' ? 'Listening' : status === 'speaking' ? 'Speaking' : status === 'processing' ? 'Thinking' : 'Voice'}
        </span>
      </motion.button>
    </div>
  );
}
