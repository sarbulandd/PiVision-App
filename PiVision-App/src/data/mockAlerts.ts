import { AlertItem } from '../types/alert';

export const mockAlerts: AlertItem[] = [
    {
        id: '1',
        title: 'Motion detected – view snapshot',
        type: 'motion',
        thumbnailUrl: '',
        videoUrl: '',
        deviceName: 'Front Camera',
        createdAt: '2026-03-08T16:27:30Z',
        viewed: false,
    },
    {
        id: '2',
        title: 'Sarbuland at the door – front camera',
        type: 'known_person',
        thumbnailUrl: '',
        videoUrl: '',
        deviceName: 'Front Camera',
        createdAt: '2026-03-08T16:22:30Z',
        viewed: true,
    },
    {
        id: '3',
        title: 'Unknown person detected – view snapshot',
        type: 'unknown_person',
        thumbnailUrl: '',
        videoUrl: '',
        deviceName: 'Front Camera',
        createdAt: '2026-03-08T15:57:30Z',
        viewed: false,
    },
];