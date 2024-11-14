const setupSSE = async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendUpdate = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    req.app.locals.sseClients.push(sendUpdate);

    req.on('close', () => {
        req.app.locals.sseClients = req.app.locals.sseClients.filter(client => client !== sendUpdate);
    });
};

const broadcastSSE = async (app, data) => {
    app.locals.sseClients.forEach(client => client(data));
};

module.exports = { setupSSE, broadcastSSE };