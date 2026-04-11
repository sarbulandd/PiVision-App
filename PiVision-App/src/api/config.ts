// src/api/config.ts
// -------------------------------------------------
// Update BASE_URL whenever your ngrok URL changes.
// -------------------------------------------------

export const BASE_URL = "https://6cbd-82-16-250-247.ngrok-free.app";

// Required to bypass ngrok's browser warning interstitial on API calls
export const HEADERS: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
};
