import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const NAVY = "#020617";

export default function RootLayout() {
    return (
        <>
            <StatusBar style="light" backgroundColor={NAVY} />
            <Stack screenOptions={{ headerShown: false }}>
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
            </Stack>
        </>
    );
}