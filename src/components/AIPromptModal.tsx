import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Wand2,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Bot,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  RefreshCw,
  ShieldCheck,
  FileImage,
  ArrowRight,
} from 'lucide-react';
import { FrameRate, ResolutionConfig } from '../types/microstock';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedCode: (htmlCode: string) => void;
  resolution: ResolutionConfig;
  duration: number;
  fps: FrameRate;
  transparent: boolean;
}

interface QuickTopicIdea {
  id: string;
  label: string;
  icon: string;
  promptRequest: string;
  category: string;
  suggestedStyle: string;
}

interface UploadedImageState {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
  name: string;
  sizeKb: number;
}

const QUICK_TOPIC_IDEAS: QuickTopicIdea[] = [
  {
    id: 'money',
    label: 'Uang & Koin Emas',
    icon: '💰',
    promptRequest: 'Buatkan saya animasi motion graphics tentang uang: koin emas 3D berputar melayang, simbol mata uang ($, €, Rp, Bitcoin) bercahaya, dan partikel debu emas kemilau',
    category: 'Finance & Wealth',
    suggestedStyle: 'Luxury Gold & Emerald Green (Emas #FFD700, Amber #F59E0B, Hijau Finansial #10B981, Hitam Elegan #0A0C10)',
  },
  {
    id: 'crypto',
    label: 'Crypto & Market Chart',
    icon: '📈',
    promptRequest: 'Animasi grafik saham futuristik dengan garis candlestick hijau menyala, kurva tren naik dinamis, dan node data finansial bergerak mulus',
    category: 'Financial Markets',
    suggestedStyle: 'Trading Terminal (Neon Green #00ff88, Electric Cyan #00e5ff, Obsidian Dark #05070c)',
  },
  {
    id: 'ai-network',
    label: 'Teknologi AI & Cyber Grid',
    icon: '🌐',
    promptRequest: 'Animasi jaringan neural network AI: titik-titik node bercahaya yang saling terhubung dengan pulsa data listrik berkecepatan tinggi',
    category: 'Technology & AI',
    suggestedStyle: 'Cyberpunk Neon (Cyan #00f0ff, Purple #7000ff, Deep Navy #030712)',
  },
  {
    id: 'luxury-gold',
    label: 'Luxury Gold Bokeh',
    icon: '✨',
    promptRequest: 'Partikel bokeh emas mewah melayang anggun dengan ribbon cahaya meliuk-liuk halus dan kilau shimmer elegan',
    category: 'Luxury & Awards',
    suggestedStyle: 'Rich Gold & Amber (Gold #d97706, Amber #f59e0b, Deep Velvet #080504)',
  },
  {
    id: 'hud-radar',
    label: 'HUD Sci-Fi Radar',
    icon: '🛸',
    promptRequest: 'Interface HUD hologram sci-fi dengan lingkaran radar berputar 360 derajat, garis crosshair dinamis, dan target locking telemetry',
    category: 'Sci-Fi Hologram',
    suggestedStyle: 'Holographic Blue (Sky Blue #38bdf8, Neon Cyan #00f0ff, Transparan)',
  },
  {
    id: 'abstract-waves',
    label: 'Gelombang Abstrak 4K',
    icon: '🌊',
    promptRequest: 'Gelombang cahaya neon multidimensi yang mengalir lembut dengan interferensi harmonik dan partikel kabut bercahaya',
    category: 'Abstract Waves',
    suggestedStyle: 'Prismatic Aurora (Magenta #ec4899, Violet #8b5cf6, Deep Dark #030712)',
  },
  {
    id: 'solar-energy',
    label: 'Energi Api & Solar Flare',
    icon: '🔥',
    promptRequest: 'Gelombang energi surya dan lidah plasma api kosmik yang bergolak dengan partikel bara api melayang',
    category: 'Energy & Cosmic',
    suggestedStyle: 'Solar Flare (Blazing Amber #f59e0b, Crimson #ef4444, Gold #facc15)',
  },
  {
    id: 'matrix-data',
    label: 'Matrix Code Rain',
    icon: '💻',
    promptRequest: 'Hujan kode digital vertikal matriks dengan karakter heksadesimal bercahaya dan node cyber berkilat',
    category: 'Cyber Security',
    suggestedStyle: 'Matrix Terminal (Emerald Neon #10b981, Mint #6ee7b7, Void Black #000000)',
  },
];

// Helper to load file to base64, auto-scaling if image is huge
function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (file.size <= 3 * 1024 * 1024) {
        resolve({ base64: result, mimeType: file.type || 'image/png' });
        return;
      }
      // If large, scale down to max 1920px to optimize transmission
      const img = new Image();
      img.onload = () => {
        const maxDim = 1920;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const scaledDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve({ base64: scaledDataUrl, mimeType: 'image/jpeg' });
        } else {
          resolve({ base64: result, mimeType: file.type || 'image/png' });
        }
      };
      img.onerror = () => resolve({ base64: result, mimeType: file.type || 'image/png' });
      img.src = result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const AIPromptModal: React.FC<AIPromptModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedCode,
  resolution,
  duration,
  fps,
  transparent,
}) => {
  const [activeTab, setActiveTab] = useState<'prompt-generator' | 'direct-code'>('prompt-generator');

  // Input states
  const [userConcept, setUserConcept] = useState<string>(
    'Buatkan saya prompt motion tentang uang: koin emas 3D berputar melayang, simbol mata uang bercahaya, dan partikel debu emas'
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [isAiEngineering, setIsAiEngineering] = useState<boolean>(false);
  const [aiEngineeredPrompt, setAiEngineeredPrompt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Image Upload state
  const [uploadedImage, setUploadedImage] = useState<UploadedImageState | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Direct script generation
  const [isDirectGenerating, setIsDirectGenerating] = useState<boolean>(false);
  const [directGenError, setDirectGenError] = useState<string | null>(null);

  // Listen for Clipboard Paste (Ctrl+V) when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleProcessImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, duration, fps, transparent, resolution]);

  // Clean up object URLs on unmount or when image changes
  useEffect(() => {
    return () => {
      if (uploadedImage?.previewUrl) {
        URL.revokeObjectURL(uploadedImage.previewUrl);
      }
    };
  }, [uploadedImage]);

  // Smart local template builder (fallback)
  const buildLocalPrompt = (requestText: string) => {
    let cleanTopic = requestText
      .replace(/^buatkan\s+(saya\s+)?(prompt\s+)?(motion\s+)?(tentang\s+)?/i, '')
      .replace(/^animasi\s+(tentang\s+)?/i, '')
      .trim();

    if (!cleanTopic) cleanTopic = 'Uang & Koin Emas (Finance & Wealth Motion Background)';

    const isMoney = /uang|duit|koin|emas|dollar|rupiah|money|coin|gold|wealth|finance/i.test(requestText);
    const isCrypto = /crypto|bitcoin|saham|market|trading|chart/i.test(requestText);
    const isCyber = /cyber|matrix|hud|sci-fi|radar|hologram|data/i.test(requestText);

    let visualStyle = 'Sinematik Elegan Kualitas Tinggi (High-Contrast Microstock Standard)';
    let motionDetail = 'Gerakan harmonis periodik 60 FPS dengan kedalaman multi-layer';

    if (isMoney) {
      visualStyle = 'Luxury Gold & Emerald Wealth (Emas Mengkilap #FFD700, Rich Amber #F59E0B, Hijau Finansial #10B981, Latar Belakang Obsidian #0A0C10)';
      motionDetail = 'Koin emas 3D berputar pada sumbu Y secara periodik, simbol mata uang ($, €, Rp) melayang dengan kedalaman perspektif, partikel debu emas bercahaya (shimmering motes), dan sinar bias cahaya halus (volumetric light rays)';
    } else if (isCrypto) {
      visualStyle = 'Futuristic Trading Terminal (Neon Emerald #00FF88, Cyan #00E5FF, Dark Space #05070C)';
      motionDetail = 'Kurva garis tren naik dinamis, candlestick chart berkedip halus, dan node jaringan terhubung yang mentransfer pulsa data';
    } else if (isCyber) {
      visualStyle = 'Cyberpunk High-Tech (Electric Cyan #00F0FF, Deep Purple #7000FF, Void Black #02040A)';
      motionDetail = 'Gelombang sinus dinamis, grid heksagonal dengan glow shadow, dan partikel listrik berkecepatan tinggi';
    }

    return `Tolong buatkan SATU file HTML LENGKAP MANDIRI (single standalone HTML file berisi CSS <style> dan JavaScript <script> di dalamnya tanpa dependensi eksternal) untuk animasi motion graphics background kualitas Microstock (Shutterstock / Adobe Stock / Pond5 4K UHD Master).

Ikuti spesifikasi teknis tingkat industri berikut secara ketat:

1. KONSEP & TOPIK ANIMASI:
   - Tema Utama: ${cleanTopic}
   - Karakter Visual & Aksen: ${motionDetail}
   - Palet Warna: ${visualStyle}
   - Kerapatan Detail Visual: Ultra High Detail (sertakan 5-8 layer grafis bertingkat: background ambient gradient, midground floating elements, foreground main visuals, puluhan partikel/motes bercahaya, dan gunakan ctx.globalCompositeOperation = "screen" atau "lighter" untuk pencahayaan glow sinematik yang menyala).

2. FORMULA MATEMATIKA SEAMLESS LOOPING TEPAT ${duration} DETIK:
   - Durasi video: Tepat ${duration} detik (${duration * fps} frames pada ${fps} FPS).
   - Wajib 100% SEAMLESS LOOP tanpa ada patahan, jeda, atau lompatan visual antara frame pertama dan frame terakhir!
   - Gunakan formula waktu periodik 360 derajat berdasar sudut 2*PI:
     const DURATION = window.__timelineDuration || ${duration};
     const elapsed = ((now - startTime) / 1000) % DURATION;
     const progress = elapsed / DURATION; // 0.0 sampai 1.0
     const angle = progress * Math.PI * 2; // Tepat 0 sampai 2*PI (siklus mulus sempurna)
     Semua posisi partikel, rotasi koin/objek, skala, dan opacity HARUS merupakan fungsi dari sin/cos sudut 'angle' tersebut.

3. RESOLUSI & CANVAS TARGET 4K UHD:
   - Resolusi Asli: ${resolution.label} (${resolution.width} × ${resolution.height} px, Rasio ${resolution.aspectRatio}).
   - Buat canvas mengisi 100vw dan 100vh tanpa scrollbar (overflow: hidden).
   - Skalakan ukuran elemen, ketebalan garis, dan radius partikel relatif terhadap ukuran canvas (misal: const scale = canvas.width / 3840;) agar gambar tetap tajam dan proporsional sempurna saat dirender di 4K.

4. LATAR BELAKANG & ALPHA CHANNEL:
   ${
     transparent
       ? '- Latar Belakang WAJIB TRANSPARAN (Alpha Channel): body { background: transparent; }, gunakan ctx.clearRect(0, 0, canvas.width, canvas.height) pada tiap frame tanpa background gelap, agar video bisa digunakan sebagai overlay transparan.'
       : '- Latar Belakang: Gelap sinematik kaya kontras (radial gradient gelap dengan vignetting halus) yang membuat elemen cahaya tampak kontras dan menyala.'
   }

5. KUALITAS CODE & STANDAR RENDER:
   - Gunakan HTML5 Canvas 2D murni yang sangat efisien dan berjalan stabil di 60 FPS.
   - Panggil requestAnimationFrame(draw) secara kontinu.
   - Berikan HANYA KODE HTML LENGKAP UTUH (mulai dari <!DOCTYPE html> hingga </html>) tanpa penjelasan bertele-tele, agar bisa langsung saya salin ke aplikasi renderer 4K.`;
  };

  // Active prompt display: AI engineered if available, otherwise local smart builder
  const activePromptText = aiEngineeredPrompt || buildLocalPrompt(userConcept);

  // Process uploaded image file & immediately trigger Gemini Vision analysis
  const handleProcessImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Harap pilih file gambar yang valid (PNG, JPG, WebP)');
      return;
    }

    try {
      setIsAiEngineering(true);
      setErrorMessage(null);

      const previewUrl = URL.createObjectURL(file);
      const { base64, mimeType } = await fileToBase64(file);

      const newImageState: UploadedImageState = {
        file,
        previewUrl,
        base64,
        mimeType,
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
      };

      setUploadedImage(newImageState);

      // Trigger Gemini Vision API to analyze image and write prompt
      const res = await fetch('/api/generate-gpt-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          imageMimeType: mimeType,
          userRequest: userConcept,
          duration,
          fps,
          transparent,
          resolution: resolution.label,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menganalisis gambar dengan Gemini');
      }

      if (data.detectedConcept) {
        setUserConcept(data.detectedConcept);
      }
      setAiEngineeredPrompt(data.engineeredPrompt);
    } catch (err: unknown) {
      console.warn('Vision analysis error:', err);
      setErrorMessage(
        (err as Error)?.message || 'Gagal menganalisis gambar. Memakai rancangan prompt lokal.'
      );
    } finally {
      setIsAiEngineering(false);
    }
  };

  // Enhance / Re-analyze with Gemini AI
  const handleEnhanceWithGemini = async () => {
    setIsAiEngineering(true);
    setErrorMessage(null);

    try {
      const payload: any = {
        userRequest: userConcept,
        duration,
        fps,
        transparent,
        resolution: resolution.label,
      };

      if (uploadedImage) {
        payload.imageBase64 = uploadedImage.base64;
        payload.imageMimeType = uploadedImage.mimeType;
      }

      const res = await fetch('/api/generate-gpt-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal merancang prompt dengan Gemini AI');
      }

      if (data.detectedConcept && uploadedImage) {
        setUserConcept(data.detectedConcept);
      }
      setAiEngineeredPrompt(data.engineeredPrompt);
    } catch (err: unknown) {
      console.warn('Fallback to local prompt generator:', err);
      setErrorMessage('Server AI sedang sibuk, telah disiapkan formula lokal berstandar 4K.');
    } finally {
      setIsAiEngineering(false);
    }
  };

  const handleRemoveImage = () => {
    if (uploadedImage?.previewUrl) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }
    setUploadedImage(null);
    setAiEngineeredPrompt('');
    setUserConcept('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenChatGPT = () => {
    window.open('https://chatgpt.com', '_blank');
  };

  const handleDirectGenerateCode = async () => {
    if (!userConcept.trim()) return;
    setIsDirectGenerating(true);
    setDirectGenError(null);

    try {
      const res = await fetch('/api/generate-motion-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userConcept,
          duration,
          fps,
          transparent,
          resolution: resolution.label,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat kode animasi');
      }

      onApplyGeneratedCode(data.htmlCode);
      onClose();
    } catch (err: unknown) {
      setDirectGenError((err as Error)?.message || 'Terjadi kesalahan saat generate kode');
    } finally {
      setIsDirectGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-sky-500/20 text-amber-400 border border-amber-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <span>Generator Prompt ChatGPT / Claude</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>Mendukung Upload Gambar & Teks</span>
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Unggah 1 gambar atau ketik ide: AI merancang otomatis konsep & prompt 4K siap salin ke ChatGPT
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

        {/* Tab Selector */}
        <div className="px-5 py-2 border-b border-neutral-800 bg-neutral-950/70 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('prompt-generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'prompt-generator'
                ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>1. Buat Prompt untuk ChatGPT (Gambar / Teks)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('direct-code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'direct-code'
                ? 'bg-indigo-500 text-white shadow-sm font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Atau Generate Script Langsung (Gemini)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {activeTab === 'prompt-generator' && (
            <div className="space-y-4">
              {/* IMAGE UPLOAD / VISION SECTION */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Unggah 1 Gambar Referensi (Auto-Prompt Vision):</span>
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Bisa Drag & Drop atau Tekan Ctrl+V (Paste)
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessImageFile(file);
                    e.target.value = '';
                  }}
                />

                {!uploadedImage ? (
                  /* Dropzone when no image is uploaded */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleProcessImageFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-4 border-2 border-dashed rounded-xl flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left cursor-pointer transition-all ${
                      isDragging
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-amber-500/50 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-200">
                        Klik untuk memilih gambar atau seret file gambar ke sini
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        PNG, JPG, WebP (misal gambar koin, uang, karakter, logo, atau 3D). AI akan otomatis menganalisis visual dan membuat prompt ChatGPT untuk Anda!
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Image Preview Card when uploaded */
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-700 bg-black shrink-0 flex items-center justify-center">
                      <img
                        src={uploadedImage.previewUrl}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1 text-left w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <FileImage className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-xs font-bold text-neutral-200 truncate">
                          {uploadedImage.name}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          ({uploadedImage.sizeKb} KB)
                        </span>
                      </div>

                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                        {isAiEngineering ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                            <span className="text-amber-300">Gemini Vision sedang menganalisis elemen & pencahayaan gambar...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Gambar berhasil dianalisis! Teks konsep & prompt otomatis terbuat di bawah.</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleEnhanceWithGemini}
                        disabled={isAiEngineering}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1 border border-neutral-700 cursor-pointer disabled:opacity-50"
                        title="Analisis ulang gambar"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isAiEngineering ? 'animate-spin' : ''}`} />
                        <span>Analisis Ulang</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1 border border-rose-500/20 cursor-pointer"
                        title="Hapus gambar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Natural language concept / notes editor */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {uploadedImage
                          ? 'Konsep Terdeteksi dari Gambar (Bisa Ditambah/Diedit Bebas):'
                          : 'Ketik Ide Animasi (Jika Tanpa Gambar):'}
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      {userConcept && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserConcept('');
                            setAiEngineeredPrompt('');
                          }}
                          className="text-[10px] text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Hapus / kosongkan teks prompt"
                        >
                          <X className="w-3 h-3" />
                          <span>Hapus Teks</span>
                        </button>
                      )}
                      <span className="text-[10px] text-neutral-500 hidden sm:inline">
                        Otomatis diperbarui saat upload gambar
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={2}
                      value={userConcept}
                      onChange={(e) => {
                        setUserConcept(e.target.value);
                        if (aiEngineeredPrompt && !uploadedImage) setAiEngineeredPrompt('');
                      }}
                      placeholder="Contoh: Buatkan saya prompt motion tentang uang, koin emas berjatuhan dengan glow mewah..."
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-neutral-100 text-xs outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Quick Topic Chips (Shown when no image is uploaded) */}
                {!uploadedImage && (
                  <div>
                    <span className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
                      💡 Atau pilih contoh topik populer:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_TOPIC_IDEAS.map((idea) => (
                        <button
                          key={idea.id}
                          type="button"
                          onClick={() => {
                            setUserConcept(idea.promptRequest);
                            setAiEngineeredPrompt('');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                            userConcept.includes(idea.label.split(' ')[0])
                              ? 'border-amber-500/60 bg-amber-500/15 text-amber-300 font-bold'
                              : 'border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <span>{idea.icon}</span>
                          <span>{idea.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer action bar */}
                <div className="flex items-center justify-end pt-1 border-t border-neutral-800/80">
                  <button
                    type="button"
                    onClick={handleEnhanceWithGemini}
                    disabled={isAiEngineering || !userConcept.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                    title="Minta Gemini untuk merancang prompt ChatGPT yang jauh lebih kaya dan detail"
                  >
                    {isAiEngineering ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span>Sedang Merancang Prompt...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>✨ Rancang Mendalam dengan Gemini AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                  {errorMessage}
                </div>
              )}

              {/* Ready to copy prompt box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-neutral-200">
                      Prompt Hasil Rancangan (Tinggal Salin & Tempel ke ChatGPT):
                    </span>
                    {aiEngineeredPrompt && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {uploadedImage ? 'Vision AI Engineered' : 'AI Engineered'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(activePromptText)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 text-xs font-black transition-all shadow-md cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>PROMPT TERSALIN!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>SALIN PROMPT</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenChatGPT}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all border border-neutral-700 cursor-pointer"
                      title="Buka situs web ChatGPT di tab baru"
                    >
                      <span>Buka ChatGPT</span>
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-auto select-text prompt-scroll custom-scrollbar">
                  {activePromptText}
                </div>
              </div>

              {/* Step-by-step workflow guide */}
              <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl text-xs space-y-2.5">
                <span className="font-bold text-neutral-200 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Alur Praktis 4 Langkah:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-neutral-400">
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800/80">
                    <strong className="text-amber-400 block mb-0.5">1. Unggah / Ketik</strong>
                    Unggah 1 gambar referensi atau ketik ide animasi Anda.
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800/80">
                    <strong className="text-amber-400 block mb-0.5">2. Salin Prompt</strong>
                    Klik tombol kuning <span className="text-neutral-200 font-semibold">"SALIN PROMPT"</span> di atas.
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800/80">
                    <strong className="text-amber-400 block mb-0.5">3. Tempel di ChatGPT</strong>
                    Buka ChatGPT / Claude, tempelkan (Ctrl+V), dan kirim.
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800/80">
                    <strong className="text-emerald-400 block mb-0.5">4. Tempel ke Editor</strong>
                    Salin kode HTML dari ChatGPT, tempel ke <span className="text-neutral-200 font-semibold">Editor Kode</span> kiri untuk preview & render 4K!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Direct Generation in App with Gemini */}
          {activeTab === 'direct-code' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                <label className="text-xs font-bold text-neutral-200 block">
                  Langsung Buatkan Kode Animasi di Sini (Menggunakan Gemini):
                </label>
                <textarea
                  rows={3}
                  value={userConcept}
                  onChange={(e) => setUserConcept(e.target.value)}
                  placeholder="Contoh: Animasi koin emas berputar 3D dengan debu cahaya berkilau..."
                  className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 text-xs outline-none focus:border-indigo-500 transition-colors resize-none"
                />

                <div className="flex justify-between items-center text-xs text-neutral-400 font-mono pt-1">
                  <span>Target: {resolution.label} • {duration}s Loop • {fps} FPS</span>
                  <span>Alpha: {transparent ? 'Transparan' : 'Solid Dark'}</span>
                </div>
              </div>

              {directGenError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                  {directGenError}
                </div>
              )}

              <button
                type="button"
                disabled={isDirectGenerating || !userConcept.trim()}
                onClick={handleDirectGenerateCode}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDirectGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sedang Membuat Kode Script Motion Graphics...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>GENERATE KODE SEKARANG & LANGSUNG PREVIEW</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
