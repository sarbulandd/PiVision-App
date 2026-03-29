// src/api/config.ts
// -------------------------------------------------
// Change PI_IP to your Raspberry Pi's local IP address.
// The app and Pi must be on the same Wi-Fi network.
// -------------------------------------------------

const PI_IP = "192.168.1.100"; // ← replace with your Pi's IP

export const BASE_URL = `http://${PI_IP}:5000`;

// Handy quick-reference:
//   Phone on same Wi-Fi  →  PI_IP = "<pi-ip>"
//   Android emulator     →  PI_IP = "10.0.2.2"
//   iOS simulator        →  PI_IP = "localhost"
