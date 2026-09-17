import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Film,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Camera,
  Play,
} from 'lucide-react';
import { Project, ResolutionPreset, RenderExportProgress } from '../types/motion';
import { exportProjectToWebM, getResolutionDimensions } from '../engine/exportEngine';

interface RenderModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  defaultResolution: ResolutionPreset;
}

export const RenderModal: React.FC<RenderModalProps> = ({
  project,
  isOpen,
  onClose,
  defaultResolution,
}) => {
  const [resolution, setResolution] = useState<ResolutionPreset>(defaultResolution);
  const [renderProgress, setRenderProgress] = useState<RenderExportProgress>({
    isRendering: false,
    currentFrame: 0,
    totalFrames: 0,
    progressPercent: 0,
    statusText: '',
    videoUrl: null,
    fileSizeMb: undefined,
  });

  const abortSignalRef = useRef<{ aborted: boolean }>({ aborted: false });

  if (!isOpen) return null;

  const { width, height } = getResolutionDimensions(project.aspectRatio, resolution);
  const totalFrames = Math.floor(project.duration * project.fps);

  const startRender = async () => {
    abortSignalRef.current = { aborted: false };
    try {
      await exportProjectToWebM(
        project,
        resolution,
        (progress) => {
          setRenderProgress(progress);
        },
        abortSignalRef.current
      );
    } catch (err: unknown) {
      if ((err as Error)?.message !== 'Render dibatalkan pengguna') {
        setRenderProgress((prev) => ({
          ...prev,
          isRendering: false,
          error: (err as Error)?.message || 'Terjadi kesalahan saat rendering',
        }));
      }
    }
  };

  const handleCancel = () => {
    abortSignalRef.current.aborted = true;
    setRenderProgress({
      isRendering: false,
      currentFrame: 0,
      totalFrames: 0,
      progressPercent: 0,
      statusText: '',
      videoUrl: null,
    });
  };

  const handleDownload = () => {
    if (!renderProgress.videoUrl) return;
    const a = document.createElement('a');
    a.href = renderProgress.videoUrl;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-${resolution}-${project.fps}fps.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">Render & Ekspor Video</h2>
              <p className="text-xs text-neutral-400">
                Ekspor animasi motion grafis resolusi tinggi dalam format WebM
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (renderProgress.isRendering) handleCancel();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Settings Section (when not rendering and no video yet) */}
          {!renderProgress.isRendering && !renderProgress.videoUrl && (
            <div className="space-y-4">
              {/* Resolution selection */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-2">
                  Pilih Resolusi Video
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['720p', '1080p', '4k'] as ResolutionPreset[]).map((res) => {
                    const dims = getResolutionDimensions(project.aspectRatio, res);
                    const isSelected = resolution === res;
                    return (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setResolution(res)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/10 text-white ring-1 ring-sky-500'
                            : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="text-xs font-bold uppercase">{res}</div>
                        <div className="text-[11px] font-mono text-neutral-400 mt-1">
                          {dims.width} × {dims.height}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Composition Summary Specs */}
              <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800 text-xs space-y-2 font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Aspek Rasio</span>
                  <span className="text-neutral-200">{project.aspectRatio}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Frame Rate</span>
                  <span className="text-neutral-200">{project.fps} FPS</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Durasi</span>
                  <span className="text-neutral-200">{project.duration} Detik ({totalFrames} frames)</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Encoder Format</span>
                  <span className="text-sky-400 font-semibold">WebM (VP9/VP8 Video + Audio)</span>
                </div>
              </div>

              {/* Start Render Button */}
              <button
                type="button"
                onClick={startRender}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>MULAI PROSES RENDER</span>
              </button>
            </div>
          )}

          {/* Rendering Progress View */}
          {renderProgress.isRendering && (
            <div className="space-y-4 py-4 text-center">
              <div className="inline-flex p-3 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 animate-spin">
                <Loader2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-neutral-100">Merender Video Motion...</h3>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  {renderProgress.statusText}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 max-w-md mx-auto">
                <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-150"
                    style={{ width: `${renderProgress.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-neutral-400 px-1">
                  <span>
                    Frame {renderProgress.currentFrame} / {renderProgress.totalFrames}
                  </span>
                  <span className="text-sky-400 font-bold">{renderProgress.progressPercent}%</span>
                </div>
              </div>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
              >
                Batalkan Render
              </button>
            </div>
          )}

          {/* Success Preview & Download View */}
          {!renderProgress.isRendering && renderProgress.videoUrl && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Video Berhasil Dirender! Ukuran perkiraan: {renderProgress.fileSizeMb} MB</span>
              </div>

              {/* Video Player Preview */}
              <div className="rounded-xl overflow-hidden border border-neutral-800 bg-black aspect-video flex items-center justify-center">
                <video
                  src={renderProgress.videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>UNDUH VIDEO (.WEBM)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRenderProgress({
                      isRendering: false,
                      currentFrame: 0,
                      totalFrames: 0,
                      progressPercent: 0,
                      statusText: '',
                      videoUrl: null,
                    });
                  }}
                  className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-xl transition-colors"
                >
                  Render Ulang
                </button>
              </div>
            </div>
          )}

          {/* Error View */}
          {renderProgress.error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{renderProgress.error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
