
import React, { useState, useRef } from 'react';
import { User } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { StreamIcon, UserCircleIcon } from '../icons/Icons';

interface RegisterFormProps {
    onRegister: (user: Omit<User, 'id' | 'role' | 'licenseActive'>) => void;
    onNavigateToLogin: () => void;
    allUsers: User[];
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onNavigateToLogin, allUsers }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (allUsers.some(u => u.email === email)) {
            setError('Email ini sudah terdaftar. Silakan gunakan email lain.');
            return;
        }
        if (password.length < 6) {
            setError('Kata sandi harus terdiri dari minimal 6 karakter.');
            return;
        }
        onRegister({ name, email, password, photo });
    };
    
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPhotoPreview(result);
                setPhoto(result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full p-8 bg-surface rounded-xl shadow-lg">
                <div className="flex justify-center mb-6">
                    <StreamIcon className="h-12 w-12 text-accent" />
                </div>
                <h2 className="text-3xl font-bold text-center text-text-primary">Buat Akun Baru</h2>
                <p className="text-center text-text-secondary mb-8">Daftar untuk mulai streaming</p>
                {error && <p className="bg-red-900 text-red-200 p-3 rounded-md text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Foto Profil (Opsional)</label>
                        <div 
                            className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-600 hover:border-accent transition"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {photoPreview ? (
                                <img src={photoPreview} alt="Pratinjau Profil" className="h-full w-full object-cover" />
                            ) : (
                                <UserCircleIcon className="h-12 w-12 text-gray-500" />
                            )}
                        </div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
                    </div>
                    <Input
                        label="Nama Lengkap"
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Nama Anda"
                    />
                    <Input
                        label="Email"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="email@anda.com"
                    />
                    <Input
                        label="Kata Sandi"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="minimal 6 karakter"
                    />
                    <Button type="submit" className="w-full justify-center">
                        Daftar
                    </Button>
                </form>
                 <p className="text-center text-sm text-text-secondary mt-6">
                    Sudah punya akun?{' '}
                    <button onClick={onNavigateToLogin} className="font-semibold text-accent hover:underline focus:outline-none">
                        Masuk di sini
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;
