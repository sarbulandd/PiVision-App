// app/index.tsx
import { useEffect, useState } from "react";
import {
    View,
    Text,
    Button,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
} from "react-native";
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
                <ActivityIndicator />
                <Text style={styles.muted}>Loading PiVision status…</Text>
            </View>
        );
    }

    if (error || !status) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error ?? "No status available."}</Text>
                <Button title="Retry" onPress={loadStatus} />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>PiVision Dashboard</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>System Status</Text>
                <Text>
                    Online:{" "}
                    <Text style={{ color: status.online ? "green" : "red" }}>
                        {status.online ? "Yes" : "No"}
                    </Text>
                </Text>
                <Text style={styles.muted}>
                    Last heartbeat: {new Date(status.lastHeartbeat).toLocaleString()}
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Armed State</Text>
                <Text style={{ marginBottom: 8 }}>
                    System is currently{" "}
                    <Text
                        style={{
                            color: status.armed ? "red" : "grey",
                            fontWeight: "600",
                        }}
                    >
                        {status.armed ? "ARMED" : "DISARMED"}
                    </Text>
                </Text>
                <Button
                    title={status.armed ? "Disarm system" : "Arm system"}
                    onPress={handleToggleArm}
                    disabled={updating}
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Quick Info</Text>
                <Text style={styles.muted}>• Raspberry Pi intruder detection</Text>
                <Text style={styles.muted}>• Camera + motion / ML pipeline</Text>
                <Text style={styles.muted}>• This app = PiVision controller</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12,
    },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
    card: {
        backgroundColor: "white",
        padding: 14,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
    muted: { color: "#666", fontSize: 12, marginTop: 2 },
    error: { color: "red", marginBottom: 8, textAlign: "center" },
});
