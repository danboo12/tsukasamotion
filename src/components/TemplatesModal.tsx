import React, { useState } from 'react';
import { X, Sparkles, Film, ArrowRight } from 'lucide-react';
import { PRESET_TEMPLATES, TemplatePreset } from '../data/presets';
import { Project } from '../types/motion';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (project: Project) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Titles', 'Broadcast', 'Social', 'Promo', 'Cyber'];

  const filteredTemplates =
    selectedCategory === 'All'
      ? PRESET_TEMPLATES
      : PRESET_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">Galeri Template Motion</h2>
              <p className="text-xs text-neutral-400">
                Pilih template siap pakai dengan animasi, partikel, dan efek suara terkonfigurasi
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

        {/* Category Pills */}
        <div className="px-6 py-3 border-b border-neutral-800 flex items-center gap-2 bg-neutral-950/40">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 hover:border-sky-500/50 hover:bg-neutral-950 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Visual Thumbnail Strip */}
                <div
                  className={`h-24 rounded-lg bg-gradient-to-r ${template.thumbnailColor} p-3 flex flex-col justify-between mb-3 shadow-inner relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase bg-black/40 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                      {template.category}
                    </span>
                    <span className="text-[10px] font-mono text-white/90 bg-black/30 px-1.5 py-0.5 rounded">
                      {template.project.aspectRatio} • {template.project.duration}s
                    </span>
                  </div>
                  <div className="text-white font-extrabold text-sm drop-shadow-md truncate">
                    {template.name}
                  </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  {template.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  onSelectTemplate(template.project);
                  onClose();
                }}
                className="w-full py-2 bg-neutral-800 hover:bg-sky-500 hover:text-neutral-950 text-neutral-200 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <span>Gunakan Template Ini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
