import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { relayManager } from '../lib/relay';

export default function FileBrowserScreen({ navigation }) {
    const [files, setFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState('.');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        relayManager.onResult = (payload) => {
            if (payload.command === 'list_files') {
                setFiles(payload.result);
                setLoading(false);
            }
        };
        fetchFiles('.');
    }, []);

    const fetchFiles = (path) => {
        setLoading(true);
        setCurrentPath(path);
        relayManager.sendCommand('list_files', { path });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.item} 
            onPress={() => item.isDirectory ? fetchFiles(item.path) : null}
        >
            <Text style={styles.itemText}>{item.isDirectory ? '📁' : '📄'} {item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>WORKSPACE</Text>
                <Text style={styles.path}>{currentPath}</Text>
            </View>
            
            {loading ? (
                <ActivityIndicator color="white" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={files}
                    renderItem={renderItem}
                    keyExtractor={item => item.path}
                    contentContainerStyle={styles.list}
                />
            )}

            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                <Text style={styles.closeButtonText}>CLOSE</Text>
            </TouchableOpacity>
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
    path: {
        color: '#888',
        fontSize: 12,
    },
    list: {
        padding: 10,
    },
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#111',
    },
    itemText: {
        color: '#fff',
        fontSize: 14,
    },
    closeButton: {
        height: 60,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#000',
        fontWeight: 'bold',
        letterSpacing: 2,
    }
});
