import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Gauge,
  Clock,
  Sliders,
} from 'lucide-react';
import { FrameRate, VideoBitrate } from '../types/microstock';

interface TransportBarProps {
  currentTime: number;
  duration: number;
  fps: FrameRate;
  isPlaying: boolean;
  isLooping: boolean;
  bitrate: VideoBitrate;
  onTogglePlay: () => void;
  onRestart: () => void;
  onToggleLoop: () => void;
  onSeek: (time: number) => void;
  onChangeFps: (fps: FrameRate) => void;
  onChangeDuration: (dur: number) => void;
  onChangeBitrate: (br: VideoBitrate) => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  currentTime,
  duration,
  fps,
  isPlaying,
  isLooping,
  bitrate,
  onTogglePlay,
  onRestart,
  onToggleLoop,
  onSeek,
  onChangeFps,
  onChangeDuration,
  onChangeBitrate,
}) => {
  const totalFrames = Math.floor(duration * fps);
  const currentFrame = Math.min(totalFrames, Math.floor(currentTime * fps));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  return (
    <div className="h-14 px-2 sm:px-4 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur-md flex items-center justify-between z-20 shrink-0 select-none text-xs overflow-x-auto no-scrollbar gap-2 min-w-0">
      {/* Left Transport Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={onRestart}
          title="Ulangi dari Awal (00:00)"
          className="p-1.5 sm:p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">Jeda</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">Putar</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleLoop}
          title="Aktifkan Putar Berulang (Looping)"
          className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer ${
            isLooping
              ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
              : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Repeat className="w-4 h-4" />
        </button>

        {/* Timecode & Frame Counter */}
        <div className="font-mono text-xs flex items-center gap-1.5 sm:gap-2 bg-neutral-950 px-2 sm:px-3 py-1.5 rounded-lg border border-neutral-800 shrink-0">
          <span className="text-neutral-100 font-bold">{formatTime(currentTime)}</span>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-400">{formatTime(duration)}</span>
          <span className="text-neutral-600 hidden md:inline">|</span>
          <span className="text-sky-400 font-semibold hidden md:inline">F: {currentFrame} / {totalFrames}</span>
        </div>
      </div>

      {/* Middle Scrubbing Timeline */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6 flex items-center gap-2 sm:gap-3 min-w-[70px]">
        <input
          type="range"
          min="0"
          max={duration}
          step={1 / fps}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400"
        />
      </div>

      {/* Right Controls: FPS, Duration, Bitrate Selectors */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Frame Rate (FPS) */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-neutral-950 px-2 sm:px-2.5 py-1 rounded-lg border border-neutral-800">
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-neutral-400 text-[11px] hidden sm:inline">FPS:</span>
          <select
            value={fps}
            onChange={(e) => onChangeFps(Number(e.target.value) as FrameRate)}
            className="bg-transparent font-bold text-neutral-200 outline-none cursor-pointer text-xs"
          >
            <option value={24} className="bg-neutral-900">24 (Film)</option>
            <option value={25} className="bg-neutral-900">25 (PAL)</option>
            <option value={29.97} className="bg-neutral-900">29.97 (NTSC)</option>
            <option value={30} className="bg-neutral-900">30 (Web)</option>
            <option value={60} className="bg-neutral-900">60 (Smooth)</option>
          </select>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-neutral-950 px-2 sm:px-2.5 py-1 rounded-lg border border-neutral-800">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-neutral-400 text-[11px] hidden sm:inline">Durasi:</span>
          <select
            value={duration}
            onChange={(e) => onChangeDuration(Number(e.target.value))}
            className="bg-transparent font-bold text-neutral-200 outline-none cursor-pointer text-xs"
          >
            <option value={5} className="bg-neutral-900">5 Detik</option>
            <option value={8} className="bg-neutral-900">8 Detik</option>
            <option value={10} className="bg-neutral-900">10 Detik (Stock)</option>
            <option value={12} className="bg-neutral-900">12 Detik</option>
            <option value={15} className="bg-neutral-900">15 Detik</option>
            <option value={20} className="bg-neutral-900">20 Detik</option>
            <option value={30} className="bg-neutral-900">30 Detik</option>
          </select>
        </div>

        {/* Bitrate / Quality */}
        <div className="hidden xl:flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-neutral-400 text-[11px]">Bitrate:</span>
          <select
            value={bitrate}
            onChange={(e) => onChangeBitrate(e.target.value as VideoBitrate)}
            className="bg-transparent font-bold text-neutral-200 outline-none cursor-pointer text-xs"
          >
            <option value="medium" className="bg-neutral-900">15 Mbps (Sedang)</option>
            <option value="high" className="bg-neutral-900">30 Mbps (Tinggi)</option>
            <option value="ultra" className="bg-neutral-900">60 Mbps (Ultra Stock)</option>
            <option value="master" className="bg-neutral-900">100 Mbps (Master)</option>
          </select>
        </div>

        {/* Deterministic Clock Sync Badge */}
        <div
          className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-[11px] font-medium select-none"
          title="Sinkronisasi Frame Deterministik Aktif: Rendering video maju frame-by-frame sesuai timecode virtual sehingga animasi teks dan grafik selalu selesai penuh tanpa loop prematur."
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sync 1:1 Locked</span>
        </div>
      </div>
    </div>
  );
};
