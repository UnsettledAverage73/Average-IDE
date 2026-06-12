const { WebSocketServer } = require('ws');
const { nanoid } = require('nanoid');

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });

// Maps to track connections
// node_id -> { ws, apps: Set(app_id) }
const nodes = new Map();
// app_id -> { ws, node_id }
const apps = new Map();

console.log(`Average Relay Server started on port ${PORT}`);

wss.on('connection', (ws) => {
    let connectionId = null;
    let connectionType = null; // 'node' or 'app'

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            const { type, payload } = message;

            switch (type) {
                case 'register_node':
                    // Node identifying itself
                    const nodeId = payload.nodeId || nanoid(10);
                    connectionId = nodeId;
                    connectionType = 'node';
                    nodes.set(nodeId, { ws, apps: new Set() });
                    console.log(`Node registered: ${nodeId}`);
                    ws.send(JSON.stringify({ type: 'registered', payload: { nodeId } }));
                    break;

                case 'connect_app':
                    // Mobile app trying to connect to a specific node
                    const targetNodeId = payload.nodeId;
                    const appId = nanoid(10);
                    
                    if (nodes.has(targetNodeId)) {
                        connectionId = appId;
                        connectionType = 'app';
                        apps.set(appId, { ws, nodeId: targetNodeId });
                        nodes.get(targetNodeId).apps.add(appId);
                        
                        console.log(`App ${appId} connected to Node ${targetNodeId}`);
                        ws.send(JSON.stringify({ type: 'connected', payload: { appId, nodeId: targetNodeId } }));
                        
                        // Notify node that an app connected
                        nodes.get(targetNodeId).ws.send(JSON.stringify({ 
                            type: 'app_connected', 
                            payload: { appId } 
                        }));
                    } else {
                        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Node not found' } }));
                    }
                    break;

                case 'command':
                    // App sending a command to its paired Node
                    if (connectionType === 'app' && apps.has(connectionId)) {
                        const { nodeId } = apps.get(connectionId);
                        if (nodes.has(nodeId)) {
                            nodes.get(nodeId).ws.send(JSON.stringify({
                                type: 'command',
                                payload: { ...payload, appId: connectionId }
                            }));
                        }
                    }
                    break;

                case 'result':
                    // Node sending a result back to a specific App
                    if (connectionType === 'node' && nodes.has(connectionId)) {
                        const targetAppId = payload.appId;
                        if (apps.has(targetAppId)) {
                            apps.get(targetAppId).ws.send(JSON.stringify({
                                type: 'result',
                                payload: payload
                            }));
                        }
                    }
                    break;

                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;

                default:
                    console.log(`Unknown message type: ${type}`);
            }
        } catch (err) {
            console.error('Failed to process message:', err);
        }
    });

    ws.on('close', () => {
        if (connectionType === 'node') {
            console.log(`Node disconnected: ${connectionId}`);
            const nodeInfo = nodes.get(connectionId);
            if (nodeInfo) {
                // Notify all attached apps that node is gone
                nodeInfo.apps.forEach(appId => {
                    const app = apps.get(appId);
                    if (app) app.ws.send(JSON.stringify({ type: 'node_disconnected' }));
                    apps.delete(appId);
                });
                nodes.delete(connectionId);
            }
        } else if (connectionType === 'app') {
            console.log(`App disconnected: ${connectionId}`);
            const appInfo = apps.get(connectionId);
            if (appInfo && nodes.has(appInfo.nodeId)) {
                nodes.get(appInfo.nodeId).apps.delete(connectionId);
            }
            apps.delete(connectionId);
        }
    });
});
