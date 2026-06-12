import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { relayManager } from '../lib/relay';

export default function VaultScreen({ navigation }) {
    const [status, setStatus] = useState('');
    const [commitMsg, setCommitMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState('');

    useEffect(() => {
        relayManager.onResult = (payload) => {
            if (payload.command === 'git_status') {
                setStatus(payload.result);
                setLoading(false);
            } else if (payload.command === 'git_log') {
                setLogs(payload.result);
                setLoading(false);
            } else if (payload.command === 'git_commit' || payload.command === 'git_push') {
                alert(payload.result);
                fetchGitInfo();
            }
        };
        fetchGitInfo();
    }, []);

    const fetchGitInfo = () => {
        setLoading(true);
        relayManager.sendCommand('git_status');
        relayManager.sendCommand('git_log');
    };

    const handleCommit = () => {
        if (!commitMsg.trim()) return;
        setLoading(true);
        relayManager.sendCommand('git_commit', { message: commitMsg });
        setCommitMsg('');
    };

    const handlePush = () => {
        setLoading(true);
        relayManager.sendCommand('git_push');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>VAULT</Text>
                <TouchableOpacity onPress={fetchGitInfo}>
                    <Text style={styles.refreshText}>{loading ? '...' : 'REFRESH'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>UNSTAGED CHANGES</Text>
                <View style={styles.statusBox}>
                    <Text style={styles.statusText}>{status || 'Clean'}</Text>
                </View>

                <View style={styles.commitSection}>
                    <TextInput
                        style={styles.input}
                        placeholder="COMMIT MESSAGE..."
                        placeholderTextColor="#666"
                        value={commitMsg}
                        onChangeText={setCommitMsg}
                    />
                    <TouchableOpacity style={styles.commitButton} onPress={handleCommit}>
                        <Text style={styles.commitButtonText}>COMMIT ALL</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.pushButton} onPress={handlePush}>
                    <Text style={styles.pushButtonText}>PUSH TO GITHUB</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>RECENT LOGS</Text>
                <View style={styles.logBox}>
                    <Text style={styles.logText}>{logs}</Text>
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                <Text style={styles.closeButtonText}>BACK</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#222',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    refreshText: {
        color: '#888',
        fontSize: 10,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 10,
        marginTop: 20,
    },
    statusBox: {
        backgroundColor: '#111',
        padding: 15,
        borderWidth: 1,
        borderColor: '#333',
    },
    statusText: {
        color: '#0f0',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 12,
    },
    commitSection: {
        marginTop: 20,
    },
    input: {
        backgroundColor: '#111',
        color: '#fff',
        padding: 15,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 10,
    },
    commitButton: {
        backgroundColor: '#fff',
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    commitButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    },
    pushButton: {
        marginTop: 15,
        height: 45,
        borderWidth: 1,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pushButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    logBox: {
        backgroundColor: '#111',
        padding: 15,
        marginTop: 10,
        marginBottom: 40,
    },
    logText: {
        color: '#888',
        fontSize: 10,
        lineHeight: 16,
    },
    closeButton: {
        height: 60,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});
