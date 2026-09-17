export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export type ResolutionId =
  | '4k-uhd'
  | '1080p-fhd'
  | '9:16-4k'
  | '9:16-fhd'
  | '1:1-square-4k'
  | '1:1-square-hd'
  | '4:5-social';

export interface ResolutionConfig {
  id: ResolutionId;
  label: string;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  category: 'Landscape' | 'Vertical' | 'Square';
  recommendedFor: string;
}

export type FrameRate = 24 | 25 | 29.97 | 30 | 60;

export type BackgroundType = 'transparent' | 'black' | 'dark' | 'white' | 'custom';

export type ExportFormat = 'mp4-h264' | 'mov-prores' | 'webm-vp9' | 'png-sequence' | 'png-poster';

export type VideoBitrate = 'compact' | 'medium' | 'high' | 'ultra' | 'master'; // compact (15mbps), medium (30mbps), high (60mbps), ultra (90mbps), master (120mbps)

export interface ExternalLibrary {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
}

export interface MicrostockScriptPreset {
  id: string;
  title: string;
  category:
    | 'Luxury & Bokeh'
    | 'Neural & Cyber Tech'
    | 'Business & Infographics'
    | 'Fluid Aura Gradients'
    | 'Broadcast & Lower Thirds'
    | 'Geometric VJ Loops';
  description: string;
  duration: number;
  fps: FrameRate;
  aspectRatio: AspectRatio;
  transparent: boolean;
  tags: string[];
  htmlCode: string;
  requiredLibraries?: string[];
}

export interface RenderProgress {
  isRendering: boolean;
  exportFormat: ExportFormat;
  currentFrame: number;
  totalFrames: number;
  percent: number;
  statusText: string;
  actualWidth?: number;
  actualHeight?: number;
  renderingFps?: number;
  estimatedSecondsRemaining?: number;
  qualityTier?: string;
  outputVideoUrl: string | null;
  outputZipUrl: string | null;
  outputFileSizeMb?: number;
  outputBlob?: Blob | null;
  outputFilename?: string;
  error?: string | null;
}
