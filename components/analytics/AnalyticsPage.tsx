
import React from 'react';
import { Stream } from '../../types';
import Card from '../ui/Card';
import { UsersIcon, ClockIcon, StreamIcon } from '../icons/Icons';

interface AnalyticsPageProps {
    streams: Stream[];
}

// Helper component for stat cards
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; }> = ({ icon, title, value }) => (
    <Card className="flex items-center p-4">
        <div className="p-3 rounded-full bg-secondary mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-text-secondary font-medium">{title}</p>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
    </Card>
);

// Helper for simulated charts
const MockChart: React.FC<{ title: string; color: string }> = ({ title, color }) => (
    <div className="h-full flex flex-col">
        <h3 className="text-md font-semibold text-text-secondary mb-2">{title}</h3>
        <div className="flex-grow bg-background rounded-md p-2 flex items-end space-x-2">
            {[30, 50, 40, 60, 80, 75, 90].map((h, i) => (
                <div key={i} className={`w-full rounded-t-sm ${color}`} style={{ height: `${h}%` }}></div>
            ))}
        </div>
    </div>
);

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ streams }) => {

    const totalStreams = streams.length;
    const totalViewers = streams.reduce((acc, _, index) => acc + (1234 * (index + 1)) % 5000 + 100, 0);
    const totalDurationMinutes = streams.reduce((acc, s) => acc + (s.schedule.durationMinutes || 90), 0);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Analitik Streaming</h1>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    icon={<StreamIcon className="h-6 w-6 text-accent"/>} 
                    title="Total Streaming"
                    value={totalStreams.toString()}
                />
                <StatCard 
                    icon={<UsersIcon className="h-6 w-6 text-green-400"/>} 
                    title="Total Penonton (Simulasi)"
                    value={totalViewers.toLocaleString('id-ID')}
                />
                <StatCard 
                    icon={<ClockIcon className="h-6 w-6 text-yellow-400"/>} 
                    title="Total Durasi (Menit)"
                    value={totalDurationMinutes.toLocaleString('id-ID')}
                />
            </div>

            {/* Charts Section */}
            <Card className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-text-primary">Kesehatan Streaming Real-Time (Simulasi)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-64">
                    <MockChart title="Penonton Bersamaan" color="bg-accent" />
                    <MockChart title="Bitrate (Kbps)" color="bg-green-500" />
                    <MockChart title="Frame Rate (FPS)" color="bg-yellow-500" />
                </div>
            </Card>

            {/* Individual Stream Performance */}
            <Card>
                <h2 className="text-xl font-semibold mb-4 text-text-primary">Performa Streaming Individual (Simulasi)</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-secondary">
                        <thead className="bg-background">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Judul Streaming</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tanggal</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Penonton</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Waktu Tonton (Jam)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary">
                            {streams.slice(0, 5).map((stream, index) => (
                                <tr key={stream.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{stream.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                        {stream.schedule.datetime ? new Date(stream.schedule.datetime).toLocaleDateString('id-ID') : 'Berulang'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{((totalViewers / totalStreams) * (1.5 - index * 0.2)).toFixed(0)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{(((totalViewers / totalStreams) * 1.2 * (1.5 - index * 0.2)) / 60).toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AnalyticsPage;
