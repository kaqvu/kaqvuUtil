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
const slotInput = document.getElementById('slotInput');
const setSlotButton = document.getElementById('setSlotButton');
const leftClickButton = document.getElementById('leftClickButton');
const rightClickButton = document.getElementById('rightClickButton');
const guiSlotInput = document.getElementById('guiSlotInput');
const guiShiftCheckbox = document.getElementById('guiShiftCheckbox');
const guiLeftClickButton = document.getElementById('guiLeftClickButton');
const guiRightClickButton = document.getElementById('guiRightClickButton');
const offlinePlayerControl = document.getElementById('offlinePlayerControl');
const offlinePlayerName = document.getElementById('offlinePlayerName');
const closeOfflineControl = document.getElementById('closeOfflineControl');
const serverIpInput = document.getElementById('serverIpInput');
const serverPortInput = document.getElementById('serverPortInput');
const joinServerButton = document.getElementById('joinServerButton');
const offlineStatusMessage = document.getElementById('offlineStatusMessage');
const resourcePackToggle = document.getElementById('resourcePackToggle');

let ws = null;
let currentPlayer = null;
let currentPlayerOnline = false;
let resourcePackEnabled = true;
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

                if (currentPlayer) {
                    const playerData = players.find(p => (typeof p === 'string' ? p : p.name) === currentPlayer);
                    if (playerData) {
                        const newOnlineState = typeof playerData === 'object' ? playerData.online === true : true;
                        if (newOnlineState !== currentPlayerOnline) {
                            selectPlayer(currentPlayer, newOnlineState);
                        }
                    }
                }

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
        emptyDiv.innerHTML = '<p>Brak graczy</p>';
        playerList.appendChild(emptyDiv);

        if (currentPlayer) {
            deselectPlayer();
        }
        return;
    }

    players.forEach(player => {
        const playerName = typeof player === 'string' ? player : player.name;
        const serverIp = typeof player === 'object' ? (player.serverIp || 'Menu główne') : 'Unknown';
        const isOnline = typeof player === 'object' ? player.online === true : true;

        if (!playerName || typeof playerName !== 'string') return;

        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        if (!isOnline) {
            playerItem.classList.add('offline');
        }
        if (playerName === currentPlayer) {
            playerItem.classList.add('active');
        }

        const statusText = isOnline ? serverIp : 'Menu główne';

        playerItem.innerHTML = `
            <div class="player-avatar">${playerName.charAt(0).toUpperCase()}</div>
            <div class="player-info">
                <span class="player-name">${playerName}</span>
                <span class="player-status">${statusText}</span>
            </div>
        `;

        playerItem.addEventListener('click', () => selectPlayer(playerName, isOnline));
        playerList.appendChild(playerItem);
    });

    if (currentPlayer && !players.find(p => (typeof p === 'string' ? p : p.name) === currentPlayer)) {
        deselectPlayer();
    }
}

function selectPlayer(player, isOnline) {
    currentPlayer = player;
    currentPlayerOnline = isOnline;
    updatePlayerList();

    noSelection.classList.add('hidden');

    if (isOnline) {
        playerControl.classList.remove('hidden');
        offlinePlayerControl.classList.add('hidden');
        selectedPlayerName.textContent = player;
        messageInput.value = '';
        statusMessage.textContent = '';
        messageInput.focus();
    } else {
        playerControl.classList.add('hidden');
        offlinePlayerControl.classList.remove('hidden');
        offlinePlayerName.textContent = player;
        serverIpInput.value = '';
        serverPortInput.value = '25565';
        offlineStatusMessage.textContent = '';
        resourcePackEnabled = true;
        updateResourcePackToggle();
        serverIpInput.focus();
    }
}

function deselectPlayer() {
    currentPlayer = null;
    currentPlayerOnline = false;
    updatePlayerList();

    noSelection.classList.remove('hidden');
    playerControl.classList.add('hidden');
    offlinePlayerControl.classList.add('hidden');
}

function updateResourcePackToggle() {
    if (resourcePackEnabled) {
        resourcePackToggle.classList.remove('disabled');
        resourcePackToggle.classList.add('enabled');
        resourcePackToggle.querySelector('.toggle-text').textContent = 'ENABLED';
    } else {
        resourcePackToggle.classList.remove('enabled');
        resourcePackToggle.classList.add('disabled');
        resourcePackToggle.querySelector('.toggle-text').textContent = 'DISABLED';
    }
}

closeControl.addEventListener('click', deselectPlayer);
closeOfflineControl.addEventListener('click', deselectPlayer);

resourcePackToggle.addEventListener('click', () => {
    resourcePackEnabled = !resourcePackEnabled;
    updateResourcePackToggle();
});

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

async function sendAction(action, value, successMessage) {
    if (!currentPlayer) return;

    try {
        const response = await fetch('/api/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player: currentPlayer,
                type: 'action',
                action: action,
                value: value
            })
        });

        const result = await response.json();

        if (result.success) {
            showStatus(successMessage, 'success');
        } else {
            showStatus(result.message || 'Błąd wykonania akcji', 'error');
        }
    } catch (e) {
        showStatus('Błąd połączenia z serwerem', 'error');
    }
}

setSlotButton.addEventListener('click', () => {
    const slot = parseInt(slotInput.value);
    if (isNaN(slot) || slot < 0 || slot > 8) {
        showStatus('Slot musi być liczbą od 0 do 8', 'error');
        return;
    }
    sendAction('setSlot', slot, `Slot ustawiony na ${slot + 1}`);
});

leftClickButton.addEventListener('click', () => {
    sendAction('leftClick', null, 'Lewy przycisk myszy');
});

rightClickButton.addEventListener('click', () => {
    sendAction('rightClick', null, 'Prawy przycisk myszy');
});

guiLeftClickButton.addEventListener('click', () => {
    const slot = parseInt(guiSlotInput.value);
    const shift = guiShiftCheckbox.checked;
    sendGuiClick(slot, 0, shift);
});

guiRightClickButton.addEventListener('click', () => {
    const slot = parseInt(guiSlotInput.value);
    const shift = guiShiftCheckbox.checked;
    sendGuiClick(slot, 1, shift);
});

function sendGuiClick(slot, button, shift) {
    if (!currentPlayer) {
        showStatus('Wybierz gracza', 'error');
        return;
    }
    if (isNaN(slot) || slot < 0) {
        showStatus('Podaj poprawny numer slotu', 'error');
        return;
    }

    fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            player: currentPlayer,
            type: 'action',
            action: 'guiClick',
            slot: slot,
            button: button,
            shift: shift
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const btnText = button === 0 ? 'Lewy' : 'Prawy';
                const shiftText = shift ? ' + Shift' : '';
                showStatus(`GUI slot ${slot}: ${btnText}${shiftText}`, 'success');
            } else {
                showStatus(data.message || 'Błąd', 'error');
            }
        })
        .catch(() => showStatus('Błąd połączenia', 'error'));
}

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

function showOfflineStatus(message, type) {
    offlineStatusMessage.textContent = message;
    offlineStatusMessage.className = `status-message ${type} show`;

    setTimeout(() => {
        offlineStatusMessage.classList.remove('show');
        setTimeout(() => {
            offlineStatusMessage.textContent = '';
            offlineStatusMessage.className = 'status-message';
        }, 300);
    }, 3000);
}

joinServerButton.addEventListener('click', () => {
    const ip = serverIpInput.value.trim();
    const port = parseInt(serverPortInput.value) || 25565;

    if (!ip) {
        showOfflineStatus('Podaj adres IP serwera', 'error');
        return;
    }
    if (!currentPlayer) {
        showOfflineStatus('Wybierz gracza', 'error');
        return;
    }

    const address = port === 25565 ? ip : `${ip}:${port}`;
    showOfflineStatus(`Dołączanie do ${address}...`, 'info');

    fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            player: currentPlayer,
            type: 'action',
            action: 'joinServer',
            ip: ip,
            port: port,
            resourcePacks: resourcePackEnabled
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showOfflineStatus(`Dołączanie do ${address}...`, 'success');
            } else {
                showOfflineStatus(data.message || 'Błąd połączenia', 'error');
            }
        })
        .catch(() => showOfflineStatus('Błąd połączenia z serwerem', 'error'));
});

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