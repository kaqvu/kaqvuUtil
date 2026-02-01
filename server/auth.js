const CREDENTIALS = {
    login: 'kaqvu',
    password: 'password'
};

function verifyToken(token) {
    if (!token) {
        return false;
    }

    try {
        const expectedToken = Buffer.from(`${CREDENTIALS.login}:${CREDENTIALS.password}`).toString('base64');
        return token === expectedToken;
    } catch (e) {
        return false;
    }
}

function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    return null;
}

module.exports = {
    verifyToken,
    extractToken
};
