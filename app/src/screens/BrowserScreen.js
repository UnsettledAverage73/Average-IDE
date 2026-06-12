import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { relayManager } from '../lib/relay';

export default function BrowserScreen({ navigation }) {
    const [url, setUrl] = useState('http://localhost:5173');
    const [currentUrl, setCurrentUrl] = useState('http://localhost:5173');
    const [activePorts, setActivePorts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPorts, setShowPorts] = useState(false);

    useEffect(() => {
        relayManager.onResult = (payload) => {
            if (payload.command === 'get_active_ports') {
                setActivePorts(payload.result);
                setLoading(false);
            }
        };
        fetchPorts();
    }, []);

    const fetchPorts = () => {
        setLoading(true);
        relayManager.sendCommand('get_active_ports');
    };

    const handleGo = () => {
        let targetUrl = url;
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'http://' + targetUrl;
        }
        setCurrentUrl(targetUrl);
    };

    const selectPort = (portUrl) => {
        setUrl(portUrl);
        setCurrentUrl(portUrl);
        setShowPorts(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.input}
                    value={url}
                    onChangeText={setUrl}
                    placeholder="URL..."
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.goButton} onPress={handleGo}>
                    <Text style={styles.goButtonText}>GO</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.portButton} onPress={() => setShowPorts(!showPorts)}>
                    <Text style={styles.portButtonText}>PORTS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            {showPorts && (
                <View style={styles.portsDropdown}>
                    <View style={styles.portsHeader}>
                        <Text style={styles.portsTitle}>ACTIVE DEV SERVERS</Text>
                        <TouchableOpacity onPress={fetchPorts}>
                            <Text style={styles.refreshText}>{loading ? '...' : 'REFRESH'}</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={activePorts}
                        keyExtractor={item => item.port.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.portItem} onPress={() => selectPort(item.url)}>
                                <Text style={styles.portName}>{item.name}</Text>
                                <Text style={styles.portUrl}>Port: {item.port}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>No active servers found</Text>}
                    />
                </View>
            )}

            <WebView 
                source={{ uri: currentUrl }} 
                style={styles.webview} 
                backgroundColor="#000"
                startInLoadingState={true}
                renderLoading={() => <ActivityIndicator color="#fff" style={styles.webViewLoading} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingTop: 50,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingBottom: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#222',
        zIndex: 10,
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: '#111',
        color: '#fff',
        paddingHorizontal: 15,
        fontSize: 14,
    },
    goButton: {
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },
    goButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 10,
    },
    portButton: {
        width: 50,
        height: 40,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },
    portButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 20,
    },
    portsDropdown: {
        position: 'absolute',
        top: 100,
        left: 10,
        right: 10,
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
        maxHeight: 300,
        zIndex: 20,
        padding: 10,
    },
    portsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: '#222',
    },
    portsTitle: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    refreshText: {
        color: '#888',
        fontSize: 10,
    },
    portItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#222',
    },
    portName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    portUrl: {
        color: '#666',
        fontSize: 10,
    },
    emptyText: {
        color: '#444',
        textAlign: 'center',
        padding: 20,
    },
    webview: {
        flex: 1,
    },
    webViewLoading: {
        position: 'absolute',
        top: '50%',
        left: '50%',
    }
});
