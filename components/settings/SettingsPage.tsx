
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Toggle from '../ui/Toggle';
import Button from '../ui/Button';
import { InfoIcon, YouTubeIcon, FacebookIcon, TwitchIcon, TikTokIcon, InstagramIcon, CustomStreamIcon, LinkIcon, UnlinkIcon } from '../icons/Icons';
import { ConnectedAccount, Platform, mockBrowsableAccounts, SimulatedPlatformAccount } from '../../types';
import OAuthSimModal from './OAuthSimModal';

const platformIcons: Record<Platform, React.ReactNode> = {
    [Platform.YouTube]: <YouTubeIcon className="h-6 w-6 text-[#FF0000]" />,
    [Platform.Facebook]: <FacebookIcon className="h-6 w-6 text-[#1877F2]" />,
    [Platform.Twitch]: <TwitchIcon className="h-6 w-6 text-[#9146FF]" />,
    [Platform.TikTok]: <TikTokIcon className="h-6 w-6" />,
    [Platform.Instagram]: <InstagramIcon className="h-6 w-6 text-[#E4405F]" />,
    [Platform.Custom]: <CustomStreamIcon className="h-6 w-6 text-gray-400" />,
};

const SettingsPage: React.FC = () => {
    const [previewMode, setPreviewMode] = useState(true);
    const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [platformToConnect, setPlatformToConnect] = useState<Platform | null>(null);

    // Efek untuk memuat data dari localStorage saat komponen pertama kali dirender
    useEffect(() => {
        // Logika untuk akun terhubung
        try {
            const savedAccountsRaw = localStorage.getItem('connected_accounts');
            if (savedAccountsRaw) {
                setConnectedAccounts(JSON.parse(savedAccountsRaw));
            } else {
                // Jika tidak ada data, buat beberapa akun demo untuk memastikan streaming awal berfungsi
                const demoAccounts: ConnectedAccount[] = [
                    { id: 'yt-gaming', platform: Platform.YouTube, name: 'Channel Gaming Saya' },
                    { id: 'twitch-main', platform: Platform.Twitch, name: 'Akun Twitch Utama' },
                    { id: 'fb-page-official', platform: Platform.Facebook, name: 'Halaman Facebook Resmi' },
                ];
                localStorage.setItem('connected_accounts', JSON.stringify(demoAccounts));
                setConnectedAccounts(demoAccounts);
            }
        } catch (e) {
            console.error("Tidak dapat memuat atau membuat akun yang terhubung dari localStorage", e);
        }
    }, []);
    
    const handleOpenConnectModal = (platform: Platform) => {
        setPlatformToConnect(platform);
        setIsModalOpen(true);
    };
    
    const handleConnectAccount = (simulatedAccount: SimulatedPlatformAccount) => {
        const newAccount: ConnectedAccount = {
            id: simulatedAccount.id,
            platform: simulatedAccount.platform,
            name: simulatedAccount.name,
        };

        const newAccounts = [...connectedAccounts, newAccount];
        setConnectedAccounts(newAccounts);
        localStorage.setItem('connected_accounts', JSON.stringify(newAccounts));
        setIsModalOpen(false);
        setPlatformToConnect(null);
    };
    
    const handleDisconnectAccount = (accountId: string) => {
        const newAccounts = connectedAccounts.filter(acc => acc.id !== accountId);
        setConnectedAccounts(newAccounts);
        localStorage.setItem('connected_accounts', JSON.stringify(newAccounts));
    };
    
    const getAvailableAccountsForPlatform = (platform: Platform): SimulatedPlatformAccount[] => {
        const connectedIds = new Set(connectedAccounts.map(acc => acc.id));
        return mockBrowsableAccounts.filter(
            acc => acc.platform === platform && !connectedIds.has(acc.id)
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Pengaturan</h1>
            <div className="space-y-8 max-w-3xl">
                <Card>
                    <h2 className="text-xl font-semibold mb-4 border-b border-secondary pb-2">Konfigurasi AI Gemini</h2>
                    <div className="flex items-start p-4 bg-background rounded-lg border border-secondary">
                        <InfoIcon className="h-6 w-6 text-blue-400 mr-4 mt-1 flex-shrink-0" />
                        <div>
                             <h3 className="font-semibold text-text-primary">Fitur AI Dikelola oleh Administrator</h3>
                             <p className="text-sm text-text-secondary mt-1">
                                Kunci API Google Gemini untuk fitur pembuatan konten otomatis dikonfigurasi di tingkat sistem oleh administrator. Jika fitur AI tidak berfungsi, silakan hubungi mereka.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold mb-4 border-b border-secondary pb-2">Akun Terhubung</h2>
                    <p className="text-sm text-text-secondary mb-4">
                        Hubungkan akun platform Anda untuk mengaktifkan streaming terintegrasi. Ini adalah simulasi dari alur otorisasi OAuth.
                    </p>
                    <div className="space-y-4">
                        {Object.values(Platform).map(platform => {
                            if (platform === Platform.Custom) return null; // Lewati RTMP kustom karena tidak memiliki akun
                            const accountsForPlatform = connectedAccounts.filter(acc => acc.platform === platform);
                            const canConnectMore = getAvailableAccountsForPlatform(platform).length > 0;
                           
                            return (
                                <div key={platform} className="p-4 bg-background rounded-lg border border-secondary">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            {platformIcons[platform]}
                                            <span className="ml-4 text-lg font-medium">{platform}</span>
                                        </div>
                                        <Button size="sm" onClick={() => handleOpenConnectModal(platform)} disabled={!canConnectMore} title={canConnectMore ? `Hubungkan akun ${platform} baru` : "Semua akun simulasi sudah terhubung"}>
                                            <LinkIcon className="h-4 w-4 mr-2" /> Hubungkan Akun
                                        </Button>
                                    </div>
                                    <div className="mt-4 pl-10 space-y-2">
                                        {accountsForPlatform.length > 0 ? (
                                            accountsForPlatform.map(acc => (
                                                <div key={acc.id} className="flex items-center justify-between gap-3 bg-secondary px-3 py-2 rounded-md">
                                                    <span className="text-sm text-text-primary">{acc.name}</span>
                                                    <Button size="sm" variant="danger" onClick={() => handleDisconnectAccount(acc.id)} title="Putuskan akun">
                                                        <UnlinkIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-text-secondary">Tidak ada akun terhubung</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

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
            </div>
            
            {platformToConnect && (
                <OAuthSimModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConnect={handleConnectAccount}
                    platform={platformToConnect}
                    availableAccounts={getAvailableAccountsForPlatform(platformToConnect)}
                />
            )}
        </div>
    );
};

export default SettingsPage;
