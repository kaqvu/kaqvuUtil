const WebSocket = require('ws');

const CREDENTIALS = {
    login: 'kaqvu',
    password: 'password'
};

class WebSocketManager {
    constructor() {
        this.wss = null;
        this.webClients = new Set();
        this.minecraftClients = new Map();
        this.players = new Map();
    }

    initialize(server) {
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', (ws) => {
            this.handleConnection(ws);
        });

        console.log('WebSocket server initialized');
    }

    handleConnection(ws) {
        let clientType = null;
        let playerName = null;

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                this.handleMessage(ws, data, clientType, playerName, (type, name) => {
                    clientType = type;
                    playerName = name;
                });
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        });

        ws.on('close', () => {
            if (clientType === 'web') {
                this.webClients.delete(ws);
            } else if (clientType === 'minecraft' && playerName) {
                this.minecraftClients.delete(playerName);
                this.players.delete(playerName);
                this.broadcastPlayerList();
            }
        });
    }

    handleMessage(ws, data, clientType, playerName, setClientInfo) {
        if (data.type === 'auth') {
            const expectedToken = Buffer.from(`${CREDENTIALS.login}:${CREDENTIALS.password}`).toString('base64');

            if (data.token === expectedToken) {
                setClientInfo('web', null);
                this.webClients.add(ws);
                this.sendPlayerList(ws);
            } else {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid credentials' }));
                ws.close();
            }
        }

        if (data.type === 'register') {
            setClientInfo('minecraft', data.player);
            this.minecraftClients.set(data.player, ws);

            const isOnline = data.online === true;
            const serverIp = data.serverIp || '';

            this.players.set(data.player, {
                connected: true,
                timestamp: Date.now(),
                serverIp: serverIp,
                online: isOnline
            });

            console.log(`[WebSocket] Player ${data.player}: online=${isOnline}, serverIp="${serverIp}"`);
            this.broadcastPlayerList();
        }
    }

    sendPlayerList(ws) {
        const playerList = Array.from(this.players.entries()).map(([name, data]) => ({
            name: name,
            serverIp: data.serverIp || '',
            online: data.online === true
        }));

        console.log('[WebSocket] Sending player list:', JSON.stringify(playerList));

        ws.send(JSON.stringify({
            type: 'players',
            players: playerList
        }));
    }

    broadcastPlayerList() {
        const playerList = Array.from(this.players.entries()).map(([name, data]) => ({
            name: name,
            serverIp: data.serverIp || '',
            online: data.online === true
        }));

        const message = JSON.stringify({
            type: 'players',
            players: playerList
        });

        console.log('[WebSocket] Broadcasting player list:', JSON.stringify(playerList));

        this.webClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    getPlayers() {
        return Array.from(this.players.keys());
    }

    sendToMinecraft(playerName, action, data) {
        const ws = this.minecraftClients.get(playerName);

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            return { success: false, message: 'Player not connected' };
        }

        try {
            ws.send(JSON.stringify({
                type: action,
                ...data
            }));
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    disconnectPlayer(playerName) {
        return this.sendToMinecraft(playerName, 'disconnect', {});
    }
}

module.exports = WebSocketManager;