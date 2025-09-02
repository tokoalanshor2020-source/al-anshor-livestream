
export type Page = 'dashboard' | 'edit-stream' | 'settings' | 'user-management';

export type UserRole = 'master' | 'user';

export interface User {
    id: string;
    email: string;
    password?: string; // Should be handled securely on a real backend
    name: string;
    photo?: string; // Data URL for the image
    role: UserRole;
    licenseActive: boolean;
}

export enum Platform {
    YouTube = 'YouTube',
    Facebook = 'Facebook',
    Twitch = 'Twitch',
    TikTok = 'TikTok',
    Instagram = 'Instagram',
    Custom = 'Custom RTMP'
}

export interface Destination {
    id: string;
    platform: Platform;
    streamKey: string;
}

export enum VideoSourceType {
    Upload = 'Upload',
    GoogleDrive = 'Google Drive'
}

export interface VideoSource {
    type: VideoSourceType;
    path: string; // File name for upload, URL for GDrive
}

export enum Recurrence {
    None = 'None',
    Daily = 'Daily',
    Weekly = 'Weekly'
}

export enum DayOfWeek {
    Senin = 'Senin',
    Selasa = 'Selasa',
    Rabu = 'Rabu',
    Kamis = 'Kamis',
    Jumat = 'Jumat',
    Sabtu = 'Sabtu',
    Minggu = 'Minggu'
}


export interface Schedule {
    recurrence: Recurrence;
    datetime?: string; // ISO string for Recurrence.None
    time?: string;     // HH:mm format for Daily and Weekly
    daysOfWeek?: DayOfWeek[]; // For Recurrence.Weekly
    autoStop?: boolean;
    durationMinutes?: number;
}


export enum StreamStatus {
    Scheduled = 'Scheduled',
    Live = 'Live',
    Ended = 'Ended',
    Error = 'Error'
}

export interface Stream {
    id: string;
    title: string;
    description: string;
    thumbnail?: string; // URL or path to thumbnail image
    videoSource: VideoSource;
    destinations: Destination[];
    schedule: Schedule;
    status: StreamStatus;
}

export type NotificationType = 'info' | 'success' | 'error' | 'warning';

export interface Notification {
  id: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  type: NotificationType;
  streamId?: string;
}


// --- MOCK DATA ---

export const initialUsers: User[] = [
    { id: 'user-master-01', name: 'Master Admin', email: 'alanshorentertaiment@gmail.com', password: 'RiyanJelilaCAVA2018', role: 'master', licenseActive: true },
    { id: 'user-regular-01', name: 'User Biasa', email: 'user@example.com', password: 'password', role: 'user', licenseActive: true },
    { id: 'user-pending-01', name: 'User Tertunda', email: 'pending@example.com', password: 'password', role: 'user', licenseActive: false },
];

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(14, 0, 0);

const soon = new Date();
soon.setMinutes(soon.getMinutes() + 4);

export const initialStreams: Stream[] = [
    {
        id: 'stream-1',
        title: 'Sorotan Gaming Mingguan',
        description: 'Saksikan momen-momen terbaik dari sesi gaming minggu ini. Menampilkan kemenangan epik dan kegagalan lucu.',
        thumbnail: 'https://placehold.co/600x400/1f2937/d1d5db?text=Gaming',
        videoSource: { type: VideoSourceType.GoogleDrive, path: 'https://drive.google.com/file/d/example1/view' },
        destinations: [
            { id: 'dest-1a', platform: Platform.YouTube, streamKey: 'xxxx-xxxx-xxxx-xxxx' },
            { id: 'dest-1b', platform: Platform.Twitch, streamKey: 'live_xxxx_xxxxxxxxxxxxxxxxxx' },
        ],
        schedule: { 
            recurrence: Recurrence.Weekly, 
            time: '20:00',
            daysOfWeek: [DayOfWeek.Jumat, DayOfWeek.Sabtu],
            autoStop: true,
            durationMinutes: 120,
        },
        status: StreamStatus.Scheduled
    },
    {
        id: 'stream-2',
        title: 'Sesi Coding Langsung: Membangun Aplikasi React',
        description: 'Bergabunglah dengan saya saat saya membangun aplikasi keren dari awal menggunakan React, TypeScript, dan Tailwind CSS.',
        thumbnail: 'https://placehold.co/600x400/1e40af/f9fafb?text=Coding',
        videoSource: { type: VideoSourceType.Upload, path: 'live_coding.mp4' },
        destinations: [
            { id: 'dest-2a', platform: Platform.YouTube, streamKey: 'yyyy-yyyy-yyyy-yyyy' }
        ],
        schedule: { 
            recurrence: Recurrence.None, 
            datetime: tomorrow.toISOString(),
        },
        status: StreamStatus.Scheduled
    },
    {
        id: 'stream-3',
        title: 'Tutorial FFMPEG (Segera Tayang)',
        description: 'Tutorial mendalam tentang penggunaan FFMPEG untuk manipulasi video.',
        thumbnail: 'https://placehold.co/600x400/6366f1/f9fafb?text=FFMPEG',
        videoSource: { type: VideoSourceType.Upload, path: 'ffmpeg_tutorial.mp4' },
        destinations: [
            { id: 'dest-3a', platform: Platform.YouTube, streamKey: 'zzzz-zzzz-zzzz-zzzz' }
        ],
        schedule: { 
            recurrence: Recurrence.None, 
            datetime: soon.toISOString(),
        },
        status: StreamStatus.Scheduled
    }
];
