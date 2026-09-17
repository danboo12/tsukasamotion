export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export type ResolutionPreset = '720p' | '1080p' | '4k';

export type LayerType = 'text' | 'shape' | 'badge' | 'particles' | 'glow-ring';

export type ShapeKind = 'rect' | 'circle' | 'pill' | 'star' | 'triangle' | 'donut' | 'hexagon';

export type InAnimationType = 
  | 'none'
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'pop-bounce'
  | 'blur-in'
  | 'elastic-drop'
  | 'kinetic-stagger';

export type LoopAnimationType = 
  | 'none'
  | 'float'
  | 'pulse'
  | 'spin'
  | 'wiggle'
  | 'wave'
  | 'breathing'
  | 'glow-pulse';

export type OutAnimationType = 
  | 'none'
  | 'fade-out'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale-down'
  | 'blur-out';

export type EasingFunctionType = 
  | 'linear'
  | 'easeOutQuad'
  | 'easeInOutCubic'
  | 'easeOutBack'
  | 'easeOutBounce'
  | 'easeOutElastic';

export type SoundEffectType = 'none' | 'whoosh' | 'pop' | 'hit' | 'chime' | 'glitch';

export type BackgroundMotionType = 
  | 'none'
  | 'gradient-shift'
  | 'grid-flow'
  | 'starfield'
  | 'radial-pulse';

export type ParticleKind = 'confetti' | 'stars' | 'bubbles' | 'cyber-dust';

export interface GradientConfig {
  enabled: boolean;
  color1: string;
  color2: string;
  angle: number; // in degrees
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  
  // Timing (in seconds)
  startTime: number;
  duration: number;

  // Base Transform (percentage of canvas width/height: 0-100)
  x: number;
  y: number;
  scale: number; // default 1.0
  rotation: number; // in degrees
  opacity: number; // 0 to 1

  // Type specific properties
  // Text
  text?: string;
  fontSize?: number; // base size in px (at 1080p)
  fontFamily?: string;
  fontWeight?: number | string;
  textColor?: string;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
  textGradient?: GradientConfig;
  textShadow?: boolean;
  shadowColor?: string;

  // Shape
  shapeKind?: ShapeKind;
  width?: number; // in px at 1080p
  height?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  shapeGradient?: GradientConfig;

  // Badge
  badgeText?: string;
  badgeSubtext?: string;
  badgeIcon?: string;
  badgeBgColor?: string;
  badgeBorderColor?: string;
  badgeTextColor?: string;

  // Particles
  particleKind?: ParticleKind;
  particleCount?: number;
  particleColor?: string;
  particleSpeed?: number;

  // Animations
  inAnimation: InAnimationType;
  inDuration: number; // in seconds
  inEasing: EasingFunctionType;

  loopAnimation: LoopAnimationType;
  loopSpeed: number; // multiplier (e.g. 1.0)

  outAnimation: OutAnimationType;
  outDuration: number; // in seconds

  // Sound trigger on enter
  sfx: SoundEffectType;
}

export interface ProjectBgm {
  enabled: boolean;
  type: 'cyber-pulse' | 'ambient-chill' | 'upbeat-groove' | 'minimal-tick' | 'none';
  volume: number; // 0 to 1
}

export interface Project {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  duration: number; // total duration in seconds (e.g. 5.0)
  fps: number; // 30 or 60
  backgroundColor: string;
  backgroundGradient: GradientConfig;
  backgroundMotion: BackgroundMotionType;
  layers: Layer[];
  bgm: ProjectBgm;
}

export interface EvaluatedTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  blur: number; // in px
  clipProgress?: number; // 0 to 1
  kineticOffset?: number;
  isVisible: boolean;
}

export interface RenderExportProgress {
  isRendering: boolean;
  currentFrame: number;
  totalFrames: number;
  progressPercent: number;
  statusText: string;
  videoUrl: string | null;
  fileSizeMb?: number;
  error?: string | null;
}
