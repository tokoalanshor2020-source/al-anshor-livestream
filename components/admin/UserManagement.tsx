import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { SearchIcon, UserCircleIcon } from '../icons/Icons';

interface UserManagementProps {
    users: User[];
    onSetUserLicenseStatus: (userId: string, isActive: boolean) => void;
}

type StatusFilter = 'All' | 'Active' | 'Inactive';

const UserManagement: React.FC<UserManagementProps> = ({ users, onSetUserLicenseStatus }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

    const filterButtons: { label: string, value: StatusFilter }[] = [
        { label: 'Semua', value: 'All' },
        { label: 'Aktif', value: 'Active' },
        { label: 'Nonaktif', value: 'Inactive' },
    ];

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesStatus = 
                statusFilter === 'All' ||
                (statusFilter === 'Active' && user.licenseActive) ||
                (statusFilter === 'Inactive' && !user.licenseActive);

            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesStatus && matchesSearch;
        });
    }, [users, searchQuery, statusFilter]);

    const getEmptyStateMessage = () => {
        const filterLabel = filterButtons.find(f => f.value === statusFilter)?.label.toLowerCase();
    
        if (searchQuery && statusFilter !== 'All') {
            return `Tidak ada pengguna ${filterLabel} yang cocok dengan pencarian "${searchQuery}".`;
        }
        if (searchQuery) {
            return `Tidak ada pengguna yang cocok dengan pencarian "${searchQuery}".`;
        }
        if (statusFilter !== 'All') {
            return `Tidak ada pengguna dengan status ${filterLabel}.`;
        }
        return 'Tidak ada pengguna yang terdaftar dalam sistem.';
    };

    return (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Input 
                            type="text"
                            placeholder="Cari nama atau email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full md:w-64"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    </div>
                     <div className="flex items-center gap-2">
                        {filterButtons.map(filter => (
                            <button
                                key={filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${statusFilter === filter.value ? 'bg-accent text-white' : 'bg-secondary hover:bg-gray-600 text-text-secondary'}`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary">
                    <thead className="bg-background">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Pengguna</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status Lisensi</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {user.photo ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={user.photo} alt={`${user.name}'s profile`} />
                                                ) : (
                                                    <UserCircleIcon className="h-10 w-10 text-gray-500" />
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text-primary">{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.licenseActive ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-200">
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900 text-yellow-200">
                                                Nonaktif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-2">
                                            {user.licenseActive ? (
                                                <Button variant="secondary" onClick={() => onSetUserLicenseStatus(user.id, false)} size="sm">
                                                    Hentikan Sementara
                                                </Button>
                                            ) : (
                                                <Button onClick={() => onSetUserLicenseStatus(user.id, true)} size="sm">
                                                    Aktifkan Kembali
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-text-secondary">
                                    {getEmptyStateMessage()}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default UserManagement;