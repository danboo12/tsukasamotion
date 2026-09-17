import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Palette,
  Volume2,
  Trash2,
  Copy,
  Layers,
  Activity,
  Type,
  Maximize,
  RotateCw,
  Sun,
  Eye,
  Music,
} from 'lucide-react';
import {
  Project,
  Layer,
  InAnimationType,
  LoopAnimationType,
  OutAnimationType,
  EasingFunctionType,
  SoundEffectType,
  BackgroundMotionType,
  ShapeKind,
  ParticleKind,
} from '../types/motion';
import { soundEngine } from '../engine/audioSynthesizer';

interface InspectorProps {
  project: Project;
  selectedLayerId: string | null;
  onUpdateProject: (updated: Partial<Project>) => void;
  onUpdateLayer: (id: string, updated: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  project,
  selectedLayerId,
  onUpdateProject,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'motion' | 'project'>('properties');

  const selectedLayer = project.layers.find((l) => l.id === selectedLayerId);

  // If no layer selected, auto-show project canvas properties
  const isProjectView = !selectedLayer || activeTab === 'project';

  return (
    <aside className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col select-none overflow-hidden z-30">
      {/* Top Header Tabs */}
      <div className="h-12 border-b border-neutral-800 flex items-center px-3 gap-1 bg-neutral-950/60">
        <button
          onClick={() => setActiveTab('properties')}
          disabled={!selectedLayer}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'properties' && selectedLayer
              ? 'bg-neutral-800 text-sky-400'
              : selectedLayer
              ? 'text-neutral-400 hover:text-neutral-200'
              : 'text-neutral-600 cursor-not-allowed'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Properties</span>
        </button>

        <button
          onClick={() => setActiveTab('motion')}
          disabled={!selectedLayer}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'motion' && selectedLayer
              ? 'bg-neutral-800 text-sky-400'
              : selectedLayer
              ? 'text-neutral-400 hover:text-neutral-200'
              : 'text-neutral-600 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Animasi</span>
        </button>

        <button
          onClick={() => setActiveTab('project')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            isProjectView
              ? 'bg-neutral-800 text-sky-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Canvas</span>
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-neutral-300">
        {selectedLayer && !isProjectView ? (
          <>
            {/* Header: Layer Name & Quick Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex-1 mr-2">
                <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-1">
                  Nama Layer
                </label>
                <input
                  type="text"
                  value={selectedLayer.name}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { name: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-neutral-200 font-semibold focus:border-sky-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-1 pt-3">
                <button
                  onClick={() => onDuplicateLayer(selectedLayer.id)}
                  className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                  title="Duplikat"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteLayer(selectedLayer.id)}
                  className="p-1.5 rounded bg-neutral-800 hover:bg-rose-900/60 text-neutral-300 hover:text-rose-300 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* TAB 1: PROPERTIES (Transform + Content/Style) */}
            {activeTab === 'properties' && (
              <div className="space-y-4">
                {/* Transform Section */}
                <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Maximize className="w-3.5 h-3.5 text-sky-400" />
                    Transformasi
                  </span>

                  {/* Position X & Y */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-neutral-400">Pos X (%)</span>
                        <span className="font-mono text-neutral-300">{selectedLayer.x}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.5"
                        value={selectedLayer.x}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, { x: parseFloat(e.target.value) })
                        }
                        className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-neutral-400">Pos Y (%)</span>
                        <span className="font-mono text-neutral-300">{selectedLayer.y}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.5"
                        value={selectedLayer.y}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, { y: parseFloat(e.target.value) })
                        }
                        className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Scale & Rotation */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-neutral-400">Skala</span>
                        <span className="font-mono text-neutral-300">
                          {selectedLayer.scale.toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="2.5"
                        step="0.05"
                        value={selectedLayer.scale}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, { scale: parseFloat(e.target.value) })
                        }
                        className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-neutral-400">Rotasi</span>
                        <span className="font-mono text-neutral-300">{selectedLayer.rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={selectedLayer.rotation}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, {
                            rotation: parseInt(e.target.value),
                          })
                        }
                        className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Opacity */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-400">Opasitas</span>
                      <span className="font-mono text-neutral-300">
                        {Math.round(selectedLayer.opacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedLayer.opacity}
                      onChange={(e) =>
                        onUpdateLayer(selectedLayer.id, {
                          opacity: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Content Specific: TEXT */}
                {selectedLayer.type === 'text' && (
                  <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-sky-400" />
                      Tipografi & Teks
                    </span>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Teks Konten</label>
                      <textarea
                        rows={2}
                        value={selectedLayer.text || ''}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, { text: e.target.value })
                        }
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-neutral-200 outline-none focus:border-sky-500 resize-none font-medium"
                      />
                    </div>

                    {/* Font Family & Size */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Font Family</label>
                        <select
                          value={selectedLayer.fontFamily || 'Outfit, sans-serif'}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, { fontFamily: e.target.value })
                          }
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
                        >
                          <option value="Outfit, sans-serif">Outfit (Modern Display)</option>
                          <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                          <option value="Syne, sans-serif">Syne (Bold Brutalist)</option>
                          <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Ukuran ({selectedLayer.fontSize}px)</label>
                        <input
                          type="range"
                          min="18"
                          max="160"
                          value={selectedLayer.fontSize || 64}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })
                          }
                          className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer mt-2"
                        />
                      </div>
                    </div>

                    {/* Font Weight & Align */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Ketebalan</label>
                        <select
                          value={selectedLayer.fontWeight || 800}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, { fontWeight: parseInt(e.target.value) })
                          }
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
                        >
                          <option value="400">Regular (400)</option>
                          <option value="600">Semi-Bold (600)</option>
                          <option value="800">Bold (800)</option>
                          <option value="900">Black (900)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Perataan</label>
                        <select
                          value={selectedLayer.textAlign || 'center'}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, { textAlign: e.target.value as 'left' | 'center' | 'right' })
                          }
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
                        >
                          <option value="center">Tengah (Center)</option>
                          <option value="left">Kiri (Left)</option>
                          <option value="right">Kanan (Right)</option>
                        </select>
                      </div>
                    </div>

                    {/* Solid Color & Text Shadow */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-neutral-400">Warna Teks</label>
                        <input
                          type="color"
                          value={selectedLayer.textColor || '#ffffff'}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, { textColor: e.target.value })
                          }
                          className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                        />
                      </div>
                      <label className="flex items-center gap-1.5 text-[11px] text-neutral-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLayer.textShadow || false}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, { textShadow: e.target.checked })
                          }
                          className="rounded accent-sky-500"
                        />
                        <span>Drop Shadow</span>
                      </label>
                    </div>

                    {/* Text Gradient */}
                    <div className="pt-2 border-t border-neutral-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-neutral-300 font-semibold">Warna Gradasi (Gradient)</span>
                        <input
                          type="checkbox"
                          checked={selectedLayer.textGradient?.enabled || false}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, {
                              textGradient: {
                                enabled: e.target.checked,
                                color1: selectedLayer.textGradient?.color1 || '#38bdf8',
                                color2: selectedLayer.textGradient?.color2 || '#ec4899',
                                angle: selectedLayer.textGradient?.angle || 90,
                              },
                            })
                          }
                          className="rounded accent-sky-500"
                        />
                      </div>

                      {selectedLayer.textGradient?.enabled && (
                        <div className="flex items-center gap-2 bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                          <input
                            type="color"
                            value={selectedLayer.textGradient.color1}
                            onChange={(e) =>
                              onUpdateLayer(selectedLayer.id, {
                                textGradient: {
                                  ...selectedLayer.textGradient!,
                                  color1: e.target.value,
                                },
                              })
                            }
                            className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                          />
                          <span className="text-neutral-500">→</span>
                          <input
                            type="color"
                            value={selectedLayer.textGradient.color2}
                            onChange={(e) =>
                              onUpdateLayer(selectedLayer.id, {
                                textGradient: {
                                  ...selectedLayer.textGradient!,
                                  color2: e.target.value,
                                },
                              })
                            }
                            className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                          />
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={selectedLayer.textGradient.angle}
                            onChange={(e) =>
                              onUpdateLayer(selectedLayer.id, {
                                textGradient: {
                                  ...selectedLayer.textGradient!,
                                  angle: parseInt(e.target.value),
                                },
                              })
                            }
                            className="flex-1 accent-sky-500 h-1 bg-neutral-800 rounded"
                            title="Sudut Sudut Gradasi"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Content Specific: SHAPE */}
                {selectedLayer.type === 'shape' && (
                  <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-400" />
                      Pengaturan Bentuk / Shape
                    </span>

                    {/* Shape Kind */}
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Model Bentuk</label>
                      <select
                        value={selectedLayer.shapeKind || 'rect'}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, {
                            shapeKind: e.target.value as ShapeKind,
                          })
                        }
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
                      >
                        <option value="rect">Kotak Persegi (Rounded Rect)</option>
                        <option value="pill">Pill Capsule</option>
                        <option value="circle">Lingkaran Penuh (Circle)</option>
                        <option value="donut">Donat Ring</option>
                        <option value="star">Bintang (5-Spike Star)</option>
                        <option value="hexagon">Heksagonal (Hexagon)</option>
                        <option value="triangle">Segitiga (Triangle)</option>
                      </select>
                    </div>

                    {/* Width & Height */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">
                          Lebar ({selectedLayer.width}px)
                        </label>
                        <input
                          type="range"
                          min="40"
                          max="900"
                          value={selectedLayer.width || 300}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, {
                              width: parseInt(e.target.value),
                            })
                          }
                          className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">
                          Tinggi ({selectedLayer.height}px)
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="900"
                          value={selectedLayer.height || 180}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, {
                              height: parseInt(e.target.value),
                            })
                          }
                          className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Fill Color & Stroke */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-neutral-400">Warna Isi</label>
                        <input
                          type="color"
                          value={selectedLayer.fillColor || '#4f46e5'}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, { fillColor: e.target.value })
                          }
                          className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-neutral-400">Border</label>
                        <input
                          type="color"
                          value={selectedLayer.strokeColor || '#38bdf8'}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, {
                              strokeColor: e.target.value,
                              strokeWidth: selectedLayer.strokeWidth || 2,
                            })
                          }
                          className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Border Radius (if rect) */}
                    {selectedLayer.shapeKind === 'rect' && (
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-neutral-400">Corner Radius</span>
                          <span className="font-mono text-neutral-300">
                            {selectedLayer.borderRadius || 16}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          value={selectedLayer.borderRadius || 16}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, {
                              borderRadius: parseInt(e.target.value),
                            })
                          }
                          className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Content Specific: BADGE */}
                {selectedLayer.type === 'badge' && (
                  <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Pill Badge
                    </span>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Teks Utama</label>
                      <input
                        type="text"
                        value={selectedLayer.badgeText || ''}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, { badgeText: e.target.value })
                        }
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Subteks (Opsional)</label>
                      <input
                        type="text"
                        value={selectedLayer.badgeSubtext || ''}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, { badgeSubtext: e.target.value })
                        }
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-neutral-400">Warna Teks</label>
                        <input
                          type="color"
                          value={selectedLayer.badgeTextColor || '#38bdf8'}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, { badgeTextColor: e.target.value })
                          }
                          className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-neutral-400">Warna Border</label>
                        <input
                          type="color"
                          value={selectedLayer.badgeBorderColor || '#38bdf8'}
                          onChange={(e) =>
                            onUpdateLayer(selectedLayer.id, { badgeBorderColor: e.target.value })
                          }
                          className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Specific: PARTICLES */}
                {selectedLayer.type === 'particles' && (
                  <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Partikel FX
                    </span>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Jenis Partikel</label>
                      <select
                        value={selectedLayer.particleKind || 'confetti'}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, {
                            particleKind: e.target.value as ParticleKind,
                          })
                        }
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 outline-none"
                      >
                        <option value="confetti">Confetti Melayang</option>
                        <option value="stars">Bintang Berkelip</option>
                        <option value="bubbles">Gelembung Halus</option>
                        <option value="cyber-dust">Cyber Dust</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-neutral-400">Jumlah Partikel</span>
                        <span className="font-mono text-neutral-300">
                          {selectedLayer.particleCount || 40}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="120"
                        value={selectedLayer.particleCount || 40}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, {
                            particleCount: parseInt(e.target.value),
                          })
                        }
                        className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ANIMATION & SFX */}
            {activeTab === 'motion' && (
              <div className="space-y-4">
                {/* 1. IN-ANIMATION */}
                <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                      ▶ In-Animation (Masuk)
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {selectedLayer.inDuration}s
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Efek Masuk</label>
                    <select
                      value={selectedLayer.inAnimation}
                      onChange={(e) =>
                        onUpdateLayer(selectedLayer.id, {
                          inAnimation: e.target.value as InAnimationType,
                        })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-neutral-200 outline-none font-semibold"
                    >
                      <option value="none">Tanpa Efek (None)</option>
                      <option value="fade-in">Fade In (Transparansi)</option>
                      <option value="slide-up">Slide Up (Meluncur Naik)</option>
                      <option value="slide-down">Slide Down (Meluncur Turun)</option>
                      <option value="slide-right">Slide Right (Dari Kiri)</option>
                      <option value="slide-left">Slide Left (Dari Kanan)</option>
                      <option value="pop-bounce">Pop & Bounce (Membal)</option>
                      <option value="elastic-drop">Elastic Drop (Pegas)</option>
                      <option value="blur-in">Cinematic Blur In</option>
                      <option value="kinetic-stagger">Kinetic Typography Stagger</option>
                    </select>
                  </div>

                  {/* Duration slider */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-400">Durasi Masuk</span>
                      <span className="font-mono text-neutral-300">
                        {selectedLayer.inDuration.toFixed(1)} detik
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.5"
                      step="0.1"
                      value={selectedLayer.inDuration}
                      onChange={(e) =>
                        onUpdateLayer(selectedLayer.id, {
                          inDuration: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Easing Function */}
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Kurva Easing</label>
                    <select
                      value={selectedLayer.inEasing}
                      onChange={(e) =>
                        onUpdateLayer(selectedLayer.id, {
                          inEasing: e.target.value as EasingFunctionType,
                        })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-300 outline-none"
                    >
                      <option value="easeOutBack">Ease Out Back (Overshoot Punch)</option>
                      <option value="easeOutBounce">Ease Out Bounce (Membal Nyata)</option>
                      <option value="easeOutElastic">Ease Out Elastic (Pegas Lentur)</option>
                      <option value="easeInOutCubic">Ease In-Out Cubic (Halus)</option>
                      <option value="easeOutQuad">Ease Out Quad (Standar)</option>
                      <option value="linear">Linear (Rata)</option>
                    </select>
                  </div>
                </div>

                {/* 2. ACTIVE LOOP MOTION */}
                <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      ⚡ Gerak Aktif (Looping)
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Jenis Gerakan</label>
                    <select
                      value={selectedLayer.loopAnimation}
                      onChange={(e) =>
                        onUpdateLayer(selectedLayer.id, {
                          loopAnimation: e.target.value as LoopAnimationType,
                        })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-neutral-200 outline-none font-semibold"
                    >
                      <option value="none">Diam (None)</option>
                      <option value="float">Floating (Mengapung Santai)</option>
                      <option value="pulse">Pulse (Detak Irama)</option>
                      <option value="spin">Spinning (Berputar Terus)</option>
                      <option value="wiggle">Wiggle (Gemetar Energetik)</option>
                      <option value="wave">Wave (Gelombang Lembut)</option>
                      <option value="breathing">Breathing (Napas Halus)</option>
                      <option value="glow-pulse">Glow Pulsating</option>
                    </select>
                  </div>

                  {selectedLayer.loopAnimation !== 'none' && (
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-neutral-400">Kecepatan Loop</span>
                        <span className="font-mono text-neutral-300">
                          {selectedLayer.loopSpeed.toFixed(1)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="3.0"
                        step="0.1"
                        value={selectedLayer.loopSpeed}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, {
                            loopSpeed: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-amber-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* 3. OUT-ANIMATION */}
                <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                      ◀ Out-Animation (Keluar)
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {selectedLayer.outDuration}s
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Efek Keluar</label>
                    <select
                      value={selectedLayer.outAnimation}
                      onChange={(e) =>
                        onUpdateLayer(selectedLayer.id, {
                          outAnimation: e.target.value as OutAnimationType,
                        })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-neutral-200 outline-none font-semibold"
                    >
                      <option value="none">Tanpa Efek (None)</option>
                      <option value="fade-out">Fade Out</option>
                      <option value="slide-up">Slide Up (Keluar Naik)</option>
                      <option value="slide-down">Slide Down (Keluar Turun)</option>
                      <option value="scale-down">Scale Down (Mengecil)</option>
                      <option value="blur-out">Cinematic Blur Out</option>
                    </select>
                  </div>

                  {selectedLayer.outAnimation !== 'none' && (
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-neutral-400">Durasi Keluar</span>
                        <span className="font-mono text-neutral-300">
                          {selectedLayer.outDuration.toFixed(1)} detik
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={selectedLayer.outDuration}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, {
                            outDuration: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-rose-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* 4. SOUND EFFECT (SFX) TRIGGER */}
                <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    Efek Suara Masuk (SFX)
                  </span>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedLayer.sfx || 'none'}
                      onChange={(e) =>
                        onUpdateLayer(selectedLayer.id, {
                          sfx: e.target.value as SoundEffectType,
                        })
                      }
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-neutral-200 outline-none font-medium"
                    >
                      <option value="none">Tanpa Suara</option>
                      <option value="whoosh">💨 Whoosh (Swoosh)</option>
                      <option value="pop">🫧 Bubble Pop</option>
                      <option value="hit">💥 Cinematic Boom / Hit</option>
                      <option value="chime">✨ Sparkle Chime</option>
                      <option value="glitch">⚡ Cyber Glitch</option>
                    </select>

                    <button
                      onClick={() => soundEngine.playSFX(selectedLayer.sfx || 'none')}
                      className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-semibold text-[11px] transition-colors"
                      title="Tes Suara"
                    >
                      Tes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* TAB 3 or NO LAYER: PROJECT & CANVAS SETTINGS */
          <div className="space-y-4">
            <div className="pb-2 border-b border-neutral-800">
              <h3 className="font-bold text-neutral-100 text-sm">Pengaturan Canvas & Studio</h3>
              <p className="text-[11px] text-neutral-400">Atur latar belakang, durasi proyek, dan musik ambient.</p>
            </div>

            {/* Total Duration */}
            <div className="space-y-2 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-400 font-semibold">Total Durasi Komposisi</span>
                <span className="font-mono text-sky-400 font-bold">{project.duration} Detik</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="15.0"
                step="0.5"
                value={project.duration}
                onChange={(e) =>
                  onUpdateProject({ duration: parseFloat(e.target.value) })
                }
                className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Background Color & Gradient */}
            <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-sky-400" />
                Latar Belakang (Background)
              </span>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">Warna Solid</span>
                <input
                  type="color"
                  value={project.backgroundColor}
                  onChange={(e) =>
                    onUpdateProject({ backgroundColor: e.target.value })
                  }
                  className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer"
                />
              </div>

              {/* Background Gradient */}
              <div className="pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-neutral-300 font-semibold">Gradasi Latar</span>
                  <input
                    type="checkbox"
                    checked={project.backgroundGradient.enabled}
                    onChange={(e) =>
                      onUpdateProject({
                        backgroundGradient: {
                          ...project.backgroundGradient,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="rounded accent-sky-500"
                  />
                </div>

                {project.backgroundGradient.enabled && (
                  <div className="flex items-center gap-2 bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                    <input
                      type="color"
                      value={project.backgroundGradient.color1}
                      onChange={(e) =>
                        onUpdateProject({
                          backgroundGradient: {
                            ...project.backgroundGradient,
                            color1: e.target.value,
                          },
                        })
                      }
                      className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-neutral-500">→</span>
                    <input
                      type="color"
                      value={project.backgroundGradient.color2}
                      onChange={(e) =>
                        onUpdateProject({
                          backgroundGradient: {
                            ...project.backgroundGradient,
                            color2: e.target.value,
                          },
                        })
                      }
                      className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={project.backgroundGradient.angle}
                      onChange={(e) =>
                        onUpdateProject({
                          backgroundGradient: {
                            ...project.backgroundGradient,
                            angle: parseInt(e.target.value),
                          },
                        })
                      }
                      className="flex-1 accent-sky-500 h-1 bg-neutral-800 rounded"
                      title="Sudut Gradasi"
                    />
                  </div>
                )}
              </div>

              {/* Background Motion FX */}
              <div className="pt-2 border-t border-neutral-800">
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Pola Gerak Latar (Background Motion)
                </label>
                <select
                  value={project.backgroundMotion}
                  onChange={(e) =>
                    onUpdateProject({
                      backgroundMotion: e.target.value as BackgroundMotionType,
                    })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-neutral-200 outline-none"
                >
                  <option value="none">Polos (None)</option>
                  <option value="grid-flow">Cyber Perspective Grid</option>
                  <option value="starfield">Drifting Starfield</option>
                  <option value="gradient-shift">Pulsing Gradient Orbs</option>
                  <option value="radial-pulse">Center Radial Pulse</option>
                </select>
              </div>
            </div>

            {/* Background Music Synthesizer */}
            <div className="space-y-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" />
                  Synthesizer Audio (BGM)
                </span>
                <input
                  type="checkbox"
                  checked={project.bgm.enabled}
                  onChange={(e) =>
                    onUpdateProject({
                      bgm: { ...project.bgm, enabled: e.target.checked },
                    })
                  }
                  className="rounded accent-sky-500"
                />
              </div>

              {project.bgm.enabled && (
                <>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Gaya Musik</label>
                    <select
                      value={project.bgm.type}
                      onChange={(e) =>
                        onUpdateProject({
                          bgm: {
                            ...project.bgm,
                            type: e.target.value as Project['bgm']['type'],
                          },
                        })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-neutral-200 outline-none"
                    >
                      <option value="cyber-pulse">Cyber Pulse (Bass Groove)</option>
                      <option value="ambient-chill">Ambient Chill (Pads)</option>
                      <option value="upbeat-groove">Upbeat Groove (Lead)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-400">Volume</span>
                      <span className="font-mono text-neutral-300">
                        {Math.round(project.bgm.volume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={project.bgm.volume}
                      onChange={(e) =>
                        onUpdateProject({
                          bgm: { ...project.bgm, volume: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-sky-500 h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
