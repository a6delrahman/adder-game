function webSocketResponseHandler(handler) {
    return async (ws, data) => {
        try {
            const response = await handler(ws, data);
            ws.send(JSON.stringify({ type: 'success', payload: response }));
        } catch (error) {
            ws.send(JSON.stringify({ type: 'error', message: error.message, code: 500 }));
        }
    };
}

module.exports = webSocketResponseHandler;
