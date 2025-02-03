const WebSocket = require("ws");

let wss;

// Initialize WebSocket Server
function initWebSocket(server) {
    wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
        console.log("New WebSocket connection");

        ws.on("message", (message) => {
            console.log("Received:", message);
        });

        ws.on("close", () => {
            console.log("WebSocket disconnected");
        });
    });
}

// Broadcast function to send updates to all connected clients
function broadcast(data) {
    if (!wss) {
        console.error("WebSocket server is not initialized.");
        return;
    }

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

module.exports = { initWebSocket, broadcast };
