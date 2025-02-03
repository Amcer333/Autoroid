const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite", (err) => {
    if (err) {
        console.error("Error connecting to database", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create Users Table
db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`
);

// Create Cars Table
db.run(
    `CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        starting_price REAL,
        highest_bid REAL DEFAULT 0,
        seller_id INTEGER,
        FOREIGN KEY (seller_id) REFERENCES users (id)
    )`
);

module.exports = db;
