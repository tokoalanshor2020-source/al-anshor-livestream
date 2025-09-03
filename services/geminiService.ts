
import { GoogleGenAI, Type } from "@google/genai";

interface StreamDetails {
    title: string;
    description: string;
}

// Kunci API sekarang bersumber dari variabel lingkungan.
// Proses deployment bertanggung jawab untuk membuat variabel ini tersedia.
const apiKey = process.env.API_KEY;

export const generateStreamDetails = async (prompt: string): Promise<StreamDetails> => {
    if (!apiKey) {
        throw new Error("Fitur AI tidak dikonfigurasi oleh administrator. Kunci API tidak tersedia.");
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
             throw new Error("Kunci API yang dikonfigurasi oleh administrator tidak valid.");
        }
        throw new Error("Gagal menghasilkan konten dengan AI. Silakan periksa konsol untuk detail teknis.");
    }
};
