// src/api/securityMonitorApi.ts
import { BASE_URL } from "./config";

// ──────────────────────────────────────────────
// Types that match what the Pi Flask API returns
// ──────────────────────────────────────────────

/** Raw JSON from GET /status */
interface PiStatusResponse {
    system_name: string;
    health: string;
    armed: boolean;
    status: string; // "armed" | "disarmed"
}

/** Raw JSON for a single event from GET /events */
interface PiEvent {
    event_id: string;
    timestamp: string;
    snapshot_path: string;
    video_path: string;
    face_detected: boolean;
    recognised_person: string | null;
}

/** Raw JSON from GET /events */
interface PiEventsResponse {
    count: number;
    events: PiEvent[];
}

// ──────────────────────────────────────────────
// App-facing types (used by screens)
// ──────────────────────────────────────────────

export interface SystemStatus {
    online: boolean;
    lastHeartbeat: string;
    armed: boolean;
}

export type AlertType = "motion" | "person" | "unknown";

export interface Alert {
    id: string;
    timestamp: string;
    type: AlertType;
    snapshotPath: string;  // Pi filesystem path (needs /media endpoint later)
    videoPath: string;     // Pi filesystem path (needs /media endpoint later)
    faceDetected: boolean;
    recognisedPerson: string | null;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Derive an alert type from the Pi's face-detection fields. */
function deriveAlertType(event: PiEvent): AlertType {
    if (event.face_detected && event.recognised_person) {
        return "person";
    }
    if (event.face_detected) {
        return "unknown";
    }
    return "motion";
}

/** Map a raw Pi event into the app's Alert shape. */
function mapEvent(event: PiEvent): Alert {
    return {
        id: event.event_id,
        timestamp: event.timestamp,
        type: deriveAlertType(event),
        snapshotPath: event.snapshot_path,
        videoPath: event.video_path,
        faceDetected: event.face_detected,
        recognisedPerson: event.recognised_person,
    };
}

// ──────────────────────────────────────────────
// API calls
// ──────────────────────────────────────────────

/** GET /status → SystemStatus */
export async function getStatus(): Promise<SystemStatus> {
    const res = await fetch(`${BASE_URL}/status`);

    if (!res.ok) {
        throw new Error(`GET /status failed (${res.status})`);
    }

    const data: PiStatusResponse = await res.json();

    return {
        online: data.health === "ok",
        lastHeartbeat: new Date().toISOString(), // Pi doesn't send a timestamp; use fetch time
        armed: data.armed,
    };
}

/** POST /arm */
export async function armSystem(): Promise<void> {
    const res = await fetch(`${BASE_URL}/arm`, { method: "POST" });

    if (!res.ok) {
        throw new Error(`POST /arm failed (${res.status})`);
    }
}

/** POST /disarm */
export async function disarmSystem(): Promise<void> {
    const res = await fetch(`${BASE_URL}/disarm`, { method: "POST" });

    if (!res.ok) {
        throw new Error(`POST /disarm failed (${res.status})`);
    }
}

/** GET /events → Alert[] (newest first) */
export async function getAlerts(): Promise<Alert[]> {
    const res = await fetch(`${BASE_URL}/events`);

    if (!res.ok) {
        throw new Error(`GET /events failed (${res.status})`);
    }

    const data: PiEventsResponse = await res.json();

    return data.events.map(mapEvent);
}

/** GET /events/latest → Alert | null */
export async function getLatestAlert(): Promise<Alert | null> {
    const res = await fetch(`${BASE_URL}/events/latest`);

    if (res.status === 404) {
        return null; // no events yet
    }

    if (!res.ok) {
        throw new Error(`GET /events/latest failed (${res.status})`);
    }

    const event: PiEvent = await res.json();
    return mapEvent(event);
}

/** GET / → quick connectivity check */
export async function ping(): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_URL}/`, { method: "GET" });
        return res.ok;
    } catch {
        return false;
    }
}
