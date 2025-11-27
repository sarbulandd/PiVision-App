import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function Header() {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>PiVision</Text>

            <Image
                source={require("../../assets/images/pivisioncornerlogo.jpg")}
                style={styles.logo}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        width: "100%",
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: "#020617", // same dark navy
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "white",
    },
    logo: {
        width: 42,
        height: 42,
    },
});
