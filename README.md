# PiVision-App
Mobile client for the PiVision Security System — a Raspberry Pi-powered intruder detection platform.

PiVision-App is a cross-platform mobile application built using **Expo (React Native)**.  
It provides a real-time dashboard for viewing system status, alerts, snapshots, and managing system controls such as arming/disarming the security system.

---

## 🚀 Features

-  **Mobile App (iOS/Android)**
-  **Real-time connection to Raspberry Pi**
-  View latest detection snapshots (motion/person)
-  Alerts page with detailed event logs
-  Arm / Disarm the security system remotely
-  Adjustable sensitivity & system settings
-  Dark mode support (optional)
-  Built with Expo Router, TypeScript, and modern RN components

---

## Project Structure
PiVision-App/
app/
(tabs)/
index.tsx # Dashboard
alerts.tsx # Alerts list
settings.tsx # Settings page
_layout.tsx # Tab navigation
src/
api/ # API client (fetch -> PiVision-Pi)
components/ # UI components
hooks/
utils/
assets/
package.json

---

## 🧩 Tech Stack

- **React Native (Expo)**
- **TypeScript**
- **Expo Router**
- **Fetch API for backend communication**
- **AsyncStorage (for saving preferences)**
- **ESLint** for code quality

