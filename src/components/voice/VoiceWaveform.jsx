import { useRef, useEffect } from 'react';

// Radial perimeter waveform — drawn on a small canvas ring
// Placed below/behind the core in the layout as a surrounding ring visualization.
// Falls back gracefully if canvas is unavailable.

const SPOKE_COUNT = 48;
const TWO_PI = Math.PI * 2;

function drawWaveform(ctx, w, h, status, t) {
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  // Inner radius = center dead zone
  const innerR = Math.min(w, h) * 0.28;
  // Outer radius = max spoke tip
  const outerR = Math.min(w, h) * 0.46;

  for (let i = 0; i < SPOKE_COUNT; i++) {
    const angle = (i / SPOKE_COUNT) * TWO_PI - Math.PI / 2;
    const phase = (i / SPOKE_COUNT) * TWO_PI;

    // Spoke amplitude based on state
    const amplitude =
      status === 'listening'  ? 0.35 + 0.65 * Math.abs(Math.sin(phase * 2.3 + t * 0.0022)) :
      status === 'speaking'   ? 0.25 + 0.75 * Math.abs(Math.sin(phase * 1.8 + t * 0.0032)) :
      status === 'processing' ? 0.15 + 0.45 * Math.abs(Math.sin(phase * 3.1 + t * 0.0018)) :
      status === 'error'      ? 0.05 + 0.20 * Math.abs(Math.sin(phase + t * 0.0009)) :
                                0.04 + 0.06 * Math.abs(Math.sin(phase + t * 0.0004));

    const spokeLen = (outerR - innerR) * amplitude;
    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * (innerR + spokeLen);
    const y2 = cy + Math.sin(angle) * (innerR + spokeLen);

    // Opacity based on amplitude
    const opacity = status === 'idle' ? 0.12 + amplitude * 0.12 : 0.18 + amplitude * 0.38;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `rgba(200,200,200,${opacity})`;
    ctx.lineWidth = 0.7 + amplitude * 0.4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

export default function VoiceWaveform({ status }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    setup();

    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const t = ts - startRef.current;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // The surrounding voice UI remains fully usable without Canvas.
        rafRef.current = null;
        return;
      }

      const rect = canvas.getBoundingClientRect();
      try {
        drawWaveform(ctx, rect.width, rect.height, statusRef.current, reducedMotion ? 0 : t);
      } catch (e) {
        console.warn('[VoiceWaveform] draw error:', e);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const ro = new ResizeObserver(setup);
    ro.observe(canvas);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      className={`voice-waveform-container ${status}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
