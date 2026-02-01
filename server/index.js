const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocketManager = require('./websocket');
const sendAPI = require('./api/send');
const disconnectAPI = require('./api/disconnect');
const playersAPI = require('./api/players');

const PORT = process.env.PORT || 3000;
const wsManager = new WebSocketManager();

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname === '/') {
        res.writeHead(302, { 'Location': '/login' });
        res.end();
        return;
    }

    if (pathname === '/api/send' && req.method === 'POST') {
        sendAPI(req, res, wsManager);
        return;
    }

    if (pathname === '/api/disconnect' && req.method === 'POST') {
        disconnectAPI(req, res, wsManager);
        return;
    }

    if (pathname === '/api/players' && req.method === 'GET') {
        playersAPI(req, res, wsManager);
        return;
    }

    if (pathname === '/login' || pathname === '/login/') {
        serveFile(res, path.join(__dirname, '../public/login/index.html'), 'text/html');
        return;
    }

    if (pathname === '/panel' || pathname === '/panel/') {
        serveFile(res, path.join(__dirname, '../public/panel/index.html'), 'text/html');
        return;
    }

    if (pathname.startsWith('/login/')) {
        const file = pathname.slice(7);
        const filePath = path.join(__dirname, '../public/login', file);
        serveStaticFile(res, filePath);
        return;
    }

    if (pathname.startsWith('/panel/')) {
        const file = pathname.slice(7);
        const filePath = path.join(__dirname, '../public/panel', file);
        serveStaticFile(res, filePath);
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

function serveStaticFile(res, filePath) {
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

server.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});

wsManager.initialize(server);