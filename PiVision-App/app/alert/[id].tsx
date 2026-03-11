import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { getAlerts, Alert } from "../../src/api/securityMonitorApi";

const NAVY = "#020617";

function formatDate(dateString: string) {
    const date = new Date(dateString);

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
}

function formatAlertMessage(item: Alert) {
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
}

export default function AlertDetailScreen() {
    const params = useLocalSearchParams<{ id?: string | string[] }>();
    const rawId = params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const [alert, setAlert] = useState<Alert | null>(null);
    const [loading, setLoading] = useState(true);

    const placeholderImage = require("../../assets/images/snapshot-placeholder.jpg");

    useEffect(() => {
        const loadAlert = async () => {
            try {
                const alerts = await getAlerts();
                const found = Array.isArray(alerts)
                    ? alerts.find((item) => String(item.id) === String(id))
                    : null;

                setAlert(found ?? null);
            } catch (error) {
                console.error("Failed to load alert detail:", error);
                setAlert(null);
            } finally {
                setLoading(false);
            }
        };

        if (!id) {
            setLoading(false);
            setAlert(null);
            return;
        }

        loadAlert();
    }, [id]);

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Alert Details",
                    headerStyle: { backgroundColor: NAVY },
                    headerTintColor: "#ffffff",
                    headerTitleStyle: { fontWeight: "700" },
                    headerTitleAlign: "center",
                }}
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color="white" />
                    <Text style={styles.muted}>Loading alert…</Text>
                </View>
            ) : !alert ? (
                <View style={styles.center}>
                    <Text style={styles.notFoundText}>Alert not found.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.pageTitle}>Alert Details</Text>

                    <View style={styles.card}>
                        <Image
                            source={placeholderImage}
                            style={styles.image}
                            resizeMode="cover"
                        />

                        <Text style={styles.title}>{formatAlertMessage(alert)}</Text>
                        <Text style={styles.meta}>Alert ID: {String(alert.id)}</Text>
                        <Text style={styles.meta}>Time: {formatDate(alert.timestamp)}</Text>
                        <Text style={styles.meta}>Type: {alert.type}</Text>

                        <Pressable style={styles.playButton}>
                            <Text style={styles.playButtonText}>Play Clip</Text>
                        </Pressable>

                        <Text style={styles.note}>
                            Later, this button can open the video clip stored in Azure.
                        </Text>
                    </View>
                </ScrollView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: NAVY,
        flexGrow: 1,
    },
    center: {
        flex: 1,
        backgroundColor: NAVY,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        gap: 10,
    },
    muted: {
        color: "#9ca3af",
        fontSize: 14,
    },
    pageTitle: {
        color: "#ffffff",
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#f5f5f5",
        borderRadius: 24,
        padding: 18,
    },
    image: {
        width: "100%",
        height: 240,
        borderRadius: 18,
        backgroundColor: "#d9d9d9",
        marginBottom: 18,
    },
    title: {
        color: "#111827",
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 12,
    },
    meta: {
        color: "#374151",
        fontSize: 16,
        marginBottom: 8,
    },
    playButton: {
        marginTop: 18,
        backgroundColor: NAVY,
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: "center",
    },
    playButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
    },
    note: {
        marginTop: 14,
        color: "#6b7280",
        fontSize: 14,
        lineHeight: 20,
    },
    notFoundText: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
    },
});