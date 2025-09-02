
export type Page = 'dashboard' | 'edit-stream' | 'settings' | 'user-management' | 'analytics';

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

export type DestinationType = 'manual' | 'integrated';

export interface ManualDestination {
    id: string;
    type: 'manual';
    platform: Platform;
    streamKey: string;
}

// Ini sekarang akan menjadi struktur utama untuk akun yang terhubung
export interface IntegratedDestination {
    id: string;
    type: 'integrated';
    platform: Platform;
    accountId: string;
    accountName: string;
}

export type Destination = ManualDestination | IntegratedDestination;


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

export interface AdvancedSettings {
    bitrate: 2500 | 4000 | 6000;
    resolution: '720p' | '1080p' | '1440p' | '2160p';
    fps: 30 | 60;
    orientation: 'landscape' | 'portrait';
    followInput?: boolean;
    loopVideo?: boolean;
    smoothTransition?: boolean;
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
    advancedSettings?: AdvancedSettings;
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

export interface VideoAsset {
    id: string;
    name: string;
    thumbnailUrl: string;
    duration: string;
    uploadedAt: string; // ISO string
}

// Struktur yang sama dengan IntegratedDestination, tetapi digunakan untuk manajemen
export interface ConnectedAccount {
    id: string;
    platform: Platform;
    name: string;
}

// BARU: Struktur untuk mensimulasikan akun yang dapat dipilih selama alur OAuth
export interface SimulatedPlatformAccount {
    id: string;
    platform: Platform;
    name: string;
    email: string;
    avatar?: string;
}


// --- MOCK DATA ---

// BARU: Data untuk mensimulasikan akun yang "login" di browser pengguna
export const mockBrowsableAccounts: SimulatedPlatformAccount[] = [
    { id: 'yt-gaming', platform: Platform.YouTube, name: 'Channel Gaming Saya', email: 'gamerpro@email.com' },
    { id: 'yt-vlog', platform: Platform.YouTube, name: 'Channel Vlog Pribadi', email: 'travel.blogger@email.com' },
    { id: 'fb-page-official', platform: Platform.Facebook, name: 'Halaman Facebook Resmi', email: 'official.page@email.com' },
    { id: 'twitch-main', platform: Platform.Twitch, name: 'Akun Twitch Utama', email: 'main.streamer@email.com' },
    { id: 'twitch-alt', platform: Platform.Twitch, name: 'Akun Twitch Kedua', email: 'alt.streamer@email.com' },
    { id: 'tiktok-business', platform: Platform.TikTok, name: 'Akun TikTok Bisnis', email: 'business.tok@email.com' },
];


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
            { id: 'dest-1a', type: 'integrated', platform: Platform.YouTube, accountId: 'yt-gaming', accountName: 'Channel Gaming Saya' },
            { id: 'dest-1b', type: 'integrated', platform: Platform.Twitch, accountId: 'twitch-main', accountName: 'Akun Twitch Utama' },
        ],
        schedule: { 
            recurrence: Recurrence.Weekly, 
            time: '20:00',
            daysOfWeek: [DayOfWeek.Jumat, DayOfWeek.Sabtu],
            autoStop: true,
            durationMinutes: 120,
        },
        status: StreamStatus.Scheduled,
        advancedSettings: {
            bitrate: 6000,
            resolution: '1080p',
            fps: 60,
            orientation: 'landscape',
            followInput: false,
            loopVideo: true,
            smoothTransition: true,
        }
    },
    {
        id: 'stream-2',
        title: 'Sesi Coding Langsung: Membangun Aplikasi React',
        description: 'Bergabunglah dengan saya saat saya membangun aplikasi keren dari awal menggunakan React, TypeScript, dan Tailwind CSS.',
        thumbnail: 'https://placehold.co/600x400/1e40af/f9fafb?text=Coding',
        videoSource: { type: VideoSourceType.Upload, path: 'live_coding.mp4' },
        destinations: [
            { id: 'dest-2a', type: 'manual', platform: Platform.YouTube, streamKey: 'yyyy-yyyy-yyyy-yyyy' }
        ],
        schedule: { 
            recurrence: Recurrence.None, 
            datetime: tomorrow.toISOString(),
        },
        status: StreamStatus.Scheduled,
        advancedSettings: {
            bitrate: 4000,
            resolution: '1080p',
            fps: 30,
            orientation: 'landscape',
            followInput: false,
            loopVideo: false,
            smoothTransition: false,
        }
    },
    {
        id: 'stream-3',
        title: 'Tutorial FFMPEG (Segera Tayang)',
        description: 'Tutorial mendalam tentang penggunaan FFMPEG untuk manipulasi video.',
        thumbnail: 'https://placehold.co/600x400/6366f1/f9fafb?text=FFMPEG',
        videoSource: { type: VideoSourceType.Upload, path: 'ffmpeg_tutorial.mp4' },
        destinations: [
            { id: 'dest-3a', type: 'integrated', platform: Platform.Facebook, accountId: 'fb-page-official', accountName: 'Halaman Facebook Resmi' }
        ],
        schedule: { 
            recurrence: Recurrence.None, 
            datetime: soon.toISOString(),
        },
        status: StreamStatus.Scheduled
    }
];


export const initialVideoAssets: VideoAsset[] = [
    {
        id: 'vid-1',
        name: 'Final_Cut_Project_v12.mp4',
        thumbnailUrl: 'https://placehold.co/600x400/374151/d1d5db?text=Project+V12',
        duration: '01:24:30',
        uploadedAt: new Date('2024-05-28T10:00:00Z').toISOString(),
    },
    {
        id: 'vid-2',
        name: 'Tutorial_Blender_Intro.mp4',
        thumbnailUrl: 'https://placehold.co/600x400/1e40af/f9fafb?text=Blender+Tutorial',
        duration: '00:15:52',
        uploadedAt: new Date('2024-05-27T14:32:10Z').toISOString(),
    },
    {
        id: 'vid-3',
        name: 'Vlog_Trip_Bali_2024.mov',
        thumbnailUrl: 'https://placehold.co/600x400/6366f1/f9fafb?text=Bali+Vlog',
        duration: '00:22:18',
        uploadedAt: new Date('2024-05-25T08:11:45Z').toISOString(),
    },
    {
        id: 'vid-4',
        name: 'Product_Demo_Export.mp4',
        thumbnailUrl: 'https://placehold.co/600x400/111827/d1d5db?text=Product+Demo',
        duration: '00:05:03',
        uploadedAt: new Date('2024-05-24T18:00:00Z').toISOString(),
    }
];
