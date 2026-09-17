import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Maximize2,
  Minimize2,
  Grid,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
  Split,
  ZoomIn,
  Crosshair,
} from 'lucide-react';
import { BackgroundType, FrameRate, ResolutionConfig } from '../types/microstock';

interface PreviewStageProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  bundledHtml: string;
  resolution: ResolutionConfig;
  fps: FrameRate;
  duration: number;
  backgroundType: BackgroundType;
  onChangeBackgroundType: (type: BackgroundType) => void;
  isLooping: boolean;
}

export const PreviewStage: React.FC<PreviewStageProps> = ({
  iframeRef,
  bundledHtml,
  resolution,
  fps,
  duration,
  backgroundType,
  onChangeBackgroundType,
  isLooping,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportDims, setViewportDims] = useState<{ width: number; height: number }>({ width: 640, height: 360 });
  const [showSafeZones, setShowSafeZones] = useState<boolean>(false);
  const [showCenterGuides, setShowCenterGuides] = useState<boolean>(false);

  // ResizeObserver to always compute exact pixel-perfect aspect ratio frame inside available viewport
  useEffect(() => {
    if (!viewportRef.current) return;
    const updateSize = () => {
      if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        // Give 16px breathing room padding
        const padX = window.innerWidth < 640 ? 12 : 24;
        const padY = window.innerWidth < 640 ? 12 : 24;
        const width = Math.max(80, rect.width - padX);
        const height = Math.max(80, rect.height - padY);
        setViewportDims({ width, height });
      }
    };

    updateSize();
    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(viewportRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Compute exact bounded box that never overflows container width or height
  const stageBoxStyle = useMemo(() => {
    const [wRatio, hRatio] = resolution.aspectRatio.split(':').map(Number);
    const targetRatio = (wRatio || 16) / (hRatio || 9);
    const availableW = Math.max(80, viewportDims.width);
    const availableH = Math.max(80, viewportDims.height);
    const currentRatio = availableW / availableH;

    let finalW: number;
    let finalH: number;

    if (currentRatio > targetRatio) {
      // Container is wider than target aspect ratio -> bound by available height
      finalH = availableH;
      finalW = availableH * targetRatio;
    } else {
      // Container is taller than target aspect ratio -> bound by available width
      finalW = availableW;
      finalH = availableW / targetRatio;
    }

    return {
      width: `${Math.floor(finalW)}px`,
      height: `${Math.floor(finalH)}px`,
    };
  }, [resolution.aspectRatio, viewportDims]);

  // Background style
  const getStageBackground = () => {
    switch (backgroundType) {
      case 'transparent':
        return 'bg-[linear-gradient(45deg,#1f1f2e_25%,transparent_25%),linear-gradient(-45deg,#1f1f2e_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1f1f2e_75%),linear-gradient(-45deg,transparent_75%,#1f1f2e_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] bg-neutral-900';
      case 'black':
        return 'bg-black';
      case 'dark':
        return 'bg-[#0a0a10]';
      case 'white':
        return 'bg-white';
      default:
        return 'bg-[#0a0a10]';
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-neutral-950/90 relative overflow-hidden select-none min-h-0 min-w-0"
    >
      {/* Top Floating Stage Bar */}
      <div className="h-10 px-2 sm:px-4 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between z-20 shrink-0 text-xs overflow-x-auto no-scrollbar gap-2">
        {/* Resolution & Specs Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded bg-neutral-800/80 border border-neutral-700/60 font-mono text-[10px] sm:text-[11px] text-neutral-200">
            <span className="font-bold text-sky-400">{resolution.width} × {resolution.height}</span>
            <span className="text-neutral-500">|</span>
            <span>{resolution.aspectRatio}</span>
            <span className="text-neutral-500 hidden sm:inline">|</span>
            <span className="text-amber-400 font-bold hidden sm:inline">{fps} FPS</span>
            <span className="text-neutral-500 hidden md:inline">|</span>
            <span className="hidden md:inline">{duration}s</span>
          </div>

          {/* Microstock Validation Tag */}
          <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Buffer: {((resolution.width * resolution.height) / 1000000).toFixed(1)} MP Native</span>
          </div>
        </div>

        {/* Right Stage Controls: Background Checkerboard & Zoom */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Background Toggle */}
          <div className="flex items-center bg-neutral-950 rounded-lg p-0.5 border border-neutral-800">
            <button
              type="button"
              onClick={() => onChangeBackgroundType('transparent')}
              title="Latar Transparan Alpha (Checkerboard)"
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer ${
                backgroundType === 'transparent'
                  ? 'bg-sky-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Transparan
            </button>
            <button
              type="button"
              onClick={() => onChangeBackgroundType('black')}
              title="Latar Hitam Pekat"
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer ${
                backgroundType === 'black'
                  ? 'bg-neutral-800 text-neutral-100 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Hitam
            </button>
            <button
              type="button"
              onClick={() => onChangeBackgroundType('white')}
              title="Latar Putih"
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer ${
                backgroundType === 'white'
                  ? 'bg-white text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Putih
            </button>
          </div>

          {/* Center Crosshair Guides Toggle */}
          <button
            type="button"
            onClick={() => setShowCenterGuides((s) => !s)}
            title="Garis Titik Pusat (Crosshair)"
            className={`p-1 sm:p-1.5 rounded-lg border border-neutral-800 transition-colors flex items-center gap-1 cursor-pointer ${
              showCenterGuides
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-neutral-950 text-neutral-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono hidden md:inline">Pusat</span>
          </button>

          {/* Safe Margins Toggle */}
          <button
            type="button"
            onClick={() => setShowSafeZones((s) => !s)}
            title="Tampilkan Safe Margins 80% & 90%"
            className={`p-1 sm:p-1.5 rounded-lg border border-neutral-800 transition-colors cursor-pointer ${
              showSafeZones
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                : 'bg-neutral-950 text-neutral-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Stage Center */}
      <div
        ref={viewportRef}
        className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative min-h-0 min-w-0 w-full h-full"
      >
        {/* Frame Shadow Wrapper with Exact ResizeObserver Dimensions */}
        <div
          className={`relative transition-all duration-150 rounded-lg overflow-hidden shadow-2xl border border-neutral-800 ${getStageBackground()} m-auto flex items-center justify-center shrink-0`}
          style={stageBoxStyle}
        >
          {/* Iframe Sandboxed Runner */}
          <iframe
            ref={iframeRef}
            srcDoc={bundledHtml}
            title="HTML Motion Preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-0 block"
          />

          {/* Center Crosshair Overlay */}
          {showCenterGuides && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* Horizontal Center Axis */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-rose-500/60 -translate-y-1/2" />
              {/* Vertical Center Axis */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-rose-500/60 -translate-x-1/2" />
              {/* Center Target Reticle */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-rose-500/80 bg-rose-500/10 flex items-center justify-center shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
              </div>
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-mono text-rose-400 border border-rose-500/30">
                CENTER ALIGNMENT [50%, 50%]
              </div>
            </div>
          )}

          {/* Safe Zones Overlay if enabled */}
          {showSafeZones && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              {/* 90% Action Safe */}
              <div className="w-[90%] h-[90%] border border-dashed border-sky-500/40 flex items-center justify-center">
                {/* 80% Title Safe */}
                <div className="w-[88.8%] h-[88.8%] border border-dashed border-amber-500/40">
                  <span className="text-[9px] font-mono text-amber-400/70 p-1 block">
                    Safe Title Margin 80%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Transparent Watermark / Indicator in Corner */}
          {backgroundType === 'transparent' && (
            <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono text-sky-400 border border-sky-500/30 pointer-events-none">
              ALPHA CHANNEL ACTIVE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
