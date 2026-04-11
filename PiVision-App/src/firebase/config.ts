import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyDA0OojFx_D_OxGLwhK3RgNXKLh7n1Hozk",
    authDomain: "pivision-3aa84.firebaseapp.com",
    projectId: "pivision-3aa84",
    storageBucket: "pivision-3aa84.firebasestorage.app",
    messagingSenderId: "60705892500",
    appId: "1:60705892500:web:183c48815ebeceb194ec81",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getApps().length === 1
    ? initializeAuth(app, { persistence: getReactNativePersistence(ReactNativeAsyncStorage) })
    : getAuth(app);
export const db = getFirestore(app);
export default app;
