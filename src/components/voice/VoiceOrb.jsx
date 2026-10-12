import { useRef, useEffect, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const TWO_PI = Math.PI * 2;

// State configuration — drives all visual parameters
const STATE_CONFIG = {
  idle: {
    baseRadius: 0.34,
    radiusAmplitude: 0.018,
    breathSpeed: 0.0004,
    particleSpeed: 0.12,
    particleOpacityMax: 0.45,
    innerDensity: 0.55,
    outerDensity: 0.45,
    deformAmplitude: 0.045,
    deformSpeed: 0.00025,
    highlightIntensity: 0.55,
    atmosphereOpacity: 0.06,
    innerVoidRadius: 0.36,
  },
  listening: {
    baseRadius: 0.38,
    radiusAmplitude: 0.032,
    breathSpeed: 0.0009,
    particleSpeed: 0.38,
    particleOpacityMax: 0.7,
    innerDensity: 0.7,
    outerDensity: 0.6,
    deformAmplitude: 0.065,
    deformSpeed: 0.0005,
    highlightIntensity: 0.8,
    atmosphereOpacity: 0.10,
    innerVoidRadius: 0.32,
  },
  processing: {
    baseRadius: 0.36,
    radiusAmplitude: 0.024,
    breathSpeed: 0.0007,
    particleSpeed: 0.28,
    particleOpacityMax: 0.62,
    innerDensity: 0.65,
    outerDensity: 0.55,
    deformAmplitude: 0.055,
    deformSpeed: 0.00045,
    highlightIntensity: 0.65,
    atmosphereOpacity: 0.08,
    innerVoidRadius: 0.34,
    rotationSpeed: 0.00018,
  },
  speaking: {
    baseRadius: 0.37,
    radiusAmplitude: 0.038,
    breathSpeed: 0.0011,
    particleSpeed: 0.32,
    particleOpacityMax: 0.75,
    innerDensity: 0.68,
    outerDensity: 0.58,
    deformAmplitude: 0.07,
    deformSpeed: 0.00055,
    highlightIntensity: 0.9,
    atmosphereOpacity: 0.12,
    innerVoidRadius: 0.30,
  },
  error: {
    baseRadius: 0.33,
    radiusAmplitude: 0.015,
    breathSpeed: 0.0006,
    particleSpeed: 0.2,
    particleOpacityMax: 0.4,
    innerDensity: 0.45,
    outerDensity: 0.38,
    deformAmplitude: 0.09,
    deformSpeed: 0.0007,
    highlightIntensity: 0.35,
    atmosphereOpacity: 0.04,
    innerVoidRadius: 0.38,
    turbulence: 0.04,
  },
};

// ─── Particle ─────────────────────────────────────────────────────────────────

function createParticle(canvasW, canvasH, cx, cy, maxR, layer) {
  // layer: 'inner' | 'shell' | 'specular' | 'atmosphere'
  const angle = Math.random() * TWO_PI;
  let r;

  if (layer === 'inner') {
    r = maxR * (0.36 + Math.random() * 0.28); // mid-field
  } else if (layer === 'shell') {
    r = maxR * (0.62 + Math.random() * 0.22); // near shell boundary
  } else if (layer === 'specular') {
    r = maxR * (0.55 + Math.random() * 0.35); // distributed
  } else {
    r = maxR * (0.90 + Math.random() * 0.55); // atmospheric haze
  }

  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
    r, // current radius from center
    angle,
    baseRadius: r,
    size: layer === 'specular'
      ? 0.6 + Math.random() * 1.2
      : layer === 'atmosphere'
        ? 0.3 + Math.random() * 0.5
        : 0.25 + Math.random() * 0.75,
    opacity: Math.random() * 0.5 + 0.1,
    phase: Math.random() * TWO_PI,
    phaseSpeed: (Math.random() * 0.4 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
    orbitSpeed: (Math.random() * 0.15 + 0.02) * (Math.random() > 0.5 ? 1 : -1),
    noiseOffset: Math.random() * 100,
    layer,
    depth: Math.random(), // simulated z-depth 0..1
    brightness: layer === 'specular' ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4,
    radialDrift: (Math.random() - 0.5) * 0.002,
  };
}

function buildParticleSystem(canvasW, canvasH) {
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const maxR = Math.min(canvasW, canvasH) * 0.44;
  const particles = [];

  const counts = {
    inner: 160,
    shell: 140,
    specular: 40,
    atmosphere: 60,
  };

  for (const [layer, count] of Object.entries(counts)) {
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(canvasW, canvasH, cx, cy, maxR, layer));
    }
  }

  return { particles, cx, cy, maxR };
}

// ─── Noise helpers ────────────────────────────────────────────────────────────

// Simple deterministic smooth noise (no library needed)
function smoothNoise(x) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f); // smoothstep
  // Random-ish hash
  const a = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  const b = Math.sin((i + 1) * 127.1 + 311.7) * 43758.5453;
  return (a - Math.floor(a)) * (1 - u) + (b - Math.floor(b)) * u;
}

// Compute organic shell radius at a given angle using layered noise
function shellRadius(angle, t, deformAmplitude, deformSpeed) {
  const n1 = smoothNoise(angle * 1.8 + t * deformSpeed * 60) * deformAmplitude;
  const n2 = smoothNoise(angle * 3.1 + t * deformSpeed * 40 + 5.3) * deformAmplitude * 0.45;
  const n3 = smoothNoise(angle * 5.2 + t * deformSpeed * 80 + 11.1) * deformAmplitude * 0.22;
  return 1.0 + n1 + n2 + n3;
}

// ─── Main Draw Loop ───────────────────────────────────────────────────────────

function drawCore(ctx, canvasW, canvasH, system, cfg, t, dpr, reducedMotion) {
  const { particles, cx, cy, maxR } = system;

  ctx.clearRect(0, 0, canvasW, canvasH);

  // ── Background black void (center gradient) ──────────────────────────────
  const breathFactor = reducedMotion
    ? cfg.baseRadius
    : cfg.baseRadius + Math.sin(t * cfg.breathSpeed * 1000) * cfg.radiusAmplitude;

  const voidR = maxR * breathFactor * cfg.innerVoidRadius;
  const voidGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, voidR);
  voidGrad.addColorStop(0, 'rgba(0,0,0,1)');
  voidGrad.addColorStop(0.6, 'rgba(2,2,2,0.98)');
  voidGrad.addColorStop(1, 'rgba(4,4,4,0)');
  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, voidR * 1.3, 0, TWO_PI);
  ctx.fill();

  // ── Draw atmospheric field (outermost, very faint) ───────────────────────
  const atmR = maxR * breathFactor * 1.35;
  const atmGrad = ctx.createRadialGradient(cx, cy, maxR * breathFactor * 0.85, cx, cy, atmR);
  atmGrad.addColorStop(0, `rgba(255,255,255,${cfg.atmosphereOpacity})`);
  atmGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = atmGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, atmR, 0, TWO_PI);
  ctx.fill();

  // ── Draw organic shell path (translucent boundary) ────────────────────────
  const coreR = maxR * breathFactor;
  ctx.save();
  ctx.globalAlpha = 0.22;

  const shellGrad = ctx.createRadialGradient(cx, cy, coreR * 0.72, cx, cy, coreR * 1.04);
  shellGrad.addColorStop(0, 'rgba(255,255,255,0)');
  shellGrad.addColorStop(0.55, `rgba(200,200,200,${cfg.highlightIntensity * 0.18})`);
  shellGrad.addColorStop(0.85, `rgba(255,255,255,${cfg.highlightIntensity * 0.12})`);
  shellGrad.addColorStop(1, 'rgba(255,255,255,0)');

  // Draw shell shape with organic deformation
  ctx.beginPath();
  const shellSteps = 96;
  for (let i = 0; i <= shellSteps; i++) {
    const ang = (i / shellSteps) * TWO_PI;
    const turbulence = cfg.turbulence ? (smoothNoise(ang * 2.3 + t * 0.001 * 60) - 0.5) * cfg.turbulence : 0;
    const sr = shellRadius(ang, t, cfg.deformAmplitude, cfg.deformSpeed) + turbulence;
    const pr = coreR * sr;
    const px = cx + Math.cos(ang) * pr;
    const py = cy + Math.sin(ang) * pr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = shellGrad;
  ctx.fill();
  ctx.restore();

  // Shell rim stroke (very faint)
  ctx.save();
  ctx.globalAlpha = 0.10 + cfg.highlightIntensity * 0.08;
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let i = 0; i <= shellSteps; i++) {
    const ang = (i / shellSteps) * TWO_PI;
    const turbulence = cfg.turbulence ? (smoothNoise(ang * 2.3 + t * 0.001 * 60) - 0.5) * cfg.turbulence : 0;
    const sr = shellRadius(ang, t, cfg.deformAmplitude, cfg.deformSpeed) + turbulence;
    const pr = coreR * sr;
    const px = cx + Math.cos(ang) * pr;
    const py = cy + Math.sin(ang) * pr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // ── Processing state: circulation overlay ──────────────────────────────────
  if (cfg.rotationSpeed && !reducedMotion) {
    ctx.save();
    ctx.globalAlpha = 0.04;
    const angle = t * cfg.rotationSpeed * 1000;
    const circGrad = ctx.createConicalGradient
      ? ctx.createConicalGradient(cx, cy, angle)
      : null;
    if (!circGrad) {
      // Fallback: rotating arc
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = coreR * 0.08;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.7, angle, angle + Math.PI * 0.8);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Particles ──────────────────────────────────────────────────────────────
  const voidBoundary = maxR * breathFactor * cfg.innerVoidRadius * 0.9;

  for (const p of particles) {
    // Update particle position
    if (!reducedMotion) {
      // Orbital drift
      p.angle += p.orbitSpeed * cfg.particleSpeed * 0.0012;
      // Phase oscillation (radial breathing)
      p.phase += p.phaseSpeed * 0.008;
      // Radial drift
      const radialPulse = Math.sin(p.phase) * 0.015 * coreR;
      p.r = p.baseRadius + radialPulse + Math.sin(t * 0.00038 + p.noiseOffset) * coreR * 0.04;
    }

    // Shell modulation: particles cluster around shell boundary
    if (p.layer === 'shell') {
      const shellAt = shellRadius(p.angle, t, cfg.deformAmplitude, cfg.deformSpeed);
      const targetR = coreR * shellAt * (0.88 + p.depth * 0.22);
      p.r += (targetR - p.r) * 0.018;
    }

    const px = cx + Math.cos(p.angle) * p.r;
    const py = cy + Math.sin(p.angle) * p.r;

    // Skip particles inside the void
    const distFromCenter = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    if (distFromCenter < voidBoundary && p.layer !== 'atmosphere') continue;

    // Opacity: depth + state + opacity oscillation
    let opacity = p.opacity * cfg.particleOpacityMax;
    if (!reducedMotion) {
      opacity *= 0.6 + 0.4 * Math.sin(p.phase * 0.7 + t * 0.0003);
    }
    // Fade at void boundary
    const voidEdge = voidBoundary * 1.2;
    if (distFromCenter < voidEdge) {
      opacity *= (distFromCenter - voidBoundary) / (voidEdge - voidBoundary);
    }
    // Atmosphere particles fade with distance
    if (p.layer === 'atmosphere') {
      const atmFade = 1 - Math.max(0, (p.r - coreR * 0.95) / (coreR * 0.55));
      opacity *= atmFade * 0.5;
    }

    if (opacity <= 0.005) continue;

    // Brightness/color
    let brightness;
    if (p.layer === 'specular') {
      brightness = p.brightness * cfg.highlightIntensity;
      const bv = Math.floor(Math.min(255, brightness * 255));
      ctx.fillStyle = `rgba(${bv},${bv},${bv},${Math.min(1, opacity * 1.4)})`;
    } else if (p.layer === 'atmosphere') {
      ctx.fillStyle = `rgba(160,160,160,${opacity * cfg.atmosphereOpacity * 4})`;
    } else {
      const bv = Math.floor(80 + p.brightness * cfg.highlightIntensity * 140);
      ctx.fillStyle = `rgba(${bv},${bv},${bv},${opacity})`;
    }

    ctx.beginPath();
    ctx.arc(px, py, p.size * (0.7 + p.depth * 0.6), 0, TWO_PI);
    ctx.fill();
  }

  // ── Specular highlight (upper-left internal light source) ─────────────────
  const specX = cx - coreR * 0.22;
  const specY = cy - coreR * 0.28;
  const specR = coreR * 0.38;
  const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
  specGrad.addColorStop(0, `rgba(255,255,255,${cfg.highlightIntensity * 0.12})`);
  specGrad.addColorStop(0.5, `rgba(255,255,255,${cfg.highlightIntensity * 0.04})`);
  specGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(specX, specY, specR, 0, TWO_PI);
  ctx.fill();
  ctx.restore();

  // ── Inner void depth (re-darken center to ensure depth) ──────────────────
  const deepVoid = ctx.createRadialGradient(cx, cy, 0, cx, cy, voidR * 0.85);
  deepVoid.addColorStop(0, 'rgba(0,0,0,0.92)');
  deepVoid.addColorStop(0.7, 'rgba(0,0,0,0.6)');
  deepVoid.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = deepVoid;
  ctx.beginPath();
  ctx.arc(cx, cy, voidR * 0.85, 0, TWO_PI);
  ctx.fill();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VoiceOrb({ status, onClick }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const systemRef = useRef(null);
  const startTimeRef = useRef(null);
  const statusRef = useRef(status);

  // Keep statusRef in sync without restarting the animation loop
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Build particle system on mount / resize
  const initSystem = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    systemRef.current = buildParticleSystem(rect.width, rect.height);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initSystem();

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const t = timestamp - startTimeRef.current;

      const ctx = canvas.getContext('2d');
      const system = systemRef.current;
      if (!ctx || !system) {
        // Canvas is strictly an enhancement. Do not retain an animation loop
        // when Chromium cannot provide a 2D context.
        rafRef.current = null;
        return;
      }

      const currentStatus = statusRef.current;
      const cfg = STATE_CONFIG[currentStatus] || STATE_CONFIG.idle;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();

      try {
        drawCore(ctx, rect.width, rect.height, system, cfg, t, dpr, reducedMotion);
      } catch (err) {
        // Never crash the voice experience due to canvas error
        console.warn('[VoiceOrb] Canvas draw error (non-fatal):', err);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // Resize observer
    const ro = new ResizeObserver(() => {
      initSystem();
    });
    ro.observe(canvas);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [initSystem]);

  return (
    <div
      className="voice-orb-wrapper"
      role="button"
      aria-label={`samGPT Intelligence Core — current state: ${status}. Click to interact.`}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className={`voice-intelligence-canvas ${status}`}
        aria-hidden="true"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
