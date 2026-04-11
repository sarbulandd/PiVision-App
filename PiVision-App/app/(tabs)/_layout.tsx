import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
                    borderTopColor: "#1e293b",
                    borderTopWidth: 1,
                },
                tabBarActiveTintColor: "#ffffff",
                tabBarInactiveTintColor: "#4b5563",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="alerts"
                options={{
                    title: "Alerts",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "notifications" : "notifications-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="live"
                options={{
                    title: "Live",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "videocam" : "videocam-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "settings" : "settings-outline"} size={22} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
