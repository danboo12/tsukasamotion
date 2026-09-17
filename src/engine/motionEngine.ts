import { Project, Layer, EvaluatedTransform, ShapeKind } from '../types/motion';
import { getEasing } from './easing';

/**
 * Calculates the interpolated transform of a layer at a given time t (in seconds).
 */
export function evaluateLayerAtTime(
  layer: Layer,
  t: number
): EvaluatedTransform {
  // If layer is outside its active range (before start or after start + duration)
  if (t < layer.startTime || t > layer.startTime + layer.duration) {
    return {
      x: layer.x,
      y: layer.y,
      scale: layer.scale,
      rotation: layer.rotation,
      opacity: 0,
      blur: 0,
      isVisible: false,
    };
  }

  const localTime = t - layer.startTime;
  const inDuration = Math.max(0.01, layer.inDuration);
  const outDuration = Math.max(0.01, layer.outDuration);
  const outStartTime = layer.duration - outDuration;

  let currentX = layer.x;
  let currentY = layer.y;
  let currentScale = layer.scale;
  let currentRotation = layer.rotation;
  let currentOpacity = layer.opacity;
  let currentBlur = 0;
  let kineticOffset = 0;

  // 1. IN-ANIMATION PHASE (0 <= localTime < inDuration)
  if (localTime < inDuration && layer.inAnimation !== 'none') {
    const rawProgress = Math.min(1, Math.max(0, localTime / inDuration));
    const easeFn = getEasing(layer.inEasing);
    const progress = easeFn(rawProgress);

    switch (layer.inAnimation) {
      case 'fade-in':
        currentOpacity = layer.opacity * progress;
        break;

      case 'slide-up':
        currentY = layer.y + (1 - progress) * 25; // starts 25% lower
        currentOpacity = layer.opacity * Math.min(1, progress * 1.4);
        break;

      case 'slide-down':
        currentY = layer.y - (1 - progress) * 25;
        currentOpacity = layer.opacity * Math.min(1, progress * 1.4);
        break;

      case 'slide-left':
        currentX = layer.x + (1 - progress) * 35;
        currentOpacity = layer.opacity * Math.min(1, progress * 1.4);
        break;

      case 'slide-right':
        currentX = layer.x - (1 - progress) * 35;
        currentOpacity = layer.opacity * Math.min(1, progress * 1.4);
        break;

      case 'pop-bounce':
        // Starts very small (0.1), bounces to full scale
        currentScale = layer.scale * (0.1 + 0.9 * progress);
        currentOpacity = layer.opacity * Math.min(1, rawProgress * 2.5);
        break;

      case 'blur-in':
        currentBlur = (1 - progress) * 16;
        currentOpacity = layer.opacity * progress;
        currentScale = layer.scale * (1.15 - 0.15 * progress);
        break;

      case 'elastic-drop':
        currentY = layer.y - (1 - progress) * 40;
        currentScale = layer.scale * (0.8 + 0.2 * progress);
        currentOpacity = layer.opacity * Math.min(1, rawProgress * 3);
        break;

      case 'kinetic-stagger':
        kineticOffset = (1 - progress) * 30;
        currentOpacity = layer.opacity * progress;
        break;
    }
  }

  // 2. ACTIVE / LOOP ANIMATION PHASE (when past in-animation, before out-animation)
  if (layer.loopAnimation !== 'none') {
    const speed = layer.loopSpeed || 1.0;
    const loopCycle = localTime * speed * Math.PI * 2;

    switch (layer.loopAnimation) {
      case 'float':
        // Gentle up/down floating motion
        currentY += Math.sin(loopCycle * 0.8) * 2.5;
        currentRotation += Math.sin(loopCycle * 0.4) * 1.5;
        break;

      case 'pulse':
        // Subtle rhythmic heartbeat scale
        currentScale *= 1 + Math.sin(loopCycle * 1.5) * 0.06;
        break;

      case 'spin':
        // Continuous rotation
        currentRotation += ((localTime * speed * 90) % 360);
        break;

      case 'wiggle':
        // Jittery energetic wiggle
        currentRotation += Math.sin(loopCycle * 3.5) * 4;
        currentX += Math.cos(loopCycle * 4) * 0.8;
        break;

      case 'wave':
        currentX += Math.sin(loopCycle * 1.2) * 2;
        currentY += Math.cos(loopCycle * 1.2) * 1.5;
        break;

      case 'breathing':
        currentScale *= 1 + Math.sin(loopCycle * 0.6) * 0.04;
        currentOpacity *= 0.9 + 0.1 * Math.sin(loopCycle * 0.6);
        break;

      case 'glow-pulse':
        currentScale *= 1 + Math.sin(loopCycle * 2) * 0.08;
        break;
    }
  }

  // 3. OUT-ANIMATION PHASE (localTime >= outStartTime)
  if (localTime >= outStartTime && layer.outAnimation !== 'none') {
    const rawProgress = Math.min(1, Math.max(0, (localTime - outStartTime) / outDuration));
    const easeFn = getEasing('easeOutQuad');
    const progress = easeFn(rawProgress);

    switch (layer.outAnimation) {
      case 'fade-out':
        currentOpacity *= 1 - progress;
        break;

      case 'slide-up':
        currentY -= progress * 25;
        currentOpacity *= 1 - progress;
        break;

      case 'slide-down':
        currentY += progress * 25;
        currentOpacity *= 1 - progress;
        break;

      case 'slide-left':
        currentX -= progress * 35;
        currentOpacity *= 1 - progress;
        break;

      case 'slide-right':
        currentX += progress * 35;
        currentOpacity *= 1 - progress;
        break;

      case 'scale-down':
        currentScale *= Math.max(0, 1 - progress);
        currentOpacity *= 1 - progress;
        break;

      case 'blur-out':
        currentBlur = Math.max(currentBlur, progress * 16);
        currentOpacity *= 1 - progress;
        break;
    }
  }

  return {
    x: currentX,
    y: currentY,
    scale: Math.max(0.001, currentScale),
    rotation: currentRotation,
    opacity: Math.max(0, Math.min(1, currentOpacity)),
    blur: currentBlur,
    kineticOffset,
    isVisible: currentOpacity > 0.001,
  };
}

/**
 * Draws the dynamic background on the canvas
 */
export function renderBackground(
  ctx: CanvasRenderingContext2D,
  project: Project,
  t: number,
  width: number,
  height: number
) {
  ctx.save();

  // Background Fill
  if (project.backgroundGradient?.enabled) {
    const angleRad = ((project.backgroundGradient.angle || 0) * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.sqrt(cx * cx + cy * cy);
    const x0 = cx - Math.cos(angleRad) * r;
    const y0 = cy - Math.sin(angleRad) * r;
    const x1 = cx + Math.cos(angleRad) * r;
    const y1 = cy + Math.sin(angleRad) * r;

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, project.backgroundGradient.color1 || '#0f172a');
    grad.addColorStop(1, project.backgroundGradient.color2 || '#020617');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = project.backgroundColor || '#0a0a0c';
  }
  ctx.fillRect(0, 0, width, height);

  // Background Motion FX
  if (project.backgroundMotion === 'grid-flow') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    const gridSize = 60 * (width / 1920);
    const offsetY = (t * 40 * (height / 1080)) % gridSize;

    ctx.beginPath();
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    // Flowing horizontal lines
    for (let y = offsetY; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Perspective horizon accent glow
    const glowGrad = ctx.createRadialGradient(width / 2, height, 50, width / 2, height, width * 0.8);
    glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
    glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (project.backgroundMotion === 'starfield') {
    // Deterministic pseudo-random stars based on fixed seed + drift
    const starCount = 80;
    for (let i = 0; i < starCount; i++) {
      const seedX = (Math.sin(i * 997) * 10000) % 1;
      const seedY = (Math.cos(i * 543) * 10000) % 1;
      const posX = ((seedX + 1) / 2 * width + t * 15 * ((i % 3) + 1)) % width;
      const posY = (seedY + 1) / 2 * height;
      const radius = (1 + (i % 3)) * (width / 1920);
      const twinkle = 0.3 + 0.7 * Math.sin(t * 3 + i);

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, twinkle * 0.6)})`;
      ctx.beginPath();
      ctx.arc(posX, posY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (project.backgroundMotion === 'gradient-shift') {
    // Pulsing colored ambient orbs
    const orb1X = width * 0.3 + Math.sin(t * 0.8) * width * 0.15;
    const orb1Y = height * 0.3 + Math.cos(t * 0.6) * height * 0.15;
    const rad1 = width * 0.45;
    const g1 = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, rad1);
    g1.addColorStop(0, 'rgba(139, 92, 246, 0.22)');
    g1.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    const orb2X = width * 0.7 + Math.cos(t * 0.7) * width * 0.15;
    const orb2Y = height * 0.7 + Math.sin(t * 0.9) * height * 0.15;
    const rad2 = width * 0.5;
    const g2 = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, rad2);
    g2.addColorStop(0, 'rgba(236, 72, 153, 0.18)');
    g2.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);
  } else if (project.backgroundMotion === 'radial-pulse') {
    const pulseRad = (width * 0.25) * (1 + 0.2 * Math.sin(t * 2));
    const pulseGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, pulseRad);
    pulseGrad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
    pulseGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = pulseGrad;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

/**
 * Renders a single layer on canvas
 */
export function renderLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  t: number,
  canvasWidth: number,
  canvasHeight: number
) {
  const transform = evaluateLayerAtTime(layer, t);
  if (!transform.isVisible || transform.opacity <= 0) return;

  const scaleFactor = canvasWidth / 1920; // Normalizer based on 1080p full width
  const pixelX = (transform.x / 100) * canvasWidth;
  const pixelY = (transform.y / 100) * canvasHeight;

  ctx.save();
  ctx.translate(pixelX, pixelY);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.scale, transform.scale);
  ctx.globalAlpha = transform.opacity;

  if (transform.blur > 0.5) {
    ctx.filter = `blur(${transform.blur * scaleFactor}px)`;
  }

  switch (layer.type) {
    case 'text':
      renderTextLayer(ctx, layer, transform, scaleFactor);
      break;
    case 'shape':
      renderShapeLayer(ctx, layer, scaleFactor);
      break;
    case 'badge':
      renderBadgeLayer(ctx, layer, scaleFactor);
      break;
    case 'glow-ring':
      renderGlowRingLayer(ctx, layer, t, scaleFactor);
      break;
    case 'particles':
      renderParticlesLayer(ctx, layer, t, canvasWidth, canvasHeight, scaleFactor);
      break;
  }

  ctx.restore();
}

function renderTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  transform: EvaluatedTransform,
  scaleFactor: number
) {
  const text = layer.text || 'Motion Studio';
  const fontSize = (layer.fontSize || 64) * scaleFactor;
  const fontWeight = layer.fontWeight || 800;
  const fontFamily = layer.fontFamily || 'Outfit, sans-serif';

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = layer.textAlign || 'center';
  ctx.textBaseline = 'middle';

  // Text Shadow
  if (layer.textShadow) {
    ctx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 18 * scaleFactor;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6 * scaleFactor;
  }

  // Handle Multi-line Text
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.25;
  const totalBlockHeight = lines.length * lineHeight;
  const startY = -(totalBlockHeight / 2) + lineHeight / 2;

  lines.forEach((line, index) => {
    const yPos = startY + index * lineHeight;

    // Fill style (Solid or Linear Gradient)
    if (layer.textGradient?.enabled) {
      const metrics = ctx.measureText(line);
      const textW = metrics.width || 200;
      const angleRad = ((layer.textGradient.angle || 90) * Math.PI) / 180;
      const grad = ctx.createLinearGradient(
        -textW / 2 * Math.cos(angleRad),
        -fontSize * Math.sin(angleRad),
        textW / 2 * Math.cos(angleRad),
        fontSize * Math.sin(angleRad)
      );
      grad.addColorStop(0, layer.textGradient.color1 || '#38bdf8');
      grad.addColorStop(1, layer.textGradient.color2 || '#a855f7');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = layer.textColor || '#ffffff';
    }

    // Kinetic offset stagger for characters if applicable
    if (transform.kineticOffset && transform.kineticOffset > 0) {
      ctx.fillText(line, 0, yPos + transform.kineticOffset);
    } else {
      ctx.fillText(line, 0, yPos);
    }
  });
}

function renderShapeLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  scaleFactor: number
) {
  const w = (layer.width || 300) * scaleFactor;
  const h = (layer.height || 180) * scaleFactor;
  const kind: ShapeKind = layer.shapeKind || 'rect';

  // Fill Gradient or Solid
  if (layer.shapeGradient?.enabled) {
    const angleRad = ((layer.shapeGradient.angle || 45) * Math.PI) / 180;
    const grad = ctx.createLinearGradient(
      (-w / 2) * Math.cos(angleRad),
      (-h / 2) * Math.sin(angleRad),
      (w / 2) * Math.cos(angleRad),
      (h / 2) * Math.sin(angleRad)
    );
    grad.addColorStop(0, layer.shapeGradient.color1 || '#6366f1');
    grad.addColorStop(1, layer.shapeGradient.color2 || '#ec4899');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = layer.fillColor || '#4f46e5';
  }

  ctx.strokeStyle = layer.strokeColor || 'transparent';
  ctx.lineWidth = (layer.strokeWidth || 0) * scaleFactor;

  ctx.beginPath();
  switch (kind) {
    case 'rect': {
      const radius = (layer.borderRadius || 16) * scaleFactor;
      drawRoundedRect(ctx, -w / 2, -h / 2, w, h, radius);
      break;
    }
    case 'pill': {
      const radius = Math.min(w, h) / 2;
      drawRoundedRect(ctx, -w / 2, -h / 2, w, h, radius);
      break;
    }
    case 'circle': {
      const radius = Math.min(w, h) / 2;
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      break;
    }
    case 'donut': {
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.65;
      ctx.arc(0, 0, outerR, 0, Math.PI * 2);
      ctx.arc(0, 0, innerR, 0, Math.PI * 2, true);
      break;
    }
    case 'triangle': {
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();
      break;
    }
    case 'star': {
      const spikes = 5;
      const outerRadius = Math.min(w, h) / 2;
      const innerRadius = outerRadius * 0.45;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      ctx.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        let x = Math.cos(rot) * outerRadius;
        let y = Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(0, -outerRadius);
      ctx.closePath();
      break;
    }
    case 'hexagon': {
      const r = Math.min(w, h) / 2;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
  }

  ctx.fill();
  if (layer.strokeWidth && layer.strokeWidth > 0) {
    ctx.stroke();
  }
}

function renderBadgeLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  scaleFactor: number
) {
  const text = layer.badgeText || 'FEATURE ANNOUNCEMENT';
  const subtext = layer.badgeSubtext || '';
  const bgColor = layer.badgeBgColor || 'rgba(15, 23, 42, 0.85)';
  const borderColor = layer.badgeBorderColor || 'rgba(56, 189, 248, 0.4)';
  const textColor = layer.badgeTextColor || '#38bdf8';

  const padX = 24 * scaleFactor;
  const padY = 12 * scaleFactor;
  const fontSize = 20 * scaleFactor;

  ctx.font = `700 ${fontSize}px Outfit, sans-serif`;
  const metrics = ctx.measureText(text);
  const badgeW = metrics.width + padX * 2 + (layer.badgeIcon ? 30 * scaleFactor : 0);
  const badgeH = fontSize + padY * 2 + (subtext ? 16 * scaleFactor : 0);

  // Background pill
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5 * scaleFactor;

  ctx.beginPath();
  drawRoundedRect(ctx, -badgeW / 2, -badgeH / 2, badgeW, badgeH, badgeH / 2);
  ctx.fill();
  ctx.stroke();

  // Draw Icon Circle
  let textStartX = -badgeW / 2 + padX;
  if (layer.badgeIcon) {
    const iconR = 8 * scaleFactor;
    const iconX = -badgeW / 2 + padX + iconR;
    const iconY = 0;

    ctx.fillStyle = textColor;
    ctx.beginPath();
    ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2);
    ctx.fill();

    textStartX = iconX + iconR + 12 * scaleFactor;
  }

  // Draw Text
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;
  ctx.fillText(text, textStartX, subtext ? -8 * scaleFactor : 0);

  if (subtext) {
    ctx.font = `500 ${14 * scaleFactor}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(subtext, textStartX, 10 * scaleFactor);
  }
}

function renderGlowRingLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  t: number,
  scaleFactor: number
) {
  const baseR = (layer.width ? layer.width / 2 : 120) * scaleFactor;
  const color = layer.fillColor || '#06b6d4';
  const pulse = Math.sin(t * 4) * 0.15 + 1;

  for (let i = 1; i <= 3; i++) {
    const r = baseR * i * 0.75 * pulse;
    const alpha = (0.7 / i) * (0.8 + 0.2 * Math.sin(t * 3 + i));

    ctx.strokeStyle = color;
    ctx.lineWidth = (3 - i * 0.6) * scaleFactor;
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function renderParticlesLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  t: number,
  canvasWidth: number,
  canvasHeight: number,
  scaleFactor: number
) {
  const count = layer.particleCount || 40;
  const kind = layer.particleKind || 'confetti';
  const color = layer.particleColor || '#f59e0b';

  const colors = [color, '#ec4899', '#38bdf8', '#a855f7', '#10b981'];

  for (let i = 0; i < count; i++) {
    const seed = i * 133.7;
    const speed = (layer.particleSpeed || 1.0) * (0.5 + (i % 5) * 0.2);
    const pX = (Math.sin(seed) * 500 * scaleFactor) + Math.cos(t * speed + i) * 60 * scaleFactor;
    const pY = ((t * 80 * speed * scaleFactor + (seed % 600)) % 800) - 400;

    const pColor = colors[i % colors.length];
    ctx.fillStyle = pColor;

    if (kind === 'confetti') {
      const pSize = (8 + (i % 6) * 2) * scaleFactor;
      const rot = t * 4 + i;
      ctx.save();
      ctx.translate(pX, pY);
      ctx.rotate(rot);
      ctx.fillRect(-pSize / 2, -pSize / 4, pSize, pSize / 2);
      ctx.restore();
    } else {
      // Circles / Bubbles / Dust
      const pRadius = (3 + (i % 4) * 2) * scaleFactor;
      ctx.beginPath();
      ctx.arc(pX, pY, pRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Main project frame renderer. Renders the entire composition onto the specified 2D context.
 */
export function renderProjectToCanvas(
  ctx: CanvasRenderingContext2D,
  project: Project,
  t: number,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);

  // 1. Draw dynamic background
  renderBackground(ctx, project, t, width, height);

  // 2. Draw layers sorted by zIndex
  const sortedLayers = [...project.layers].filter((l) => l.visible).sort((a, b) => a.zIndex - b.zIndex);

  for (const layer of sortedLayers) {
    renderLayer(ctx, layer, t, width, height);
  }
}
