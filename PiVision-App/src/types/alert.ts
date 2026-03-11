export type AlertType = 'motion' | 'known_person' | 'unknown_person';

export type AlertItem = {
    id: string;
    title: string;
    type: AlertType;
    thumbnailUrl: string;
    videoUrl: string;
    deviceName: string;
    createdAt: string;
    viewed: boolean;
};