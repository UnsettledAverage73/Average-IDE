import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { relayManager } from '../lib/relay';

export default function ConnectScreen({ navigation, route }) {
    const [url, setUrl] = useState('ws://localhost:3000');
    const [nodeId, setNodeId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (route.params?.discoveredUrl) {
            setUrl(route.params.discoveredUrl);
        }
        if (route.params?.scannedNodeId) {
            setNodeId(route.params.scannedNodeId);
        }
    }, [route.params?.discoveredUrl, route.params?.scannedNodeId]);

    const handleConnect = async () => {
        setLoading(true);
        setError('');
        try {
            await relayManager.connect(url, nodeId);
            navigation.navigate('Chat');
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>AVERAGE</Text>
            <Text style={styles.subtitle}>Connect to System Node</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Relay URL (ws://...)"
                placeholderTextColor="#666"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
            />
            
            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Node ID"
                    placeholderTextColor="#666"
                    value={nodeId}
                    onChangeText={setNodeId}
                    autoCapitalize="none"
                />
                <TouchableOpacity 
                    style={styles.qrButton}
                    onPress={() => navigation.navigate('QRScanner')}
                >
                    <Text style={styles.qrButtonText}>[QR]</Text>
                </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity 
                style={styles.button} 
                onPress={handleConnect}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>CONNECT</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.discoverButton} 
                onPress={() => navigation.navigate('Discovery')}
            >
                <Text style={styles.discoverButtonText}>DISCOVER LOCAL NODES</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 10,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 40,
        textTransform: 'uppercase',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
        color: '#fff',
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    qrButton: {
        width: 60,
        height: 50,
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    qrButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    discoverButton: {
        marginTop: 30,
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#444',
    },
    discoverButtonText: {
        color: '#666',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    error: {
        color: '#ff4444',
        marginBottom: 15,
        textAlign: 'center',
    }
});
