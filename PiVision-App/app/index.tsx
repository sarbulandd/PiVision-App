import { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from "react-native";

import Header from "../src/components/Header";

import {
    getStatus,
    armSystem,
    disarmSystem,
    SystemStatus,
} from "../src/api/securityMonitorApi";

export default function DashboardScreen() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    const loadStatus = async () => {
        try {
            setLoading(true);
            const data = await getStatus();
            setStatus(data);
            setError(null);
        } catch (err) {
            setError("Failed to load system status.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatus();
    }, []);

    const handleToggleArm = async () => {
        if (!status) return;
        try {
            setUpdating(true);

            if (status.armed) {
                await disarmSystem();
                setStatus({ ...status, armed: false });
            } else {
                await armSystem();
                setStatus({ ...status, armed: true });
            }
        } catch (err) {
            setError("Failed to update system state.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text style={styles.muted}>Loading PiVision status…</Text>
            </View>
        );
    }

    if (error || !status) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error ?? "No status available."}</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={loadStatus}>
                    <Text style={styles.primaryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <Header />

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>Dashboard</Text>
                        <Text style={styles.subtitle}>PiVision system overview</Text>
                    </View>
                </View>

                {/* System status + armed control combined in one card */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>System Status</Text>
                        <View
                            style={[
                                styles.statusPill,
                                status.online ? styles.statusOnline : styles.statusOffline,
                            ]}
                        >
                            <View style={styles.statusDot} />
                            <Text style={styles.statusPillText}>
                                {status.online ? "Online" : "Offline"}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.cardBodyText}>
                        Last heartbeat:
                    </Text>
                    <Text style={styles.cardBodyStrong}>
                        {new Date(status.lastHeartbeat).toLocaleString()}
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.cardBodyText}>
                        Armed state:{" "}
                        <Text
                            style={[
                                styles.armedText,
                                status.armed ? styles.armedOn : styles.armedOff,
                            ]}
                        >
                            {status.armed ? "ARMED" : "DISARMED"}
                        </Text>
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            status.armed && styles.dangerButton,
                            updating && styles.buttonDisabled,
                        ]}
                        onPress={handleToggleArm}
                        disabled={updating}
                    >
                        <Text style={styles.primaryButtonText}>
                            {updating
                                ? "Updating…"
                                : status.armed
                                    ? "Disarm system"
                                    : "Arm system"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Latest snapshot */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Latest Snapshot</Text>

                    <Image
                        source={require("../assets/images/snapshot-placeholder.jpg")}
                        style={styles.snapshotImage}
                        resizeMode="cover"
                    />

                    <Text style={styles.muted}>
                        Placeholder image — this will show the latest detection from
                        PiVision-Pi.
                    </Text>
                </View>
            </ScrollView>
        </>
    );
}

const NAVY_BACKGROUND = "#020617"; // very dark navy (matches header vibe)
const NAVY_DARK = "#0b1120";        // card shadow/navy
const WHITE = "#ffffff";

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
        backgroundColor: NAVY_BACKGROUND,
        minHeight: "100%",
        paddingBottom: 32,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backgroundColor: NAVY_BACKGROUND,
        padding: 16,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: WHITE,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: "#9ca3af",
    },
    card: {
        backgroundColor: WHITE,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#1f2937",
        shadowColor: NAVY_DARK,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        gap: 10,
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: NAVY_DARK,
    },
    cardBodyText: {
        fontSize: 13,
        color: "#4b5563",
    },
    cardBodyStrong: {
        fontSize: 13,
        color: "#111827",
        fontWeight: "600",
        marginBottom: 4,
    },
    muted: {
        color: "#6b7280",
        fontSize: 12,
        marginTop: 4,
    },
    error: {
        color: "#fca5a5",
        fontSize: 14,
        textAlign: "center",
    },
    snapshotImage: {
        width: "100%",
        height: 180,
        borderRadius: 12,
        marginTop: 8,
        backgroundColor: "#e5e7eb",
    },

    // Status pill (online/offline)
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    statusOnline: {
        backgroundColor: "#dcfce7",
    },
    statusOffline: {
        backgroundColor: "#fee2e2",
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        marginRight: 6,
        backgroundColor: "#22c55e",
    },
    statusPillText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#14532d",
    },

    // Armed text
    armedText: {
        fontWeight: "700",
    },
    armedOn: {
        color: "#b91c1c",
    },
    armedOff: {
        color: "#1d4ed8",
    },

    // Button styles
    primaryButton: {
        marginTop: 10,
        paddingVertical: 10,
        borderRadius: 999,
        alignItems: "center",
        backgroundColor: NAVY_DARK,
    },
    dangerButton: {
        backgroundColor: "#b91c1c",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    primaryButtonText: {
        color: WHITE,
        fontWeight: "600",
        fontSize: 14,
    },

    divider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 8,
    },
});
