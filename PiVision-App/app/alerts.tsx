// app/alerts.tsx
import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Image,
} from "react-native";
import { getAlerts, Alert } from "../src/api/securityMonitorApi";

const NAVY = "#020617";

export default function AlertsScreen() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const data = await getAlerts();
            setAlerts(data);
        } finally {
            setLoading(false);
        }
    };

    const refresh = async () => {
        setRefreshing(true);
        await loadAlerts();
        setRefreshing(false);
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="white" />
                <Text style={styles.muted}>Loading alerts…</Text>
            </View>
        );
    }

    // TEMP: nice human-readable messages for WIP demo
    const formatAlertMessage = (item: Alert) => {
        switch (item.type) {
            case "motion":
                return "Motion detected – view snapshot";
            case "person":
                return "Sarbuland at the door – front camera";
            case "unknown":
                return "Unknown person detected – view snapshot";
            default:
                return "Motion detected – view snapshot";
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Alerts</Text>

            <FlatList
                data={alerts}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                        tintColor="white"
                    />
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image
                            source={require("../assets/images/snapshot-placeholder.jpg")}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                        <View style={styles.cardTextBlock}>
                            <Text style={styles.message}>
                                {formatAlertMessage(item)}
                            </Text>
                            <Text style={styles.timestamp}>
                                {new Date(item.timestamp).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.muted}>No alerts recorded yet.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: NAVY,
        padding: 16,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: NAVY,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "white",
        marginBottom: 12,
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0f172a",
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#1e293b",
        gap: 12,
    },
    thumbnail: {
        width: 56,
        height: 56,
        borderRadius: 8,
        backgroundColor: "#1f2933",
    },
    cardTextBlock: {
        flex: 1,
    },
    message: {
        color: "white",
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 2,
    },
    timestamp: {
        color: "#9ca3af",
        fontSize: 12,
    },
    muted: {
        color: "#9ca3af",
        fontSize: 14,
        textAlign: "center",
    },
});
