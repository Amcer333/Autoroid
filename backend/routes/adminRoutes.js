const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

// ✅ Middleware to check if user is an admin
function isAdmin(req, res, next) {
    const userId = req.headers.authorization?.split(" ")[1];

    console.log("Admin check received user ID:", userId);

    if (!userId) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    db.get("SELECT role FROM users WHERE id = ?", [userId], (err, user) => {
        if (err || !user) {
            return res.status(403).json({ message: "Invalid user or user not found." });
        }
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        console.log("Admin verification passed for user ID:", userId);
        next();
    });
}

// ✅ Create a new user (Admin only)
router.post("/create-user", isAdmin, (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: "All fields are required." });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: "Error hashing password." });
        }

        db.run(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
            [username, hashedPassword, role],
            function (err) {
                if (err) {
                    return res.status(500).json({ message: "Error creating user." });
                }
                res.json({ message: "User created successfully!", userId: this.lastID });
            }
        );
    });
});

// ✅ Start an auction (Admin only)
router.post("/start-auction", isAdmin, (req, res) => {
    const { car_id } = req.body;

    db.run("UPDATE cars SET auction_status = 'active' WHERE id = ?", [car_id], function (err) {
        if (err) {
            return res.status(500).json({ message: "Error starting auction." });
        }
        res.json({ message: "Auction started successfully!" });
    });
});

// ✅ End an auction (Admin only)
router.post("/end-auction", isAdmin, (req, res) => {
    const { car_id } = req.body;

    db.run("UPDATE cars SET auction_status = 'ended' WHERE id = ?", [car_id], function (err) {
        if (err) {
            return res.status(500).json({ message: "Error ending auction." });
        }
        res.json({ message: "Auction ended successfully!" });
    });
});

module.exports = router;
