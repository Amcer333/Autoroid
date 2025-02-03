const express = require("express");
const db = require("../db");
const { broadcast } = require("../websocket"); // Import broadcast from websocket.js

const router = express.Router();

// Add a Car Listing
router.post("/add", (req, res) => {
    console.log("Request body for adding car:", req.body);

    const { name, description, starting_price, seller_id } = req.body;

    if (!name || !description || !starting_price || !seller_id) {
        return res.status(400).json({ message: "All fields are required." });
    }

    db.run(
        "INSERT INTO cars (name, description, starting_price, seller_id, highest_bid) VALUES (?, ?, ?, ?, ?)",
        [name, description, starting_price, seller_id, starting_price],
        function (err) {
            if (err) {
                console.error("Error adding car:", err.message);
                return res.status(500).json({ message: "Error adding car." });
            }
            broadcast({ type: "car_added", carId: this.lastID, name, description, starting_price });
            res.json({ message: "Car added successfully!", carId: this.lastID });
        }
    );
});

// Place a Bid (with Validation)
router.post("/bid", (req, res) => {
    console.log("Request body for placing bid:", req.body);

    const { car_id, bid_amount } = req.body;

    if (!car_id || !bid_amount) {
        return res.status(400).json({ message: "Car ID and bid amount are required." });
    }

    db.get("SELECT highest_bid FROM cars WHERE id = ?", [car_id], (err, car) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ message: "Database error." });
        }

        if (!car) {
            return res.status(400).json({ message: "Car not found." });
        }

        if (bid_amount <= car.highest_bid) {
            return res.status(400).json({ message: "Bid must be higher than the current highest bid." });
        }

        db.run(
            "UPDATE cars SET highest_bid = ? WHERE id = ?",
            [bid_amount, car_id],
            (updateErr) => {
                if (updateErr) {
                    console.error("Error updating bid:", updateErr.message);
                    return res.status(500).json({ message: "Error placing bid." });
                }

                broadcast({ type: "bid_update", car_id, bid_amount });
                res.json({ message: "Bid placed successfully!" });
            }
        );
    });
});

// Get All Cars
router.get("/", (req, res) => {
    db.all("SELECT * FROM cars", [], (err, cars) => {
        if (err) {
            console.error("Error fetching cars:", err.message);
            return res.status(500).json({ message: "Error fetching cars." });
        }
        res.json(cars);
    });
});

module.exports = router;
