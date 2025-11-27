import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
    return (
        <>
            <StatusBar style="dark" />
            <Tabs
                screenOptions={{
                    headerTitleAlign: "center",
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{ title: "Dashboard" }}
                />
                <Tabs.Screen
                    name="alerts"
                    options={{ title: "Alerts" }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{ title: "Settings" }}
                />
            </Tabs>
        </>
    );
}
