const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const dbPath = "./database.sqlite";

// ✅ Check if database file exists, if not, create it
if (!fs.existsSync(dbPath)) {
    console.log("Database file not found. Creating a new database...");
    fs.writeFileSync(dbPath, "");
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to database", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// ✅ Create Users Table
db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
    )`
);

// ✅ Create Cars Table with Auction Fields
db.run(
    `CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        starting_price REAL,
        highest_bid REAL DEFAULT 0,
        auction_status TEXT DEFAULT 'pending', 
        countdown_timer INTEGER DEFAULT 0, 
        image_url TEXT DEFAULT '',
        seller_id INTEGER,
        FOREIGN KEY (seller_id) REFERENCES users (id)
    )`
);

module.exports = db;
