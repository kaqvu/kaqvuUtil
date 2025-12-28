function sendAPI(req, res, wsManager) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const { player, type, content } = data;

            if (!player || !type || !content) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Missing required fields' }));
                return;
            }

            if (type !== 'message' && type !== 'command') {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Invalid type' }));
                return;
            }

            let result;
            if (type === 'message') {
                result = wsManager.sendToMinecraft(player, 'chat', { message: content });
            } else {
                result = wsManager.sendToMinecraft(player, 'execute', { command: content });
            }

            res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
        }
    });
}

module.exports = sendAPI;
