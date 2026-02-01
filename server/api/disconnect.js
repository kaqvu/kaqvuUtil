function disconnectAPI(req, res, wsManager) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const { player } = data;

            if (!player) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Missing player field' }));
                return;
            }

            const result = wsManager.disconnectPlayer(player);

            res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
        }
    });
}

module.exports = disconnectAPI;
