
import React, { useState, useRef, useEffect } from 'react';
import { User, Notification } from '../../types';
import { LogoutIcon, BellIcon } from '../icons/Icons';
import NotificationPopover from './NotificationPopover';

interface HeaderProps {
    user: User;
    onLogout: () => void;
    notifications: Notification[];
    onMarkNotificationAsRead: (id: string) => void;
    onMarkAllNotificationsAsRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, notifications, onMarkNotificationAsRead, onMarkAllNotificationsAsRead }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleTogglePopover = () => {
        setIsPopoverOpen(prev => !prev);
        if(!isPopoverOpen) { // If we are opening it, mark all as read after a delay
            setTimeout(() => {
                onMarkAllNotificationsAsRead();
            }, 2000);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-surface shadow-md p-4 flex justify-end items-center z-20">
            <div className="flex items-center space-x-4">
                <div ref={popoverRef} className="relative">
                    <button 
                        onClick={handleTogglePopover}
                        className="relative text-text-secondary hover:text-text-primary transition-colors p-2 rounded-full hover:bg-secondary"
                        aria-label={`Notifikasi (${unreadCount} belum dibaca)`}
                    >
                        <BellIcon className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-surface"></span>
                        )}
                    </button>
                    {isPopoverOpen && (
                        <NotificationPopover 
                            notifications={notifications}
                            onDismiss={onMarkNotificationAsRead}
                            onClearAll={() => {
                                onMarkAllNotificationsAsRead();
                                setIsPopoverOpen(false);
                            }}
                        />
                    )}
                </div>

                <div className="flex items-center">
                    {user.photo ? (
                        <img src={user.photo} alt="Profil" className="h-10 w-10 rounded-full mr-3 object-cover" />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center mr-3 text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-text-secondary mr-4 hidden sm:inline">Selamat datang, {user.name}</span>
                    <button
                        onClick={onLogout}
                        className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        <LogoutIcon className="h-5 w-5 sm:mr-2" />
                        <span className="hidden sm:inline">Keluar</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
