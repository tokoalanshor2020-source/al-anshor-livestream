
import React, { useState, useCallback, useMemo } from 'react';
import { User, Page, Stream, initialStreams, initialUsers } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import PageContainer from './components/layout/PageContainer';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './components/dashboard/Dashboard';
import StreamEditor from './components/stream/StreamEditor';
import SettingsPage from './components/settings/SettingsPage';
import UserManagement from './components/admin/UserManagement';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    
    // History state for streams to enable undo/redo
    const [history, setHistory] = useState<Stream[][]>([initialStreams]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const streams = history[historyIndex];

    const [users, setUsers] = useState<User[]>(initialUsers);
    const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
    const [authPage, setAuthPage] = useState<'login' | 'register'>('login');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const updateStreamsHistory = (newStreams: Stream[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newStreams]);
        setHistoryIndex(newHistory.length);
    };
    
    const handleLogin = useCallback((loggedInUser: User) => {
        setUser(loggedInUser);
        setCurrentPage('dashboard');
    }, []);

    const handleLogout = useCallback(() => {
        setUser(null);
        setAuthPage('login');
        setRegistrationSuccess(false);
    }, []);
    
    const handleNavigation = useCallback((page: Page) => {
        setCurrentPage(page);
        setEditingStreamId(null);
    }, []);

    const handleRegister = useCallback((newUserData: Omit<User, 'id' | 'role' | 'licenseActive'>) => {
        const newUser: User = {
            ...newUserData,
            id: `user-${Date.now()}`,
            role: 'user',
            licenseActive: false,
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        setRegistrationSuccess(true);
        setAuthPage('login');
    }, []);
    
    const startEditingStream = useCallback((streamId: string) => {
        setEditingStreamId(streamId);
        setCurrentPage('edit-stream');
    }, []);

    const startCreatingStream = useCallback(() => {
        setEditingStreamId(null);
        setCurrentPage('edit-stream');
    }, []);

    const saveStream = useCallback((stream: Stream) => {
        const currentStreams = history[historyIndex];
        const exists = currentStreams.some(s => s.id === stream.id);
        let newStreams;
        if (exists) {
            newStreams = currentStreams.map(s => s.id === stream.id ? stream : s);
        } else {
            newStreams = [...currentStreams, stream];
        }
        updateStreamsHistory(newStreams);
        setCurrentPage('dashboard');
        setEditingStreamId(null);
    }, [history, historyIndex]);

    const deleteStream = useCallback((streamId: string) => {
        const currentStreams = history[historyIndex];
        const newStreams = currentStreams.filter(s => s.id !== streamId);
        updateStreamsHistory(newStreams);
    }, [history, historyIndex]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const handleUndo = useCallback(() => {
        if (canUndo) {
            setHistoryIndex(prevIndex => prevIndex - 1);
        }
    }, [canUndo]);

    const handleRedo = useCallback(() => {
        if (canRedo) {
            setHistoryIndex(prevIndex => prevIndex + 1);
        }
    }, [canRedo]);


    // Dihapus useCallback untuk memastikan fungsi tidak pernah stale
    const setUserLicenseStatus = (userId: string, isActive: boolean) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, licenseActive: isActive } : u));
    };

    const editingStream = useMemo(() => {
        return streams.find(s => s.id === editingStreamId) || null;
    }, [editingStreamId, streams]);

    if (!user) {
        if (authPage === 'login') {
            return <LoginForm 
                onLogin={handleLogin} 
                allUsers={users} 
                onNavigateToRegister={() => {
                    setRegistrationSuccess(false);
                    setAuthPage('register');
                }}
                showSuccessMessage={registrationSuccess}
            />;
        }
        return <RegisterForm onRegister={handleRegister} onNavigateToLogin={() => setAuthPage('login')} allUsers={users} />;
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard 
                    streams={streams} 
                    onEdit={startEditingStream} 
                    onDelete={deleteStream} 
                    onCreate={startCreatingStream}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />;
            case 'edit-stream':
                return <StreamEditor stream={editingStream} onSave={saveStream} onCancel={() => handleNavigation('dashboard')} />;
            case 'settings':
                return <SettingsPage />;
            case 'user-management':
                return <UserManagement users={users.filter(u => u.role !== 'master')} onSetUserLicenseStatus={setUserLicenseStatus} />;
            default:
                return <Dashboard 
                    streams={streams} 
                    onEdit={startEditingStream} 
                    onDelete={deleteStream} 
                    onCreate={startCreatingStream} 
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />;
        }
    };

    return (
        <div className="flex h-screen bg-background text-text-primary">
            <Sidebar onNavigate={handleNavigation} userRole={user.role} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} onLogout={handleLogout} />
                <PageContainer>
                    {renderPage()}
                </PageContainer>
            </div>
        </div>
    );
};

export default App;
