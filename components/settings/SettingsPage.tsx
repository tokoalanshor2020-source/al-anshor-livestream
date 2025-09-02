import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Toggle from '../ui/Toggle';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { YouTubeIcon, FacebookIcon, TwitchIcon, TikTokIcon, InstagramIcon, CheckCircleIcon, TrashIcon, PlusIcon } from '../icons/Icons';

const SettingsPage: React.FC = () => {
    const [previewMode, setPreviewMode] = useState(true);
    const [apiKeys, setApiKeys] = useState<string[]>([]);
    const [newApiKey, setNewApiKey] = useState('');
    const [addSuccess, setAddSuccess] = useState(false);

    useEffect(() => {
        const storedKeys = localStorage.getItem('geminiApiKeys');
        if (storedKeys) {
            try {
                const parsedKeys = JSON.parse(storedKeys);
                if (Array.isArray(parsedKeys)) {
                    setApiKeys(parsedKeys);
                }
            } catch (e) {
                console.error("Gagal mem-parsing kunci API dari localStorage:", e);
                localStorage.removeItem('geminiApiKeys');
            }
        }
    }, []);
    
    const handleAddApiKey = () => {
        if (newApiKey && !apiKeys.includes(newApiKey)) {
            const updatedKeys = [...apiKeys, newApiKey];
            setApiKeys(updatedKeys);
            localStorage.setItem('geminiApiKeys', JSON.stringify(updatedKeys));
            setNewApiKey('');
            setAddSuccess(true);
            setTimeout(() => {
                setAddSuccess(false);
            }, 3000);
        }
    };

    const handleDeleteApiKey = (keyToDelete: string) => {
        const updatedKeys = apiKeys.filter(key => key !== keyToDelete);
        setApiKeys(updatedKeys);
        localStorage.setItem('geminiApiKeys', JSON.stringify(updatedKeys));
    };

    const maskApiKey = (key: string) => {
        if (key.length < 8) return '****';
        return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Pengaturan</h1>
            <div className="space-y-8 max-w-2xl">
                <Card>
                    <h2 className="text-xl font-semibold mb-4 border-b border-secondary pb-2">Umum</h2>
                    <div className="py-4">
                        <Toggle 
                            label="Aktifkan Pratinjau Streaming"
                            enabled={previewMode}
                            onChange={setPreviewMode}
                        />
                        <p className="text-sm text-text-secondary mt-2">
                            Jika diaktifkan, Anda dapat melihat pratinjau video sebelum siaran langsung. Menonaktifkan ini dapat mengurangi beban server.
                        </p>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold mb-4 border-b border-secondary pb-2">Konfigurasi API Gemini</h2>
                    <p className="text-sm text-text-secondary mb-4">
                        Tambahkan satu atau lebih kunci API Google Gemini. Sistem akan secara otomatis mencoba kunci berikutnya jika salah satu gagal.
                    </p>
                    <div className="space-y-4">
                        <div className="flex gap-2 items-end">
                            <Input 
                                label="Kunci API Gemini Baru"
                                type="password"
                                value={newApiKey}
                                onChange={(e) => setNewApiKey(e.target.value)}
                                placeholder="Masukkan kunci API Anda"
                                className="flex-grow"
                            />
                            <Button onClick={handleAddApiKey} disabled={!newApiKey}>
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Tambah
                            </Button>
                        </div>
                        {addSuccess && (
                            <div className="flex items-center text-green-400 text-sm">
                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                <span>Kunci berhasil ditambahkan!</span>
                            </div>
                        )}
                        <div className="space-y-2 pt-2">
                            <h3 className="text-sm font-medium text-text-secondary">Kunci Tersimpan:</h3>
                            {apiKeys.length > 0 ? (
                                <ul className="space-y-2">
                                    {apiKeys.map((key, index) => (
                                        <li key={index} className="flex items-center justify-between p-2 bg-background rounded-md">
                                            <span className="font-mono text-sm text-text-primary">{maskApiKey(key)}</span>
                                            <Button variant="danger" size="sm" onClick={() => handleDeleteApiKey(key)} title="Hapus Kunci">
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">Belum ada kunci API yang ditambahkan.</p>
                            )}
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold mb-4 border-b border-secondary pb-2">Integrasi Platform</h2>
                    <p className="text-sm text-text-secondary mb-6">
                        Hubungkan akun Anda untuk mengelola acara langsung secara otomatis di setiap platform. Ini menghindari pengaturan kunci streaming manual untuk setiap siaran.
                    </p>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                            <div className="flex items-center">
                                <YouTubeIcon className="h-8 w-8 text-red-600" />
                                <span className="ml-4 font-medium">YouTube</span>
                            </div>
                           <Button variant="secondary" onClick={() => alert('Menghubungkan ke YouTube... (simulasi)')}>Hubungkan</Button>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                           <div className="flex items-center">
                                <FacebookIcon className="h-8 w-8 text-blue-600" />
                                <span className="ml-4 font-medium">Facebook</span>
                            </div>
                           <Button variant="secondary" onClick={() => alert('Menghubungkan ke Facebook... (simulasi)')}>Hubungkan</Button>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                            <div className="flex items-center">
                                <TwitchIcon className="h-8 w-8 text-purple-600" />
                                <span className="ml-4 font-medium">Twitch</span>
                            </div>
                           <Button variant="secondary" onClick={() => alert('Menghubungkan ke Twitch... (simulasi)')}>Hubungkan</Button>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                            <div className="flex items-center">
                                <TikTokIcon className="h-8 w-8" />
                                <span className="ml-4 font-medium">TikTok</span>
                            </div>
                           <Button variant="secondary" onClick={() => alert('Menghubungkan ke TikTok... (simulasi)')}>Hubungkan</Button>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                            <div className="flex items-center">
                                <InstagramIcon className="h-8 w-8" />
                                <span className="ml-4 font-medium">Instagram</span>
                            </div>
                           <Button variant="secondary" onClick={() => alert('Menghubungkan ke Instagram... (simulasi)')}>Hubungkan</Button>
                       </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;