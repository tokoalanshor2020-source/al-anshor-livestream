
import React, { useState, useMemo } from 'react';
import { Stream, StreamStatus, Platform } from '../../types';
import StreamCard from './StreamCard';
import Button from '../ui/Button';
import { PlusIcon, HelpIcon, SparklesIcon, PlayIcon, SearchIcon, UndoIcon, RedoIcon, LinkIcon } from '../icons/Icons';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

interface DashboardProps {
    streams: Stream[];
    onEdit: (streamId: string) => void;
    onDelete: (streamId: string) => void;
    onCreate: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onStatusChange: (streamId: string, status: StreamStatus) => void;
}

const statusFilters: Array<StreamStatus | 'All'> = ['All', StreamStatus.Scheduled, StreamStatus.Live, StreamStatus.Ended, StreamStatus.Error];
const statusFilterText: Record<StreamStatus | 'All', string> = {
    'All': 'Semua',
    [StreamStatus.Scheduled]: 'Dijadwalkan',
    [StreamStatus.Live]: 'Langsung',
    [StreamStatus.Ended]: 'Selesai',
    [StreamStatus.Error]: 'Gagal',
};

const Dashboard: React.FC<DashboardProps> = ({ streams, onEdit, onDelete, onCreate, onUndo, onRedo, canUndo, canRedo, onStatusChange }) => {
    const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
    const [titleSearchQuery, setTitleSearchQuery] = useState('');
    const [accountSearchQuery, setAccountSearchQuery] = useState('');
    const [activeStatusFilter, setActiveStatusFilter] = useState<StreamStatus | 'All'>('All');
    const [platformFilter, setPlatformFilter] = useState<Platform | 'All'>('All');

    const filteredStreams = useMemo(() => {
        return streams.filter(stream => {
            const matchesTitle = stream.title.toLowerCase().includes(titleSearchQuery.toLowerCase());
            const matchesStatus = activeStatusFilter === 'All' || stream.status === activeStatusFilter;
            const matchesPlatform = platformFilter === 'All' || stream.destinations.some(d => d.platform === platformFilter);
            const matchesAccount = accountSearchQuery === '' || stream.destinations.some(d =>
                d.type === 'integrated' && d.accountName.toLowerCase().includes(accountSearchQuery.toLowerCase())
            );

            return matchesTitle && matchesStatus && matchesPlatform && matchesAccount;
        });
    }, [streams, titleSearchQuery, activeStatusFilter, platformFilter, accountSearchQuery]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Streaming Saya</h1>
                <div className="flex items-center space-x-2">
                    <Button onClick={onUndo} disabled={!canUndo} variant="secondary">
                        <UndoIcon className="h-5 w-5 mr-2" />
                        Batal
                    </Button>
                    <Button onClick={onRedo} disabled={!canRedo} variant="secondary">
                        <RedoIcon className="h-5 w-5 mr-2" />
                        Ulangi
                    </Button>
                    <Button onClick={() => setIsTutorialModalOpen(true)} variant="secondary">
                        <HelpIcon className="h-5 w-5 mr-2" />
                        Tutorial
                    </Button>
                    <Button onClick={onCreate}>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Streaming Baru
                    </Button>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6 p-4 bg-surface rounded-lg flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="relative w-full">
                         <Input 
                            type="text"
                            placeholder="Cari berdasarkan judul..."
                            value={titleSearchQuery}
                            onChange={(e) => setTitleSearchQuery(e.target.value)}
                            className="pl-10"
                         />
                         <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    </div>
                     <div className="relative w-full">
                         <Input 
                            type="text"
                            placeholder="Cari nama channel/akun..."
                            value={accountSearchQuery}
                            onChange={(e) => setAccountSearchQuery(e.target.value)}
                            className="pl-10"
                         />
                         <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    </div>
                    <div>
                        <select 
                            value={platformFilter} 
                            onChange={(e) => setPlatformFilter(e.target.value as Platform | 'All')}
                            className="w-full bg-secondary border border-gray-600 text-text-primary rounded-md p-2 focus:ring-accent focus:border-accent transition h-full"
                        >
                            <option value="All">Semua Platform</option>
                            {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                    {statusFilters.map(filter => (
                        <button 
                            key={filter}
                            onClick={() => setActiveStatusFilter(filter)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${activeStatusFilter === filter ? 'bg-accent text-white' : 'bg-secondary hover:bg-gray-600 text-text-secondary'}`}
                        >
                            {statusFilterText[filter]}
                        </button>
                    ))}
                </div>
            </div>

            {filteredStreams.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStreams.map(stream => (
                        <StreamCard
                            key={stream.id}
                            stream={stream}
                            onEdit={() => onEdit(stream.id)}
                            onDelete={() => onDelete(stream.id)}
                            onStatusChange={onStatusChange}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-surface rounded-lg">
                    <h2 className="text-2xl font-semibold text-text-secondary">Tidak ada streaming yang ditemukan.</h2>
                    <p className="text-gray-500 mt-2">{titleSearchQuery || accountSearchQuery || activeStatusFilter !== 'All' || platformFilter !== 'All' ? 'Coba ubah kriteria pencarian atau filter Anda.' : 'Klik "Streaming Baru" untuk memulai!'}</p>
                    <Button onClick={onCreate} className="mt-6">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Buat Streaming Pertama Anda
                    </Button>
                </div>
            )}

            <Modal isOpen={isTutorialModalOpen} onClose={() => setIsTutorialModalOpen(false)} title="Tutorial Pengoperasian Aplikasi">
                <div className="space-y-4 text-text-secondary max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 1: Pengaturan Awal (Penting!)</h3>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                             <li>Buka halaman <strong>Pengaturan</strong>.</li>
                             <li>Di bagian "Akun Terhubung", klik "Hubungkan" (<LinkIcon className="h-4 w-4 inline-block"/>) untuk setiap platform yang ingin Anda gunakan. Anda dapat menghubungkan beberapa akun untuk platform yang sama (misalnya, beberapa channel YouTube).</li>
                             <li>Di bagian "Konfigurasi AI Gemini", masukkan <strong>Kunci API Google Gemini</strong> Anda. Ini diperlukan untuk membuat judul dan deskripsi otomatis (<SparklesIcon className="h-4 w-4 inline-block text-accent"/>).</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 2: Pendaftaran dan Login</h3>
                        <p>
                            Jika Anda pengguna baru, klik "Daftar di sini". Setelah mendaftar, akun Anda harus disetujui oleh admin. Setelah disetujui, Anda dapat masuk.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 3: Membuat Streaming Baru</h3>
                        <p>
                            Di halaman Dasbor, klik tombol "Streaming Baru".
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 4: Mengisi Detail Streaming</h3>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li><strong>Judul & Deskripsi:</strong> Beri judul dan deskripsi. Gunakan fitur AI (<SparklesIcon className="h-4 w-4 inline-block text-accent"/>) dengan memberikan topik untuk membuatnya secara otomatis (memerlukan Kunci API dari Langkah 1).</li>
                            <li><strong>Thumbnail:</strong> Klik pada area gambar untuk mengunggah thumbnail.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 5: Mengatur Sumber Video & Tujuan</h3>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li><strong>Sumber Video:</strong> Pilih video dari file yang diunggah, pustaka, atau tautan Google Drive.</li>
                            <li><strong>Tujuan:</strong> Klik "Tambah", pilih platform. Untuk tipe "Akun Terhubung", pilih akun yang sudah Anda hubungkan di Pengaturan. Untuk tipe "Manual", masukkan kunci streaming.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 6: Mengatur Penjadwalan & Pengaturan Lanjutan</h3>
                         <ul className="list-disc list-inside space-y-1 pl-2">
                            <li><strong>Penjadwalan:</strong> Atur kapan streaming akan dimulai.</li>
                            <li><strong>Pengaturan Lanjutan:</strong> Konfigurasikan bitrate, resolusi, dll., atau aktifkan "Ikuti Pengaturan Video Input" agar otomatis.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 7: Menyimpan dan Memulai Streaming</h3>
                        <p>
                            Klik "Simpan Streaming". Streaming akan muncul di dasbor. Untuk memulai (simulasi), klik tombol putar (<PlayIcon className="h-4 w-4 inline-block"/>).
                        </p>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 8: Memantau Analitik & Manajemen</h3>
                        <p>
                            Gunakan halaman "Analitik" untuk melihat performa dan "Manajemen Pengguna" (khusus admin) untuk mengelola akun.
                        </p>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={() => setIsTutorialModalOpen(false)}>Tutup</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
