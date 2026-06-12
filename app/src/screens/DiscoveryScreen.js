import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { relayManager } from '../lib/relay';

export default function DiscoveryScreen({ navigation }) {
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        relayManager.onResult = (payload) => {
            if (payload.command === 'discover_nodes') {
                setNodes(payload.result.results);
                setLoading(false);
            }
        };
        handleDiscover();
    }, []);

    const handleDiscover = () => {
        setLoading(true);
        relayManager.sendCommand('discover_nodes');
    };

    const renderNode = ({ item }) => (
        <TouchableOpacity 
            style={styles.nodeItem} 
            onPress={() => {
                // Return to connect screen with this IP
                navigation.navigate('Connect', { discoveredUrl: `ws://${item.host}:3000` });
            }}
        >
            <View style={styles.nodeHeader}>
                <Text style={styles.nodeHost}>{item.host}</Text>
                <Text style={styles.nodeStatus}>ONLINE</Text>
            </View>
            <Text style={styles.nodeModels}>Models: {item.models.join(', ') || 'None'}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>DISCOVERY</Text>
                <Text style={styles.subtitle}>Scanning local network for System Nodes...</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="white" />
                    <Text style={styles.loadingText}>SCANNING...</Text>
                </View>
            ) : (
                <FlatList
                    data={nodes}
                    renderItem={renderNode}
                    keyExtractor={item => item.host}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No nodes found. Ensure they are on the same WiFi.</Text>
                    }
                />
            )}

            <View style={styles.footer}>
                <TouchableOpacity style={styles.provisionButton} onPress={() => {}}>
                    <Text style={styles.provisionButtonText}>PROVISION CLOUD NODE (AWS)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.closeButtonText}>BACK</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderColor: '#222',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 4,
        marginBottom: 5,
    },
    subtitle: {
        color: '#888',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 10,
        letterSpacing: 2,
    },
    list: {
        padding: 20,
    },
    nodeItem: {
        backgroundColor: '#111',
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333',
    },
    nodeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    nodeHost: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    nodeStatus: {
        color: '#0f0',
        fontSize: 10,
        fontWeight: 'bold',
    },
    nodeModels: {
        color: '#666',
        fontSize: 12,
    },
    emptyText: {
        color: '#444',
        textAlign: 'center',
        marginTop: 50,
    },
    footer: {
        padding: 20,
    },
    provisionButton: {
        height: 50,
        borderWidth: 1,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    provisionButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    closeButton: {
        height: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#000',
        fontWeight: 'bold',
    }
});
