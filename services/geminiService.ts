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
                contents: `Berdasarkan topik berikut, hasilkan judul yang menarik dan deskripsi singkat yang memikat untuk siaran langsung. Topiknya adalah: "${prompt}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                                type: Type.STRING,
                                description: "Judul yang menarik untuk siaran langsung. Harus di bawah 70 karakter."
                            },
                            description: {
                                type: Type.STRING,
                                description: "Deskripsi yang menarik untuk siaran langsung. Harus 1-2 kalimat."
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