const express = require("express");
const db = require("../db");
const { broadcast } = require("../websocket");

const router = express.Router();

// Middleware to check if user is an admin
function isAdmin(req, res, next) {
    const { role } = req.body; // Expect role to be passed in request body
    if (role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
}

// ✅ Create a new user with a role
router.post("/create-user", isAdmin, (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: "All fields are required." });
    }

    db.run(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [username, password, role],
        function (err) {
            if (err) {
                return res.status(500).json({ message: "Error creating user." });
            }
            res.json({ message: "User created successfully!", userId: this.lastID });
        }
    );
});

// ✅ Delete a user
router.delete("/delete-user/:id", isAdmin, (req, res) => {
    const userId = req.params.id;

    db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
        if (err) {
            return res.status(500).json({ message: "Error deleting user." });
        }
        res.json({ message: "User deleted successfully." });
    });
});

// ✅ Get all users (for admin management)
router.get("/users", isAdmin, (req, res) => {
    db.all("SELECT id, username, role FROM users", [], (err, users) => {
        if (err) {
            return res.status(500).json({ message: "Error retrieving users." });
        }
        res.json(users);
    });
});

// ✅ Start an auction
router.post("/start-auction", isAdmin, (req, res) => {
    const { car_id } = req.body;

    db.run("UPDATE cars SET auction_status = 'active' WHERE id = ?", [car_id], function (err) {
        if (err) {
            return res.status(500).json({ message: "Error starting auction." });
        }
        // Notify all users that an auction has started
        broadcast({ type: "auction_update", car_id, status: "Aktiv" });
        res.json({ message: "Auction started successfully!" });
    });
});

// ✅ End an auction
router.post("/end-auction", isAdmin, (req, res) => {
    const { car_id } = req.body;

    db.run("UPDATE cars SET auction_status = 'ended' WHERE id = ?", [car_id], function (err) {
        if (err) {
            return res.status(500).json({ message: "Error ending auction." });
        }
        // Notify all users that an auction has ended
        broadcast({ type: "auction_update", car_id, status: "Beendet" });
        res.json({ message: "Auction ended successfully!" });
    });
});

// ✅ Delete an auction
router.delete("/delete-auction/:id", isAdmin, (req, res) => {
    const carId = req.params.id;

    db.run("DELETE FROM cars WHERE id = ?", [carId], function (err) {
        if (err) {
            return res.status(500).json({ message: "Error deleting auction." });
        }
        // Notify all users that an auction has been removed
        broadcast({ type: "auction_update", car_id: carId, status: "Gelöscht" });
        res.json({ message: "Auction deleted successfully." });
    });
});

module.exports = router;
