// app/alerts.tsx
import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { getAlerts, Alert } from "../src/api/securityMonitorApi";

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
                <ActivityIndicator />
                <Text style={styles.muted}>Loading alerts…</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Alerts</Text>
            <FlatList
                data={alerts}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={refresh} />
                }
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.type}>
                                {item.type.toUpperCase()} ({Math.round(item.confidence * 100)}%)
                            </Text>
                            <Text style={styles.time}>
                                {new Date(item.timestamp).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    <Text style={styles.muted}>No alerts recorded yet.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
    row: {
        flexDirection: "row",
        paddingVertical: 8,
    },
    type: { fontWeight: "600" },
    time: { fontSize: 12, color: "#666", marginTop: 2 },
    separator: { height: 1, backgroundColor: "#eee" },
    muted: { color: "#666", fontSize: 13 },
});
