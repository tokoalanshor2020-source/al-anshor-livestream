import { GoogleGenAI, Type } from "@google/genai";

interface StreamDetails {
    title: string;
    description: string;
}

export const generateStreamDetails = async (prompt: string): Promise<StreamDetails> => {
    const storedKeys = localStorage.getItem('geminiApiKeys');
    let keys: string[] = [];

    if (storedKeys) {
        try {
            keys = JSON.parse(storedKeys);
        } catch (e) {
            console.error("Gagal mem-parsing kunci API dari localStorage", e);
        }
    }

    if (keys.length === 0) {
        throw new Error("Tidak ada kunci API Gemini yang dikonfigurasi. Harap tambahkan setidaknya satu di halaman Pengaturan.");
    }

    let lastError: Error | null = null;

    for (const apiKey of keys) {
        if (!apiKey) continue;

        try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Anda adalah seorang ahli SEO dan marketing media sosial. Untuk topik siaran langsung berikut: "${prompt}", buatkan judul dan deskripsi yang sangat dioptimalkan.

**Persyaratan Judul:**
- Harus dimulai dengan kalimat pembuka (hook) yang kuat untuk menarik perhatian.
- Dioptimalkan untuk SEO dan algoritme platform.
- Maksimal 100 karakter.

**Persyaratan Deskripsi:**
- Dioptimalkan untuk SEO.
- Sertakan bagian "Kata Kunci" yang relevan.
- Sertakan bagian "Tag" yang sesuai.
- Sertakan beberapa "Tagar" (hashtags) di akhir.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                                type: Type.STRING,
                                description: "Judul yang menarik dan SEO-friendly, diawali dengan hook. Maksimal 100 karakter."
                            },
                            description: {
                                type: Type.STRING,
                                description: "Deskripsi yang dioptimalkan untuk SEO. Harus mencakup paragraf singkat, daftar kata kunci yang relevan, daftar tag, dan beberapa tagar (hashtags) di akhir."
                            }
                        },
                        required: ["title", "description"]
                    }
                }
            });
            
            const jsonText = response.text.trim();
            const parsedJson = JSON.parse(jsonText);
            
            if (parsedJson.title && parsedJson.description) {
                return parsedJson as StreamDetails; // Sukses, kembali
            } else {
                throw new Error("Struktur JSON yang diterima dari API tidak valid.");
            }

        } catch (error: any) {
            console.error(`Gagal dengan kunci API yang berakhir pada ...${apiKey.slice(-4)}:`, error);
            lastError = error; // Simpan error terakhir untuk konteks
        }
    }

    // Jika loop selesai tanpa kembali, semua kunci gagal.
    console.error("Semua kunci API Gemini gagal.", lastError);
    throw new Error("Semua kunci API gagal. Periksa kunci Anda di Pengaturan atau coba lagi nanti.");
};


/**
 * Memvalidasi Kunci API Gemini dengan membuat panggilan API yang ringan.
 * @param apiKey Kunci API yang akan divalidasi.
 * @returns {Promise<boolean>} True jika kunci valid, false jika tidak.
 */
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Menggunakan permintaan yang sangat sederhana dan murah untuk validasi
        await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "validasi",
            config: { thinkingConfig: { thinkingBudget: 0 } } // Cepat dan murah
        });
        return true; // Jika panggilan berhasil, kunci tersebut valid
    } catch (error) {
        console.error("Validasi Kunci API Gagal:", error);
        return false; // Jika gagal, kunci tersebut kemungkinan besar tidak valid
    }
};