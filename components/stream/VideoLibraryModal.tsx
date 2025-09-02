
import React from 'react';
import { VideoAsset } from '../../types';
import Modal from '../ui/Modal';
import { ClockIcon, PlayIcon } from '../icons/Icons';

interface VideoLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    videos: VideoAsset[];
    onSelectVideo: (video: VideoAsset) => void;
}

const VideoLibraryModal: React.FC<VideoLibraryModalProps> = ({ isOpen, onClose, videos, onSelectVideo }) => {
    
    const formatUploadDate = (isoDate: string) => {
        return new Date(isoDate).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pilih Video dari Pustaka">
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                {videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {videos.map(video => (
                            <div key={video.id} className="bg-background rounded-lg overflow-hidden group cursor-pointer" onClick={() => onSelectVideo(video)}>
                                <div className="relative">
                                    <img src={video.thumbnailUrl} alt={video.name} className="w-full h-32 object-cover" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                        <PlayIcon className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                        {video.duration}
                                    </span>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-text-primary truncate" title={video.name}>{video.name}</h3>
                                    <p className="text-xs text-text-secondary mt-1">
                                        Diunggah: {formatUploadDate(video.uploadedAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-text-secondary">
                        <p>Pustaka video Anda kosong.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default VideoLibraryModal;
