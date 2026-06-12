import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { relayManager } from '../lib/relay';

export default function ChatScreen({ navigation }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedAgents, setSelectedAgents] = useState(['qwen2.5:0.5b']);
    const [isInstalling, setIsInstalling] = useState(false);
    const [availableModels, setAvailableModels] = useState([]);
    const flatListRef = useRef();

    useEffect(() => {
        // Initial setup
        relayManager.sendCommand('check_models');

        relayManager.onResult = (payload) => {
            switch (payload.command) {
                case 'orchestrate':
                    const results = payload.result.results;
                    results.forEach(res => {
                        setMessages(prev => [...prev, {
                            id: Math.random().toString(),
                            role: 'assistant',
                            agent: res.agent,
                            content: res.content || res.error
                        }]);
                    });
                    setLoading(false);
                    break;
                case 'check_models':
                    setAvailableModels(payload.result.models || []);
                    break;
                case 'pull_model':
                    setIsInstalling(false);
                    // Refresh model list after pull
                    relayManager.sendCommand('check_models');
                    break;
            }
        };
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;

        // Check if selected local model is installed
        const localModel = selectedAgents.find(a => a.includes(':'));
        if (localModel && !availableModels.includes(localModel)) {
            setIsInstalling(true);
            relayManager.sendCommand('pull_model', { model_name: localModel });
            return;
        }

        const userMsg = {
            id: Math.random().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        
        relayManager.sendCommand('orchestrate', {
            query: input,
            agents: selectedAgents
        });

        setInput('');
    };

    const renderMessage = ({ item }) => (
        <View style={[styles.messageContainer, item.role === 'user' ? styles.userMessage : styles.assistantMessage]}>
            {item.agent && <Text style={styles.agentTag}>{item.agent.toUpperCase()}</Text>}
            <Text style={styles.messageText}>{item.content}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
            keyboardVerticalOffset={100}
        >
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>CHAMBER</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => navigation.navigate('FileBrowser')} style={{ marginRight: 15 }}>
                            <Text style={styles.headerLink}>FILES</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Browser')} style={{ marginRight: 15 }}>
                            <Text style={styles.headerLink}>BROWSE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Vault')}>
                            <Text style={styles.headerLink}>VAULT</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {isInstalling && (
                    <View style={styles.installBanner}>
                        <ActivityIndicator size="small" color="#000" />
                        <Text style={styles.installText}>INSTALLING MODEL...</Text>
                    </View>
                )}

                <View style={styles.agentBar}>
                    {['qwen2.5:0.5b', 'gpt-3.5-turbo-instruct'].map(agent => (
                        <TouchableOpacity 
                            key={agent} 
                            onPress={() => {
                                if (selectedAgents.includes(agent)) {
                                    setSelectedAgents(selectedAgents.filter(a => a !== agent));
                                } else {
                                    setSelectedAgents([...selectedAgents, agent]);
                                }
                            }}
                            style={[styles.agentChip, selectedAgents.includes(agent) && styles.activeAgentChip]}
                        >
                            <Text style={[styles.agentChipText, selectedAgents.includes(agent) && styles.activeAgentChipText]}>
                                {agent.split(':')[0].toUpperCase()}
                            </Text>
                            {!availableModels.includes(agent) && agent.includes(':') && (
                                <Text style={styles.downloadIcon}>↓</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current.scrollToEnd()}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="COMMAND..."
                    placeholderTextColor="#666"
                    value={input}
                    onChangeText={setInput}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading || isInstalling}>
                    <Text style={styles.sendButtonText}>{loading ? '...' : 'EXEC'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: '#222',
    },
    menuIcon: {
        color: '#fff',
        fontSize: 24,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    headerLink: {
        color: '#fff', 
        fontSize: 12, 
        borderBottomWidth: 1, 
        borderColor: '#fff'
    },
    installBanner: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    installText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 10,
        letterSpacing: 1,
    },
    agentBar: {
        flexDirection: 'row',
    },
    agentChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#333',
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeAgentChip: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    agentChipText: {
        color: '#888',
        fontSize: 10,
        fontWeight: 'bold',
    },
    activeAgentChipText: {
        color: '#000',
    },
    downloadIcon: {
        color: '#666',
        fontSize: 10,
        marginLeft: 5,
    },
    listContent: {
        padding: 20,
    },
    messageContainer: {
        marginBottom: 20,
        padding: 15,
        maxWidth: '85%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
    },
    assistantMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#000',
        borderLeftWidth: 2,
        borderColor: '#fff',
    },
    agentTag: {
        color: '#888',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    messageText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#222',
        backgroundColor: '#000',
    },
    input: {
        flex: 1,
        backgroundColor: '#111',
        color: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
    },
    sendButton: {
        width: 70,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    sendButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    }
});
