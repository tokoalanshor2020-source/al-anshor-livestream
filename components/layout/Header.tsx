
import React from 'react';
import { User } from '../../types';
import { LogoutIcon } from '../icons/Icons';

interface HeaderProps {
    user: User;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
    return (
        <header className="bg-surface shadow-md p-4 flex justify-end items-center z-10">
            <div className="flex items-center">
                 {user.photo ? (
                    <img src={user.photo} alt="Profil" className="h-10 w-10 rounded-full mr-3 object-cover" />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center mr-3 text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <span className="text-text-secondary mr-4">Selamat datang, {user.name}</span>
                <button
                    onClick={onLogout}
                    className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    <LogoutIcon className="h-5 w-5 mr-2" />
                    Keluar
                </button>
            </div>
        </header>
    );
};

export default Header;
