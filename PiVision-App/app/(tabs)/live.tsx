import { useState, useRef, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    ScrollView,
    Animated,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useFocusEffect } from "expo-router";
import { BASE_URL, HEADERS } from "../../src/api/config";

type StreamStatus = "idle" | "starting" | "live" | "stopping" | "error";

interface DetectedFace {
    name: string;
    confidence: number | null;
}

interface DetectionResult {
    detected: boolean;
    faces: DetectedFace[];
    timestamp: string;
}

export default function LiveScreen() {
    const [streamStatus, setStreamStatus] = useState<StreamStatus>("idle");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [videoError, setVideoError] = useState(false);
    const [streamStartTime, setStreamStartTime] = useState<Date | null>(null);
    const [elapsed, setElapsed] = useState("00:00");
    const [detection, setDetection] = useState<DetectionResult | null>(null);
    const [scanning, setScanning] = useState(false);

    const videoRef = useRef<Video>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const detectionRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const streamStatusRef = useRef<StreamStatus>("idle");
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Keep ref in sync so useFocusEffect cleanup always has latest value
    useEffect(() => { streamStatusRef.current = streamStatus; }, [streamStatus]);

    // Pulse animation for LIVE dot
    useEffect(() => {
        if (streamStatus === "live") {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [streamStatus]);

    const streamUrl = `${BASE_URL}/stream/live.m3u8`;

    // Elapsed timer
    useEffect(() => {
        if (streamStatus === "live" && streamStartTime) {
            timerRef.current = setInterval(() => {
                const secs = Math.floor((Date.now() - streamStartTime.getTime()) / 1000);
                const m = Math.floor(secs / 60).toString().padStart(2, "0");
                const s = (secs % 60).toString().padStart(2, "0");
                setElapsed(`${m}:${s}`);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setElapsed("00:00");
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [streamStatus, streamStartTime]);

    // Face detection polling — every 2 seconds while live
    useEffect(() => {
        if (streamStatus === "live") {
            const poll = async () => {
                setScanning(true);
                try {
                    const res = await fetch(`${BASE_URL}/stream/detection`, { headers: HEADERS });
                    if (res.ok) {
                        const data: DetectionResult = await res.json();
                        setDetection(data);
                    }
                } catch (_) {}
                setScanning(false);
            };

            poll(); // immediate first call
            detectionRef.current = setInterval(poll, 2000);
        } else {
            if (detectionRef.current) clearInterval(detectionRef.current);
            setDetection(null);
            setScanning(false);
        }
        return () => { if (detectionRef.current) clearInterval(detectionRef.current); };
    }, [streamStatus]);

    // Stop stream when leaving the tab — uses ref so deps array stays empty
    useFocusEffect(
        useCallback(() => {
            return () => {
                const status = streamStatusRef.current;
                if (status === "live" || status === "starting") {
                    setStreamStatus("idle");
                    setStreamStartTime(null);
                    setDetection(null);
                    videoRef.current?.stopAsync().catch(() => {});
                    fetch(`${BASE_URL}/stream/stop`, { method: "POST", headers: HEADERS }).catch(() => {});
                }
                // If stuck on stopping, just reset
                if (status === "stopping") {
                    setStreamStatus("idle");
                    setStreamStartTime(null);
                    setDetection(null);
                }
            };
        }, [])
    );

    const pollForStream = async (maxAttempts = 20): Promise<boolean> => {
        // Give FFmpeg 3 seconds to initialise before we start checking
        await new Promise((r) => setTimeout(r, 3000));
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const res = await fetch(`${BASE_URL}/stream/live.m3u8`, { headers: HEADERS });
                if (res.ok) return true;
            } catch (_) {}
            await new Promise((r) => setTimeout(r, 1000));
        }
        return false;
    };

    const startStream = async () => {
        setStreamStatus("starting");
        setErrorMsg(null);
        setVideoError(false);

        // Yield to let React flush the "starting" state before async work begins
        await new Promise((r) => setTimeout(r, 50));

        try {
            const res = await fetch(`${BASE_URL}/stream/start`, {
                method: "POST",
                headers: HEADERS,
            });
            if (!res.ok) throw new Error(`Failed to start stream (${res.status})`);

            const ready = await pollForStream();
            if (!ready) throw new Error("Stream timed out — FFmpeg may have failed to start.");

            setStreamStartTime(new Date());
            setStreamStatus("live");
        } catch (err: any) {
            setErrorMsg(err.message ?? "Could not start stream.");
            setStreamStatus("error");
        }
    };

    const stopStream = () => {
        // Reset UI instantly — don't wait for async
        setStreamStatus("idle");
        setStreamStartTime(null);
        setDetection(null);
        // Fire and forget
        videoRef.current?.stopAsync().catch(() => {});
        fetch(`${BASE_URL}/stream/stop`, { method: "POST", headers: HEADERS }).catch(() => {});
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

            {/* Title row */}
            <View style={styles.titleRow}>
                <Text style={styles.heading}>Live Camera</Text>
                {streamStatus === "live" && (
                    <View style={styles.liveBadge}>
                        <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                )}
            </View>

            {/* Video player */}
            <View style={styles.playerContainer}>
                {streamStatus === "live" && !videoError ? (
                    <Video
                        ref={videoRef}
                        source={{ uri: streamUrl }}
                        style={styles.video}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay
                        useNativeControls={false}
                        onError={() => setVideoError(true)}
                    />
                ) : streamStatus === "starting" ? (
                    <View style={styles.placeholder}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.placeholderText}>Starting stream…</Text>
                        <Text style={styles.placeholderSub}>Waiting for Pi camera to initialise</Text>
                    </View>
                ) : streamStatus === "stopping" ? (
                    <View style={styles.placeholder}>
                        <ActivityIndicator size="large" color="#9ca3af" />
                        <Text style={styles.placeholderText}>Stopping…</Text>
                    </View>
                ) : videoError ? (
                    <View style={styles.placeholder}>
                        <Text style={styles.errorIcon}>⚠</Text>
                        <Text style={styles.placeholderText}>Stream error</Text>
                        <Text style={styles.placeholderSub}>Check Pi is running and ngrok is active</Text>
                    </View>
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>Stream is offline</Text>
                        <Text style={styles.placeholderSub}>Press Start Stream to begin</Text>
                    </View>
                )}
            </View>

            {/* Face detection card — only shown when live */}
            {streamStatus === "live" && (
                <View style={styles.detectionCard}>
                    <View style={styles.detectionHeader}>
                        <Text style={styles.detectionTitle}>Face Recognition</Text>
                        {scanning && <ActivityIndicator size="small" color="#3b82f6" />}
                    </View>

                    {!detection || detection.faces.length === 0 ? (
                        <Text style={styles.detectionEmpty}>
                            {detection ? "No faces detected" : "Scanning…"}
                        </Text>
                    ) : (
                        detection.faces.map((face, i) => (
                            <View key={i} style={styles.faceRow}>
                                <View style={styles.faceAvatar}>
                                    <Text style={styles.faceAvatarText}>
                                        {face.name === "Unknown" ? "?" : face.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.faceInfo}>
                                    <Text style={styles.faceName}>
                                        {face.name === "Unknown" ? "Unknown person" : face.name}
                                    </Text>
                                    {face.confidence !== null && (
                                        <Text style={styles.faceConfidence}>
                                            {Math.round(face.confidence * 100)}% confidence
                                        </Text>
                                    )}
                                </View>
                                <View style={[
                                    styles.facePill,
                                    face.name === "Unknown" ? styles.facePillUnknown : styles.facePillKnown,
                                ]}>
                                    <Text style={styles.facePillText}>
                                        {face.name === "Unknown" ? "Unknown" : "Recognised"}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            )}

            {/* Error message */}
            {streamStatus === "error" && errorMsg && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{errorMsg}</Text>
                </View>
            )}

            {/* Time details card */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Started at</Text>
                    <Text style={styles.infoValue}>
                        {streamStartTime
                            ? streamStartTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                            : "—"}
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Duration</Text>
                    <Text style={[styles.infoValue, streamStatus === "live" && styles.infoValueAccent]}>
                        {streamStatus === "live" ? elapsed : "—"}
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={[styles.infoValue, streamStatus === "live" ? styles.infoValueAccent : styles.infoValueMuted]}>
                        {streamStatus === "live" ? "Streaming" : streamStatus === "starting" ? "Starting…" : "Offline"}
                    </Text>
                </View>
            </View>

            {/* Controls */}
            {streamStatus === "idle" || streamStatus === "error" ? (
                <Pressable style={styles.startButton} onPress={startStream}>
                    <Text style={styles.startButtonText}>Start Stream</Text>
                </Pressable>
            ) : streamStatus === "live" ? (
                <Pressable style={styles.stopButton} onPress={stopStream}>
                    <Text style={styles.stopButtonText}>Stop Stream</Text>
                </Pressable>
            ) : null}

        </ScrollView>
    );
}

const NAVY = "#020617";
const NAVY_CARD = "#0f172a";

const styles = StyleSheet.create({
    container: {
        backgroundColor: NAVY,
        padding: 20,
        flexGrow: 1,
        gap: 16,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    heading: {
        color: "#ffffff",
        fontSize: 26,
        fontWeight: "800",
    },
    liveBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#dc2626",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        gap: 5,
    },
    liveDot: {
        width: 7,
        height: 7,
        borderRadius: 999,
        backgroundColor: "#fff",
    },
    liveText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1,
    },
    playerContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: "#0b1120",
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#1e293b",
    },
    video: {
        width: "100%",
        height: "100%",
    },
    placeholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    errorIcon: { fontSize: 36, color: "#ef4444" },
    placeholderText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    placeholderSub: {
        color: "#64748b",
        fontSize: 13,
    },
    // Face detection
    detectionCard: {
        backgroundColor: NAVY_CARD,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#1e293b",
        padding: 16,
        gap: 12,
    },
    detectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    detectionTitle: {
        color: "#94a3b8",
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    detectionEmpty: {
        color: "#64748b",
        fontSize: 14,
        textAlign: "center",
        paddingVertical: 8,
    },
    faceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    faceAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1d4ed8",
        alignItems: "center",
        justifyContent: "center",
    },
    faceAvatarText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    faceInfo: {
        flex: 1,
    },
    faceName: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
    faceConfidence: {
        color: "#64748b",
        fontSize: 12,
        marginTop: 2,
    },
    facePill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    facePillKnown: {
        backgroundColor: "#14532d",
    },
    facePillUnknown: {
        backgroundColor: "#450a0a",
    },
    facePillText: {
        color: "#ffffff",
        fontSize: 11,
        fontWeight: "700",
    },
    // Error
    errorBanner: {
        backgroundColor: "#450a0a",
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#dc2626",
    },
    errorBannerText: {
        color: "#fca5a5",
        fontSize: 14,
    },
    // Time info
    infoCard: {
        backgroundColor: NAVY_CARD,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#1e293b",
        padding: 16,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    infoLabel: { color: "#94a3b8", fontSize: 14 },
    infoValue: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
    infoValueAccent: { color: "#22c55e" },
    infoValueMuted: { color: "#64748b" },
    divider: { height: 1, backgroundColor: "#1e293b" },
    startButton: {
        backgroundColor: "#1d4ed8",
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: "center",
    },
    startButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
    stopButton: {
        backgroundColor: "#450a0a",
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#dc2626",
    },
    stopButtonText: {
        color: "#fca5a5",
        fontSize: 16,
        fontWeight: "700",
    },
});
