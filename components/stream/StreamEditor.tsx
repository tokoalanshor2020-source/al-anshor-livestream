
import React, { useState, useEffect, useRef } from 'react';
import { Stream, Destination, Platform, VideoSourceType, Recurrence, StreamStatus, Schedule, VideoSource, DayOfWeek } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { PlusIcon, TrashIcon, SparklesIcon } from '../icons/Icons';
import { generateStreamDetails } from '../../services/geminiService';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import Toggle from '../ui/Toggle';

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
    const [autoStop, setAutoStop] = useState(false);
    const [durationMinutes, setDurationMinutes] = useState(60);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    useEffect(() => {
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
            setAutoStop(stream.schedule.autoStop || false);
            setDurationMinutes(stream.schedule.durationMinutes || 60);
        } else {
            // Set default for new stream
            const nextHour = new Date();
            nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
            setSchedule({
                recurrence: Recurrence.None,
                datetime: nextHour.toISOString().substring(0, 16),
                time: '12:00',
                daysOfWeek: [],
            });
            setAutoStop(false);
            setDurationMinutes(60);
        }
    }, [stream]);
    
    const handleAddDestination = () => {
        setDestinations([...destinations, { id: `dest-${Date.now()}`, platform: Platform.YouTube, streamKey: '' }]);
    };
    
    const handleRemoveDestination = (id: string) => {
        setDestinations(destinations.filter(d => d.id !== id));
    };

    const handleDestinationChange = (id: string, field: keyof Destination, value: string) => {
        setDestinations(destinations.map(d => d.id === id ? { ...d, [field]: value } : d));
    };
    
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
                setThumbnail(reader.result as string); // For mock purposes, we store the data URL
            };
            reader.readAsDataURL(file);
        }
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
                                onClick={() => fileInputRef.current?.click()}
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
                             <input type="file" accept="image/*" ref={fileInputRef} onChange={handleThumbnailChange} className="hidden" />
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
                                <Input label="Unggah Video" type="file" onChange={(e) => setVideoSource({ ...videoSource, path: e.target.files?.[0]?.name || '' })} />
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
                        {destinations.map(dest => (
                            <div key={dest.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 bg-background rounded-md">
                                 <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Platform</label>
                                    <select value={dest.platform} onChange={(e) => handleDestinationChange(dest.id, 'platform', e.target.value)} className="w-full bg-secondary border border-gray-600 text-text-primary rounded-md p-2 focus:ring-accent focus:border-accent transition">
                                        {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <Input label="Kunci Streaming" type="password" value={dest.streamKey} onChange={(e) => handleDestinationChange(dest.id, 'streamKey', e.target.value)} placeholder="tempel kunci streaming Anda di sini" />
                                </div>
                                <div className="md:col-start-4 flex justify-end">
                                    <Button variant="danger" onClick={() => handleRemoveDestination(dest.id)}><TrashIcon className="h-5 w-5" /></Button>
                                </div>
                            </div>
                        ))}
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
        </div>
    );
};

export default StreamEditor;