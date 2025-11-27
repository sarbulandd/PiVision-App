import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

const NAVY = "#020617";

export default function RootLayout() {
    return (
        <>
            <StatusBar style="light" backgroundColor={NAVY} />

            <Tabs
                screenOptions={{
                    headerStyle: { backgroundColor: NAVY },
                    headerTintColor: "white",
                    headerTitleStyle: { color: "white" },
                    headerTitleAlign: "center",

                    tabBarStyle: {
                        backgroundColor: NAVY,
                        borderTopColor: NAVY,
                    },
                    tabBarActiveTintColor: "white",
                    tabBarInactiveTintColor: "#9ca3af",
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
