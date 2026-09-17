import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

const execFileAsync = promisify(execFile);
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy Gemini AI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY belum disetel pada environment");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Route: Generate HTML Motion Script with AI for Microstock
app.post("/api/generate-motion-script", async (req, res) => {
  try {
    const { prompt, theme, duration = 10, fps = 60, transparent = false, resolution = "4K UHD" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt animasi harus diisi" });
    }

    const ai = getAI();

    const systemInstruction = `Anda adalah ahli pengembang HTML5 Canvas, WebGL, CSS, dan JavaScript motion graphics kelas dunia yang mengkhususkan diri membuat footage animasi kualitas tinggi untuk kontributor Microstock (Shutterstock, Adobe Stock, Pond5, Freepik).

Tugas Anda adalah menghasilkan SATU file HTML LENGKAP mandiri (single standalone HTML file) yang memuat CSS (<style>) dan JavaScript (<script>) di dalamnya.

ATURAN KRUSIAL MICROSTOCK:
1. Output WAJIB berupa dokumen HTML utuh (<!DOCTYPE html> ... </html>) tanpa penjelasan atau markdown tambahan di luar blok html.
2. WAJIB SEAMLESS LOOPING secara matematis untuk durasi tepat ${duration} detik (${duration * fps} frames pada ${fps} FPS). Gunakan time progression berbasis waktu (misal t = (timeMs / 1000) % ${duration}) atau sinus/cosinus periodik (2 * Math.PI * t / ${duration}) agar frame pertama dan frame terakhir bersambung sempurna tanpa patah!
3. Responsive Canvas: Canvas harus mengisi layar (width: 100vw; height: 100vh; display: block;) dan menangani resize window dengan benar.
4. Jika opsi transparent = ${transparent ? "true" : "false"}: ${
      transparent
        ? "Latar belakang WAJIB transparan (body { background: transparent; }, canvas transparan tanpa ctx.fillRect background hitam), cocok untuk alpha overlay / lower third / HUD footage."
        : "Latar belakang harus memiliki visual estetika tinggi (misal deep black #0a0a0f, gradient gelap, atau nuansa mewah cinematic)."
    }
5. Kualitas Visual Tinggi: Gunakan partikel bercahaya (ctx.shadowBlur, blend modes seperti 'lighter' atau 'screen'), gradient warna yang kaya, tipografi modern, matematika organik (simplex/perlin noise atau sine superposition), dan gerakan yang halus 60fps.
6. Tidak memerlukan dependensi eksternal atau jika perlu library, gunakan CDN terpercaya (misalnya cdnjs Three.js atau GSAP). Tetapi jika memungkinkan, Canvas 2D murni lebih disukai karena sangat stabil dan cepat dirender frame-by-frame.
7. Resolusi Native 4K UHD: Animasi harus selalu menghitung koordinat, radius partikel, dan ketebalan garis berdasarkan rasio canvas.width dan canvas.height secara dinamis (atau menggunakan skala dinamis) sehingga saat dirender pada resolusi 3840x2160 (8.29 Megapiksel) visualnya sangat tajam (ultra-crisp) dan lolos inspeksi microstock (Adobe Stock / Shutterstock).
8. Berikan kode HTML yang bersih, valid, dan langsung bisa dijalankan di browser!`;

    const userMessage = `Buatkan script HTML motion graphics microstock berikut:
Topik/Deskripsi: "${prompt}"
Kategori/Tema: ${theme || "Abstract Motion Background"}
Target Resolusi: ${resolution}
Target Durasi: ${duration} detik (Seamless Loop)
Target FPS: ${fps} FPS
Latar Transparan (Alpha): ${transparent ? "Ya" : "Tidak"}

Keluarkan HANYA kode HTML lengkap (termasuk CSS dan JS) tanpa teks pembuka atau penutup.`;

    const candidateModels = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
    let responseText = "";
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`Mencoba generate motion script dengan model: ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userMessage,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        if (response && response.text) {
          responseText = response.text;
          console.log(`Berhasil generate dengan model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} gagal:`, err?.message || err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("Semua model Gemini sedang sibuk atau mengalami kendala kapasitas");
    }

    let code = responseText;
    // Clean markdown code blocks if wrapped
    if (code.includes("```html")) {
      code = code.replace(/```html\n?/g, "").replace(/```\n?$/g, "");
    } else if (code.includes("```")) {
      code = code.replace(/```\n?/g, "");
    }

    return res.json({
      success: true,
      htmlCode: code.trim(),
    });
  } catch (error: unknown) {
    console.error("Gemini generation error:", error);
    let errorMessage = (error as Error)?.message || "Gagal menghasilkan script motion";
    try {
      if (errorMessage.startsWith("{") && errorMessage.endsWith("}")) {
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        }
      }
    } catch {
      // Ignore JSON parse error and keep original string
    }
    return res.status(500).json({
      error: errorMessage,
    });
  }
});

// API Route: Generate an engineered Master Prompt for ChatGPT / Claude (Supports Text and Image Vision Input)
app.post("/api/generate-gpt-prompt", async (req, res) => {
  try {
    const {
      userRequest = "",
      imageBase64,
      imageMimeType = "image/png",
      duration = 10,
      fps = 60,
      transparent = false,
      resolution = "4K UHD (3840 × 2160)",
    } = req.body;

    if (!userRequest && !imageBase64) {
      return res.status(400).json({ error: "Harap masukkan teks atau unggah 1 gambar" });
    }

    const ai = getAI();
    const candidateModels = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-flash-latest"];

    if (imageBase64) {
      // Multimodal Vision Mode: Analyze image and generate ChatGPT prompt
      let cleanMime = imageMimeType;
      let cleanBase64 = imageBase64;
      if (imageBase64.includes(";base64,")) {
        const parts = imageBase64.split(";base64,");
        cleanMime = parts[0].replace("data:", "") || imageMimeType;
        cleanBase64 = parts[1];
      }

      const imagePart = {
        inlineData: {
          mimeType: cleanMime,
          data: cleanBase64,
        },
      };

      const systemInstruction = `Anda adalah Master AI Prompt Architect & Creative Motion Graphics Director untuk kontributor Microstock (Adobe Stock, Shutterstock, Pond5).
Tugas Anda adalah:
1. Menganalisis gambar yang diunggah secara tajam: identifikasi subjek utama (misal uang, koin emas 3D, chart, teknologi, abstrak, partikel), palet warna spesifik (#HEX), pencahayaan (glow, refleksi, shadow, bokeh), dan atmosfer.
2. Menghasilkan 'detectedConcept': 1-2 kalimat ringkasan dalam Bahasa Indonesia yang menjelaskan ide konsep animasi motion graphics berdasarkan gambar ini (misal: "Animasi koin emas 3D berputar melayang di udara dengan simbol mata uang bercahaya, kilauan debu emas, dan latar belakang gelap mewah").
3. Menghasilkan 'engineeredPrompt': Prompt teks master lengkap dalam Bahasa Indonesia yang SIAP LANGSUNG DISALIN KE CHATGPT / CLAUDE.
   Prompt tersebut harus menginstruksikan ChatGPT untuk membuat SATU FILE LENGKAP HTML5 Canvas + CSS + JavaScript mandiri tanpa library eksternal, dengan ketentuan:
   - Merekayasa ulang dan menganimasikan elemen dari gambar tersebut menjadi motion background bernilai jual tinggi.
   - 5-8 lapisan kedalaman visual (foreground, midground, background ambient glow, partikel debu melayang, compositeMode 'screen' / 'lighter').
   - Formula matematika seamless loop tepat ${duration} detik (${duration * fps} frames pada ${fps} FPS) berbasis modulo waktu dan sudut 2*Math.PI.
   - Skala kanvas responsif 4K UHD (${resolution}).
   - Format latar belakang: ${transparent ? "Transparan (Alpha channel untuk overlay video)" : "Gelap sinematik kaya kontras"}.
   - Instruksikan ChatGPT agar HANYA mengeluarkan kode HTML utuh (<!DOCTYPE html> ... </html>) tanpa penjelasan atau basa-basi.

WAJIB RESPON DALAM FORMAT JSON VALID:
{
  "detectedConcept": "...",
  "engineeredPrompt": "..."
}`;

      const userPromptText = `Tolong analisis gambar yang saya lampirkan ini.${
        userRequest ? ` Catatan tambahan dari user: "${userRequest}".` : ""
      }
Spesifikasi teknis:
- Durasi: ${duration} detik
- FPS: ${fps} FPS
- Resolusi: ${resolution}
- Latar Belakang Transparan: ${transparent ? "Ya (Alpha channel)" : "Tidak (Solid Sinematik)"}

Hasilkan JSON dengan properti 'detectedConcept' dan 'engineeredPrompt' yang siap saya salin ke ChatGPT!`;

      const textPart = { text: userPromptText };

      let detectedConcept = "";
      let engineeredPrompt = "";
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts: [imagePart, textPart] },
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              temperature: 0.6,
            },
          });

          if (response && response.text) {
            try {
              const parsed = JSON.parse(response.text);
              detectedConcept = parsed.detectedConcept || "";
              engineeredPrompt = parsed.engineeredPrompt || "";
            } catch {
              // In case JSON parsing fails, extract fields or whole text
              const conceptMatch = response.text.match(/"detectedConcept"\s*:\s*"([^"]+)"/);
              const promptMatch = response.text.match(/"engineeredPrompt"\s*:\s*"([^"]+)"/);
              detectedConcept = conceptMatch ? conceptMatch[1] : "Animasi motion graphics dari gambar yang diunggah";
              engineeredPrompt = promptMatch ? promptMatch[1] : response.text;
            }
            if (engineeredPrompt) break;
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      if (!engineeredPrompt) {
        throw lastError || new Error("Gagal menganalisis gambar dengan Gemini Vision");
      }

      return res.json({
        success: true,
        detectedConcept: detectedConcept || "Konsep visual berbasis gambar terunggah",
        engineeredPrompt,
      });
    } else {
      // Text-only Mode
      const systemInstruction = `Anda adalah Master AI Prompt Architect & Creative Motion Graphics Director untuk kontributor Microstock (Adobe Stock, Shutterstock, Pond5).
Tugas Anda adalah membuat PROMPT BAHASA INDONESIA YANG SANGAT DETAIL, PRESISI, DAN SIAP DITEMPELKAN KE CHATGPT / CLAUDE / DEEPSEEK.

Prompt yang Anda hasilkan harus menginstruksikan ChatGPT untuk menulis SATU FILE LENGKAP HTML5 Canvas + JavaScript + CSS murni tanpa library eksternal, dengan spesifikasi:
1. Konsep visual motion yang sangat kaya, elegan, bernilai jual tinggi (high-selling microstock) sesuai topik yang diminta user.
2. Penjelasan rinci tentang elemen grafis, 5-8 lapisan layer visual (foreground, midground, background ambient glow), efek cahaya (screen/lighter composite mode), dan palet warna spesifik (#HEX).
3. Rumus matematika seamless loop tepat ${duration} detik (${duration * fps} frame pada ${fps} FPS) menggunakan periodisitas 2*Math.PI dan modulo waktu.
4. Skala kanvas responsif 4K UHD (${resolution}) agar objek dan garis tajam pada piksel native 3840x2160.
5. Format latar belakang: ${transparent ? "Transparan (Alpha channel untuk overlay video)" : "Gelap sinematik kaya kontras"}.
6. Aturan ketat agar ChatGPT HANYA mengeluarkan kode HTML utuh (<!DOCTYPE html> ... </html>) tanpa penjelasan atau basa-basi.

ATURAN OUTPUT:
Berikan HANYA teks prompt siap salin ke ChatGPT tersebut. Jangan sertakan kata pengantar seperti "Tentu, ini prompt-nya:". Mulai langsung dari kalimat instruksi untuk ChatGPT.`;

      const userMessage = `User ingin membuat animasi motion graphics dengan ide/permintaan:
"${userRequest}"

Spesifikasi teknis:
- Durasi: ${duration} detik
- FPS: ${fps} FPS
- Resolusi: ${resolution}
- Latar Belakang Transparan: ${transparent ? "Ya (Alpha channel)" : "Tidak (Solid Sinematik)"}

Tolong buatkan teks prompt master lengkap dan profesional yang siap saya salin dan tempelkan langsung ke ChatGPT!`;

      let promptResult = "";
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: userMessage,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          if (response && response.text) {
            promptResult = response.text.trim();
            break;
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      if (!promptResult) {
        throw lastError || new Error("Gagal membuat prompt dengan AI");
      }

      return res.json({
        success: true,
        detectedConcept: userRequest,
        engineeredPrompt: promptResult,
      });
    }
  } catch (error: unknown) {
    console.error("Generate GPT prompt error:", error);
    return res.status(500).json({
      error: (error as Error)?.message || "Gagal membuat prompt",
    });
  }
});

// API Route: Convert WebM video into Adobe Stock compliant MP4 (H.264) or MOV (Apple ProRes 4444 / 422)
app.post(
  "/api/convert-video",
  express.raw({ type: ["video/*", "application/octet-stream", "application/x-binary"], limit: "500mb" }),
  async (req, res) => {
    const rawBuffer = req.body;
    if (!rawBuffer || !(rawBuffer instanceof Buffer) || rawBuffer.length === 0) {
      return res.status(400).json({ error: "Buffer video input tidak valid atau kosong" });
    }

    const targetFormat = ((req.query.format as string) || "mp4").toLowerCase();
    const targetBitrate = parseInt((req.query.bitrate as string) || "30", 10);
    const isTransparent = req.query.transparent === "true";
    const requestedFilename = (req.query.filename as string) || "microstock-stock-footage";

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const inputPath = path.join(os.tmpdir(), `stock_in_${uniqueId}.webm`);
    const outputExt = targetFormat.includes("mov") ? "mov" : "mp4";
    const outputPath = path.join(os.tmpdir(), `stock_out_${uniqueId}.${outputExt}`);

    try {
      // 1. Write incoming WebM buffer to temp disk
      await fs.promises.writeFile(inputPath, rawBuffer);

      // 2. Formulate ffmpeg parameters based on target standard
      let ffmpegArgs: string[] = [];

      if (targetFormat.includes("mov")) {
        // MOV Container (Apple ProRes standard for Adobe Stock)
        if (isTransparent) {
          // Adobe Stock requirement for transparency: Apple ProRes 4444 with Alpha
          ffmpegArgs = [
            "-y",
            "-threads", "0",
            "-i", inputPath,
            "-c:v", "prores_ks",
            "-profile:v", "4", // ProRes 4444
            "-pix_fmt", "yuva444p10le", // 10-bit RGBA Alpha
            outputPath,
          ];
        } else {
          // Apple ProRes 422 HQ (Broadcast Master) - use ultra-fast multithreaded prores_aw
          ffmpegArgs = [
            "-y",
            "-threads", "0",
            "-i", inputPath,
            "-c:v", "prores_aw",
            "-profile:v", "3", // ProRes 422 HQ
            "-pix_fmt", "yuv422p10le",
            outputPath,
          ];
        }
      } else {
        // Universal MP4 (H.264 / AVC) for Adobe Stock, Shutterstock, Pond5
        // Controlled Bitrate with veryfast preset and +faststart
        ffmpegArgs = [
          "-y",
          "-threads", "0",
          "-i", inputPath,
          "-c:v", "libx264",
          "-preset", "veryfast",
          "-pix_fmt", "yuv420p",
          "-b:v", `${targetBitrate}M`,
          "-maxrate", `${Math.round(targetBitrate * 1.3)}M`,
          "-bufsize", `${Math.round(targetBitrate * 2)}M`,
          "-movflags", "+faststart",
          outputPath,
        ];
      }

      // 3. Execute ffmpeg with 50MB maxBuffer to avoid buffer overflow on long renders
      await execFileAsync("ffmpeg", ffmpegArgs, { maxBuffer: 50 * 1024 * 1024 });

      // 4. Read converted output and send to client
      const outputBuffer = await fs.promises.readFile(outputPath);
      const mimeType = outputExt === "mov" ? "video/quicktime" : "video/mp4";
      const finalFilename = `${requestedFilename.replace(/\.[^/.]+$/, "")}.${outputExt}`;

      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Length", outputBuffer.length);
      res.setHeader("Content-Disposition", `attachment; filename="${finalFilename}"`);
      return res.send(outputBuffer);
    } catch (err: unknown) {
      console.error("FFmpeg conversion error:", err);
      return res.status(500).json({
        error: `Gagal mengonversi video: ${(err as Error)?.message || "FFmpeg error"}`,
      });
    } finally {
      // Clean up temp files safely
      fs.promises.unlink(inputPath).catch(() => {});
      fs.promises.unlink(outputPath).catch(() => {});
    }
  }
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HTML Motion Code Renderer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
