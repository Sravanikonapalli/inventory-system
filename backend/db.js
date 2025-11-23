const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./inventory.db');

db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS inventory_history`);
  db.run(`DROP TABLE IF EXISTS products`);

  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    unit TEXT,
    category TEXT,
    brand TEXT,
    stock INTEGER NOT NULL,
    status TEXT,
    image TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inventory_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    old_quantity INTEGER,
    new_quantity INTEGER,
    change_date TEXT,
    user_info TEXT,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);

  // Insert sample data
  const sampleSQL = require('fs').readFileSync('./sampledata.sql', 'utf-8');
  db.exec(sampleSQL, (err) => {
    if (err) console.error("Failed to insert sample data:", err);
    else console.log("Sample data inserted!");
  });
});

module.exports = db;
