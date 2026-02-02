function sendAPI(req, res, wsManager) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const { player, type, content, action, value } = data;

            if (!player) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Missing player' }));
                return;
            }

            let result;

            if (type === 'message' && content) {
                result = wsManager.sendToMinecraft(player, 'chat', { message: content });
            } else if (type === 'command' && content) {
                result = wsManager.sendToMinecraft(player, 'execute', { command: content });
            } else if (type === 'action' && action) {
                switch (action) {
                    case 'setSlot':
                        const slot = parseInt(value);
                        if (isNaN(slot) || slot < 0 || slot > 8) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: 'Slot must be 0-8' }));
                            return;
                        }
                        result = wsManager.sendToMinecraft(player, 'setSlot', { slot: slot });
                        break;
                    case 'leftClick':
                        result = wsManager.sendToMinecraft(player, 'leftClick', {});
                        break;
                    case 'rightClick':
                        result = wsManager.sendToMinecraft(player, 'rightClick', {});
                        break;
                    case 'guiClick':
                        const guiSlot = parseInt(data.slot);
                        const button = parseInt(data.button);
                        const shift = data.shift === true;
                        if (isNaN(guiSlot) || guiSlot < 0) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: 'Invalid slot' }));
                            return;
                        }
                        result = wsManager.sendToMinecraft(player, 'guiClick', { slot: guiSlot, button: button, shift: shift });
                        break;
                    default:
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Unknown action' }));
                        return;
                }
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Invalid request' }));
                return;
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
