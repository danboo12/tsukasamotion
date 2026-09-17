import { ExternalLibrary } from '../types/microstock';
import { EXTERNAL_LIBRARIES } from '../data/microstockPresets';

export interface BuildBundleOptions {
  rawHtml: string;
  selectedLibraryIds?: string[];
  transparent?: boolean;
  backgroundColor?: string;
  targetDimensions?: { width: number; height: number } | null;
}

/**
 * Builds a self-contained HTML bundle with injected CDN scripts,
 * bridge scripts for frame synchronization, and explicit native resolution overrides.
 */
export function buildHtmlBundle(
  rawHtml: string,
  selectedLibraryIds: string[] = [],
  transparent: boolean = false,
  backgroundColor: string = '#07070d',
  targetDimensions?: { width: number; height: number } | null
): string {
  let processedHtml = rawHtml.trim();

  // Find all scripts that need injection
  const scriptsToInject = selectedLibraryIds
    .map((id) => EXTERNAL_LIBRARIES.find((lib) => lib.id === id))
    .filter((lib): lib is ExternalLibrary => !!lib)
    .map((lib) => `<script src="${lib.url}"></script>`)
    .join('\n');

  // Universal centering and dimensions CSS that locks canvas dead-center
  let dimensionStyle = '';
  if (targetDimensions) {
    dimensionStyle = `
      html, body {
        width: ${targetDimensions.width}px !important;
        height: ${targetDimensions.height}px !important;
        min-width: ${targetDimensions.width}px !important;
        min-height: ${targetDimensions.height}px !important;
        max-width: none !important;
        max-height: none !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        overflow: hidden !important;
      }
      canvas {
        width: ${targetDimensions.width}px !important;
        height: ${targetDimensions.height}px !important;
        min-width: ${targetDimensions.width}px !important;
        min-height: ${targetDimensions.height}px !important;
        max-width: none !important;
        max-height: none !important;
        display: block !important;
        margin: auto !important;
      }
    `;
  } else {
    dimensionStyle = `
      html, body {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        overflow: hidden !important;
      }
      canvas {
        display: block !important;
        margin: auto !important;
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain !important;
      }
    `;
  }

  const bgStyle = transparent
    ? `
    html, body {
      background: transparent !important;
    }
  `
    : `
    html, body {
      background: ${backgroundColor} !important;
    }
  `;

  // Internal bridge script to support canvas frame extraction, centering, and true native resolution locking
  const bridgeScript = `
    <script>
      (function() {
        const TARGET_W = ${targetDimensions ? targetDimensions.width : 'null'};
        const TARGET_H = ${targetDimensions ? targetDimensions.height : 'null'};

        if (TARGET_W && TARGET_H) {
          // Direct overrides on window instance to ensure scripts get exact target resolution
          try {
            Object.defineProperty(window, 'innerWidth', { get: function() { return TARGET_W; }, configurable: true });
            Object.defineProperty(window, 'innerHeight', { get: function() { return TARGET_H; }, configurable: true });
            Object.defineProperty(window, 'outerWidth', { get: function() { return TARGET_W; }, configurable: true });
            Object.defineProperty(window, 'outerHeight', { get: function() { return TARGET_H; }, configurable: true });
            Object.defineProperty(window, 'devicePixelRatio', { get: function() { return 1; }, configurable: true });
          } catch (e) {}

          try {
            Object.defineProperty(Window.prototype, 'innerWidth', { get: function() { return TARGET_W; }, configurable: true });
            Object.defineProperty(Window.prototype, 'innerHeight', { get: function() { return TARGET_H; }, configurable: true });
            Object.defineProperty(Window.prototype, 'devicePixelRatio', { get: function() { return 1; }, configurable: true });
          } catch (e) {}

          try {
            if (window.screen) {
              Object.defineProperty(window.screen, 'width', { get: function() { return TARGET_W; }, configurable: true });
              Object.defineProperty(window.screen, 'height', { get: function() { return TARGET_H; }, configurable: true });
              Object.defineProperty(window.screen, 'availWidth', { get: function() { return TARGET_W; }, configurable: true });
              Object.defineProperty(window.screen, 'availHeight', { get: function() { return TARGET_H; }, configurable: true });
            }
          } catch (e) {}

          try {
            Object.defineProperty(document.documentElement, 'clientWidth', { get: function() { return TARGET_W; }, configurable: true });
            Object.defineProperty(document.documentElement, 'clientHeight', { get: function() { return TARGET_H; }, configurable: true });
          } catch (e) {}

          // Intercept document.createElement so any dynamically created canvas starts at exact target resolution
          try {
            const _origCreate = document.createElement;
            document.createElement = function(tagName, options) {
              const elem = _origCreate.call(document, tagName, options);
              if (tagName && String(tagName).toLowerCase() === 'canvas') {
                elem.width = TARGET_W;
                elem.height = TARGET_H;
                elem.style.width = TARGET_W + 'px';
                elem.style.height = TARGET_H + 'px';
              }
              return elem;
            };
          } catch (e) {}

          // Intercept getContext so default 300x150 canvas is automatically initialized to target resolution
          // Also guarantee WebGL preserveDrawingBuffer: true so snapshot & video frames are never blank/black
          try {
            const _origGetContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(type, attributes) {
              if (this.width === 300 && this.height === 150) {
                this.width = TARGET_W;
                this.height = TARGET_H;
                this.style.width = TARGET_W + 'px';
                this.style.height = TARGET_H + 'px';
              }
              if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
                attributes = Object.assign({}, attributes, { preserveDrawingBuffer: true });
              }
              return _origGetContext.call(this, type, attributes);
            };
          } catch (e) {}
        } else {
          // In live preview mode without fixed target dimensions, still preserve WebGL drawing buffer for clean snapshots
          try {
            const _origGetContextLive = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(type, attributes) {
              if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
                attributes = Object.assign({}, attributes, { preserveDrawingBuffer: true });
              }
              return _origGetContextLive.call(this, type, attributes);
            };
          } catch (e) {}
        }

        // =====================================================================
        // DETERMINISTIC VIRTUAL TIME CONTROLLER & RENDER SYNCHRONIZER
        // Solves: text animations cutting off or looping prematurely during render
        // =====================================================================
        const IS_RENDER_MODE = ${targetDimensions ? 'true' : 'false'};
        let virtualTimeMs = 0;
        let activeRAFQueue = new Map();
        let rafIdCounter = 1;
        let timelineDuration = 10;
        let isTimelinePlaying = true;

        window.__MOTION_DURATION = 10;
        window.__timelineDuration = 10;
        window.__timelineTime = 0;

        if (IS_RENDER_MODE) {
          // In Render Mode, time does NOT advance via real-world wall clock!
          // Time ONLY advances when __stepRenderFrame(f, fps, totalDuration) is called!
          const _baseRealEpoch = Date.now();

          // Intercept performance.now()
          window.performance.now = function() {
            return virtualTimeMs;
          };

          // Intercept Date.now()
          Date.now = function() {
            return _baseRealEpoch + virtualTimeMs;
          };

          // Intercept requestAnimationFrame so render controls frame advances
          window.requestAnimationFrame = function(callback) {
            const id = rafIdCounter++;
            activeRAFQueue.set(id, callback);
            return id;
          };

          window.cancelAnimationFrame = function(id) {
            activeRAFQueue.delete(id);
          };

          // Deterministic frame step function called before every captured frame
          window.__stepRenderFrame = function(frameIndex, fps, totalDuration) {
            timelineDuration = totalDuration || 10;
            window.__MOTION_DURATION = timelineDuration;
            window.__timelineDuration = timelineDuration;

            // Exact mathematical timestamp for this frame
            virtualTimeMs = (frameIndex / fps) * 1000;
            window.__timelineTime = virtualTimeMs / 1000;

            // 1. Sync any CSS animations via Web Animations API
            try {
              if (document.getAnimations) {
                const anims = document.getAnimations();
                for (let i = 0; i < anims.length; i++) {
                  const anim = anims[i];
                  if (anim.playState !== 'paused') {
                    anim.pause();
                  }
                  anim.currentTime = virtualTimeMs;
                }
              }
            } catch (e) {}

            // 2. Flush pending requestAnimationFrame callbacks with exact timestamp
            if (activeRAFQueue.size > 0) {
              const currentBatch = Array.from(activeRAFQueue.entries());
              activeRAFQueue.clear();
              for (let i = 0; i < currentBatch.length; i++) {
                try {
                  currentBatch[i][1](virtualTimeMs);
                } catch (err) {
                  console.error('Error in rAF frame callback:', err);
                }
              }
            }
          };
        }

        // Lock existing and newly parsed canvas elements to center and target dimensions
        function enforceCanvasResolution() {
          const canvases = document.querySelectorAll('canvas');
          canvases.forEach(function(c) {
            if (TARGET_W && TARGET_H) {
              if (c.width === 300 || c.width === 0 || !c.width) {
                c.width = TARGET_W;
                c.height = TARGET_H;
              }
              c.style.width = TARGET_W + 'px';
              c.style.height = TARGET_H + 'px';
              c.style.minWidth = TARGET_W + 'px';
              c.style.minHeight = TARGET_H + 'px';
            }
            c.style.display = 'block';
            c.style.margin = 'auto';
          });
        }

        // MutationObserver to catch canvas as soon as parsed into DOM before script runs
        try {
          const _mo = new MutationObserver(function() {
            enforceCanvasResolution();
          });
          _mo.observe(document.documentElement || document, { childList: true, subtree: true });
        } catch (e) {}

        // Run once on DOM ready and load
        window.addEventListener('DOMContentLoaded', enforceCanvasResolution);
        window.addEventListener('load', function() {
          enforceCanvasResolution();
          window.dispatchEvent(new Event('resize'));
        });

        // Helper to find largest canvas in document
        window.__findTargetCanvas = function() {
          const canvases = document.querySelectorAll('canvas');
          if (canvases.length > 0) {
            let best = canvases[0];
            let maxArea = best.width * best.height;
            canvases.forEach(function(c) {
              const area = c.width * c.height;
              if (area > maxArea) {
                best = c;
                maxArea = area;
              }
            });
            return best;
          }
          return null;
        };

        // Verification telemetry
        window.__getResolutionReport = function() {
          const c = window.__findTargetCanvas();
          return {
            canvasFound: !!c,
            canvasWidth: c ? c.width : window.innerWidth,
            canvasHeight: c ? c.height : window.innerHeight,
            pixelRatio: 1,
            megapixels: c ? ((c.width * c.height) / 1000000).toFixed(2) : 0,
          };
        };

        // Listen for messages from parent
        window.addEventListener('message', function(event) {
          if (!event.data || !event.data.type) return;
          if (event.data.type === 'PING') {
            const report = window.__getResolutionReport();
            window.parent.postMessage({
              type: 'PONG',
              ...report
            }, '*');
          } else if (event.data.type === 'FORCE_RESIZE' && TARGET_W && TARGET_H) {
            enforceCanvasResolution();
            window.dispatchEvent(new Event('resize'));
          } else if (event.data.type === 'SEEK_TIME') {
            const targetMs = (event.data.timeSeconds || 0) * 1000;
            window.__timelineTime = event.data.timeSeconds || 0;
            if (event.data.duration) {
              window.__MOTION_DURATION = event.data.duration;
              window.__timelineDuration = event.data.duration;
            }
            try {
              if (document.getAnimations) {
                const anims = document.getAnimations();
                for (let i = 0; i < anims.length; i++) {
                  anims[i].currentTime = targetMs;
                }
              }
            } catch (e) {}
            window.dispatchEvent(new CustomEvent('timeline-seek', {
              detail: { timeSeconds: event.data.timeSeconds, timeMs: targetMs }
            }));
          } else if (event.data.type === 'SET_PLAYING') {
            isTimelinePlaying = !!event.data.isPlaying;
            try {
              if (document.getAnimations) {
                const anims = document.getAnimations();
                for (let i = 0; i < anims.length; i++) {
                  if (isTimelinePlaying) anims[i].play();
                  else anims[i].pause();
                }
              }
            } catch (e) {}
          } else if (event.data.type === 'SET_DURATION') {
            if (event.data.duration) {
              window.__MOTION_DURATION = event.data.duration;
              window.__timelineDuration = event.data.duration;
            }
          } else if (event.data.type === 'RESTART') {
            window.__timelineTime = 0;
            try {
              if (document.getAnimations) {
                const anims = document.getAnimations();
                for (let i = 0; i < anims.length; i++) {
                  anims[i].currentTime = 0;
                }
              }
            } catch (e) {}
            window.dispatchEvent(new CustomEvent('timeline-restart'));
          }
        });
      })();
    </script>
  `;

  // Final override style injected to guarantee centering even over custom script CSS
  const overrideStyleTag = `
    <style id="__motion_center_lock">
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        overflow: hidden !important;
      }
      canvas {
        display: block !important;
        margin: auto !important;
      }
      ${bgStyle}
      ${dimensionStyle}
    </style>
  `;

  const headInject = `
    <head>
      ${scriptsToInject}
      ${bridgeScript}
  `;

  // Ensure override styles are injected right before </head> so they take priority
  let result = processedHtml;
  if (result.toLowerCase().includes('<head>')) {
    result = result.replace(/<head>/i, headInject);
  } else if (result.toLowerCase().includes('<html>')) {
    result = result.replace(/<html>/i, `<html>\n${headInject}\n</head>`);
  } else {
    result = `<!DOCTYPE html>\n<html lang="en">\n${headInject}\n</head>\n<body>\n${result}\n</body>\n</html>`;
  }

  // Inject the final centering style right before </head>
  if (result.toLowerCase().includes('</head>')) {
    result = result.replace(/<\/head>/i, `${overrideStyleTag}\n</head>`);
  } else {
    result = `${overrideStyleTag}\n${result}`;
  }

  // If target dimensions are specified (render mode), ensure static <canvas> tags have exact pixel attributes
  if (targetDimensions) {
    result = result.replace(/<canvas\b([^>]*)>/gi, (_match, attrs) => {
      const cleaned = attrs.replace(/\b(width|height)=["'][^"']*["']/gi, '').trim();
      return `<canvas width="${targetDimensions.width}" height="${targetDimensions.height}" ${cleaned}>`;
    });
  }

  return result;
}
