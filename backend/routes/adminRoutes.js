const express = require("express");
const db = require("../db");

const router = express.Router();

// ✅ Middleware to check if user is an admin
function isAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    const userId = authHeader.split(" ")[1]; // Extract token (user ID)

    db.get("SELECT role FROM users WHERE id = ?", [userId], (err, user) => {
        if (err || !user) {
            return res.status(403).json({ message: "Invalid user or user not found." });
        }
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        next();
    });
}

// ✅ Fetch all users (for dropdown)
router.get("/users", isAdmin, (req, res) => {
    db.all("SELECT id, username FROM users", [], (err, users) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching users." });
        }
        res.json(users);
    });
});

// ✅ Fetch all auctions (Fix: Use correct column names)
router.get("/auctions", isAdmin, (req, res) => {
    db.all("SELECT id, name, auction_status, countdown_timer, image_url FROM cars", [], (err, auctions) => {
        if (err) {
            console.error("Error fetching auctions:", err);
            return res.status(500).json({ message: "Error fetching auctions." });
        }
        res.json(auctions);
    });
});

module.exports = router;
