import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Pressable,
    Image,
} from "react-native";
import { router } from "expo-router";
import { getAlerts, Alert } from "../../src/api/securityMonitorApi";

const NAVY = "#020617";

export default function AlertsScreen() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadAlerts = async () => {
        try {
            const data = await getAlerts();
            setAlerts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load alerts:", error);
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    const refresh = async () => {
        setRefreshing(true);
        try {
            const data = await getAlerts();
            setAlerts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to refresh alerts:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAlerts();
    }, []);

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

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);

        if (Number.isNaN(date.getTime())) {
            return "Unknown time";
        }

        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const openAlert = (item: Alert) => {
        if (!item?.id) {
            return;
        }

        router.push({
            pathname: "/alert/[id]",
            params: { id: String(item.id) },
        });
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="white" />
                <Text style={styles.muted}>Loading alerts…</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Alerts</Text>

            <FlatList
                data={alerts}
                keyExtractor={(item, index) => String(item?.id ?? index)}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                        tintColor="white"
                    />
                }
                renderItem={({ item }) => (
                    <Pressable style={styles.card} onPress={() => openAlert(item)}>
                        <Image
                            source={require("../../assets/images/snapshot-placeholder.jpg")}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />

                        <View style={styles.cardTextBlock}>
                            <Text style={styles.message}>{formatAlertMessage(item)}</Text>
                            <Text style={styles.timestamp}>
                                {formatTimestamp(item.timestamp)}
                            </Text>
                        </View>

                        <Text style={styles.chevron}>›</Text>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <Text style={styles.muted}>No alerts recorded yet.</Text>
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    alerts.length === 0 ? styles.emptyListContent : undefined
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
        borderRadius: 16,
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
        marginBottom: 4,
    },
    timestamp: {
        color: "#9ca3af",
        fontSize: 12,
    },
    chevron: {
        color: "#94a3b8",
        fontSize: 24,
        fontWeight: "600",
        marginLeft: 8,
    },
    muted: {
        color: "#9ca3af",
        fontSize: 14,
        textAlign: "center",
        marginTop: 24,
    },
    emptyListContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
});