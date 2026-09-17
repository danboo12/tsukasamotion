import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Repeat,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Type,
  Square,
  BadgeAlert,
  Radio,
  Sparkle,
  Plus,
} from 'lucide-react';
import { Project, Layer, LayerType } from '../types/motion';

interface TimelineProps {
  project: Project;
  currentTime: number;
  isPlaying: boolean;
  isLooping: boolean;
  selectedLayerId: string | null;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onToggleLoop: () => void;
  onRestart: () => void;
  onStepFrame: (direction: -1 | 1) => void;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updated: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onReorderLayer: (id: string, direction: 'up' | 'down') => void;
  onAddLayer: (type: LayerType) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  currentTime,
  isPlaying,
  isLooping,
  selectedLayerId,
  onSeek,
  onTogglePlay,
  onToggleLoop,
  onRestart,
  onStepFrame,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onReorderLayer,
  onAddLayer,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggingBar, setDraggingBar] = useState<{
    layerId: string;
    action: 'move' | 'trim-left' | 'trim-right';
    startX: number;
    initialStart: number;
    initialDuration: number;
  } | null>(null);

  const duration = project.duration || 5.0;
  const fps = project.fps || 60;
  const totalFrames = Math.floor(duration * fps);
  const currentFrame = Math.min(totalFrames, Math.floor(currentTime * fps));

  // Format seconds to mm:ss.ms
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Handle Playhead Scrubbing on ruler
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    updateScrub(e);
  };

  const updateScrub = (e: React.MouseEvent | MouseEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetTime = (clickX / rect.width) * duration;
    onSeek(Math.max(0, Math.min(duration, targetTime)));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        updateScrub(e);
      } else if (draggingBar) {
        if (!rulerRef.current) return;
        const rect = rulerRef.current.getBoundingClientRect();
        const deltaSec = ((e.clientX - draggingBar.startX) / rect.width) * duration;

        if (draggingBar.action === 'move') {
          const newStart = Math.max(
            0,
            Math.min(
              duration - draggingBar.initialDuration,
              draggingBar.initialStart + deltaSec
            )
          );
          onUpdateLayer(draggingBar.layerId, {
            startTime: Math.round(newStart * 100) / 100,
          });
        } else if (draggingBar.action === 'trim-right') {
          const newDur = Math.max(
            0.2,
            Math.min(
              duration - draggingBar.initialStart,
              draggingBar.initialDuration + deltaSec
            )
          );
          onUpdateLayer(draggingBar.layerId, {
            duration: Math.round(newDur * 100) / 100,
          });
        } else if (draggingBar.action === 'trim-left') {
          const maxShift = draggingBar.initialDuration - 0.2;
          const shift = Math.max(-draggingBar.initialStart, Math.min(maxShift, deltaSec));
          const newStart = draggingBar.initialStart + shift;
          const newDur = draggingBar.initialDuration - shift;
          onUpdateLayer(draggingBar.layerId, {
            startTime: Math.round(newStart * 100) / 100,
            duration: Math.round(newDur * 100) / 100,
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setDraggingBar(null);
    };

    if (isScrubbing || draggingBar) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, draggingBar, duration, onSeek, onUpdateLayer]);

  const getLayerIcon = (type: LayerType) => {
    switch (type) {
      case 'text':
        return <Type className="w-3.5 h-3.5 text-sky-400" />;
      case 'shape':
        return <Square className="w-3.5 h-3.5 text-indigo-400" />;
      case 'badge':
        return <BadgeAlert className="w-3.5 h-3.5 text-emerald-400" />;
      case 'glow-ring':
        return <Radio className="w-3.5 h-3.5 text-cyan-400" />;
      case 'particles':
        return <Sparkle className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  // Second tick marks for ruler
  const ticks = Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => i);

  // Playhead horizontal position percentage
  const playheadPercent = Math.min(100, (currentTime / duration) * 100);

  // Sorted layers (top layer on top)
  const displayLayers = [...project.layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="h-64 bg-neutral-900 border-t border-neutral-800 flex flex-col select-none z-30">
      {/* Top Playback Toolbar */}
      <div className="h-10 bg-neutral-950/80 px-4 border-b border-neutral-800/80 flex items-center justify-between text-xs">
        {/* Left: Playhead controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onRestart}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Kembali ke Awal (00:00)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onStepFrame(-1)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Mundur 1 Frame"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onTogglePlay}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                : 'bg-sky-500 hover:bg-sky-400 text-neutral-950'
            }`}
            title="Spasi untuk Putar / Jeda"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>
          <button
            onClick={() => onStepFrame(1)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Maju 1 Frame"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleLoop}
            className={`p-1.5 rounded-lg transition-colors ${
              isLooping ? 'text-sky-400 bg-sky-500/10' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Putar Berulang (Loop)"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Timecode & Frame Indicator */}
        <div className="flex items-center gap-3 font-mono">
          <div className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md text-sky-400 font-bold tracking-wider">
            {formatTimecode(currentTime)}{' '}
            <span className="text-neutral-500 font-normal">/ {formatTimecode(duration)}</span>
          </div>
          <div className="text-neutral-400 text-[11px]">
            Frame <span className="text-neutral-200 font-semibold">{currentFrame}</span> / {totalFrames}
          </div>
        </div>

        {/* Right: Quick Add Track & Zoom */}
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-[11px] text-neutral-500">{project.layers.length} Tracks</span>
        </div>
      </div>

      {/* Main Timeline Workspace: Left Header Column + Right Track Lanes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Track Headers */}
        <div className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col overflow-y-auto">
          {/* Ruler spacer */}
          <div className="h-7 border-b border-neutral-800 px-3 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
            <span>LAYERS</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAddLayer('text')}
                className="hover:text-sky-400 p-0.5 rounded"
                title="Tambah Teks Cepat"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Layer Headers List */}
          <div className="flex-1 divide-y divide-neutral-900">
            {displayLayers.map((layer) => {
              const isSelected = layer.id === selectedLayerId;
              return (
                <div
                  key={layer.id}
                  onClick={() => onSelectLayer(layer.id)}
                  className={`h-11 px-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-neutral-800/90 text-white font-medium border-l-2 border-sky-400'
                      : 'hover:bg-neutral-900 text-neutral-400'
                  }`}
                >
                  {/* Left: Icon & Name */}
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {getLayerIcon(layer.type)}
                    <span className="text-xs truncate">{layer.name}</span>
                  </div>

                  {/* Right: Actions */}
                  <div
                    className="flex items-center gap-1 text-neutral-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Layer Reorder */}
                    <button
                      onClick={() => onReorderLayer(layer.id, 'up')}
                      className="p-1 hover:text-neutral-200 transition-colors"
                      title="Naikkan Layer (z-index)"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onReorderLayer(layer.id, 'down')}
                      className="p-1 hover:text-neutral-200 transition-colors"
                      title="Turunkan Layer"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {/* Visibility */}
                    <button
                      onClick={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
                      className="p-1 hover:text-neutral-200 transition-colors"
                      title={layer.visible ? 'Sembunyikan Layer' : 'Tampilkan Layer'}
                    >
                      {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-red-400" />}
                    </button>

                    {/* Lock */}
                    <button
                      onClick={() => onUpdateLayer(layer.id, { locked: !layer.locked })}
                      className="p-1 hover:text-neutral-200 transition-colors"
                      title={layer.locked ? 'Buka Kunci' : 'Kunci Layer'}
                    >
                      {layer.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => onDuplicateLayer(layer.id)}
                      className="p-1 hover:text-neutral-200 transition-colors"
                      title="Duplikat Layer"
                    >
                      <Copy className="w-3 h-3" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteLayer(layer.id)}
                      className="p-1 hover:text-rose-400 transition-colors"
                      title="Hapus Layer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Timeline Ruler & Track Lanes */}
        <div className="flex-1 flex flex-col overflow-x-auto relative bg-neutral-900/60">
          {/* Top Time Ruler */}
          <div
            ref={rulerRef}
            onMouseDown={handleRulerMouseDown}
            className="h-7 border-b border-neutral-800 bg-neutral-950/70 relative cursor-pointer select-none"
          >
            {/* Tick Marks & Second Numbers */}
            {ticks.map((sec) => {
              const leftPercent = (sec / duration) * 100;
              return (
                <div
                  key={sec}
                  className="absolute top-0 bottom-0 flex flex-col justify-end"
                  style={{ left: `${leftPercent}%` }}
                >
                  <div className="text-[10px] font-mono text-neutral-500 pl-1 -top-0.5 relative">
                    {sec}s
                  </div>
                  <div className="w-[1px] h-2 bg-neutral-700" />
                </div>
              );
            })}

            {/* Frame subdivisions (4 sub ticks per second) */}
            {Array.from({ length: Math.ceil(duration) * 4 }).map((_, idx) => {
              const sec = idx * 0.25;
              if (sec % 1 === 0 || sec > duration) return null;
              const leftPercent = (sec / duration) * 100;
              return (
                <div
                  key={idx}
                  className="absolute bottom-0 w-[1px] h-1 bg-neutral-800"
                  style={{ left: `${leftPercent}%` }}
                />
              );
            })}

            {/* Red Playhead Header Flag */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-30"
              style={{ left: `${playheadPercent}%` }}
            >
              <div className="w-3 h-3 bg-red-500 rotate-45 -translate-x-1.5 -translate-y-1.5 shadow-md" />
            </div>
          </div>

          {/* Track Lanes Stack */}
          <div className="flex-1 relative overflow-y-auto divide-y divide-neutral-800/40">
            {/* Background Grid Lines matching seconds */}
            <div className="absolute inset-0 pointer-events-none">
              {ticks.map((sec) => (
                <div
                  key={sec}
                  className="absolute top-0 bottom-0 w-[1px] bg-neutral-800/40"
                  style={{ left: `${(sec / duration) * 100}%` }}
                />
              ))}
            </div>

            {/* Playhead Vertical Needle spanning all tracks */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-red-500/90 pointer-events-none z-20 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              style={{ left: `${playheadPercent}%` }}
            />

            {/* Layer Timeline Track Bars */}
            {displayLayers.map((layer) => {
              const isSelected = layer.id === selectedLayerId;
              const leftPercent = (layer.startTime / duration) * 100;
              const widthPercent = (layer.duration / duration) * 100;
              const inAnimPercent = (layer.inDuration / layer.duration) * 100;
              const outAnimPercent = (layer.outDuration / layer.duration) * 100;

              return (
                <div
                  key={layer.id}
                  onClick={() => onSelectLayer(layer.id)}
                  className={`h-11 relative flex items-center px-1 group transition-colors ${
                    isSelected ? 'bg-neutral-800/30' : 'hover:bg-neutral-800/10'
                  }`}
                >
                  {/* Timeline Bar for Layer */}
                  <div
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onSelectLayer(layer.id);
                      setDraggingBar({
                        layerId: layer.id,
                        action: 'move',
                        startX: e.clientX,
                        initialStart: layer.startTime,
                        initialDuration: layer.duration,
                      });
                    }}
                    className={`absolute h-7 rounded-md cursor-grab active:cursor-grabbing flex items-center overflow-hidden border shadow-sm select-none transition-all ${
                      isSelected
                        ? 'bg-sky-600/30 border-sky-400 ring-1 ring-sky-400/50 text-white'
                        : 'bg-neutral-800/90 hover:bg-neutral-700/90 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {/* Left Trim Handle */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingBar({
                          layerId: layer.id,
                          action: 'trim-left',
                          startX: e.clientX,
                          initialStart: layer.startTime,
                          initialDuration: layer.duration,
                        });
                      }}
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-sky-400/50 z-10"
                      title="Geser titik masuk (In Point)"
                    />

                    {/* In-Animation Segment Tint */}
                    {layer.inAnimation !== 'none' && (
                      <div
                        style={{ width: `${inAnimPercent}%` }}
                        className="h-full bg-gradient-to-r from-sky-500/40 to-transparent border-r border-sky-400/30 flex items-center px-1.5"
                        title={`In: ${layer.inAnimation} (${layer.inDuration}s)`}
                      >
                        <span className="text-[9px] font-mono text-sky-300 truncate">
                          ▶ {layer.inAnimation}
                        </span>
                      </div>
                    )}

                    {/* Middle Name Tag */}
                    <div className="flex-1 px-2 text-[11px] font-medium truncate flex items-center gap-1">
                      <span>{layer.name}</span>
                    </div>

                    {/* Out-Animation Segment Tint */}
                    {layer.outAnimation !== 'none' && (
                      <div
                        style={{ width: `${outAnimPercent}%` }}
                        className="h-full bg-gradient-to-l from-rose-500/40 to-transparent border-l border-rose-400/30 flex items-center justify-end px-1.5"
                        title={`Out: ${layer.outAnimation} (${layer.outDuration}s)`}
                      >
                        <span className="text-[9px] font-mono text-rose-300 truncate">
                          ◀ {layer.outAnimation}
                        </span>
                      </div>
                    )}

                    {/* Right Trim Handle */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingBar({
                          layerId: layer.id,
                          action: 'trim-right',
                          startX: e.clientX,
                          initialStart: layer.startTime,
                          initialDuration: layer.duration,
                        });
                      }}
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-sky-400/50 z-10"
                      title="Geser titik keluar (Out Point)"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
