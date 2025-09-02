
import React, { useState } from 'react';
import { User } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { StreamIcon, CheckCircleIcon } from '../icons/Icons';

interface LoginFormProps {
    onLogin: (user: User) => void;
    allUsers: User[];
    onNavigateToRegister: () => void;
    showSuccessMessage: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, allUsers, onNavigateToRegister, showSuccessMessage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = allUsers.find(u => u.email === email && u.password === password);
        if (user) {
            if (user.role === 'user' && !user.licenseActive) {
                setError('Akun Anda tidak aktif. Silakan hubungi administrator.');
            } else {
                onLogin(user);
            }
        } else {
            setError('Email atau kata sandi tidak valid.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full p-8 bg-surface rounded-xl shadow-lg">
                 <div className="flex justify-center mb-6">
                    <StreamIcon className="h-12 w-12 text-accent" />
                 </div>
                <h2 className="text-3xl font-bold text-center text-text-primary">Selamat Datang di AL ANSHOR LIVE STREAM</h2>
                <p className="text-center text-text-secondary mb-8">Masuk untuk mengelola streaming Anda</p>
                
                {error && <p className="bg-red-900 text-red-200 p-3 rounded-md text-center mb-4">{error}</p>}
                
                {showSuccessMessage && (
                    <div className="bg-green-900 text-green-200 p-3 rounded-md text-center mb-4 flex items-center">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        <span>Pendaftaran berhasil! Tunggu persetujuan admin.</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="master@example.com"
                    />
                    <Input
                        label="Kata Sandi"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="********"
                    />
                    <Button type="submit" className="w-full justify-center">
                        Masuk
                    </Button>
                </form>
                <p className="text-center text-sm text-text-secondary mt-6">
                    Belum punya akun?{' '}
                    <button onClick={onNavigateToRegister} className="font-semibold text-accent hover:underline focus:outline-none">
                        Daftar di sini
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
