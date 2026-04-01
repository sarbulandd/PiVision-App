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
    Alert as RNAlert,
} from "react-native";
import { router } from "expo-router";
import { getAlerts, deleteAlert, clearAllAlerts, Alert } from "../../src/api/securityMonitorApi";

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
                return `${item.recognisedPerson ?? "Known person"} detected`;
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

    const handleDelete = (item: Alert) => {
        RNAlert.alert("Delete Alert", "Remove this alert permanently?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteAlert(item.id);
                        setAlerts((prev) => prev.filter((a) => a.id !== item.id));
                    } catch (err) {
                        console.error("Failed to delete alert:", err);
                    }
                },
            },
        ]);
    };

    const handleClearAll = () => {
        RNAlert.alert("Clear All Alerts", "This will permanently delete all alerts. Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Clear All",
                style: "destructive",
                onPress: async () => {
                    try {
                        await clearAllAlerts();
                        setAlerts([]);
                    } catch (err) {
                        console.error("Failed to clear alerts:", err);
                    }
                },
            },
        ]);
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
            <View style={styles.headerRow}>
                <Text style={styles.title}>Alerts</Text>
                {alerts.length > 0 && (
                    <Pressable onPress={handleClearAll} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>Clear All</Text>
                    </Pressable>
                )}
            </View>

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
                            source={
                                item.snapshotPath?.startsWith("https://")
                                    ? { uri: item.snapshotPath }
                                    : require("../../assets/images/snapshot-placeholder.jpg")
                            }
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />

                        <View style={styles.cardTextBlock}>
                            <Text style={styles.message}>{formatAlertMessage(item)}</Text>
                            <Text style={styles.timestamp}>
                                {formatTimestamp(item.timestamp)}
                            </Text>
                        </View>

                        <Pressable
                            onPress={() => handleDelete(item)}
                            style={styles.deleteButton}
                            hitSlop={8}
                        >
                            <Text style={styles.deleteButtonText}>✕</Text>
                        </Pressable>
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
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "white",
    },
    clearButton: {
        backgroundColor: "#7f1d1d",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
    },
    clearButtonText: {
        color: "white",
        fontSize: 13,
        fontWeight: "600",
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
    deleteButton: {
        padding: 6,
        marginLeft: 4,
    },
    deleteButtonText: {
        color: "#ef4444",
        fontSize: 16,
        fontWeight: "700",
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