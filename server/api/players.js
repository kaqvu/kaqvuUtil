function playersAPI(req, res, wsManager) {
    try {
        const players = wsManager.getPlayers();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true,
            players: players,
            count: players.length
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
