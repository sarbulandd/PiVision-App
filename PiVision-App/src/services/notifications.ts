import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// How notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotifications(userId: string): Promise<string | null> {
    if (!Device.isDevice) {
        console.log("Push notifications only work on a physical device.");
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("Push notification permission denied.");
        return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    // Save token to Firestore so the Pi can read it
    await setDoc(doc(db, "pushTokens", userId), {
        token,
        updatedAt: new Date().toISOString(),
    });

    // Android needs a notification channel
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("pivision-alerts", {
            name: "PiVision Alerts",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#3b82f6",
        });
    }

    return token;
}
