const loadingScreen = document.getElementById('loadingScreen');
const mainPanel = document.getElementById('mainPanel');
const logoutButton = document.getElementById('logoutButton');
const playerList = document.getElementById('playerList');
const playerCount = document.getElementById('playerCount');
const noSelection = document.getElementById('noSelection');
const playerControl = document.getElementById('playerControl');
const selectedPlayerName = document.getElementById('selectedPlayerName');
const closeControl = document.getElementById('closeControl');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const disconnectButton = document.getElementById('disconnectButton');
const statusMessage = document.getElementById('statusMessage');

let ws = null;
let currentPlayer = null;
let players = [];
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function checkAuth() {
    const token = localStorage.getItem('kaqvuToken');
    if (!token) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

function showLoading() {
    loadingScreen.classList.remove('hidden');
    mainPanel.classList.add('hidden');
}

function showPanel() {
    loadingScreen.classList.add('hidden');
    mainPanel.classList.remove('hidden');
}

function getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}`;
}

function connectWebSocket() {
    const token = localStorage.getItem('kaqvuToken');
    const wsUrl = getWebSocketUrl();
    
    console.log('Connecting to:', wsUrl);
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts = 0;
        
        ws.send(JSON.stringify({
            type: 'auth',
            token: token
        }));
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('Received:', data);
            
            if (data.type === 'players') {
                players = Array.isArray(data.players) ? data.players.filter(p => p && (typeof p === 'string' || (p.name && typeof p.name === 'string'))) : [];
                updatePlayerList();
                showPanel();
            }

            if (data.type === 'error') {
                console.error('Server error:', data.message);
                if (data.message.includes('credentials')) {
                    localStorage.removeItem('kaqvuToken');
                    window.location.href = '/login';
                }
            }
        } catch (e) {
            console.error('Error parsing WebSocket message:', e);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            setTimeout(() => {
                console.log(`Reconnecting... Attempt ${reconnectAttempts}`);
                showLoading();
                connectWebSocket();
            }, 2000);
        } else {
            showStatus('Utracono połączenie z serwerem', 'error');
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function updatePlayerList() {
    playerList.innerHTML = '';
    playerCount.textContent = players.length;
    
    if (players.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-list';
        emptyDiv.innerHTML = '<p>Brak graczy online</p>';
        playerList.appendChild(emptyDiv);
        
        if (currentPlayer) {
            deselectPlayer();
        }
        return;
    }

    players.forEach(player => {
        const playerName = typeof player === 'string' ? player : player.name;
        const serverIp = typeof player === 'object' ? player.serverIp : 'Unknown';
        
        if (!playerName || typeof playerName !== 'string') return;
        
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        if (playerName === currentPlayer) {
            playerItem.classList.add('active');
        }
        
        playerItem.innerHTML = `
            <div class="player-avatar">${playerName.charAt(0).toUpperCase()}</div>
            <div class="player-info">
                <span class="player-name">${playerName}</span>
                <span class="player-status">${serverIp}</span>
            </div>
        `;
        
        playerItem.addEventListener('click', () => selectPlayer(playerName));
        playerList.appendChild(playerItem);
    });

    if (currentPlayer && !players.find(p => (typeof p === 'string' ? p : p.name) === currentPlayer)) {
        deselectPlayer();
    }
}

function selectPlayer(player) {
    currentPlayer = player;
    updatePlayerList();
    
    noSelection.classList.add('hidden');
    playerControl.classList.remove('hidden');
    selectedPlayerName.textContent = player;
    messageInput.value = '';
    statusMessage.textContent = '';
    messageInput.focus();
}

function deselectPlayer() {
    currentPlayer = null;
    updatePlayerList();
    
    noSelection.classList.remove('hidden');
    playerControl.classList.add('hidden');
}

closeControl.addEventListener('click', deselectPlayer);

async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !currentPlayer) return;

    const isCommand = content.startsWith('/');
    
    try {
        const response = await fetch('/api/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player: currentPlayer,
                type: isCommand ? 'command' : 'message',
                content: content
            })
        });

        const result = await response.json();
        
        if (result.success) {
            showStatus(isCommand ? 'Komenda wykonana' : 'Wiadomość wysłana', 'success');
            messageInput.value = '';
        } else {
            showStatus(result.message || 'Błąd wykonania akcji', 'error');
        }
    } catch (e) {
        showStatus('Błąd połączenia z serwerem', 'error');
    }
}

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

disconnectButton.addEventListener('click', async () => {
    if (!currentPlayer) return;

    try {
        const response = await fetch('/api/disconnect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player: currentPlayer
            })
        });

        const result = await response.json();
        
        if (result.success) {
            showStatus('Gracz został rozłączony', 'success');
            deselectPlayer();
        } else {
            showStatus(result.message || 'Błąd rozłączania gracza', 'error');
        }
    } catch (e) {
        showStatus('Błąd połączenia z serwerem', 'error');
    }
});

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type} show`;
    
    setTimeout(() => {
        statusMessage.classList.remove('show');
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';
        }, 300);
    }, 3000);
}

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('kaqvuToken');
    if (ws) {
        ws.close();
    }
    window.location.href = '/login';
});

if (checkAuth()) {
    showLoading();
    connectWebSocket();
}