// src/api/securityMonitorApi.ts

export interface SystemStatus {
    online: boolean;
    lastHeartbeat: string;
    armed: boolean;
}

export interface Alert {
    id: string;
    timestamp: string;
    type: "motion" | "person" | "unknown";
    confidence: number;
}

// later: swap mocks for real fetch() calls to your Pi backend
export async function getStatus(): Promise<SystemStatus> {
    return {
        online: true,
        lastHeartbeat: new Date().toISOString(),
        armed: true,
    };
}

export async function armSystem(): Promise<void> {
    // await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/arm`, { method: "POST" });
    return;
}

export async function disarmSystem(): Promise<void> {
    // await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/disarm`, { method: "POST" });
    return;
}

export async function getAlerts(): Promise<Alert[]> {
    return [
        {
            id: "1",
            timestamp: new Date().toISOString(),
            type: "motion",
            confidence: 0.87,
        },
        {
            id: "2",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            type: "person",
            confidence: 0.93,
        },
        {
            id: "3",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            type: "unknown",
            confidence: 0.55,
        },
    ];
}
