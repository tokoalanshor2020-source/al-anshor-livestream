
import { GoogleGenAI, Type } from "@google/genai";

interface StreamDetails {
    title: string;
    description: string;
}

const getApiKey = (): string | null => {
    try {
        return localStorage.getItem('gemini_api_key');
    } catch (e) {
        console.error("Could not access localStorage", e);
        return null;
    }
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    try {
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "validasi kunci",
            config: { thinkingConfig: { thinkingBudget: 0 } } // Low-cost call
        });
        return true;
    } catch (error) {
        console.error("Validasi Kunci API Gagal:", error);
        return false;
    }
};


export const generateStreamDetails = async (prompt: string): Promise<StreamDetails> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Kunci API Gemini belum diatur. Silakan atur di halaman Pengaturan.");
    }

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
            return parsedJson as StreamDetails;
        } else {
            throw new Error("Struktur JSON yang diterima dari API tidak valid.");
        }

    } catch (error: any) {
        console.error("Gagal saat memanggil Gemini API:", error);
        if (error.message.includes('API key not valid')) {
             throw new Error("Kunci API Gemini tidak valid. Silakan periksa di halaman Pengaturan.");
        }
        throw new Error("Gagal menghasilkan konten dengan AI. Silakan periksa konsol untuk detail teknis.");
    }
};
