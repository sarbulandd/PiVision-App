// app/settings.tsx
import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Switch,
    ScrollView,
} from "react-native";

const NAVY = "#020617";

export default function SettingsScreen() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [storeSnapshots, setStoreSnapshots] = useState(false);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Settings</Text>

                {/* System section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System</Text>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.label}>PiVision-Pi status</Text>
                            <Text style={styles.muted}>Connected to security monitor</Text>
                        </View>
                        <View style={styles.statusPill}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusPillText}>Online</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.label}>Device name</Text>
                            <Text style={styles.muted}>pivision-pi.local</Text>
                        </View>
                    </View>
                </View>

                {/* Alerts section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Alerts</Text>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.label}>Push notifications</Text>
                            <Text style={styles.muted}>
                                Allow PiVision to send alerts to this phone.
                            </Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            thumbColor={notificationsEnabled ? "#22c55e" : "#111827"}
                            trackColor={{ false: "#4b5563", true: "#16a34a" }}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.label}>Store snapshots locally</Text>
                            <Text style={styles.muted}>
                                Keep a copy of alert images on this device.
                            </Text>
                        </View>
                        <Switch
                            value={storeSnapshots}
                            onValueChange={setStoreSnapshots}
                            thumbColor={storeSnapshots ? "#22c55e" : "#111827"}
                            trackColor={{ false: "#4b5563", true: "#16a34a" }}
                        />
                    </View>
                </View>

                {/* Appearance section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Appearance</Text>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.label}>Theme</Text>
                            <Text style={styles.muted}>
                                Dark (PiVision default)
                            </Text>
                        </View>
                    </View>
                </View>

                {/* About section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.label}>App version</Text>
                            <Text style={styles.muted}>0.1.0 · WIP prototype</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.label}>Project</Text>
                            <Text style={styles.muted}>
                                PiVision – Raspberry Pi security monitoring system.
                            </Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.footerText}>
                    Settings are currently stored locally for demo purposes.
                    Cloud sync and backend persistence can be added in a later phase.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: NAVY,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "white",
        marginBottom: 16,
    },
    section: {
        backgroundColor: "#0f172a",
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#1e293b",
    },
    sectionTitle: {
        color: "#9ca3af",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 8,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        gap: 12,
    },
    rowText: {
        flex: 1,
    },
    label: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
    muted: {
        color: "#9ca3af",
        fontSize: 12,
        marginTop: 2,
    },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "#14532d",
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: "#22c55e",
        marginRight: 6,
    },
    statusPillText: {
        color: "white",
        fontSize: 11,
        fontWeight: "600",
    },
    footerText: {
        color: "#6b7280",
        fontSize: 12,
        marginTop: 8,
        lineHeight: 16,
    },
});
