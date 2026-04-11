import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Pressable,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getFaces, enrollFace, deleteFace, KnownFace } from "../src/api/securityMonitorApi";
import { BASE_URL, HEADERS } from "../src/api/config";

const NAVY = "#020617";
const NAVY_CARD = "#0f172a";

export default function FacesScreen() {
    const [faces, setFaces] = useState<KnownFace[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [piCameraStatus, setPiCameraStatus] = useState<string | null>(null);

    const loadFaces = async () => {
        try {
            const data = await getFaces();
            setFaces(data);
        } catch (err: any) {
            // 404 means endpoint not ready yet — show empty list
            if (!err.message?.includes("404")) {
                console.error("Failed to load faces:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFaces();
    }, []);

    const resetEnrol = () => {
        setEnrolling(false);
        setName("");
        setPiCameraStatus(null);
    };

    // Enrol using phone camera roll
    const handleEnrolFromLibrary = async () => {
        if (!name.trim()) {
            Alert.alert("Name required", "Enter a name first.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled) return;
        await submitEnrol(name.trim(), result.assets[0].uri);
    };

    // Enrol using phone camera
    const handleEnrolFromCamera = async () => {
        if (!name.trim()) {
            Alert.alert("Name required", "Enter a name first.");
            return;
        }

        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission denied", "Camera access is required.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled) return;
        await submitEnrol(name.trim(), result.assets[0].uri);
    };

    // Enrol using Pi camera
    const handleEnrolFromPiCamera = async () => {
        if (!name.trim()) {
            Alert.alert("Name required", "Enter a name first.");
            return;
        }

        try {
            setSaving(true);
            setPiCameraStatus("Triggering Pi camera…");

            const res = await fetch(`${BASE_URL}/faces/capture`, {
                method: "POST",
                headers: { ...HEADERS, "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
            });

            if (res.status === 422) throw new Error("No face detected. Make sure you're in front of the Pi camera.");
            if (!res.ok) throw new Error(`Pi camera capture failed (${res.status})`);

            const raw = await res.json();
            const newFace: KnownFace = { id: raw.id, name: raw.name, imageUrl: raw.image_url ?? raw.imageUrl };
            setFaces((prev) => [...prev, newFace]);
            resetEnrol();
            Alert.alert("Success", `${newFace.name} enrolled via Pi camera.`);
        } catch (err: any) {
            Alert.alert("Enrolment failed", err.message ?? "Something went wrong.");
        } finally {
            setSaving(false);
            setPiCameraStatus(null);
        }
    };

    const submitEnrol = async (personName: string, imageUri: string) => {
        try {
            setSaving(true);
            const newFace = await enrollFace(personName, imageUri);
            setFaces((prev) => [...prev, newFace]);
            resetEnrol();
            Alert.alert("Success", `${newFace.name} has been enrolled.`);
        } catch (err: any) {
            Alert.alert("Enrolment failed", err.message ?? "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (face: KnownFace) => {
        Alert.alert("Remove Face", `Remove ${face.name} from recognised faces?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteFace(face.id);
                        setFaces((prev) => prev.filter((f) => f.id !== face.id));
                    } catch (err) {
                        console.error("Failed to delete face:", err);
                    }
                },
            },
        ]);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Known Faces",
                    headerStyle: { backgroundColor: NAVY },
                    headerTintColor: "#ffffff",
                    headerTitleStyle: { fontWeight: "700" },
                    headerTitleAlign: "center",
                }}
            />

            <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={90}
            >
            <View style={styles.container}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color="white" />
                        <Text style={styles.muted}>Loading faces…</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={faces}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.card}>
                                    <View style={styles.avatar}>
                                        {item.imageUrl ? (
                                            <Image
                                                source={{ uri: item.imageUrl }}
                                                style={styles.avatarImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <Text style={styles.avatarText}>
                                                {item.name.charAt(0).toUpperCase()}
                                            </Text>
                                        )}
                                    </View>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Pressable
                                        onPress={() => handleDelete(item)}
                                        style={styles.deleteButton}
                                        hitSlop={8}
                                    >
                                        <Text style={styles.deleteText}>✕</Text>
                                    </Pressable>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.muted}>No faces enrolled yet.</Text>
                            }
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                        />

                        {enrolling ? (
                            <View style={styles.enrollBox}>
                                <Text style={styles.enrollTitle}>Enrol New Face</Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter name"
                                    placeholderTextColor="#6b7280"
                                    value={name}
                                    onChangeText={setName}
                                    autoFocus
                                    editable={!saving}
                                />

                                {piCameraStatus && (
                                    <Text style={styles.statusText}>{piCameraStatus}</Text>
                                )}

                                <Pressable
                                    style={[styles.optionButton, saving && styles.buttonDisabled]}
                                    onPress={handleEnrolFromPiCamera}
                                    disabled={saving}
                                >
                                    <Text style={styles.optionButtonText}>
                                        {saving ? "Please wait…" : "Use Pi Camera"}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={[styles.optionButton, saving && styles.buttonDisabled]}
                                    onPress={handleEnrolFromCamera}
                                    disabled={saving}
                                >
                                    <Text style={styles.optionButtonText}>Use Phone Camera</Text>
                                </Pressable>

                                <Pressable
                                    style={[styles.optionButton, saving && styles.buttonDisabled]}
                                    onPress={handleEnrolFromLibrary}
                                    disabled={saving}
                                >
                                    <Text style={styles.optionButtonText}>Pick from Photo Library</Text>
                                </Pressable>

                                <Pressable
                                    style={styles.cancelButton}
                                    onPress={resetEnrol}
                                    disabled={saving}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <Pressable
                                style={styles.primaryButton}
                                onPress={() => setEnrolling(true)}
                            >
                                <Text style={styles.primaryButtonText}>+ Enrol New Face</Text>
                            </Pressable>
                        )}
                    </>
                )}
            </View>
            </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: NAVY,
    },
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
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "white",
        marginBottom: 16,
    },
    list: {
        paddingBottom: 16,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: NAVY_CARD,
        padding: 14,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#1e293b",
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#1d4ed8",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    avatarText: {
        color: "white",
        fontWeight: "700",
        fontSize: 18,
    },
    name: {
        flex: 1,
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    deleteButton: {
        padding: 6,
    },
    deleteText: {
        color: "#ef4444",
        fontSize: 16,
        fontWeight: "700",
    },
    enrollBox: {
        backgroundColor: NAVY_CARD,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#1e293b",
        gap: 10,
        marginTop: 8,
    },
    enrollTitle: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
        marginBottom: 4,
    },
    input: {
        backgroundColor: "#1e293b",
        color: "white",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 15,
    },
    statusText: {
        color: "#9ca3af",
        fontSize: 13,
        textAlign: "center",
    },
    optionButton: {
        backgroundColor: "#1e3a5f",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
    },
    optionButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
    primaryButton: {
        backgroundColor: "#1d4ed8",
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 8,
    },
    primaryButtonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 15,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    cancelButton: {
        alignItems: "center",
        paddingVertical: 8,
    },
    cancelButtonText: {
        color: "#9ca3af",
        fontSize: 14,
    },
    muted: {
        color: "#9ca3af",
        fontSize: 14,
        textAlign: "center",
        marginTop: 24,
    },
});
