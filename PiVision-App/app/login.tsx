import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image,
} from "react-native";

function EyeIcon({ open }: { open: boolean }) {
    return (
        <View style={{ width: 22, height: 16, alignItems: "center", justifyContent: "center" }}>
            {/* Outer eye shape made from two arcs using border radius */}
            <View style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 1.8,
                borderColor: "#9ca3af",
                position: "absolute",
                top: -3,
            }} />
            <View style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 1.8,
                borderColor: "#9ca3af",
                position: "absolute",
                top: -3,
                transform: [{ scaleY: -1 }],
            }} />
            {open ? (
                /* Pupil */
                <View style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: "#9ca3af",
                    position: "absolute",
                    top: 1,
                }} />
            ) : (
                /* Closed line */
                <View style={{
                    width: 16,
                    height: 1.8,
                    backgroundColor: "#9ca3af",
                    borderRadius: 2,
                    position: "absolute",
                    top: 7,
                }} />
            )}
        </View>
    );
}
import { useAuth } from "../src/contexts/AuthContext";
import { useTheme } from "../src/contexts/ThemeContext";

type Mode = "login" | "register" | "reset";

export default function LoginScreen() {
    const { signIn, signUp, resetPassword } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async () => {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail) {
            Alert.alert("Error", "Please enter your email address.");
            return;
        }

        if (mode === "reset") {
            try {
                setLoading(true);
                await resetPassword(trimmedEmail);
                Alert.alert("Email Sent", "Check your inbox for a password reset link.");
                setMode("login");
            } catch (err: any) {
                Alert.alert("Error", friendlyError(err.code));
            } finally {
                setLoading(false);
            }
            return;
        }

        if (!trimmedPassword) {
            Alert.alert("Error", "Please enter your password.");
            return;
        }

        if (mode === "register" && password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            if (mode === "login") {
                await signIn(trimmedEmail, trimmedPassword);
            } else {
                await signUp(trimmedEmail, trimmedPassword);
            }
        } catch (err: any) {
            Alert.alert("Error", friendlyError(err.code));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Logo / Branding */}
                <View style={styles.brandBlock}>
                    <Image
                        source={require("../assets/images/pivision_logo_transparent.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.tagline}>Secure home monitoring</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        {mode === "login"
                            ? "Sign in"
                            : mode === "register"
                            ? "Create account"
                            : "Reset password"}
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Email address"
                        placeholderTextColor={colors.muted}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        autoComplete="email"
                    />

                    {mode !== "reset" && (
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.inputInner}
                                placeholder="Password"
                                placeholderTextColor={colors.muted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                textContentType={mode === "register" ? "newPassword" : "password"}
                                autoComplete={mode === "register" ? "new-password" : "current-password"}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword((v) => !v)}
                                style={styles.eyeButton}
                                hitSlop={8}
                            >
                                <EyeIcon open={showPassword} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {mode === "register" && (
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.inputInner}
                                placeholder="Confirm password"
                                placeholderTextColor={colors.muted}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                textContentType="newPassword"
                                autoComplete="new-password"
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword((v) => !v)}
                                style={styles.eyeButton}
                                hitSlop={8}
                            >
                                <EyeIcon open={showConfirmPassword} />
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#0b1120" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                {mode === "login"
                                    ? "Sign in"
                                    : mode === "register"
                                    ? "Create account"
                                    : "Send reset email"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {mode === "login" && (
                        <TouchableOpacity onPress={() => setMode("reset")} style={styles.linkRow}>
                            <Text style={styles.linkText}>Forgot password?</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Switch mode */}
                <View style={styles.switchRow}>
                    {mode === "login" ? (
                        <>
                            <Text style={styles.switchLabel}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => setMode("register")}>
                                <Text style={styles.switchLink}>Sign up</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.switchLabel}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => setMode("login")}>
                                <Text style={styles.switchLink}>Sign in</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function friendlyError(code: string): string {
    switch (code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Incorrect email or password.";
        case "auth/email-already-in-use":
            return "That email is already registered.";
        case "auth/weak-password":
            return "Password must be at least 6 characters.";
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";
        default:
            return "Something went wrong. Please try again.";
    }
}

function getStyles(colors: ReturnType<typeof import("../src/contexts/ThemeContext").useTheme>["colors"]) {
    return StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        container: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 24, paddingBottom: 160 },
        brandBlock: { alignItems: "center", gap: 0 },
        logo: { width: 340, height: 240 },
        tagline: { fontSize: 15, color: colors.muted, fontWeight: "500", letterSpacing: 0.5 },
        card: {
            backgroundColor: colors.card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 24,
            gap: 14,
        },
        cardTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 4 },
        input: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 13,
            color: colors.text,
            fontSize: 15,
        },
        inputWrapper: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
        },
        inputInner: {
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 13,
            color: colors.text,
            fontSize: 15,
        },
        eyeButton: { paddingHorizontal: 14, paddingVertical: 4 },
        submitButton: {
            backgroundColor: "#ffffff",
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: "center",
            marginTop: 4,
            borderWidth: 1,
            borderColor: "#e2e8f0",
        },
        buttonDisabled: { opacity: 0.6 },
        submitButtonText: { color: "#0b1120", fontWeight: "700", fontSize: 15 },
        linkRow: { alignItems: "center" },
        linkText: { color: colors.muted, fontSize: 13 },
        switchRow: { flexDirection: "row", justifyContent: "center" },
        switchLabel: { color: colors.muted, fontSize: 14 },
        switchLink: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
    });
}
