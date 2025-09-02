
import React from 'react';
import { Notification, NotificationType } from '../../types';
import { InfoIcon, CheckCircleIcon, WarningIcon, TrashIcon } from '../icons/Icons';

interface NotificationPopoverProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

const formatTimeAgo = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds} dtk lalu`;
    if (minutes < 60) return `${minutes} mnt lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
};


const NotificationItem: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
    const icons: Record<NotificationType, React.ReactNode> = {
        info: <InfoIcon className="h-5 w-5 text-blue-400" />,
        success: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
        warning: <WarningIcon className="h-5 w-5 text-yellow-400" />,
        error: <WarningIcon className="h-5 w-5 text-red-400" />,
    };

    return (
        <div className="flex items-start p-3 hover:bg-secondary transition-colors duration-150">
            <div className="flex-shrink-0 mr-3 mt-1">
                {icons[notification.type]}
            </div>
            <div className="flex-grow">
                <p className="text-sm text-text-primary">{notification.message}</p>
                <p className="text-xs text-text-secondary mt-1">{formatTimeAgo(notification.timestamp)}</p>
            </div>
            <button onClick={() => onDismiss(notification.id)} className="ml-2 p-1 text-text-secondary hover:text-text-primary">
                &times;
            </button>
        </div>
    );
};


const NotificationPopover: React.FC<NotificationPopoverProps> = ({ notifications, onDismiss, onClearAll }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 bg-surface rounded-lg shadow-2xl border border-secondary overflow-hidden">
            <div className="p-3 flex justify-between items-center border-b border-secondary">
                <h3 className="font-semibold text-text-primary">Notifikasi</h3>
                {notifications.length > 0 && (
                    <button onClick={onClearAll} className="text-sm text-accent hover:underline">
                        Bersihkan semua
                    </button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-secondary">
                        {notifications.map(notif => (
                            <NotificationItem key={notif.id} notification={notif} onDismiss={onDismiss} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 text-text-secondary">
                        <p>Tidak ada notifikasi baru.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPopover;
