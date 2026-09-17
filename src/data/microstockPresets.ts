import { ResolutionConfig, ExternalLibrary, MicrostockScriptPreset } from '../types/microstock';

export const RESOLUTION_PRESETS: ResolutionConfig[] = [
  {
    id: '4k-uhd',
    label: '4K Ultra HD (3840 × 2160)',
    width: 3840,
    height: 2160,
    aspectRatio: '16:9',
    category: 'Landscape',
    recommendedFor: 'Standar Emas Adobe Stock, Shutterstock, Pond5 4K Footage',
  },
  {
    id: '1080p-fhd',
    label: 'Full HD 1080p (1920 × 1080)',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    category: 'Landscape',
    recommendedFor: 'Standar Umum Video Stock, YouTube, & Broadcast Broadcast TV',
  },
  {
    id: '9:16-4k',
    label: 'Vertical 4K (2160 × 3840)',
    width: 2160,
    height: 3840,
    aspectRatio: '9:16',
    category: 'Vertical',
    recommendedFor: 'Footage Premium TikTok, Instagram Reels, & YouTube Shorts 4K',
  },
  {
    id: '9:16-fhd',
    label: 'Vertical HD (1080 × 1920)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    category: 'Vertical',
    recommendedFor: 'Format Standar Stories, Reels, & Mobile Ads',
  },
  {
    id: '1:1-square-4k',
    label: 'Square 4K (2160 × 2160)',
    width: 2160,
    height: 2160,
    aspectRatio: '1:1',
    category: 'Square',
    recommendedFor: 'Microstock Square Ads, Spotify Canvas, & Feed Promos',
  },
  {
    id: '1:1-square-hd',
    label: 'Square HD (1080 × 1080)',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    category: 'Square',
    recommendedFor: 'Instagram Feed Standar & Web Assets',
  },
  {
    id: '4:5-social',
    label: 'Social Portrait 4:5 (1080 × 1350)',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    category: 'Vertical',
    recommendedFor: 'Instagram Feed Portrait Optimal',
  },
];

export const EXTERNAL_LIBRARIES: ExternalLibrary[] = [
  {
    id: 'threejs',
    name: 'Three.js (r128)',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    category: '3D WebGL',
    description: 'Library render 3D grafis dan shader WebGL',
  },
  {
    id: 'gsap',
    name: 'GSAP 3 (GreenSock)',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    category: 'Animation',
    description: 'Engine animasi tweening dan timeline kelas profesional',
  },
  {
    id: 'animejs',
    name: 'Anime.js (v3.2)',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
    category: 'Animation',
    description: 'Library animasi JS ringan dan cepat untuk SVG & DOM',
  },
  {
    id: 'canvas-confetti',
    name: 'Canvas Confetti',
    url: 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
    category: 'FX',
    description: 'Efek partikel confetti untuk stock footage selebrasi',
  },
];

export const MICROSTOCK_PRESETS: MicrostockScriptPreset[] = [
  {
    id: 'luxury-gold-bokeh',
    title: 'Luxury Golden Bokeh & Shimmering Dust',
    category: 'Luxury & Bokeh',
    description: 'Partikel debu emas mengkilap dan bokeh berkilau melayang lembut di kegelapan dengan efek kedalaman lensa sinematik (Depth of Field), sangat cocok untuk intro mewah, wedding, event penghargaan, & video countdown.',
    duration: 10,
    fps: 60,
    aspectRatio: '16:9',
    transparent: false,
    tags: ['luxury', 'gold', 'bokeh', 'particles', 'wedding', 'awards', 'glamour', 'shimmer', 'seamless loop'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Luxury Golden Bokeh & Dust</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #060502; }
    canvas { display: block; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <canvas id="stage"></canvas>
  <script>
    const canvas = document.getElementById('stage');
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const DURATION = 10;
    const startTime = performance.now();

    const NUM_BOKEH = 45;
    const bokehOrbs = Array.from({ length: NUM_BOKEH }, () => ({
      baseX: Math.random(),
      baseY: Math.random(),
      radius: 25 + Math.random() * 90,
      speedX: 0.02 + Math.random() * 0.05,
      speedY: 0.03 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? 'rgba(255, 215, 100,' : 'rgba(255, 175, 40,',
      maxAlpha: 0.15 + Math.random() * 0.28,
    }));

    const NUM_DUST = 180;
    const dustParticles = Array.from({ length: NUM_DUST }, () => ({
      baseX: Math.random(),
      baseY: Math.random(),
      size: 1 + Math.random() * 3,
      speedX: 0.01 + Math.random() * 0.04,
      speedY: 0.02 + Math.random() * 0.08,
      freq: 1 + Math.floor(Math.random() * 4),
      phase: Math.random() * Math.PI * 2,
      hasRay: Math.random() > 0.75,
    }));

    function draw(now) {
      const elapsed = ((now - startTime) / 1000) % DURATION;
      const progress = elapsed / DURATION;
      const tau = Math.PI * 2;
      const cycle = progress * tau;

      const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.1, W * 0.5, H * 0.5, W * 0.75);
      bgGrad.addColorStop(0, '#1c1507');
      bgGrad.addColorStop(0.5, '#0d0a04');
      bgGrad.addColorStop(1, '#030201');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < NUM_BOKEH; i++) {
        const b = bokehOrbs[i];
        const x = ((b.baseX + Math.sin(cycle * b.speedX * 4 + b.phase) * 0.12 + progress * 0.08) % 1.2 - 0.1) * W;
        const y = ((b.baseY - Math.cos(cycle * b.speedY * 3 + b.phase) * 0.15 - progress * 0.12) % 1.2 - 0.1) * H;
        const wrapY = y < -100 ? y + H + 200 : y;
        const wrapX = x < -100 ? x + W + 200 : x;

        const pulse = 0.7 + 0.3 * Math.sin(cycle * 3 + b.phase);
        const r = b.radius * pulse;
        const alpha = b.maxAlpha * (0.8 + 0.2 * Math.cos(cycle * 2 + b.phase));

        const g = ctx.createRadialGradient(wrapX, wrapY, r * 0.1, wrapX, wrapY, r);
        g.addColorStop(0, b.color + (alpha * 1.3) + ')');
        g.addColorStop(0.4, b.color + (alpha * 0.6) + ')');
        g.addColorStop(0.8, b.color + (alpha * 0.15) + ')');
        g.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(wrapX, wrapY, r, 0, tau);
        ctx.fill();
      }

      for (let i = 0; i < NUM_DUST; i++) {
        const d = dustParticles[i];
        const x = ((d.baseX + Math.sin(cycle * 2 + d.phase) * 0.08) % 1.0) * W;
        const y = ((d.baseY - progress * 0.4 + Math.sin(cycle + d.phase) * 0.05) % 1.0 + 1.0) % 1.0 * H;

        const twinkle = Math.pow(Math.max(0, Math.sin(cycle * d.freq * 3 + d.phase)), 3);
        const alpha = 0.2 + 0.8 * twinkle;

        ctx.fillStyle = 'rgba(255, 240, 190, ' + alpha + ')';
        ctx.beginPath();
        ctx.arc(x, y, d.size * (0.8 + 0.6 * twinkle), 0, tau);
        ctx.fill();

        if (d.hasRay && twinkle > 0.6) {
          const rayLen = d.size * 6 * twinkle;
          ctx.strokeStyle = 'rgba(255, 230, 140, ' + (alpha * 0.7) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - rayLen, y);
          ctx.lineTo(x + rayLen, y);
          ctx.moveTo(x, y - rayLen);
          ctx.lineTo(x, y + rayLen);
          ctx.stroke();
        }
      }

      ctx.restore();
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  </script>
</body>
</html>`
  },
  {
    id: 'ai-neural-plexus',
    title: 'AI Neural Network & Quantum Constellation',
    category: 'Neural & Cyber Tech',
    description: 'Jaringan konstelasi kecerdasan buatan (AI) dengan titik-titik data kuantum yang saling terhubung garis cahaya dinamis, denyut data (pulse impulses), dan rotasi ruang 3D semu yang mulus.',
    duration: 10,
    fps: 60,
    aspectRatio: '16:9',
    transparent: false,
    tags: ['ai', 'neural network', 'plexus', 'technology', 'data science', 'nodes', 'cyber', 'blockchain', 'futuristic'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Neural Network Plexus</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #030611; }
    canvas { display: block; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <canvas id="stage"></canvas>
  <script>
    const canvas = document.getElementById('stage');
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const DURATION = 10;
    const startTime = performance.now();

    const NUM_NODES = 85;
    const nodes = Array.from({ length: NUM_NODES }, (_, i) => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 260 + Math.random() * 280;
      return {
        ox: r * Math.sin(phi) * Math.cos(theta),
        oy: r * Math.sin(phi) * Math.sin(theta) * 0.7,
        oz: r * Math.cos(phi),
        color: i % 3 === 0 ? '#00f0ff' : i % 3 === 1 ? '#6366f1' : '#a855f7',
        size: 2.5 + Math.random() * 3.5,
      };
    });

    const NUM_PACKETS = 16;
    const packets = Array.from({ length: NUM_PACKETS }, () => ({
      fromIdx: Math.floor(Math.random() * NUM_NODES),
      toIdx: Math.floor(Math.random() * NUM_NODES),
      speed: 0.6 + Math.random() * 1.2,
      offset: Math.random(),
    }));

    function draw(now) {
      const elapsed = ((now - startTime) / 1000) % DURATION;
      const progress = elapsed / DURATION;
      const cycle = progress * Math.PI * 2;

      const bg = ctx.createRadialGradient(W * 0.5, H * 0.5, 40, W * 0.5, H * 0.5, W * 0.7);
      bg.addColorStop(0, '#0a1128');
      bg.addColorStop(0.6, '#040714');
      bg.addColorStop(1, '#01030a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(W * 0.5, H * 0.5);

      const cosY = Math.cos(cycle);
      const sinY = Math.sin(cycle);
      const cosX = Math.cos(cycle * 0.5);
      const sinX = Math.sin(cycle * 0.5);

      const projected = nodes.map(n => {
        const x1 = n.ox * cosY - n.oz * sinY;
        const z1 = n.oz * cosY + n.ox * sinY;
        const y2 = n.oy * cosX - z1 * sinX;
        const z2 = z1 * cosX + n.oy * sinX;

        const fov = 700;
        const scale = fov / (fov + z2 + 350);
        return {
          x: x1 * scale,
          y: y2 * scale,
          z: z2,
          scale: scale,
          color: n.color,
          size: n.size * scale,
        };
      });

      ctx.lineWidth = 1.2;
      const maxDist = 135;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.45 * Math.min(p1.scale, p2.scale);
            ctx.strokeStyle = 'rgba(0, 240, 255, ' + alpha + ')';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation = 'screen';
      projected.sort((a, b) => a.z - b.z);

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const rad = Math.max(1, p.size);
        const glowRad = rad * 4;

        const g = ctx.createRadialGradient(p.x, p.y, rad * 0.2, p.x, p.y, glowRad);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.3, p.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRad, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let k = 0; k < packets.length; k++) {
        const pkt = packets[k];
        const p1 = projected[pkt.fromIdx % projected.length];
        const p2 = projected[pkt.toIdx % projected.length];
        const t = (progress * pkt.speed + pkt.offset) % 1.0;
        const px = p1.x + (p2.x - p1.x) * t;
        const py = p1.y + (p2.y - p1.y) * t;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 255, 200, 0.4)';
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  </script>
</body>
</html>`
  },
  {
    id: 'fintech-stock-metrics',
    title: 'Fintech Real-Time Trading & Analytics Dashboard',
    category: 'Business & Infographics',
    description: 'Grafik candlestick trading keuangan, kurva tren laba yang melonjak, bar chart animasi bertingkat, dan indikator persentase pasar real-time dengan aksen neon cyan & emerald green khas industri finansial Wall Street.',
    duration: 10,
    fps: 60,
    aspectRatio: '16:9',
    transparent: false,
    tags: ['finance', 'trading', 'crypto', 'stock market', 'infographic', 'business', 'chart', 'analytics', 'data visualization'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fintech Real-Time Trading Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #050811; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    canvas { display: block; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <canvas id="stage"></canvas>
  <script>
    const canvas = document.getElementById('stage');
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const DURATION = 10;
    const startTime = performance.now();

    const NUM_POINTS = 32;
    const basePrices = [
      42, 45, 43, 48, 52, 50, 56, 61, 58, 64, 69, 67, 72, 78, 75, 82,
      80, 86, 91, 88, 94, 99, 96, 104, 109, 106, 115, 120, 118, 125, 131, 136
    ];

    function draw(now) {
      const elapsed = ((now - startTime) / 1000) % DURATION;
      const progress = elapsed / DURATION;
      const cycle = progress * Math.PI * 2;

      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridCols = 12;
      const gridRows = 8;
      for (let c = 0; c <= gridCols; c++) {
        const x = (W / gridCols) * c;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let r = 0; r <= gridRows; r++) {
        const y = (H / gridRows) * r;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      const padX = W * 0.08;
      const padTop = H * 0.22;
      const chartH = H * 0.52;
      const chartW = W - padX * 2;

      const points = [];
      const step = chartW / (NUM_POINTS - 1);
      for (let i = 0; i < NUM_POINTS; i++) {
        const base = basePrices[i];
        const wave = Math.sin(cycle * 2 + i * 0.4) * 5 + Math.cos(cycle + i * 0.2) * 3;
        const normalized = (base + wave - 35) / 115;
        const x = padX + i * step;
        const y = padTop + chartH - normalized * chartH;
        points.push({ x, y, val: (base + wave) * 74.2 });
      }

      const fillGrad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
      fillGrad.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
      fillGrad.addColorStop(0.6, 'rgba(16, 185, 129, 0.08)');
      fillGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      ctx.beginPath();
      ctx.moveTo(points[0].x, padTop + chartH);
      ctx.lineTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(points[points.length - 1].x, padTop + chartH);
      ctx.closePath();
      ctx.fillStyle = fillGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      const numCandles = 22;
      const candleStep = chartW / numCandles;
      for (let k = 0; k < numCandles; k++) {
        const cx = padX + k * candleStep + 10;
        const trend = Math.sin(cycle + k * 0.5);
        const isUp = trend >= -0.2;
        const cHeight = 15 + Math.abs(trend) * 45;
        const topY = padTop + chartH * 0.7 - (k * 4) + trend * 12;

        ctx.strokeStyle = isUp ? '#10b981' : '#f43f5e';
        ctx.fillStyle = isUp ? '#10b981' : '#f43f5e';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(cx, topY - 8);
        ctx.lineTo(cx, topY + cHeight + 8);
        ctx.stroke();

        ctx.fillRect(cx - 3.5, topY, 7, cHeight);
      }

      const last = points[points.length - 1];
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(last.x, last.y, 6, 0, Math.PI * 2);
      ctx.fill();

      const rippleR = 6 + (cycle * 5 % 24);
      const rippleA = Math.max(0, 1 - rippleR / 24);
      ctx.strokeStyle = 'rgba(16, 185, 129, ' + rippleA + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(last.x, last.y, rippleR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('GLOBAL MARKET INDEX', padX, H * 0.11);

      const curPrice = (10245.50 + Math.sin(cycle) * 120.4).toFixed(2);
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = '#10b981';
      ctx.fillText('$' + curPrice, padX, H * 0.17);

      const gain = (+2.84 + Math.sin(cycle) * 0.4).toFixed(2);
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('▲ +' + gain + '% (24H SURGE)', padX + 240, H * 0.165);

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  </script>
</body>
</html>`
  },
  {
    id: 'liquid-chromatic-aura',
    title: 'Chromatic Liquid Aura & Flowing Silk',
    category: 'Fluid Aura Gradients',
    description: 'Gradasi aura cairan holografik modern dengan perpaduan warna ungu violet, magenta, dan cyan elektrik yang mengalir lembut seperti sutra cair, gaya estetika visual keynote tech modern.',
    duration: 10,
    fps: 60,
    aspectRatio: '16:9',
    transparent: false,
    tags: ['liquid', 'gradient', 'aura', 'fluid', 'chromatic', 'modern', 'apple style', 'abstract', 'colorful'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chromatic Liquid Aura</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #070312; }
    canvas { display: block; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <canvas id="stage"></canvas>
  <script>
    const canvas = document.getElementById('stage');
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const DURATION = 10;
    const startTime = performance.now();

    const BLOBS = [
      { color: '#ec4899', rRatio: 0.38, speedA: 1, speedB: 2, phase: 0 },
      { color: '#8b5cf6', rRatio: 0.42, speedA: -1, speedB: 1, phase: 1.8 },
      { color: '#06b6d4', rRatio: 0.35, speedA: 2, speedB: -1, phase: 3.2 },
      { color: '#3b82f6', rRatio: 0.40, speedA: -2, speedB: -2, phase: 4.5 },
      { color: '#f43f5e', rRatio: 0.32, speedA: 1, speedB: -1, phase: 5.4 },
    ];

    function draw(now) {
      const elapsed = ((now - startTime) / 1000) % DURATION;
      const progress = elapsed / DURATION;
      const cycle = progress * Math.PI * 2;

      ctx.fillStyle = '#080313';
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.filter = 'blur(60px)';

      const cx = W * 0.5;
      const cy = H * 0.5;
      const maxDistX = W * 0.28;
      const maxDistY = H * 0.26;

      for (let i = 0; i < BLOBS.length; i++) {
        const b = BLOBS[i];
        const bx = cx + Math.sin(cycle * b.speedA + b.phase) * maxDistX;
        const by = cy + Math.cos(cycle * b.speedB + b.phase) * maxDistY;
        const rad = Math.min(W, H) * b.rRatio * (1 + 0.15 * Math.sin(cycle * 3 + b.phase));

        const g = ctx.createRadialGradient(bx, by, rad * 0.05, bx, by, rad);
        g.addColorStop(0, b.color);
        g.addColorStop(0.5, b.color + 'aa');
        g.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  </script>
</body>
</html>`
  },
  {
    id: 'broadcast-lower-third',
    title: 'Modern Broadcast News & Tech Lower Third',
    category: 'Broadcast & Lower Thirds',
    description: 'Elemen lower third grafis siaran berita & presentasi korporat modern dengan teks dinamis, bar aksen menyala, dan latar belakang transparan alpha channel yang siap ditumpuk (overlay) langsung ke atas video utama.',
    duration: 10,
    fps: 60,
    aspectRatio: '16:9',
    transparent: true,
    tags: ['lower third', 'broadcast', 'overlay', 'transparent alpha', 'news', 'corporate', 'title', 'motion graphics'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Broadcast Lower Third Overlay</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: transparent; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    canvas { display: block; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <canvas id="stage"></canvas>
  <script>
    const canvas = document.getElementById('stage');
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const DURATION = 10;
    const startTime = performance.now();

    function draw(now) {
      const elapsed = ((now - startTime) / 1000) % DURATION;
      const progress = elapsed / DURATION;
      const cycle = progress * Math.PI * 2;

      ctx.clearRect(0, 0, W, H);

      const barX = W * 0.08;
      const barY = H * 0.76;
      const barW = Math.min(680, W * 0.55);
      const barH = 88;

      const slideIn = Math.min(1, progress * 8);
      const pulseGlow = 0.5 + 0.5 * Math.sin(cycle * 4);

      ctx.save();
      ctx.translate(barX * slideIn, barY);

      ctx.fillStyle = 'rgba(10, 15, 26, 0.88)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, barW, barH, [12, 12, 12, 12]);
      } else {
        ctx.rect(0, 0, barW, barH);
      }
      ctx.fill();

      const borderGrad = ctx.createLinearGradient(0, 0, barW, 0);
      borderGrad.addColorStop(0, '#00f0ff');
      borderGrad.addColorStop(0.5, '#6366f1');
      borderGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const stripeGrad = ctx.createLinearGradient(0, 0, 0, barH);
      stripeGrad.addColorStop(0, '#00f0ff');
      stripeGrad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = stripeGrad;
      ctx.fillRect(0, 0, 8, barH);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(24, 14, 75, 22);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(24, 14, 75, 22);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(36, 25, 4, 0, Math.PI * 2);
      ctx.fill();
      if (pulseGlow > 0.4) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.beginPath();
        ctx.arc(36, 25, 4 + pulseGlow * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#fca5a5';
      ctx.fillText('EXCLUSIVE', 46, 29);

      ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('ALEXANDER VANCE, PH.D.', 112, 32);

      ctx.font = '500 14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Head of Quantum Machine Learning Systems', 24, 62);

      const laserX = (cycle / (Math.PI * 2)) * (barW - 60);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(24 + laserX, barH - 4, 60, 2);

      ctx.restore();
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  </script>
</body>
</html>`
  },
  {
    id: 'geometric-vj-kaleidoscope',
    title: 'Hypnotic Sacred Geometric Tunnel & VJ Loop',
    category: 'Geometric VJ Loops',
    description: 'Terowongan fraktal heksagonal dan mandala neon futuristik yang berputar dan meluncur ke kedalaman tanpa henti (infinite zoom loop), visual populer untuk konser musik elektronik, VJ stage, dan latar belakang energetik.',
    duration: 10,
    fps: 60,
    aspectRatio: '16:9',
    transparent: false,
    tags: ['kaleidoscope', 'vj loop', 'geometric', 'mandala', 'tunnel', 'psychedelic', 'neon', 'edm', 'infinite loop'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hypnotic Geometric Tunnel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #000000; }
    canvas { display: block; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <canvas id="stage"></canvas>
  <script>
    const canvas = document.getElementById('stage');
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const DURATION = 10;
    const startTime = performance.now();

    function drawPolygon(x, y, radius, sides, rot) {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = rot + (i / sides) * Math.PI * 2;
        const px = x + Math.cos(a) * radius;
        const py = y + Math.sin(a) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    function draw(now) {
      const elapsed = ((now - startTime) / 1000) % DURATION;
      const progress = elapsed / DURATION;
      const cycle = progress * Math.PI * 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(W * 0.5, H * 0.5);

      const NUM_RINGS = 24;
      const maxRadius = Math.max(W, H) * 0.85;

      for (let i = 0; i < NUM_RINGS; i++) {
        const ringProgress = (i / NUM_RINGS + progress) % 1.0;
        const radius = Math.pow(ringProgress, 2.2) * maxRadius;
        if (radius < 4) continue;

        const sides = 6;
        const rot = ringProgress * Math.PI * 1.5 + cycle;
        const hue = (ringProgress * 360 + cycle * 40) % 360;
        const alpha = Math.sin(ringProgress * Math.PI) * 0.9;

        ctx.strokeStyle = 'hsla(' + hue + ', 90%, 60%, ' + alpha + ')';
        ctx.lineWidth = 1.5 + ringProgress * 3;

        drawPolygon(0, 0, radius, sides, rot);
        ctx.stroke();

        if (i % 2 === 0 && radius > 30) {
          drawPolygon(0, 0, radius * 0.72, sides, -rot * 1.2);
          ctx.strokeStyle = 'hsla(' + ((hue + 180) % 360) + ', 85%, 65%, ' + (alpha * 0.6) + ')';
          ctx.stroke();
        }
      }

      const coreR = 8 + Math.sin(cycle * 4) * 4;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  </script>
</body>
</html>`
  }
];
