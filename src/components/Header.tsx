import React from 'react';
import {
  Film,
  Sparkles,
  Camera,
  Layers,
  Play,
  RotateCw,
  Download,
  Code2,
  Settings2,
  FileCode,
  Split,
  Maximize2,
  Check,
} from 'lucide-react';
import { ResolutionConfig, ResolutionId } from '../types/microstock';
import { RESOLUTION_PRESETS } from '../data/microstockPresets';

export type WorkspaceMode = 'center' | 'split' | 'fullscreen';

interface HeaderProps {
  selectedResolution: ResolutionConfig;
  onChangeResolution: (res: ResolutionConfig) => void;
  workspaceMode: WorkspaceMode;
  onChangeWorkspaceMode: (mode: WorkspaceMode) => void;
  onOpenPresets: () => void;
  onOpenAiPrompt: () => void;
  onOpenRenderModal: () => void;
  onTakeSnapshot: () => void;
  onReloadPreview: () => void;
  isIframeLoading: boolean;
  isTakingSnapshot?: boolean;
  snapshotSuccess?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedResolution,
  onChangeResolution,
  workspaceMode,
  onChangeWorkspaceMode,
  onOpenPresets,
  onOpenAiPrompt,
  onOpenRenderModal,
  onTakeSnapshot,
  onReloadPreview,
  isIframeLoading,
  isTakingSnapshot = false,
  snapshotSuccess = false,
}) => {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-2 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none overflow-x-auto no-scrollbar gap-2 min-w-0">
      {/* Brand & Identity */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20 shrink-0">
          <Code2 className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-neutral-100 whitespace-nowrap">
              HTML Motion Renderer
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Microstock Edition
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 hidden xl:block">
            Render Script HTML/CSS/JS AI Menjadi Video 4K & PNG Sequence
          </p>
        </div>
      </div>

      {/* Center Tools: Resolution Preset Selector & Workspace Mode */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="flex items-center bg-neutral-950/80 rounded-lg p-0.5 sm:p-1 border border-neutral-800">
          <span className="text-[11px] font-medium text-neutral-400 px-1 sm:px-2 hidden sm:inline">Resolusi:</span>
          <select
            value={selectedResolution.id}
            onChange={(e) => {
              const found = RESOLUTION_PRESETS.find((r) => r.id === e.target.value);
              if (found) onChangeResolution(found);
            }}
            className="bg-transparent text-xs font-semibold text-neutral-200 outline-none cursor-pointer py-0.5 pr-1 sm:pr-2"
          >
            {RESOLUTION_PRESETS.map((res) => (
              <option key={res.id} value={res.id} className="bg-neutral-900 text-neutral-200">
                {res.label} ({res.aspectRatio})
              </option>
            ))}
          </select>
        </div>

        {/* Workspace Mode: Center Stage vs Split View */}
        <div className="flex items-center bg-neutral-950/80 rounded-lg p-0.5 border border-neutral-800">
          <button
            type="button"
            onClick={() => onChangeWorkspaceMode('center')}
            title="Tampilan Panggung Tengah (Center Stage)"
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              workspaceMode === 'center'
                ? 'bg-sky-500 text-neutral-950 shadow-sm shadow-sky-500/30 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tengah</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeWorkspaceMode('split')}
            title="Tampilan Bagi Dua (Split: Kode Kiri & Preview Kanan)"
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              workspaceMode === 'split'
                ? 'bg-sky-500 text-neutral-950 shadow-sm shadow-sky-500/30 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Bagi Dua</span>
          </button>
        </div>

        {/* Reload Preview */}
        <button
          type="button"
          onClick={onReloadPreview}
          title="Muat Ulang Script di Preview"
          className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isIframeLoading ? 'animate-spin text-sky-400' : ''}`} />
        </button>

        {/* Snapshot PNG 4K */}
        <button
          type="button"
          onClick={onTakeSnapshot}
          disabled={isTakingSnapshot}
          title="Ambil Snapshot Frame Ini (.PNG)"
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer shrink-0 ${
            snapshotSuccess
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
              : isTakingSnapshot
              ? 'border-sky-500/50 bg-sky-500/10 text-sky-300'
              : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          {isTakingSnapshot ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span className="hidden sm:inline">Memproses...</span>
            </>
          ) : snapshotSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Tersimpan!</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Snapshot</span>
            </>
          )}
        </button>
      </div>

      {/* Right Controls: Presets, AI Generator, and Render Modal */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Preset Gallery */}
        <button
          type="button"
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer shrink-0"
          title="Galeri Template Script Motion Siap Pakai"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">Galeri Template</span>
        </button>

        {/* AI Prompt Studio */}
        <button
          type="button"
          onClick={onOpenAiPrompt}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold transition-colors shadow-sm cursor-pointer shrink-0"
          title="AI Script Generator & Vision Image to Prompt"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">AI Prompt</span>
        </button>

        {/* Big Export Button */}
        <button
          type="button"
          onClick={onOpenRenderModal}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/25 cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Render 4K</span>
        </button>
      </div>
    </header>
  );
};
