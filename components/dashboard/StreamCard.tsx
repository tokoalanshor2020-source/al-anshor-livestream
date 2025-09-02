import React from 'react';
import { Stream, StreamStatus, Recurrence, Schedule, DayOfWeek } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ClockIcon, EditIcon, TrashIcon, PlayIcon, YouTubeIcon, FacebookIcon, TwitchIcon, CustomStreamIcon, TikTokIcon, InstagramIcon, StopIcon, WarningIcon } from '../icons/Icons';

interface StreamCardProps {
    stream: Stream;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (streamId: string, newStatus: StreamStatus) => void;
}

const StreamCard: React.FC<StreamCardProps> = ({ stream, onEdit, onDelete, onStatusChange }) => {

    const statusText: Record<StreamStatus, string> = {
        [StreamStatus.Scheduled]: 'Dijadwalkan',
        [StreamStatus.Live]: 'Langsung',
        [StreamStatus.Ended]: 'Selesai',
        [StreamStatus.Error]: 'Gagal',
    };

    const statusClasses: Record<StreamStatus, string> = {
        [StreamStatus.Scheduled]: 'bg-blue-500',
        [StreamStatus.Live]: 'bg-green-500 animate-pulse',
        [StreamStatus.Ended]: 'bg-gray-500',
        [StreamStatus.Error]: 'bg-red-500',
    };

    const platformIcons: Record<string, React.ReactNode> = {
        'YouTube': <YouTubeIcon className="h-5 w-5" />,
        'Facebook': <FacebookIcon className="h-5 w-5" />,
        'Twitch': <TwitchIcon className="h-5 w-5" />,
        'TikTok': <TikTokIcon className="h-5 w-5" />,
        'Instagram': <InstagramIcon className="h-5 w-5" />,
        'Custom RTMP': <CustomStreamIcon className="h-5 w-5" />
    };
    
    const formatScheduleText = (schedule: Schedule): string => {
        switch (schedule.recurrence) {
            case Recurrence.None:
                return new Date(schedule.datetime!).toLocaleString('id-ID', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
            case Recurrence.Daily:
                return `Setiap Hari pukul ${schedule.time}`;
            case Recurrence.Weekly:
                const days = schedule.daysOfWeek?.map(day => day.substring(0, 3)).join(', ') || '';
                return `Setiap ${days} pukul ${schedule.time}`;
            default:
                return "Jadwal tidak valid";
        }
    };

    return (
        <Card className="flex flex-col justify-between overflow-hidden p-0">
            <div>
                 {stream.thumbnail ? (
                    <img src={stream.thumbnail} alt={stream.title} className="w-full h-40 object-cover" />
                ) : (
                    <div className="w-full h-40 bg-secondary flex items-center justify-center text-text-secondary">
                        <span>Tidak ada thumbnail</span>
                    </div>
                 )}
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-text-primary pr-2">{stream.title}</h3>
                        <div className="flex items-center flex-shrink-0">
                             <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${statusClasses[stream.status]}`}>{statusText[stream.status]}</span>
                        </div>
                    </div>
                    <p className="text-sm text-text-secondary mb-4 h-10 overflow-hidden">{stream.description}</p>
                    
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-accent">
                            <ClockIcon className="h-5 w-5 mr-2" />
                            <span>{formatScheduleText(stream.schedule)}</span>
                        </div>
                        {stream.schedule.autoStop && (
                            <div className="flex items-center text-sm text-text-secondary">
                                <StopIcon className="h-5 w-5 mr-2 text-red-500" />
                                <span>Berhenti otomatis setelah {stream.schedule.durationMinutes} menit</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <p className="text-sm font-medium text-text-secondary mb-2">Tujuan:</p>
                        <div className="flex items-center space-x-3">
                            {stream.destinations.map(dest => (
                                <div key={dest.id} className="p-2 bg-secondary rounded-full" title={dest.platform}>
                                    {platformIcons[dest.platform]}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4 p-4 border-t border-secondary">
                <Button variant="secondary" onClick={onEdit} title="Ubah"><EditIcon className="h-5 w-5" /></Button>
                <Button variant="danger" onClick={onDelete} title="Hapus"><TrashIcon className="h-5 w-5" /></Button>
                
                {stream.status === StreamStatus.Scheduled && (
                    <>
                        <Button variant="secondary" onClick={() => onStatusChange(stream.id, StreamStatus.Error)} title="Simulasi Gagal"><WarningIcon className="h-5 w-5 text-yellow-400" /></Button>
                        <Button variant="primary" onClick={() => onStatusChange(stream.id, StreamStatus.Live)} title="Mulai Siaran"><PlayIcon className="h-5 w-5"/></Button>
                    </>
                )}

                {stream.status === StreamStatus.Live && (
                     <Button variant="danger" onClick={() => onStatusChange(stream.id, StreamStatus.Ended)} title="Hentikan Siaran">
                        <StopIcon className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default StreamCard;