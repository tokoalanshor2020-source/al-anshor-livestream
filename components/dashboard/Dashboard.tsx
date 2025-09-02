
import React, { useState, useMemo } from 'react';
import { Stream, StreamStatus } from '../../types';
import StreamCard from './StreamCard';
import Button from '../ui/Button';
import { PlusIcon, HelpIcon, SparklesIcon, PlayIcon, SearchIcon, UndoIcon, RedoIcon } from '../icons/Icons';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<StreamStatus | 'All'>('All');

    const filteredStreams = useMemo(() => {
        return streams.filter(stream => {
            const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === 'All' || stream.status === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [streams, searchQuery, activeFilter]);

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
            <div className="mb-6 p-4 bg-surface rounded-lg flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full md:w-1/3">
                     <Input 
                        type="text"
                        placeholder="Cari berdasarkan judul..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                     />
                     <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                    {statusFilters.map(filter => (
                        <button 
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${activeFilter === filter ? 'bg-accent text-white' : 'bg-secondary hover:bg-gray-600 text-text-secondary'}`}
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
                    <p className="text-gray-500 mt-2">{searchQuery || activeFilter !== 'All' ? 'Coba ubah kriteria pencarian atau filter Anda.' : 'Klik "Streaming Baru" untuk memulai!'}</p>
                    <Button onClick={onCreate} className="mt-6">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Buat Streaming Pertama Anda
                    </Button>
                </div>
            )}

            <Modal isOpen={isTutorialModalOpen} onClose={() => setIsTutorialModalOpen(false)} title="Tutorial Pengoperasian Aplikasi">
                <div className="space-y-4 text-text-secondary max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 1: Pendaftaran dan Login</h3>
                        <p>
                            Jika Anda pengguna baru, klik "Daftar di sini" pada halaman login. Isi nama, email, kata sandi, dan unggah foto profil. Setelah mendaftar, akun Anda harus disetujui oleh pengguna Master. Setelah disetujui, Anda dapat masuk menggunakan email dan kata sandi Anda.
                        </p>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 2: Mengatur Kunci API Gemini (Penting untuk Fitur AI)</h3>
                        <p>
                            Sebelum membuat streaming, navigasikan ke halaman "Pengaturan". Di bagian "Konfigurasi API Gemini", masukkan kunci API Google Gemini Anda dan klik "Tambah Kunci". Anda dapat menambahkan beberapa kunci. Aplikasi akan secara otomatis menggunakan kunci yang berfungsi dari daftar ini saat Anda menggunakan fitur AI. Jika satu kunci gagal, kunci berikutnya akan dicoba.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 3: Membuat Streaming Baru</h3>
                        <p>
                            Di halaman Dasbor, klik tombol "Streaming Baru". Anda akan diarahkan ke halaman editor untuk mengatur siaran langsung Anda.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 4: Mengisi Detail Streaming</h3>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li><strong>Judul & Deskripsi:</strong> Beri judul yang menarik dan deskripsi yang jelas. Gunakan fitur AI (<SparklesIcon className="h-4 w-4 inline-block text-accent"/>) dengan memberikan topik untuk membuat judul dan deskripsi secara otomatis (memerlukan kunci API dari Langkah 2).</li>
                            <li><strong>Thumbnail:</strong> Klik pada area gambar untuk mengunggah thumbnail. Gambar ini akan muncul di platform tujuan seperti YouTube.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 5: Mengatur Sumber Video & Tujuan</h3>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li><strong>Sumber Video:</strong> Pilih apakah video Anda berasal dari file yang diunggah ('Unggah') atau dari tautan Google Drive.</li>
                            <li><strong>Tujuan:</strong> Klik "Tambah" untuk menambahkan platform tujuan. Pilih platform (YouTube, Facebook, dll.) dan masukkan "Kunci Streaming" (Stream Key) dari platform tersebut. Anda dapat menambahkan beberapa tujuan untuk melakukan multi-live.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 6: Mengatur Penjadwalan</h3>
                        <p>
                            Atur kapan streaming Anda akan dimulai. Pilih opsi pengulangan:
                        </p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li><strong>Tidak Ada:</strong> Untuk siaran satu kali, pilih tanggal dan waktu mulai.</li>
                            <li><strong>Harian:</strong> Siaran akan berulang setiap hari pada waktu yang sama.</li>
                            <li><strong>Mingguan:</strong> Pilih hari dan waktu siaran akan diulang setiap minggu.</li>
                            <li><strong>Berhenti Otomatis:</strong> Aktifkan fitur ini dan atur durasi (dalam menit) jika Anda ingin siaran berhenti secara otomatis.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 7: Menyimpan dan Memulai Streaming</h3>
                        <p>
                            Setelah semua pengaturan selesai, klik "Simpan Streaming". Streaming Anda akan muncul di dasbor dengan status "Dijadwalkan". Untuk memulai siaran (simulasi), klik tombol putar (<PlayIcon className="h-4 w-4 inline-block"/>) pada kartu streaming.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Langkah 8: Manajemen Pengguna (Admin)</h3>
                        <p>
                            Jika Anda adalah pengguna Master, Anda akan melihat menu "Manajemen Pengguna". Di sana Anda dapat menyetujui atau menonaktifkan pengguna. Di halaman "Pengaturan", Anda dapat mengelola kunci API dan integrasi platform lainnya.
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
