import { Project, ResolutionPreset, RenderExportProgress } from '../types/motion';
import { renderProjectToCanvas } from './motionEngine';
import { soundEngine } from './audioSynthesizer';

export function getResolutionDimensions(
  aspectRatio: Project['aspectRatio'],
  resolution: ResolutionPreset
): { width: number; height: number } {
  let baseLongEdge = 1920;
  if (resolution === '720p') baseLongEdge = 1280;
  if (resolution === '4k') baseLongEdge = 3840;

  switch (aspectRatio) {
    case '16:9':
      return { width: baseLongEdge, height: Math.round((baseLongEdge * 9) / 16) };
    case '9:16':
      return { width: Math.round((baseLongEdge * 9) / 16), height: baseLongEdge };
    case '1:1':
      const sq = resolution === '720p' ? 720 : resolution === '4k' ? 2160 : 1080;
      return { width: sq, height: sq };
    case '4:5':
      const w = resolution === '720p' ? 720 : resolution === '4k' ? 2160 : 1080;
      return { width: w, height: Math.round((w * 5) / 4) };
  }
}

/**
 * Renders the project to a WebM video file with live progress callback and audio integration.
 */
export async function exportProjectToWebM(
  project: Project,
  resolution: ResolutionPreset,
  onProgress: (progress: RenderExportProgress) => void,
  abortSignal?: { aborted: boolean }
): Promise<string> {
  const { width, height } = getResolutionDimensions(project.aspectRatio, resolution);
  const fps = project.fps || 60;
  const totalDuration = project.duration;
  const totalFrames = Math.floor(totalDuration * fps);

  // Setup offscreen render canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Could not get 2D canvas context for export');

  onProgress({
    isRendering: true,
    currentFrame: 0,
    totalFrames,
    progressPercent: 0,
    statusText: 'Menginisialisasi encoder video & audio...',
    videoUrl: null,
  });

  // Capture canvas video stream
  const canvasStream = canvas.captureStream(fps);
  const combinedStream = new MediaStream();

  // Add video track
  canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));

  // Add synthesized audio track if audio is enabled
  try {
    const audioStream = soundEngine.getAudioStream();
    if (audioStream) {
      audioStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
    }
  } catch {
    // Graceful fallback if audio track couldn't attach
  }

  // Detect supported mimeTypes
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  let selectedMime = 'video/webm';
  for (const mime of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      selectedMime = mime;
      break;
    }
  }

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(combinedStream, {
    mimeType: selectedMime,
    videoBitsPerSecond: resolution === '4k' ? 18000000 : resolution === '1080p' ? 8000000 : 4000000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  recorder.start(100); // chunk every 100ms

  // If project has background music or sound effects, trigger BGM
  if (project.bgm?.enabled) {
    soundEngine.startBGM(project.bgm);
  }

  const frameIntervalMs = 1000 / fps;
  const startTimePerf = performance.now();

  // Render frame by frame
  for (let f = 0; f <= totalFrames; f++) {
    if (abortSignal?.aborted) {
      recorder.stop();
      soundEngine.stopBGM();
      throw new Error('Render dibatalkan pengguna');
    }

    const t = (f / totalFrames) * totalDuration;

    // Check layer sound effects at start time
    project.layers.forEach((layer) => {
      if (layer.sfx && layer.sfx !== 'none') {
        const frameStart = Math.floor(layer.startTime * fps);
        if (f === frameStart) {
          soundEngine.playSFX(layer.sfx);
        }
      }
    });

    renderProjectToCanvas(ctx, project, t, width, height);

    // Update progress
    const progressPercent = Math.min(99, Math.round((f / totalFrames) * 100));
    const elapsed = (performance.now() - startTimePerf) / 1000;
    const fpsAchieved = f > 0 ? (f / elapsed).toFixed(1) : fps.toString();

    onProgress({
      isRendering: true,
      currentFrame: f,
      totalFrames,
      progressPercent,
      statusText: `Merender frame ${f}/${totalFrames} (${progressPercent}%) • ${fpsAchieved} FPS`,
      videoUrl: null,
    });

    // Wait for frame timing to allow stream capture to sample smoothly
    await new Promise((resolve) => setTimeout(resolve, frameIntervalMs * 0.7));
  }

  soundEngine.stopBGM();

  onProgress({
    isRendering: true,
    currentFrame: totalFrames,
    totalFrames,
    progressPercent: 99,
    statusText: 'Menyusun kontainer video WebM...',
    videoUrl: null,
  });

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      try {
        const blob = new Blob(recordedChunks, { type: selectedMime });
        const videoUrl = URL.createObjectURL(blob);
        const fileSizeMb = Number((blob.size / (1024 * 1024)).toFixed(2));

        onProgress({
          isRendering: false,
          currentFrame: totalFrames,
          totalFrames,
          progressPercent: 100,
          statusText: 'Render selesai!',
          videoUrl,
          fileSizeMb,
        });

        resolve(videoUrl);
      } catch (err) {
        reject(err);
      }
    };

    // Allow last frames to flush
    setTimeout(() => {
      recorder.stop();
    }, 200);
  });
}

/**
 * Exports the current frame at full project resolution as a PNG poster image
 */
export function exportFrameAsPNG(
  project: Project,
  currentTime: number,
  resolution: ResolutionPreset
): void {
  const { width, height } = getResolutionDimensions(project.aspectRatio, resolution);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  renderProjectToCanvas(ctx, project, currentTime, width, height);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-frame-${currentTime.toFixed(2)}s.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/**
 * Exports the project state as JSON file
 */
export function exportProjectJSON(project: Project) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_project.motion`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
