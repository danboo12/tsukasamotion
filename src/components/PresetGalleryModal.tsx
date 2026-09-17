import React, { useState } from 'react';
import { X, Layers, ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { MICROSTOCK_PRESETS } from '../data/microstockPresets';
import { MicrostockScriptPreset } from '../types/microstock';

interface PresetGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: MicrostockScriptPreset) => void;
}

export const PresetGalleryModal: React.FC<PresetGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = [
    'All',
    'Luxury & Bokeh',
    'Neural & Cyber Tech',
    'Business & Infographics',
    'Fluid Aura Gradients',
    'Broadcast & Lower Thirds',
    'Geometric VJ Loops',
  ];

  const filteredPresets =
    selectedCategory === 'All'
      ? MICROSTOCK_PRESETS
      : MICROSTOCK_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                Galeri Template Script Motion Microstock
              </h2>
              <p className="text-xs text-neutral-400">
                Script siap pakai terverifikasi 60 FPS seamless loop dan ramah lisensi komersial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-6 py-2.5 border-b border-neutral-800 bg-neutral-950/60 flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Presets */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/70 hover:border-sky-500/50 hover:bg-neutral-950 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-800 text-sky-400 border border-neutral-700">
                    {preset.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                    <span>{preset.duration}s Loop</span>
                    <span>•</span>
                    <span className="text-amber-400">{preset.fps} FPS</span>
                    {preset.transparent && (
                      <>
                        <span>•</span>
                        <span className="text-sky-400 font-bold">ALPHA CH.</span>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-neutral-100 group-hover:text-sky-400 transition-colors mb-1.5">
                  {preset.title}
                </h3>

                <p className="text-xs text-neutral-400 leading-relaxed mb-3 line-clamp-2">
                  {preset.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {preset.tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className="w-full py-2 bg-neutral-800 hover:bg-sky-500 hover:text-neutral-950 text-neutral-200 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <span>Muat Script Ini ke Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
