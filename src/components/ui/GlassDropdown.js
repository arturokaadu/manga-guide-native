import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Platform } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme';
import GlassCard from './GlassCard';

export default function GlassDropdown({ data, onSelect, visible }) {
    if (!visible || data.length === 0) return null;

    return (
        <View style={styles.wrapper}>
            <GlassCard style={styles.container} variant="dark">
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={[
                                styles.item,
                                index === data.length - 1 && styles.lastItem
                            ]}
                            onPress={() => onSelect(item)}
                        >
                            {item.coverImage?.medium && (
                                <Image
                                    source={{ uri: item.coverImage.medium }}
                                    style={styles.cover}
                                />
                            )}
                            <View style={styles.info}>
                                <Text style={styles.title} numberOfLines={1}>
                                    {item.title.userPreferred || item.title.romaji}
                                </Text>
                                <Text style={styles.details}>
                                    {item.seasonYear ? `${item.seasonYear}` : ''} • {item.format}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    style={styles.list}
                />
            </GlassCard>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: 60, // Just below the input (56 height + spacing)
        left: 0,
        right: 0,
        zIndex: 1000,
        ...Platform.select({
            web: { zIndex: 1000 },
            default: { elevation: 15 } // Ensure above other elements on Android
        })
    },
    container: {
        maxHeight: 300,
        padding: 0,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        backgroundColor: '#000000', // Solid black to prevent seeing through
        overflow: 'hidden',
    },
    list: {
        paddingVertical: SPACING.xs,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    cover: {
        width: 30,
        height: 45,
        borderRadius: 4,
        marginRight: SPACING.m,
        backgroundColor: COLORS.surface,
    },
    info: {
        flex: 1,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    details: {
        color: COLORS.textTertiary,
        fontSize: 12,
    }
});
