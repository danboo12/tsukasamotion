import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Shield,
  Move,
} from 'lucide-react';
import { Project, Layer } from '../types/motion';
import { renderProjectToCanvas, evaluateLayerAtTime } from '../engine/motionEngine';

interface CanvasStageProps {
  project: Project;
  currentTime: number;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updated: Partial<Layer>) => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  project,
  currentTime,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [showGrid, setShowGrid] = useState(false);
  const [showSafeAreas, setShowSafeAreas] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'fit' | 0.5 | 0.75 | 1.0>('fit');
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 450 });

  // Dragging / Gizmo state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, layerX: 0, layerY: 0 });

  // Get base aspect ratio proportions
  const getAspectRatioNumbers = (ratio: Project['aspectRatio']) => {
    switch (ratio) {
      case '16:9': return { w: 16, h: 9 };
      case '9:16': return { w: 9, h: 16 };
      case '1:1': return { w: 1, h: 1 };
      case '4:5': return { w: 4, h: 5 };
    }
  };

  // Compute stage dimensions fitting the container
  const updateStageSize = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const padding = 48; // stage padding
    const availW = Math.max(200, clientWidth - padding);
    const availH = Math.max(200, clientHeight - padding);

    const { w: ratioW, h: ratioH } = getAspectRatioNumbers(project.aspectRatio);
    let targetW = availW;
    let targetH = (targetW * ratioH) / ratioW;

    if (targetH > availH) {
      targetH = availH;
      targetW = (targetH * ratioW) / ratioH;
    }

    if (zoomLevel !== 'fit') {
      targetW *= zoomLevel;
      targetH *= zoomLevel;
    }

    setStageDimensions({
      width: Math.round(targetW),
      height: Math.round(targetH),
    });
  }, [project.aspectRatio, zoomLevel]);

  useEffect(() => {
    updateStageSize();
    const ro = new ResizeObserver(() => updateStageSize());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateStageSize]);

  // Render canvas frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use internal high resolution for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const internalW = stageDimensions.width * dpr;
    const internalH = stageDimensions.height * dpr;

    if (canvas.width !== internalW || canvas.height !== internalH) {
      canvas.width = internalW;
      canvas.height = internalH;
    }

    renderProjectToCanvas(ctx, project, currentTime, internalW, internalH);
  }, [project, currentTime, stageDimensions]);

  // Selected layer info for gizmo
  const selectedLayer = project.layers.find((l) => l.id === selectedLayerId);
  const selectedTransform = selectedLayer
    ? evaluateLayerAtTime(selectedLayer, currentTime)
    : null;

  // Handle layer interaction (drag to move)
  const handleStageMouseDown = (e: React.MouseEvent) => {
    if (!selectedLayer || selectedLayer.locked) {
      // Check if user clicked another layer
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;

      // Find topmost layer near click
      const hitLayer = [...project.layers]
        .filter((l) => l.visible && !l.locked)
        .reverse()
        .find((l) => {
          const t = evaluateLayerAtTime(l, currentTime);
          const dist = Math.hypot(t.x - clickXPercent, t.y - clickYPercent);
          return dist < 12;
        });

      if (hitLayer) {
        onSelectLayer(hitLayer.id);
      } else {
        onSelectLayer(null);
      }
      return;
    }

    setIsDragging(true);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      layerX: selectedLayer.x,
      layerY: selectedLayer.y,
    });
  };

  const handleStageMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedLayer) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const deltaX = ((e.clientX - dragStart.mouseX) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.mouseY) / rect.height) * 100;

    const newX = Math.round((dragStart.layerX + deltaX) * 10) / 10;
    const newY = Math.round((dragStart.layerY + deltaY) * 10) / 10;

    onUpdateLayer(selectedLayer.id, {
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY)),
    });
  };

  const handleStageMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleStageMouseMove}
      onMouseUp={handleStageMouseUp}
      className="flex-1 bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden select-none p-4"
    >
      {/* Floating Canvas Viewport Tools Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-neutral-800 text-xs shadow-lg">
        {/* Zoom Controls */}
        <button
          onClick={() => setZoomLevel('fit')}
          className={`px-2 py-0.5 rounded font-medium transition-colors ${
            zoomLevel === 'fit'
              ? 'bg-neutral-800 text-sky-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Sesuaikan Ukuran Layar (Fit)"
        >
          Fit
        </button>
        <button
          onClick={() => setZoomLevel(0.75)}
          className={`px-2 py-0.5 rounded font-medium transition-colors ${
            zoomLevel === 0.75
              ? 'bg-neutral-800 text-sky-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          75%
        </button>
        <button
          onClick={() => setZoomLevel(1.0)}
          className={`px-2 py-0.5 rounded font-medium transition-colors ${
            zoomLevel === 1.0
              ? 'bg-neutral-800 text-sky-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          100%
        </button>

        <div className="w-[1px] h-3.5 bg-neutral-800 mx-1" />

        {/* Grid lines toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-1 rounded transition-colors ${
            showGrid ? 'bg-neutral-800 text-sky-400' : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Tampilkan Garis Kisi / Grid"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Safe Margin toggle */}
        <button
          onClick={() => setShowSafeAreas(!showSafeAreas)}
          className={`p-1 rounded transition-colors ${
            showSafeAreas ? 'bg-neutral-800 text-sky-400' : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Tampilkan Garis Area Aman (Safe Margins)"
        >
          <Shield className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Canvas Presentation Wrapper */}
      <div
        className="relative shadow-2xl rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 group"
        style={{
          width: `${stageDimensions.width}px`,
          height: `${stageDimensions.height}px`,
        }}
        onMouseDown={handleStageMouseDown}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-6 grid-rows-6">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="border border-white/5" />
            ))}
            {/* Center crosshair */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-sky-400/20" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-sky-400/20" />
          </div>
        )}

        {/* Safe Margins Overlay (Action Safe 90%, Title Safe 80%) */}
        {showSafeAreas && (
          <div className="absolute inset-0 pointer-events-none p-[5%]">
            {/* Action Safe (90%) */}
            <div className="w-full h-full border border-sky-400/30 rounded relative p-[5%]">
              <span className="absolute top-1 left-1.5 text-[9px] font-mono text-sky-400/60 uppercase">
                Action Safe (90%)
              </span>
              {/* Title Safe (80%) */}
              <div className="w-full h-full border border-amber-400/35 rounded relative">
                <span className="absolute top-1 left-1.5 text-[9px] font-mono text-amber-400/70 uppercase">
                  Title Safe (80%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Transform Gizmo overlay when a layer is selected */}
        {selectedLayer && selectedTransform && selectedTransform.isVisible && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${selectedTransform.x}%`,
              top: `${selectedTransform.y}%`,
              transform: `translate(-50%, -50%) rotate(${selectedTransform.rotation}deg)`,
            }}
          >
            {/* Bounding box indicator */}
            <div className="relative border-2 border-dashed border-sky-400 rounded-md p-3 min-w-[70px] min-h-[40px] flex items-center justify-center">
              {/* Center Move Anchor */}
              <div className="w-3 h-3 rounded-full bg-sky-400 border-2 border-neutral-900 shadow-md pointer-events-auto cursor-move flex items-center justify-center">
                <Move className="w-2 h-2 text-neutral-950" />
              </div>

              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-sky-500 rounded-sm" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-sky-500 rounded-sm" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-sky-500 rounded-sm" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-sky-500 rounded-sm" />

              {/* Layer tag pill */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-sky-500 text-neutral-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                {selectedLayer.name}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stage Bottom Status Info */}
      <div className="absolute bottom-3 right-4 z-20 text-[11px] text-neutral-500 font-mono flex items-center gap-3">
        <span>
          {project.aspectRatio} • {stageDimensions.width}×{stageDimensions.height}px
        </span>
        <span>{project.fps} FPS</span>
      </div>
    </div>
  );
};
