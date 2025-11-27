// app/settings.tsx
import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Switch,
    Button,
} from "react-native";

export default function SettingsScreen() {
    const [notifications, setNotifications] = useState(true);
    const [autoArmAtNight, setAutoArmAtNight] = useState(false);
    const [sensitivity, setSensitivity] = useState(0.7);

    const changeSensitivity = (delta: number) => {
        setSensitivity((prev) => {
            const next = Math.min(1, Math.max(0.2, prev + delta));
            return parseFloat(next.toFixed(2));
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <View style={styles.item}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Notifications</Text>
                    <Text style={styles.muted}>
                        Receive alerts on your phone when PiVision detects activity.
                    </Text>
                </View>
                <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                />
            </View>

            <View style={styles.item}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Auto-arm at night</Text>
                    <Text style={styles.muted}>
                        Automatically arm PiVision during night-time hours.
                    </Text>
                </View>
                <Switch
                    value={autoArmAtNight}
                    onValueChange={setAutoArmAtNight}
                />
            </View>

            <View style={styles.itemColumn}>
                <Text style={styles.label}>Detection sensitivity</Text>
                <Text style={styles.muted}>
                    Current: {Math.round(sensitivity * 100)}%
                </Text>
                <View style={styles.buttonRow}>
                    <Button title="-"
                            onPress={() => changeSensitivity(-0.1)} />
                    <View style={{ width: 12 }} />
                    <Button title="+"
                            onPress={() => changeSensitivity(0.1)} />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.muted}>
                    Settings are currently stored locally on this device.
                    Backend persistence can be added later.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 16 },
    title: { fontSize: 24, fontWeight: "700" },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    itemColumn: {
        paddingVertical: 8,
        gap: 8,
    },
    label: { fontWeight: "600" },
    muted: { color: "#666", fontSize: 12, marginTop: 2 },
    footer: { marginTop: 24 },
    buttonRow: {
        flexDirection: "row",
        alignItems: "center",
    },
});
