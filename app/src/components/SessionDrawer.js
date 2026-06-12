import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { relayManager } from '../lib/relay';

export default function SessionDrawer(props) {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const fetchSessions = () => {
            relayManager.sendCommand('list_sessions');
        };

        const resultHandler = (payload) => {
            if (payload.command === 'list_sessions') {
                setSessions(payload.result);
            }
        };

        // Poll for sessions or wait for command
        const interval = setInterval(fetchSessions, 5000);
        relayManager.onResult = resultHandler;

        fetchSessions();
        return () => {
            clearInterval(interval);
        };
    }, []);

    const createNewSession = () => {
        relayManager.sendCommand('create_session');
        props.navigation.closeDrawer();
    };

    const selectSession = (id) => {
        // In a real app, we'd navigate and pass the session ID
        // For this prototype, we'll just log it
        console.log('Selected session:', id);
        props.navigation.closeDrawer();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>SESSIONS</Text>
                <TouchableOpacity style={styles.newButton} onPress={createNewSession}>
                    <Text style={styles.newButtonText}>+ NEW CHAT</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={sessions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.sessionItem} onPress={() => selectSession(item.id)}>
                        <Text style={styles.sessionTitle} numberOfLines={1}>
                            {item.title || 'Untitled Session'}
                        </Text>
                        <Text style={styles.sessionDate}>{new Date(item.created_at * 1000).toLocaleDateString()}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.list}
            />
            
            <View style={styles.footer}>
                <Text style={styles.footerText}>AVERAGE v1.0.0</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderColor: '#222',
    },
    title: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 20,
    },
    newButton: {
        backgroundColor: '#fff',
        padding: 12,
        alignItems: 'center',
    },
    newButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    },
    list: {
        padding: 10,
    },
    sessionItem: {
        padding: 15,
        marginBottom: 5,
        borderLeftWidth: 1,
        borderColor: '#222',
    },
    sessionTitle: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 5,
    },
    sessionDate: {
        color: '#666',
        fontSize: 10,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#222',
    },
    footerText: {
        color: '#444',
        fontSize: 10,
        textAlign: 'center',
    }
});
