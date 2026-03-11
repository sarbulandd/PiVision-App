import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertItem } from '../types/alert';

type AlertCardProps = {
    alert: AlertItem;
    onPress: () => void;
};

function formatDate(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function AlertCard({ alert, onPress }: AlertCardProps) {
    const placeholderImage = require('../../assets/images/snapshot-placeholder.jpg');

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <Image
                source={alert.thumbnailUrl ? { uri: alert.thumbnailUrl } : placeholderImage}
                style={styles.thumbnail}
                resizeMode="cover"
            />

            <View style={styles.textContainer}>
                <Text style={styles.title}>{alert.title}</Text>
                <Text style={styles.deviceName}>{alert.deviceName}</Text>
                <Text style={styles.date}>{formatDate(alert.createdAt)}</Text>

                {!alert.viewed && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>New</Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#0d1a3a',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    thumbnail: {
        width: 72,
        height: 72,
        borderRadius: 14,
        marginRight: 16,
        backgroundColor: '#d9d9d9',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    deviceName: {
        color: '#b7bfd3',
        fontSize: 14,
        marginBottom: 4,
    },
    date: {
        color: '#9aa3b2',
        fontSize: 14,
    },
    badge: {
        alignSelf: 'flex-start',
        marginTop: 10,
        backgroundColor: '#1f6f3e',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
});