const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

// ✅ User Registration (Admin Only)
router.post("/register", (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Hash password before storing
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
                res.json({ message: "User registered successfully!", userId: this.lastID });
            }
        );
    });
});

// ✅ User Login
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Log the user details to confirm role retrieval
        console.log("User found:", user);

        // Compare hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: "Error verifying password." });
            }

            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            console.log("User role on login:", user.role); // Debugging

            res.json({ 
                message: "Login successful!", 
                userId: user.id, 
                role: user.role 
            });
        });
    });
});

// ✅ Check User Role (Used to verify if user is an admin)
router.post("/check-role", (req, res) => {
    const userId = req.headers.authorization?.split(" ")[1];

    if (!userId) {
        console.error("Access denied: No token provided.");
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    db.get("SELECT role FROM users WHERE id = ?", [userId], (err, user) => {
        if (err || !user) {
            console.error("Invalid user ID or user not found.");
            return res.status(403).json({ message: "Invalid token or user not found." });
        }

        console.log("Role check response:", user.role); // Debugging

        res.json({ role: user.role });
    });
});

// ✅ Change Password (User Must Be Logged In)
router.post("/change-password", (req, res) => {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
        return res.status(400).json({ message: "User ID and new password are required." });
    }

    // Hash the new password before storing it
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: "Error hashing password." });
        }

        db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId], function (err) {
            if (err) {
                return res.status(500).json({ message: "Error updating password." });
            }
            res.json({ message: "Password changed successfully!" });
        });
    });
});

// ✅ Delete User (Admin Only)
router.delete("/delete-user/:id", (req, res) => {
    const { role } = req.body;

    if (role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const userId = req.params.id;
    db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
        if (err) {
            return res.status(500).json({ message: "Error deleting user." });
        }
        res.json({ message: "User deleted successfully." });
    });
});

module.exports = router;
