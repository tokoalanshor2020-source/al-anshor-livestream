
import React from 'react';
import { Page, UserRole } from '../../types';
import { DashboardIcon, SettingsIcon, UsersIcon, StreamIcon } from '../icons/Icons';

interface SidebarProps {
    onNavigate: (page: Page) => void;
    userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, userRole }) => {
    const navItems = [
        { page: 'dashboard', label: 'Dasbor', icon: <DashboardIcon className="h-6 w-6" /> },
        { page: 'settings', label: 'Pengaturan', icon: <SettingsIcon className="h-6 w-6" /> },
    ];

    if (userRole === 'master') {
        navItems.push({ page: 'user-management', label: 'Manajemen Pengguna', icon: <UsersIcon className="h-6 w-6" /> });
    }

    return (
        <nav className="w-64 bg-surface flex-shrink-0 p-4 flex flex-col">
            <div className="flex items-center mb-10 px-2">
                 <StreamIcon className="h-8 w-8 text-accent"/>
                <h1 className="text-2xl font-bold ml-2">AL ANSHOR</h1>
            </div>
            <ul className="space-y-2">
                {navItems.map(item => (
                    <li key={item.page}>
                        <button
                            onClick={() => onNavigate(item.page as Page)}
                            className="w-full flex items-center p-3 text-text-secondary rounded-lg hover:bg-secondary hover:text-text-primary transition-colors duration-200"
                        >
                            {item.icon}
                            <span className="ml-4 text-lg">{item.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Sidebar;