function playersAPI(req, res, wsManager) {
    try {
        const playersData = Array.from(wsManager.players.entries()).map(([name, data]) => ({
            name: name,
            serverIp: data.serverIp || 'Unknown',
            timestamp: data.timestamp
        }));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true,
            players: playersData,
            count: playersData.length
        }));
    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: false, 
            message: 'Internal server error' 
        }));
    }
}

module.exports = playersAPI;