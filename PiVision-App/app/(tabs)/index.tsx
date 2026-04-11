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
import Header from "../../src/components/Header";
import { useTheme } from "../../src/contexts/ThemeContext";
import {
    getStatus,
    armSystem,
    disarmSystem,
    getLatestAlert,
    SystemStatus,
    Alert,
} from "../../src/api/securityMonitorApi";

const NAVY = "#020617";
const NAVY_CARD = "#0f172a";

export default function DashboardScreen() {
    const { colors } = useTheme();
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    const loadStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const [data, latest] = await Promise.all([getStatus(), getLatestAlert()]);
            setStatus(data);
            setLatestAlert(latest);
        } catch (err) {
            console.error("Failed to load system status:", err);
            setError("Failed to load system status.");
            setStatus(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStatus(); }, []);

    const handleToggleArm = async () => {
        if (!status) return;
        try {
            setUpdating(true);
            setError(null);
            if (status.armed) {
                await disarmSystem();
                setStatus({ ...status, armed: false });
            } else {
                await armSystem();
                setStatus({ ...status, armed: true });
            }
        } catch (err) {
            console.error("Failed to update system state:", err);
            setError("Failed to update system state.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.muted}>Loading PiVision status…</Text>
            </View>
        );
    }

    if (error || !status) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error ?? "No status available."}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadStatus}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Header />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* System Status Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>System Status</Text>
                        <View style={[styles.pill, status.online ? styles.pillOnline : styles.pillOffline]}>
                            <View style={[styles.pillDot, { backgroundColor: status.online ? "#22c55e" : "#ef4444" }]} />
                            <Text style={styles.pillText}>{status.online ? "Online" : "Offline"}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Last heartbeat</Text>
                        <Text style={styles.infoValue}>
                            {new Date(status.lastHeartbeat).toLocaleTimeString("en-GB", {
                                hour: "2-digit", minute: "2-digit", second: "2-digit"
                            })}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Armed state</Text>
                        <Text style={[styles.infoValue, status.armed ? styles.armedOn : styles.armedOff]}>
                            {status.armed ? "ARMED" : "DISARMED"}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.armButton, status.armed && styles.disarmButton, updating && styles.buttonDisabled]}
                        onPress={handleToggleArm}
                        disabled={updating}
                    >
                        <Text style={styles.armButtonText}>
                            {updating ? "Updating…" : status.armed ? "Disarm System" : "Arm System"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Latest Snapshot Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Latest Snapshot</Text>
                        <TouchableOpacity onPress={loadStatus} disabled={loading} hitSlop={8}>
                            <Text style={styles.refreshIcon}>↻</Text>
                        </TouchableOpacity>
                    </View>

                    <Image
                        source={
                            latestAlert?.snapshotPath?.startsWith("https://")
                                ? { uri: latestAlert.snapshotPath }
                                : require("../../assets/images/snapshot-placeholder.jpg")
                        }
                        style={styles.snapshotImage}
                        resizeMode="cover"
                    />

                    <Text style={styles.snapshotTime}>
                        {latestAlert
                            ? new Date(latestAlert.timestamp).toLocaleString("en-GB", {
                                day: "2-digit", month: "2-digit", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                            })
                            : "No snapshots yet"}
                    </Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: NAVY },
    container: { padding: 16, paddingBottom: 32, gap: 16 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: NAVY, padding: 16 },
    card: {
        backgroundColor: NAVY_CARD,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#1e293b",
        padding: 18,
        gap: 12,
    },
    cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
    refreshIcon: { fontSize: 20, color: "#64748b", fontWeight: "600" },
    infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    infoLabel: { color: "#94a3b8", fontSize: 14 },
    infoValue: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
    armedOn: { color: "#ef4444" },
    armedOff: { color: "#22c55e" },
    divider: { height: 1, backgroundColor: "#1e293b" },
    pill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    pillOnline: { backgroundColor: "#14532d" },
    pillOffline: { backgroundColor: "#450a0a" },
    pillDot: { width: 7, height: 7, borderRadius: 999, marginRight: 5 },
    pillText: { color: "#ffffff", fontSize: 11, fontWeight: "700" },
    armButton: {
        marginTop: 4,
        paddingVertical: 13,
        borderRadius: 999,
        alignItems: "center",
        backgroundColor: "#1d4ed8",
    },
    disarmButton: { backgroundColor: "#7f1d1d" },
    buttonDisabled: { opacity: 0.6 },
    armButtonText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
    snapshotImage: { width: "100%", height: 200, borderRadius: 14, backgroundColor: "#1e293b" },
    snapshotTime: { color: "#64748b", fontSize: 12 },
    muted: { color: "#9ca3af", fontSize: 14 },
    error: { color: "#fca5a5", fontSize: 14, textAlign: "center" },
    retryButton: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999, backgroundColor: "#1d4ed8" },
    retryButtonText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
});
