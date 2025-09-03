
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { User, Page, Stream, initialStreams, initialUsers, Notification, NotificationType, StreamStatus, Recurrence } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import PageContainer from './components/layout/PageContainer';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './components/dashboard/Dashboard';
import StreamEditor from './components/stream/StreamEditor';
import SettingsPage from './components/settings/SettingsPage';
import UserManagement from './components/admin/UserManagement';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import { useStreamManager } from './hooks/useStreamManager';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    
    // State management for streams is now handled by a custom hook
    const { 
        streams, 
        setStreams, 
        saveStream, 
        deleteStream, 
        handleUndo, 
        handleRedo, 
        canUndo, 
        canRedo 
    } = useStreamManager(initialStreams);

    const [users, setUsers] = useState<User[]>(initialUsers);
    const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
    const [authPage, setAuthPage] = useState<'login' | 'register'>('login');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    
    // Notification State
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [upcomingNotifiedIds, setUpcomingNotifiedIds] = useState<Set<string>>(new Set());
    
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

    const saveStreamAndNavigate = useCallback((stream: Stream) => {
        saveStream(stream);
        setCurrentPage('dashboard');
        setEditingStreamId(null);
    }, [saveStream]);

    const setUserLicenseStatus = (userId: string, isActive: boolean) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, licenseActive: isActive } : u));
    };

    const editingStream = useMemo(() => {
        return streams.find(s => s.id === editingStreamId) || null;
    }, [editingStreamId, streams]);

    // --- NOTIFICATION LOGIC ---
    const addNotification = useCallback((type: NotificationType, message: string, streamId?: string) => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}-${Math.random()}`,
            type,
            message,
            streamId,
            read: false,
            timestamp: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const markNotificationAsRead = useCallback((notificationId: string) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const handleStreamStatusChange = useCallback((streamId: string, status: StreamStatus) => {
        const streamToUpdate = streams.find(s => s.id === streamId);
        if (!streamToUpdate || streamToUpdate.status === status) return;

        const newStreams = streams.map(s => s.id === streamId ? { ...s, status } : s);
        setStreams(newStreams);

        switch (status) {
            case StreamStatus.Live:
                addNotification('success', `"${streamToUpdate.title}" sekarang sedang tayang!`, streamId);
                // Simulate stream ending after 1 minute for demo
                setTimeout(() => {
                    handleStreamStatusChange(streamId, StreamStatus.Ended);
                }, 60000); 
                break;
            case StreamStatus.Ended:
                addNotification('info', `"${streamToUpdate.title}" telah berakhir.`, streamId);
                break;
            case StreamStatus.Error:
                addNotification('error', `Gagal memulai streaming "${streamToUpdate.title}".`, streamId);
                break;
        }
    }, [streams, addNotification, setStreams]);

    // Effect for checking upcoming streams
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

            streams.forEach(stream => {
                if (stream.status === StreamStatus.Scheduled && stream.schedule.recurrence === Recurrence.None && stream.schedule.datetime) {
                    const streamTime = new Date(stream.schedule.datetime);
                    if (streamTime > now && streamTime <= fiveMinutesFromNow) {
                        if (!upcomingNotifiedIds.has(stream.id)) {
                            addNotification('warning', `"${stream.title}" akan dimulai dalam 5 menit.`, stream.id);
                            setUpcomingNotifiedIds(prev => new Set(prev).add(stream.id));
                        }
                    }
                }
            });
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [streams, upcomingNotifiedIds, addNotification]);


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
                    onStatusChange={handleStreamStatusChange}
                />;
            case 'edit-stream':
                return <StreamEditor stream={editingStream} onSave={saveStreamAndNavigate} onCancel={() => handleNavigation('dashboard')} />;
            case 'analytics':
                return <AnalyticsPage streams={streams} />;
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
                    onStatusChange={handleStreamStatusChange}
                />;
        }
    };

    return (
        <div className="flex h-screen bg-background text-text-primary">
            <Sidebar onNavigate={handleNavigation} userRole={user.role} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    user={user} 
                    onLogout={handleLogout} 
                    notifications={notifications}
                    onMarkNotificationAsRead={markNotificationAsRead}
                    onMarkAllNotificationsAsRead={markAllAsRead}
                />
                <PageContainer>
                    {renderPage()}
                </PageContainer>
            </div>
        </div>
    );
};

export default App;
