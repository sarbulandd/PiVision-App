import { Tabs } from "expo-router";

const NAVY = "#020617";

export default function TabsLayout() {
    return (
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
            <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
            <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
            <Tabs.Screen name="settings" options={{ title: "Settings" }} />
        </Tabs>
    );
}