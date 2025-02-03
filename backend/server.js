const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { initWebSocket } = require("./websocket");

const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const adminRoutes = require("./routes/adminRoutes"); // New Admin Routes

const app = express();
const server = require("http").createServer(app);

// Middleware
app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE", allowedHeaders: "Content-Type,Authorization" }));
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/admin", adminRoutes); // Register Admin Routes

// Initialize WebSocket
initWebSocket(server);

// Start Server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
