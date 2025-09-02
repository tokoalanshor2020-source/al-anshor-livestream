
import React, { useState, useEffect, useRef } from 'react';
import { Stream, Destination, Platform, VideoSourceType, Recurrence, StreamStatus, Schedule, VideoSource, DayOfWeek, AdvancedSettings, initialVideoAssets, VideoAsset, DestinationType, ManualDestination, IntegratedDestination, ConnectedAccount } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { PlusIcon, TrashIcon, SparklesIcon, LibraryIcon } from '../icons/Icons';
import { generateStreamDetails } from '../../services/geminiService';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import Toggle from '../ui/Toggle';
import VideoLibraryModal from './VideoLibraryModal';


interface StreamEditorProps {
    stream: Stream | null;
    onSave: (stream: Stream) => void;
    onCancel: () => void;
}

const videoSourceTypeText: Record<VideoSourceType, string> = {
    [VideoSourceType.Upload]: 'Unggah',
    [VideoSourceType.GoogleDrive]: 'Google Drive',
};

const recurrenceText: Record<Recurrence, string> = {
    [Recurrence.None]: 'Tidak Ada',
    [Recurrence.Daily]: 'Harian',
    [Recurrence.Weekly]: 'Mingguan',
};


const StreamEditor: React.FC<StreamEditorProps> = ({ stream, onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [videoSource, setVideoSource] = useState<VideoSource>({ type: VideoSourceType.Upload, path: '' });
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [schedule, setSchedule] = useState<Schedule>({
        recurrence: Recurrence.None,
        datetime: new Date(Date.now() + 3600 * 1000).toISOString().substring(0, 16),
        time: '12:00',
        daysOfWeek: [],
    });
    const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
        bitrate: 4000,
        resolution: '1080p',
        fps: 30,
        orientation: 'landscape',
        followInput: false,
        loopVideo: false,
        smoothTransition: false,
    });
    const [autoStop, setAutoStop] = useState(false);
    const [durationMinutes, setDurationMinutes] = useState(60);
    const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
    const videoFileInputRef = useRef<HTMLInputElement>(null);
    
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
    
    const defaultAdvancedSettings: AdvancedSettings = {
        bitrate: 4000,
        resolution: '1080p',
        fps: 30,
        orientation: 'landscape',
        followInput: false,
        loopVideo: false,
        smoothTransition: false,
    };

    useEffect(() => {
        // Bersihkan URL objek pratinjau video sebelumnya untuk mencegah kebocoran memori
        if (videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
            setVideoPreviewUrl(null);
        }

        // Muat akun yang terhubung dari localStorage
        try {
            const savedAccounts = localStorage.getItem('connected_accounts');
            if (savedAccounts) {
                setConnectedAccounts(JSON.parse(savedAccounts));
            }
        } catch (e) {
            console.error("Tidak dapat memuat akun yang terhubung dari localStorage", e);
        }

        if (stream) {
            setTitle(stream.title);
            setDescription(stream.description);
            setVideoSource(stream.videoSource);
            setDestinations(stream.destinations);
            setThumbnail(stream.thumbnail);
            setThumbnailPreview(stream.thumbnail || null);
            setSchedule({
                ...stream.schedule,
                datetime: stream.schedule.datetime ? stream.schedule.datetime.substring(0, 16) : new Date(Date.now() + 3600 * 1000).toISOString().substring(0, 16),
            });
            setAdvancedSettings(stream.advancedSettings || defaultAdvancedSettings);
            setAutoStop(stream.schedule.autoStop || false);
            setDurationMinutes(stream.schedule.durationMinutes || 60);
        } else {
            // Atur default untuk streaming baru
            const nextHour = new Date();
            nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
            setTitle('');
            setDescription('');
            setThumbnail(undefined);
            setThumbnailPreview(null);
            setVideoSource({ type: VideoSourceType.Upload, path: '' });
            setDestinations([]);
            setSchedule({
                recurrence: Recurrence.None,
                datetime: nextHour.toISOString().substring(0, 16),
                time: '12:00',
                daysOfWeek: [],
            });
            setAdvancedSettings(defaultAdvancedSettings);
            setAutoStop(false);
            setDurationMinutes(60);
        }
    }, [stream]);

    // Efek pembersihan untuk URL objek saat komponen di-unmount
    useEffect(() => {
        return () => {
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
        };
    }, [videoPreviewUrl]);
    
    const handleAddDestination = () => {
        const newDestination: ManualDestination = {
            id: `dest-${Date.now()}`,
            type: 'manual',
            platform: Platform.YouTube,
            streamKey: ''
        };
        setDestinations([...destinations, newDestination]);
    };
    
    const handleRemoveDestination = (id: string) => {
        setDestinations(destinations.filter(d => d.id !== id));
    };

    const handleDestinationChange = (id: string, field: string, value: any) => {
        setDestinations(destinations.map(d => {
            if (d.id !== id) return d;

            if (field === 'type') {
                if (value === 'manual') {
                    return { id, type: 'manual', platform: d.platform, streamKey: '' } as ManualDestination;
                } else {
                    const availableAccounts = connectedAccounts.filter(acc => acc.platform === d.platform);
                    const firstAccount = availableAccounts[0];
                    return { id, type: 'integrated', platform: d.platform, accountId: firstAccount?.id || '', accountName: firstAccount?.name || '' } as IntegratedDestination;
                }
            }

            if (field === 'platform') {
                 if (d.type === 'integrated') {
                    const availableAccounts = connectedAccounts.filter(acc => acc.platform === value);
                    const firstAccount = availableAccounts[0];
                     return { ...d, platform: value, accountId: firstAccount?.id || '', accountName: firstAccount?.name || '' };
                 }
            }
            
            if (field === 'accountId') {
                const selectedAccount = connectedAccounts.find(acc => acc.id === value);
                return { ...d, accountId: value, accountName: selectedAccount?.name || '' };
            }

            return { ...d, [field]: value };
        }));
    };
    
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
                setThumbnail(reader.result as string); // Untuk tujuan mock, kami menyimpan URL data
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('video/')) {
                alert('Harap pilih file video yang valid.');
                return;
            }
            setVideoSource({ type: VideoSourceType.Upload, path: file.name });

            // Buat URL pratinjau dan bersihkan yang lama jika ada
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
            const newPreviewUrl = URL.createObjectURL(file);
            setVideoPreviewUrl(newPreviewUrl);
        }
    };
    
    const handleSelectVideoFromLibrary = (video: VideoAsset) => {
        setVideoSource({ type: VideoSourceType.Upload, path: video.name });
        // Bersihkan pratinjau file yang mungkin ada
        if (videoPreviewUrl) {
             URL.revokeObjectURL(videoPreviewUrl);
             setVideoPreviewUrl(null);
        }
        setIsLibraryModalOpen(false);
    };


    const handleDayOfWeekChange = (day: DayOfWeek) => {
        setSchedule(prev => {
            const days = prev.daysOfWeek || [];
            const newDays = days.includes(day)
                ? days.filter(d => d !== day)
                : [...days, day];
            return { ...prev, daysOfWeek: newDays };
        });
    };

    const handleSave = () => {
        const finalSchedule: Schedule = { ...schedule };

        if (finalSchedule.recurrence === Recurrence.None) {
            finalSchedule.datetime = new Date(schedule.datetime!).toISOString();
            delete finalSchedule.time;
            delete finalSchedule.daysOfWeek;
        } else {
            delete finalSchedule.datetime;
        }
        
        if (finalSchedule.recurrence !== Recurrence.Weekly) {
            delete finalSchedule.daysOfWeek;
        }

        if (autoStop) {
            finalSchedule.autoStop = true;
            finalSchedule.durationMinutes = durationMinutes;
        } else {
            delete finalSchedule.autoStop;
            delete finalSchedule.durationMinutes;
        }

        const finalStream: Stream = {
            id: stream?.id || `stream-${Date.now()}`,
            title,
            description,
            thumbnail,
            videoSource,
            destinations,
            schedule: finalSchedule,
            status: stream?.status || StreamStatus.Scheduled,
            advancedSettings,
        };
        onSave(finalStream);
    };

    const handleGenerateWithAi = async () => {
        if (!aiPrompt) return;
        setIsAiLoading(true);
        setAiError('');
        try {
            const details = await generateStreamDetails(aiPrompt);
            setTitle(details.title);
            setDescription(details.description);
            setIsAiModalOpen(false);
            setAiPrompt('');
        } catch (error: any) {
            setAiError(error.message || 'Terjadi kesalahan yang tidak diketahui.');
        } finally {
            setIsAiLoading(false);
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{stream ? 'Ubah Streaming' : 'Buat Streaming Baru'}</h1>
            <div className="space-y-6">
                <Card>
                    <h2 className="text-xl font-semibold mb-4">Detail Streaming</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <div className="relative">
                                <Input label="Judul" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="cth., Acara Langsung Keren Saya" />
                                <button onClick={() => setIsAiModalOpen(true)} className="absolute top-7 right-2 p-2 rounded-full bg-accent text-white hover:bg-indigo-600 transition" title="Buat dengan AI">
                                    <SparklesIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <div>
                                 <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Deskripsi</label>
                                 <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-secondary border border-gray-600 text-text-primary rounded-md p-2 focus:ring-accent focus:border-accent transition" placeholder="Deskripsi singkat tentang streaming Anda."></textarea>
                            </div>
                        </div>
                        <div className="space-y-2">
                             <label className="block text-sm font-medium text-text-secondary">Thumbnail</label>
                             <div 
                                className="w-full h-40 bg-secondary rounded-md flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-600 hover:border-accent transition"
                                onClick={() => thumbnailFileInputRef.current?.click()}
                             >
                                 {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="Pratinjau thumbnail" className="w-full h-full object-cover rounded-md" />
                                 ) : (
                                    <div className="text-center text-text-secondary">
                                        <p>Klik untuk mengunggah</p>
                                        <p className="text-xs">Rasio 16:9 direkomendasikan</p>
                                    </div>
                                 )}
                             </div>
                             <input type="file" accept="image/*" ref={thumbnailFileInputRef} onChange={handleThumbnailChange} className="hidden" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold mb-4">Sumber Video</h2>
                     <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-text-secondary mb-2">Tipe Sumber</label>
                            <select value={videoSource.type} onChange={(e) => setVideoSource({ ...videoSource, type: e.target.value as VideoSourceType })} className="w-full bg-secondary border border-gray-600 text-text-primary rounded-md p-2 focus:ring-accent focus:border-accent transition">
                                {Object.values(VideoSourceType).map(type => <option key={type} value={type}>{videoSourceTypeText[type]}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                             {videoSource.type === VideoSourceType.Upload ? (
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">File Video</label>
                                    <div className="flex space-x-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => videoFileInputRef.current?.click()}
                                        >
                                            Pilih File Video
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setIsLibraryModalOpen(true)}
                                        >
                                            <LibraryIcon className="h-5 w-5 mr-2" /> Pustaka
                                        </Button>
                                    </div>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        ref={videoFileInputRef}
                                        onChange={handleVideoFileChange}
                                        className="hidden"
                                    />
                                    {(videoSource.path && !videoPreviewUrl) && (
                                        <p className="text-sm text-text-secondary mt-2">
                                            File saat ini: {videoSource.path}
                                        </p>
                                    )}
                                    {videoPreviewUrl && (
                                        <div className="mt-4">
                                            <p className="text-sm text-text-secondary mb-2">Pratinjau: {videoSource.path}</p>
                                            <video src={videoPreviewUrl} controls className="w-full max-w-md rounded-lg bg-black"></video>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Input label="URL Google Drive" type="url" value={videoSource.path} onChange={(e) => setVideoSource({ ...videoSource, path: e.target.value })} placeholder="https://drive.google.com/..." />
                            )}
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Tujuan</h2>
                        <Button onClick={handleAddDestination} variant="secondary">
                            <PlusIcon className="h-5 w-5 mr-2" /> Tambah
                        </Button>
                    </div>
                     <div className="space-y-4">
                        {destinations.map(dest => {
                            const availableAccounts = connectedAccounts.filter(acc => acc.platform === dest.platform);
                            return (
                                <div key={dest.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-background rounded-md">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Platform</label>
                                        <select value={dest.platform} onChange={(e) => handleDestinationChange(dest.id, 'platform', e.target.value)} className="w-full bg-secondary border border-gray-600 text-text-primary rounded-md p-2 focus:ring-accent focus:border-accent transition">
                                            {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Tipe</label>
                                        <select value={dest.type} onChange={(e) => handleDestinationChange(dest.id, 'type', e.target.value)} className="w-full bg-secondary border border-gray-600 text-text-primary rounded-md p-2 focus:ring-accent focus:border-accent transition">
                                            <option value="manual">Manual (Kunci Streaming)</option>
                                            <option value="integrated">Akun Terhubung</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        {dest.type === 'manual' ? (
                                            <Input label="Kunci Streaming" type="password" value={(dest as ManualDestination).streamKey} onChange={(e) => handleDestinationChange(dest.id, 'streamKey', e.target.value)} placeholder="tempel kunci streaming Anda di sini" />
                                        ) : (
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-1">Akun</label>
                                                <select
                                                    value={(dest as IntegratedDestination).accountId}
                                                    onChange={(e) => handleDestinationChange(dest.id, 'accountId', e.target.value)}
                                                    className="w-full bg-secondary border border-gray-600 text-text-primary rounded-md p-2 focus:ring-accent focus:border-accent transition disabled:opacity-70 disabled:cursor-not-allowed"
                                                    disabled={availableAccounts.length === 0}
                                                >
                                                    {availableAccounts.length > 0 ? (
                                                        availableAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)
                                                    ) : (
                                                        <option value="">Hubungkan akun di Pengaturan</option>
                                                    )}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:col-start-5 flex justify-end">
                                        <Button variant="danger" onClick={() => handleRemoveDestination(dest.id)}><TrashIcon className="h-5 w-5" /></Button>
                                    </div>
                                </div>
                            );
                        })}
                         {destinations.length === 0 && <p className="text-center text-text-secondary py-4">Belum ada tujuan ditambahkan.</p>}
                    </div>
                </Card>
                
                 <Card>
                    <h2 className="text-xl font-semibold mb-4">Pengaturan Lanjutan</h2>
                     <div className="mb-6 pb-4 border-b border-secondary">
                        <Toggle 
                            label="Ikuti Pengaturan Video Input"
                            enabled={advancedSettings.followInput || false}
                            onChange={(enabled) => setAdvancedSettings(prev => ({ ...prev, followInput: enabled }))}
                        />
                        <p className="text-sm text-text-secondary mt-2">
                            Jika diaktifkan, pengaturan di bawah ini akan diabaikan dan FFmpeg akan mencoba menggunakan pengaturan dari file video sumber.
                        </p>
                    </div>
                    <div className="mb-6 pb-4 border-b border-secondary">
                        <Toggle 
                            label="Looping Video"
                            enabled={advancedSettings.loopVideo || false}
                            onChange={(enabled) => setAdvancedSettings(prev => ({ ...prev, loopVideo: enabled, smoothTransition: enabled ? prev.smoothTransition : false }))}
                        />
                        <p className="text-sm text-text-secondary mt-2">
                            Jika diaktifkan, video akan diputar ulang secara terus menerus selama streaming berlangsung.
                        </p>
                        {advancedSettings.loopVideo && (
                            <div className="mt-4 pl-6">
                                <Toggle 
                                    label="Transisi Halus"
                                    enabled={advancedSettings.smoothTransition || false}
                                    onChange={(enabled) => setAdvancedSettings(prev => ({ ...prev, smoothTransition: enabled }))}
                                />
                                <p className="text-sm text-text-secondary mt-2">
                                    Menambahkan efek crossfade antar putaran video untuk transisi yang mulus. Mungkin sedikit meningkatkan penggunaan CPU.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="bitrate" className="block text-sm font-medium text-text-secondary mb-1">Bitrate</label>
                            <select id="bitrate" value={advancedSettings.bitrate} onChange={e => setAdvancedSettings({...advancedSettings, bitrate: Number(e.target.value) as AdvancedSettings['bitrate']})} className="w-full bg-secondary border border-gray-600 text-text-primary rounded-md p-2 focus:ring-accent focus:border-accent transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={advancedSettings.followInput}>
                                <option value="2500">2500 Kbps</option>
                                <option value="4000">4000 Kbps</option>
                                <option value="6000">6000 Kbps</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="resolution" className="block text-sm font-medium text-text-secondary mb-1">Resolusi</label>
                            <select id="resolution" value={advancedSettings.resolution} onChange={e => setAdvancedSettings({...advancedSettings, resolution: e.target.value as AdvancedSettings['resolution']})} className="w-full bg-secondary border border-gray-600 text-text-primary rounded-md p-2 focus:ring-accent focus:border-accent transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={advancedSettings.followInput}>
                                <option value="720p">720p</option>
                                <option value="1080p">1080p</option>
                                <option value="1440p">1440p</option>
                                <option value="2160p">2160p (4K)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="fps" className="block text-sm font-medium text-text-secondary mb-1">FPS</label>
                            <select id="fps" value={advancedSettings.fps} onChange={e => setAdvancedSettings({...advancedSettings, fps: Number(e.target.value) as AdvancedSettings['fps']})} className="w-full bg-secondary border border-gray-600 text-text-primary rounded-md p-2 focus:ring-accent focus:border-accent transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={advancedSettings.followInput}>
                                <option value="30">30 FPS</option>
                                <option value="60">60 FPS</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="orientation" className="block text-sm font-medium text-text-secondary mb-1">Orientasi</label>
                            <select id="orientation" value={advancedSettings.orientation} onChange={e => setAdvancedSettings({...advancedSettings, orientation: e.target.value as AdvancedSettings['orientation']})} className="w-full bg-secondary border border-gray-600 text-text-primary rounded-md p-2 focus:ring-accent focus:border-accent transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={advancedSettings.followInput}>
                                <option value="landscape">Landscape</option>
                                <option value="portrait">Portrait</option>
                            </select>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold mb-4">Penjadwalan</h2>
                    <div className="space-y-6">
                        <div>
                             <label className="block text-sm font-medium text-text-secondary mb-2">Pengulangan</label>
                             <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 p-3 bg-background rounded-md">
                                {(Object.keys(Recurrence) as Array<keyof typeof Recurrence>).map(key => (
                                    <label key={key} className="flex items-center cursor-pointer text-text-primary">
                                        <input
                                            type="radio"
                                            name="recurrence"
                                            value={Recurrence[key]}
                                            checked={schedule.recurrence === Recurrence[key]}
                                            onChange={() => setSchedule({ ...schedule, recurrence: Recurrence[key] })}
                                            className="w-4 h-4 text-accent bg-gray-700 border-gray-600 focus:ring-accent focus:ring-2"
                                        />
                                        <span className="ml-2">{recurrenceText[Recurrence[key]]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {schedule.recurrence === Recurrence.None && (
                            <Input 
                                label="Tanggal dan Waktu Mulai" 
                                type="datetime-local" 
                                value={schedule.datetime} 
                                onChange={e => setSchedule({ ...schedule, datetime: e.target.value })}
                            />
                        )}

                        {schedule.recurrence === Recurrence.Daily && (
                           <Input 
                                label="Waktu Mulai"
                                type="time"
                                value={schedule.time}
                                onChange={e => setSchedule({ ...schedule, time: e.target.value })}
                           />
                        )}

                        {schedule.recurrence === Recurrence.Weekly && (
                           <div className="space-y-4">
                                <Input 
                                    label="Waktu Mulai"
                                    type="time"
                                    value={schedule.time}
                                    onChange={e => setSchedule({ ...schedule, time: e.target.value })}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Ulangi pada hari</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 p-3 bg-background rounded-md">
                                        {Object.values(DayOfWeek).map(day => (
                                            <label key={day} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-secondary">
                                                <input
                                                    type="checkbox"
                                                    checked={schedule.daysOfWeek?.includes(day)}
                                                    onChange={() => handleDayOfWeekChange(day)}
                                                    className="w-4 h-4 text-accent bg-gray-700 border-gray-600 rounded focus:ring-accent"
                                                />
                                                <span>{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                           </div>
                        )}
                         <div className="mt-6 pt-4 border-t border-secondary">
                            <Toggle 
                                label="Berhenti Otomatis"
                                enabled={autoStop}
                                onChange={setAutoStop}
                            />
                            {autoStop && (
                                <div className="mt-4 max-w-xs">
                                    <Input 
                                        label="Durasi Streaming (menit)"
                                        type="number"
                                        value={durationMinutes}
                                        onChange={e => setDurationMinutes(Number(e.target.value))}
                                        min="1"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
                
                <div className="flex justify-end space-x-4">
                    <Button variant="secondary" onClick={onCancel}>Batal</Button>
                    <Button onClick={handleSave}>Simpan Streaming</Button>
                </div>
            </div>
            
            <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Buat dengan AI">
                <div className="space-y-4">
                    <p className="text-text-secondary">Jelaskan topik streaming Anda, dan AI akan membuatkan judul dan deskripsi untuk Anda.</p>
                    <Input label="Topik Streaming" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="cth., tutorial perintah FFMPEG tingkat lanjut" />
                    {aiError && <p className="text-red-400 text-sm">{aiError}</p>}
                    <div className="flex justify-end space-x-2">
                        <Button variant="secondary" onClick={() => setIsAiModalOpen(false)}>Batal</Button>
                        <Button onClick={handleGenerateWithAi} disabled={isAiLoading || !aiPrompt}>
                            {isAiLoading ? <Spinner /> : <><SparklesIcon className="h-5 w-5 mr-2" />Buat</>}
                        </Button>
                    </div>
                </div>
            </Modal>

            <VideoLibraryModal
                isOpen={isLibraryModalOpen}
                onClose={() => setIsLibraryModalOpen(false)}
                videos={initialVideoAssets}
                onSelectVideo={handleSelectVideoFromLibrary}
            />
        </div>
    );
};

export default StreamEditor;
