class RelayManager {
    constructor() {
        this.ws = null;
        this.nodeId = null;
        this.appId = null;
        this.onResult = null;
        this.onStatusChange = null;
    }

    connect(url, nodeId) {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(url);
                this.nodeId = nodeId;

                this.ws.onopen = () => {
                    console.log('Connected to relay');
                    this.ws.send(JSON.stringify({
                        type: 'connect_app',
                        payload: { nodeId: this.nodeId }
                    }));
                };

                this.ws.onmessage = (e) => {
                    const message = JSON.parse(e.data);
                    const { type, payload } = message;

                    switch (type) {
                        case 'connected':
                            this.appId = payload.appId;
                            if (this.onStatusChange) this.onStatusChange('connected');
                            resolve(payload);
                            break;
                        case 'result':
                            if (this.onResult) this.onResult(payload);
                            break;
                        case 'error':
                            reject(payload.message);
                            break;
                        case 'node_disconnected':
                            if (this.onStatusChange) this.onStatusChange('node_lost');
                            break;
                    }
                };

                this.ws.onerror = (err) => {
                    reject(err);
                };

                this.ws.onclose = () => {
                    if (this.onStatusChange) this.onStatusChange('disconnected');
                };
            } catch (err) {
                reject(err);
            }
        });
    }

    sendCommand(command, args = {}) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('Not connected to relay');
        }

        this.ws.send(JSON.stringify({
            type: 'command',
            payload: {
                command,
                args
            }
        }));
    }
}

export const relayManager = new RelayManager();
