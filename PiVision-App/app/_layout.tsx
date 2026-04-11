import { useEffect, useRef } from "react";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import * as Notifications from "expo-notifications";
import { ThemeProvider, useTheme } from "../src/contexts/ThemeContext";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { registerForPushNotifications } from "../src/services/notifications";

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const segments = useSegments();
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === "login";

        if (!user && !inAuthGroup) {
            router.replace("/login");
        } else if (user && inAuthGroup) {
            router.replace("/(tabs)");
        }

        // Register push token once user is logged in
        if (user) {
            registerForPushNotifications(user.uid).catch(console.error);

            // Handle notification received while app is open
            notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

            // Handle tap on notification
            responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
                const alertId = response.notification.request.content.data?.alertId;
                if (alertId) {
                    router.push(`/alert/${alertId}`);
                }
            });
        }

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [user, loading, segments]);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#020617" }}>
                <ActivityIndicator size="large" color="#22c55e" />
            </View>
        );
    }

    return <>{children}</>;
}

function AppStack() {
    const { colors } = useTheme();
    const NAVY = colors.background;
    return (
        <>
            <StatusBar style={colors.isDark ? "light" : "dark"} backgroundColor={NAVY} />
            <Stack screenOptions={{ headerShown: false, headerBackTitle: "Back" }}>
                <Stack.Screen name="login" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                    name="alert/[id]"
                    options={{
                        headerShown: true,
                        title: "Alert Details",
                        headerStyle: { backgroundColor: NAVY },
                        headerTintColor: "white",
                        headerTitleAlign: "center",
                    }}
                />
                <Stack.Screen
                    name="faces"
                    options={{
                        headerShown: true,
                        title: "Known Faces",
                        headerBackTitle: "Back",
                        headerStyle: { backgroundColor: NAVY },
                        headerTintColor: "white",
                        headerTitleAlign: "center",
                    }}
                />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AuthGuard>
                    <AppStack />
                </AuthGuard>
            </AuthProvider>
        </ThemeProvider>
    );
}
