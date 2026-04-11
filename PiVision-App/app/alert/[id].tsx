import { useEffect, useRef, useState } from "react";
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
import { Video, ResizeMode } from "expo-av";
import { getAlerts, Alert } from "../../src/api/securityMonitorApi";

const NAVY = "#020617";
const NAVY_CARD = "#0f172a";

function formatDate(dateString: string) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Unknown time";
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function alertTitle(item: Alert) {
    if (item.recognisedPerson) return `${item.recognisedPerson} detected`;
    if (item.faceDetected) return "Unknown person detected";
    if (item.type === "person") return "Person detected";
    return "Motion detected";
}

function typeLabel(type: string) {
    switch (type) {
        case "person": return "Person";
        case "motion": return "Motion";
        case "unknown": return "Unknown";
        default: return type;
    }
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, accent && styles.infoValueAccent]}>{value}</Text>
        </View>
    );
}

export default function AlertDetailScreen() {
    const params = useLocalSearchParams<{ id?: string | string[] }>();
    const rawId = params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const [alert, setAlert] = useState<Alert | null>(null);
    const [loading, setLoading] = useState(true);
    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef<Video>(null);

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

        if (!id) { setLoading(false); setAlert(null); return; }
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

                    {/* Snapshot / Video */}
                    <View style={styles.mediaContainer}>
                        {showVideo && alert.videoPath?.startsWith("https://") ? (
                            <Video
                                ref={videoRef}
                                source={{ uri: alert.videoPath }}
                                style={styles.media}
                                resizeMode={ResizeMode.COVER}
                                useNativeControls
                                shouldPlay
                            />
                        ) : (
                            <Image
                                source={
                                    alert.snapshotPath?.startsWith("https://")
                                        ? { uri: alert.snapshotPath }
                                        : placeholderImage
                                }
                                style={styles.media}
                                resizeMode="cover"
                            />
                        )}
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{alertTitle(alert)}</Text>
                    <Text style={styles.timestamp}>{formatDate(alert.timestamp)}</Text>

                    {/* Details card */}
                    <View style={styles.card}>
                        <Text style={styles.cardHeading}>Event Details</Text>

                        <InfoRow label="Alert ID" value={String(alert.id)} />
                        <View style={styles.divider} />
                        <InfoRow label="Event type" value={typeLabel(alert.type)} />
                        <View style={styles.divider} />
                        <InfoRow
                            label="Face detected"
                            value={alert.faceDetected ? "Yes" : "No"}
                            accent={alert.faceDetected}
                        />
                        {alert.recognisedPerson && (
                            <>
                                <View style={styles.divider} />
                                <InfoRow
                                    label="Recognised as"
                                    value={alert.recognisedPerson}
                                    accent
                                />
                            </>
                        )}
                    </View>

                    {/* Play clip button */}
                    {alert.videoPath?.startsWith("https://") && (
                        <Pressable
                            style={styles.playButton}
                            onPress={() => setShowVideo((v) => !v)}
                        >
                            <Text style={styles.playButtonText}>
                                {showVideo ? "Show Snapshot" : "▶  Play Clip"}
                            </Text>
                        </Pressable>
                    )}
                </ScrollView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: NAVY,
        flexGrow: 1,
        gap: 16,
    },
    center: {
        flex: 1,
        backgroundColor: NAVY,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        gap: 10,
    },
    muted: { color: "#9ca3af", fontSize: 14 },
    notFoundText: { color: "#ffffff", fontSize: 20, fontWeight: "700" },
    mediaContainer: {
        borderRadius: 20,
        overflow: "hidden",
    },
    media: {
        width: "100%",
        height: 260,
        backgroundColor: "#1e293b",
    },
    title: {
        color: "#ffffff",
        fontSize: 24,
        fontWeight: "800",
    },
    timestamp: {
        color: "#64748b",
        fontSize: 14,
        marginTop: -8,
    },
    card: {
        backgroundColor: NAVY_CARD,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#1e293b",
        padding: 16,
        gap: 4,
    },
    cardHeading: {
        color: "#94a3b8",
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    infoLabel: {
        color: "#94a3b8",
        fontSize: 14,
        fontWeight: "500",
    },
    infoValue: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
        maxWidth: "60%",
        textAlign: "right",
    },
    infoValueAccent: {
        color: "#22c55e",
    },
    divider: {
        height: 1,
        backgroundColor: "#1e293b",
    },
    playButton: {
        backgroundColor: "#1d4ed8",
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: "center",
    },
    playButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
});
