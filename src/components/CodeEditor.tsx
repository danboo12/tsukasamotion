import React, { useState, useMemo } from 'react';
import {
  Code2,
  Copy,
  ClipboardPaste,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  ExternalLink,
  BookOpen,
  Info,
} from 'lucide-react';
import { EXTERNAL_LIBRARIES } from '../data/microstockPresets';

interface CodeEditorProps {
  htmlCode: string;
  onChangeCode: (code: string) => void;
  selectedLibraries: string[];
  onToggleLibrary: (libId: string) => void;
  onRunPreview: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  htmlCode,
  onChangeCode,
  selectedLibraries,
  onToggleLibrary,
  onRunPreview,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'libraries' | 'guidelines'>('editor');

  const lineCount = useMemo(() => {
    return htmlCode.split('\n').length;
  }, [htmlCode]);

  const charCount = useMemo(() => {
    return htmlCode.length;
  }, [htmlCode]);

  // Microstock Code Analysis
  const analysis = useMemo(() => {
    const hasCanvas = /<canvas/i.test(htmlCode) || /document\.createElement\(['"]canvas['"]\)/i.test(htmlCode);
    const hasLoopLogic = /%|Math\.sin|Math\.cos|cycle|phase|requestAnimationFrame/i.test(htmlCode);
    const hasTransparent = /transparent/i.test(htmlCode) || /clearRect/i.test(htmlCode);
    const hasThreeJs = /THREE\./i.test(htmlCode);
    const hasGsap = /gsap\./i.test(htmlCode);

    return {
      hasCanvas,
      hasLoopLogic,
      hasTransparent,
      hasThreeJs,
      hasGsap,
    };
  }, [htmlCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        onChangeCode(text);
      }
    } catch (err) {
      console.warn('Clipboard paste blocked:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 border-r border-neutral-800 select-none overflow-hidden">
      {/* Tab Navigation & Code Actions */}
      <div className="h-10 px-3 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'editor'
                ? 'bg-neutral-800 text-sky-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>HTML Script Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('libraries')}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'libraries'
                ? 'bg-neutral-800 text-sky-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <span>CDN Libraries</span>
            {selectedLibraries.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-mono">
                {selectedLibraries.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guidelines')}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'guidelines'
                ? 'bg-neutral-800 text-amber-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tips Microstock</span>
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePaste}
            title="Paste kode dari clipboard"
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs flex items-center gap-1 px-2 border border-neutral-800"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline text-[11px]">Paste</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="Salin semua kode"
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs flex items-center gap-1 px-2 border border-neutral-800"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeCode('')}
            title="Bersihkan editor"
            className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 text-xs px-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'editor' && (
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Editor Body with Line Numbers */}
          <div className="flex-1 flex overflow-hidden font-mono text-xs leading-5">
            {/* Gutter Line Numbers */}
            <div className="w-11 bg-neutral-950 text-neutral-600 select-none py-3 text-right pr-2 shrink-0 border-r border-neutral-800/80 font-mono text-[11px] overflow-hidden">
              {Array.from({ length: Math.min(lineCount, 800) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Raw Textarea with syntax focus styling */}
            <textarea
              value={htmlCode}
              onChange={(e) => onChangeCode(e.target.value)}
              placeholder="<!-- Tempelkan script HTML / Canvas / SVG animasi buatan AI (ChatGPT, Claude, Gemini) di sini... -->"
              spellCheck={false}
              className="flex-1 p-3 bg-neutral-950 text-neutral-200 outline-none resize-none font-mono text-xs leading-5 overflow-auto selection:bg-sky-500/30 placeholder:text-neutral-600 whitespace-pre"
            />
          </div>

          {/* Microstock Script Status Pill Bar */}
          <div className="px-3 py-1.5 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-400 shrink-0">
            <div className="flex items-center gap-3">
              <span>{lineCount} baris</span>
              <span>{(charCount / 1024).toFixed(1)} KB</span>

              {/* Badges */}
              {analysis.hasCanvas ? (
                <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  Canvas 2D/WebGL Terdeteksi
                </span>
              ) : (
                <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                  DOM/SVG Animation
                </span>
              )}

              {analysis.hasLoopLogic && (
                <span className="text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/20">
                  Loop Logic OK
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onRunPreview}
              className="px-2.5 py-0.5 rounded bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-[11px] transition-colors"
            >
              Update Preview
            </button>
          </div>
        </div>
      )}

      {/* Tab: Libraries */}
      {activeTab === 'libraries' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-bold text-neutral-100">Injeksi Library CDN</h3>
            <p className="text-neutral-400 text-[11px] mt-0.5">
              Aktifkan library di bawah jika script motion buatan AI membutuhkan Three.js, GSAP, atau library animasi lainnya.
            </p>
          </div>

          <div className="space-y-2">
            {EXTERNAL_LIBRARIES.map((lib) => {
              const isChecked = selectedLibraries.includes(lib.id);
              return (
                <div
                  key={lib.id}
                  onClick={() => onToggleLibrary(lib.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'border-sky-500 bg-sky-500/10 text-neutral-100'
                      : 'border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-neutral-700 text-sky-500 focus:ring-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{lib.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                        {lib.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">{lib.description}</p>
                    <span className="text-[10px] font-mono text-neutral-500 truncate block mt-1">
                      {lib.url}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Guidelines for Microstockers */}
      {activeTab === 'guidelines' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Standar Motion Script Microstock</span>
            </h3>
            <p className="text-neutral-400 text-[11px] mt-0.5">
              Panduan agar video footage Anda lolos kurasi Adobe Stock, Shutterstock, & Pond5
            </p>
          </div>

          <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2">
            <div className="font-bold text-sky-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>1. Wajib Seamless Looping</span>
            </div>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              Agensi stock menyukai footage berdurasi 10–15 detik yang berulang mulus tanpa jeda. Gunakan rumus waktu periodik seperti:
            </p>
            <div className="p-2 bg-black/60 rounded font-mono text-[10px] text-sky-300">
              const angle = ((now / 1000) % DURATION) / DURATION * Math.PI * 2;
            </div>
          </div>

          <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2">
            <div className="font-bold text-indigo-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>2. Background Alpha Transparan</span>
            </div>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              Untuk elemen HUD, badge, lower-third, dan efek partikel overlay, gunakan latar transparan murni (<code className="text-sky-300">body &#123; background: transparent &#125;</code>) agar bisa diekspor ke WebM VP9 dengan alpha channel atau PNG sequence.
            </p>
          </div>

          <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>3. Responsivitas Canvas</span>
            </div>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              Pastikan script memperbarui ukuran canvas saat di-resize (<code className="text-emerald-300">canvas.width = window.innerWidth</code>) sehingga dapat dirender pada resolusi 4K UHD (3840x2160) dengan tajam tanpa pixelation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
