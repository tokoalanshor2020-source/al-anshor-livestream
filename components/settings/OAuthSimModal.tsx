
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Platform, SimulatedPlatformAccount } from '../../types';
import { GoogleIcon, ShieldCheckIcon, UserCircleIcon } from '../icons/Icons';

interface OAuthSimModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (account: SimulatedPlatformAccount) => void;
    platform: Platform;
    availableAccounts: SimulatedPlatformAccount[];
}

type ModalStep = 'select_account' | 'grant_consent';

const platformLogos: Record<Platform, React.ReactNode> = {
    [Platform.YouTube]: <GoogleIcon className="w-7 h-7" />,
    // Tambahkan ikon lain jika diperlukan
    [Platform.Facebook]: <div className="w-7 h-7 bg-[#1877F2] rounded-full" />,
    [Platform.Twitch]: <div className="w-7 h-7 bg-[#9146FF] rounded-md" />,
    [Platform.TikTok]: <div className="w-7 h-7 bg-black rounded-full" />,
    [Platform.Instagram]: <div className="w-7 h-7 bg-pink-500 rounded-full" />,
    [Platform.Custom]: <div />,
};

const OAuthSimModal: React.FC<OAuthSimModalProps> = ({ isOpen, onClose, onConnect, platform, availableAccounts }) => {
    const [step, setStep] = useState<ModalStep>('select_account');
    const [selectedAccount, setSelectedAccount] = useState<SimulatedPlatformAccount | null>(null);

    const handleAccountSelect = (account: SimulatedPlatformAccount) => {
        setSelectedAccount(account);
        setStep('grant_consent');
    };
    
    const handleAllow = () => {
        if (selectedAccount) {
            onConnect(selectedAccount);
            handleClose();
        }
    };
    
    const handleClose = () => {
        onClose();
        // Tunda reset state agar tidak terlihat 'flicker' saat modal ditutup
        setTimeout(() => {
            setStep('select_account');
            setSelectedAccount(null);
        }, 300);
    };

    const renderAccountSelection = () => (
        <>
            <div className="text-center mb-6">
                <div className="flex justify-center items-center mb-2">
                    {platformLogos[platform]}
                </div>
                <h2 className="text-xl font-semibold text-text-primary">Pilih sebuah akun</h2>
                <p className="text-text-secondary mt-1">untuk melanjutkan ke AL ANSHOR LIVE STREAM</p>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableAccounts.map(account => (
                    <button key={account.id} onClick={() => handleAccountSelect(account)} className="w-full text-left flex items-center p-3 rounded-lg hover:bg-secondary transition-colors">
                        <UserCircleIcon className="w-10 h-10 text-gray-500 mr-4" />
                        <div>
                            <p className="font-semibold text-text-primary">{account.name}</p>
                            <p className="text-sm text-text-secondary">{account.email}</p>
                        </div>
                    </button>
                ))}
            </div>
            <div className="mt-6 text-center text-xs text-text-secondary">
                Untuk melanjutkan, {platform} akan membagikan nama, alamat email, dan gambar profil Anda dengan AL ANSHOR LIVE STREAM.
            </div>
        </>
    );
    
    const renderConsentScreen = () => (
        <>
            <div className="text-center mb-6">
                <div className="flex justify-center items-center mb-2">
                    {platformLogos[platform]}
                </div>
                <h2 className="text-xl font-semibold text-text-primary">AL ANSHOR LIVE STREAM ingin mengakses Akun {platform} Anda</h2>
                <p className="text-sm text-text-secondary mt-2 bg-background p-2 rounded-md">{selectedAccount?.email}</p>
            </div>
            <p className="text-text-secondary text-sm mb-4 text-center">Ini akan memungkinkan AL ANSHOR LIVE STREAM untuk:</p>
            <div className="space-y-3 text-text-secondary text-sm bg-background p-4 rounded-lg">
                <div className="flex items-start">
                    <ShieldCheckIcon className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Mengelola video {platform} Anda dan streaming langsung atas nama Anda.</span>
                </div>
                <div className="flex items-start">
                    <ShieldCheckIcon className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Melihat analitik dan demografi dari channel {platform} Anda.</span>
                </div>
            </div>
            <div className="mt-6 text-xs text-text-secondary">
                Pastikan Anda memercayai AL ANSHOR LIVE STREAM. Anda dapat menghentikan akses kapan saja dari pengaturan Akun {platform} Anda.
            </div>
            <div className="flex justify-end space-x-3 mt-8">
                <Button variant="secondary" onClick={handleClose}>Batalkan</Button>
                <Button onClick={handleAllow}>Izinkan</Button>
            </div>
        </>
    );


    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Hubungkan Akun ${platform}`}
        >
            {step === 'select_account' && renderAccountSelection()}
            {step === 'grant_consent' && selectedAccount && renderConsentScreen()}
        </Modal>
    );
};

export default OAuthSimModal;
