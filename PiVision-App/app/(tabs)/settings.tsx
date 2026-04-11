import {
    View,
    Text,
    StyleSheet,
    Switch,
    ScrollView,
    Pressable,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useAuth } from "../../src/contexts/AuthContext";

export default function SettingsScreen() {
    const { colors, isDark, toggleTheme } = useTheme();
    const { user, logOut } = useAuth();
    const styles = getStyles(colors);

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                    try {
                        await logOut();
                    } catch (err) {
                        console.error("Sign out failed:", err);
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Settings</Text>

                {/* Face Recognition */}
                <Text style={styles.sectionTitle}>Face Recognition</Text>
                <View style={styles.section}>
                    <Pressable style={styles.row} onPress={() => router.push("/faces")}>
                        <Text style={styles.label}>Known Faces</Text>
                        <Text style={styles.chevron}>›</Text>
                    </Pressable>
                </View>

                {/* Appearance */}
                <Text style={styles.sectionTitle}>Appearance</Text>
                <View style={styles.section}>
                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.label}>Dark Mode</Text>
                            <Text style={styles.muted}>{isDark ? "Dark theme active" : "Light theme active"}</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            thumbColor={isDark ? "#22c55e" : "#9ca3af"}
                            trackColor={{ false: "#cbd5e1", true: "#16a34a" }}
                        />
                    </View>
                </View>

                {/* System */}
                <Text style={styles.sectionTitle}>System</Text>
                <View style={styles.section}>
                    <View style={[styles.row, styles.rowBorder]}>
                        <View style={styles.rowText}>
                            <Text style={styles.label}>Connection</Text>
                            <Text style={styles.muted}>ngrok tunnel to Pi</Text>
                        </View>
                        <View style={styles.pill}>
                            <View style={styles.pillDot} />
                            <Text style={styles.pillText}>Active</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.label}>Storage</Text>
                            <Text style={styles.muted}>Azure Blob — pivisionstore</Text>
                        </View>
                    </View>
                </View>

                {/* Account */}
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.section}>
                    <View style={[styles.row, styles.rowBorder]}>
                        <View style={styles.rowText}>
                            <Text style={styles.label}>Signed in as</Text>
                            <Text style={styles.muted}>{user?.email ?? "—"}</Text>
                        </View>
                    </View>
                    <Pressable style={styles.row} onPress={handleSignOut}>
                        <Text style={styles.signOutLabel}>Sign Out</Text>
                    </Pressable>
                </View>

                {/* About */}
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.section}>
                    <View style={[styles.row, styles.rowBorder]}>
                        <Text style={styles.label}>App Version</Text>
                        <Text style={styles.muted}>1.0.0</Text>
                    </View>
                    <View style={[styles.row, styles.rowBorder]}>
                        <Text style={styles.label}>Platform</Text>
                        <Text style={styles.muted}>Expo SDK 54</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Project</Text>
                        <Text style={styles.muted}>PiVision</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

function getStyles(colors: ReturnType<typeof import("../../src/contexts/ThemeContext").useTheme>["colors"]) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        scrollContent: { padding: 16, paddingBottom: 40 },
        title: { fontSize: 26, fontWeight: "700", color: colors.text, marginBottom: 20 },
        sectionTitle: { fontSize: 12, fontWeight: "600", color: colors.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
        section: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 24, overflow: "hidden" },
        row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
        rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
        rowText: { flex: 1 },
        label: { color: colors.text, fontWeight: "600", fontSize: 15 },
        muted: { color: colors.muted, fontSize: 13, marginTop: 2 },
        chevron: { color: colors.muted, fontSize: 22, fontWeight: "500" },
        pill: { flexDirection: "row", alignItems: "center", backgroundColor: "#14532d", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
        pillDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: "#22c55e", marginRight: 5 },
        pillText: { color: "#ffffff", fontSize: 11, fontWeight: "600" },
        signOutLabel: { color: "#ef4444", fontWeight: "600", fontSize: 15 },
    });
}
