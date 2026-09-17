import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header, WorkspaceMode } from './components/Header';
import { CodeEditor } from './components/CodeEditor';
import { PreviewStage } from './components/PreviewStage';
import { TransportBar } from './components/TransportBar';
import { AIPromptModal } from './components/AIPromptModal';
import { PresetGalleryModal } from './components/PresetGalleryModal';
import { RenderProgressModal } from './components/RenderProgressModal';
import { Code2 } from 'lucide-react';

import {
  BackgroundType,
  FrameRate,
  MicrostockScriptPreset,
  ResolutionConfig,
  VideoBitrate,
} from './types/microstock';
import { RESOLUTION_PRESETS, MICROSTOCK_PRESETS } from './data/microstockPresets';
import { buildHtmlBundle } from './engine/codeRunner';
import { captureSnapshotPng } from './engine/videoExporter';

export default function App() {
  // Current active script & libraries
  const [currentPreset, setCurrentPreset] = useState<MicrostockScriptPreset>(MICROSTOCK_PRESETS[0]);
  const [htmlCode, setHtmlCode] = useState<string>(MICROSTOCK_PRESETS[0].htmlCode);
  const [selectedLibraries, setSelectedLibraries] = useState<string[]>([]);

  // Video & Motion Specs
  const [selectedResolution, setSelectedResolution] = useState<ResolutionConfig>(
    RESOLUTION_PRESETS[0] // Default to 4K Ultra HD
  );
  const [fps, setFps] = useState<FrameRate>(60);
  const [duration, setDuration] = useState<number>(10); // Standard 10s stock loop
  const [bitrate, setBitrate] = useState<VideoBitrate>('ultra');
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('dark');

  // Playback & Transport State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Workspace Mode: 'split' divides left & right; 'center' puts preview directly in the center
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('split');
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState<boolean>(false);

  // Modals
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [isAiPromptModalOpen, setIsAiPromptModalOpen] = useState<boolean>(false);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState<boolean>(false);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(false);

  // References
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());

  // Compiled HTML Bundle
  const [bundledHtml, setBundledHtml] = useState<string>(() =>
    buildHtmlBundle(htmlCode, selectedLibraries, backgroundType === 'transparent')
  );

  // Update bundled HTML when code, libs, or background changes
  const updateBundle = useCallback(() => {
    setIsIframeLoading(true);
    const compiled = buildHtmlBundle(
      htmlCode,
      selectedLibraries,
      backgroundType === 'transparent'
    );
    setBundledHtml(compiled);
    setTimeout(() => setIsIframeLoading(false), 200);
  }, [htmlCode, selectedLibraries, backgroundType]);

  useEffect(() => {
    updateBundle();
  }, [updateBundle]);

  // Timeline playback tracking loop
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (isPlaying) {
        const elapsed = (now - startTimeRef.current) / 1000;
        if (isLooping) {
          const modTime = elapsed % duration;
          setCurrentTime(modTime);
        } else {
          if (elapsed >= duration) {
            setCurrentTime(duration);
            setIsPlaying(false);
          } else {
            setCurrentTime(elapsed);
          }
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isLooping, duration]);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    const next = !isPlaying;
    if (next) {
      startTimeRef.current = performance.now() - currentTime * 1000;
    }
    setIsPlaying(next);
    try {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'SET_PLAYING',
        isPlaying: next
      }, '*');
    } catch (e) {}
  };

  // Restart to 00:00
  const handleRestart = () => {
    startTimeRef.current = performance.now();
    setCurrentTime(0);
    setIsPlaying(true);
    try {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'RESTART'
      }, '*');
      iframeRef.current?.contentWindow?.postMessage({
        type: 'SEEK_TIME',
        timeSeconds: 0,
        duration
      }, '*');
    } catch (e) {}
    updateBundle();
  };

  // Scrubbing
  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    startTimeRef.current = performance.now() - newTime * 1000;
    try {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'SEEK_TIME',
        timeSeconds: newTime,
        duration
      }, '*');
    } catch (e) {}
  };

  const handleChangeDuration = (newDur: number) => {
    setDuration(newDur);
    try {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'SET_DURATION',
        duration: newDur
      }, '*');
    } catch (e) {}
  };

  // Toggle CDN Library
  const handleToggleLibrary = (libId: string) => {
    setSelectedLibraries((prev) =>
      prev.includes(libId) ? prev.filter((id) => id !== libId) : [...prev, libId]
    );
  };

  // Apply a Preset from Gallery
  const handleSelectPreset = (preset: MicrostockScriptPreset) => {
    setCurrentPreset(preset);
    setHtmlCode(preset.htmlCode);
    setDuration(preset.duration);
    setFps(preset.fps);
    if (preset.transparent) {
      setBackgroundType('transparent');
    } else {
      setBackgroundType('dark');
    }
    if (preset.requiredLibraries) {
      setSelectedLibraries(preset.requiredLibraries);
    }
    startTimeRef.current = performance.now();
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Apply code generated by AI
  const handleApplyAiGeneratedCode = (newCode: string) => {
    setHtmlCode(newCode);
    startTimeRef.current = performance.now();
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Snapshot state
  const [isTakingSnapshot, setIsTakingSnapshot] = useState<boolean>(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState<boolean>(false);

  // Snapshot PNG Frame at TRUE native resolution
  const handleTakeSnapshot = async () => {
    if (isTakingSnapshot) return;
    setIsTakingSnapshot(true);
    try {
      const bgColor =
        backgroundType === 'white'
          ? '#ffffff'
          : backgroundType === 'black'
          ? '#000000'
          : '#07070d';

      await captureSnapshotPng(
        htmlCode,
        selectedLibraries,
        selectedResolution,
        backgroundType === 'transparent',
        currentTime,
        fps,
        duration,
        iframeRef.current,
        `microstock-${selectedResolution.width}x${selectedResolution.height}-${Math.floor(
          currentTime * 100
        )}.png`,
        bgColor
      );
      setSnapshotSuccess(true);
      setTimeout(() => setSnapshotSuccess(false), 2200);
    } catch (e) {
      console.error('Snapshot capture error:', e);
    } finally {
      setIsTakingSnapshot(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] w-full max-w-full bg-neutral-950 text-neutral-100 overflow-hidden font-sans select-none">
      {/* 1. Header Toolbar */}
      <Header
        selectedResolution={selectedResolution}
        onChangeResolution={setSelectedResolution}
        workspaceMode={workspaceMode}
        onChangeWorkspaceMode={setWorkspaceMode}
        onOpenPresets={() => setIsPresetModalOpen(true)}
        onOpenAiPrompt={() => setIsAiPromptModalOpen(true)}
        onOpenRenderModal={() => setIsRenderModalOpen(true)}
        onTakeSnapshot={handleTakeSnapshot}
        onReloadPreview={updateBundle}
        isIframeLoading={isIframeLoading}
        isTakingSnapshot={isTakingSnapshot}
        snapshotSuccess={snapshotSuccess}
      />

      {/* 2. Main Workspace: Code Editor & Preview Stage */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 min-w-0 overflow-hidden relative">
        {/* Left Side / Drawer: HTML Script Code Editor & Ingestion */}
        {workspaceMode === 'split' ? (
          <div className="w-full md:w-[48%] lg:w-[44%] xl:w-[40%] h-1/2 md:h-full flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-neutral-800 min-h-0 min-w-0">
            <CodeEditor
              htmlCode={htmlCode}
              onChangeCode={setHtmlCode}
              selectedLibraries={selectedLibraries}
              onToggleLibrary={handleToggleLibrary}
              onRunPreview={updateBundle}
            />
          </div>
        ) : isCodeDrawerOpen ? (
          <div className="absolute inset-y-0 left-0 w-full max-w-lg z-30 flex flex-col shadow-2xl border-r border-neutral-800 bg-neutral-950 animate-in slide-in-from-left duration-200 min-h-0">
            <div className="h-10 px-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>Editor Script Motion</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCodeDrawerOpen(false)}
                className="text-xs text-neutral-300 hover:text-white px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors font-medium cursor-pointer"
              >
                Tutup Panel
              </button>
            </div>
            <div className="flex-1 min-h-0 min-w-0">
              <CodeEditor
                htmlCode={htmlCode}
                onChangeCode={setHtmlCode}
                selectedLibraries={selectedLibraries}
                onToggleLibrary={handleToggleLibrary}
                onRunPreview={updateBundle}
              />
            </div>
          </div>
        ) : null}

        {/* Center / Right Side: Microstock Stage Preview & Canvas Frame */}
        <div className="flex-1 h-full flex flex-col min-w-0 min-h-0 bg-neutral-950 relative">
          {workspaceMode === 'center' && (
            <div className="absolute top-2.5 left-4 z-30">
              <button
                type="button"
                onClick={() => setIsCodeDrawerOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border shadow-lg backdrop-blur-md transition-all cursor-pointer ${
                  isCodeDrawerOpen
                    ? 'bg-sky-500 text-neutral-950 border-sky-400 font-bold'
                    : 'bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{isCodeDrawerOpen ? 'Tutup Panel Editor' : 'Buka Editor Script'}</span>
              </button>
            </div>
          )}

          <PreviewStage
            iframeRef={iframeRef}
            bundledHtml={bundledHtml}
            resolution={selectedResolution}
            fps={fps}
            duration={duration}
            backgroundType={backgroundType}
            onChangeBackgroundType={setBackgroundType}
            isLooping={isLooping}
          />
        </div>
      </main>

      {/* 3. Bottom Transport Timeline Bar */}
      <TransportBar
        currentTime={currentTime}
        duration={duration}
        fps={fps}
        isPlaying={isPlaying}
        isLooping={isLooping}
        bitrate={bitrate}
        onTogglePlay={handleTogglePlay}
        onRestart={handleRestart}
        onToggleLoop={() => setIsLooping((l) => !l)}
        onSeek={handleSeek}
        onChangeFps={setFps}
        onChangeDuration={handleChangeDuration}
        onChangeBitrate={setBitrate}
      />

      {/* 4. Modals */}
      <AIPromptModal
        isOpen={isAiPromptModalOpen}
        onClose={() => setIsAiPromptModalOpen(false)}
        onApplyGeneratedCode={handleApplyAiGeneratedCode}
        resolution={selectedResolution}
        duration={duration}
        fps={fps}
        transparent={backgroundType === 'transparent'}
      />

      <PresetGalleryModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <RenderProgressModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        htmlCode={htmlCode}
        selectedLibraries={selectedLibraries}
        resolution={selectedResolution}
        duration={duration}
        fps={fps}
        bitrate={bitrate}
        isTransparent={backgroundType === 'transparent'}
      />
    </div>
  );
}
