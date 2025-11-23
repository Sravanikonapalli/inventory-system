const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csvParser = require("csv-parser");
const { Parser } = require("json2csv");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "_" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

// GET ALL PRODUCTS
router.get("/", (req, res) => {
  const { page = 1, limit = 1000, sortBy = "id", order = "ASC", category, search } = req.query;
  const offset = (page - 1) * limit;

  let baseQuery = "SELECT * FROM products";
  const whereParts = [];
  const params = [];

  if (category) { whereParts.push("category = ?"); params.push(category); }
  if (search) { whereParts.push("name LIKE ?"); params.push(`%${search}%`); }
  if (whereParts.length) baseQuery += ` WHERE ${whereParts.join(" AND ")}`;
  baseQuery += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  db.all(baseQuery, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// GET CATEGORIES
router.get("/categories", (req, res) => {
  db.all("SELECT DISTINCT category FROM products WHERE category IS NOT NULL", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.category));
  });
});

// ADD PRODUCT
router.post("/", upload.single("image"), (req, res) => {
  const { name, unit = "", category = "", brand = "", stock = 0, status = "active" } = req.body;
  if (!name) return res.status(400).json({ error: "Product name required" });

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `INSERT INTO products (name, unit, category, brand, stock, status, image)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [name, unit, category, brand, stock, status, imagePath], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: "Product added", image: imagePath });
  });
});

// UPDATE PRODUCT
router.put("/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, unit, category, brand, stock, status } = req.body;

  let sql = `UPDATE products SET name=?, unit=?, category=?, brand=?, stock=?, status=?`;
  const params = [name, unit, category, brand, stock, status];

  if (req.file) {
    const imagePath = `/uploads/${req.file.filename}`;
    sql += ", image=?";
    params.push(imagePath);
  }

  sql += " WHERE id=?";
  params.push(id);

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});


// DELETE PRODUCT
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM products WHERE id=?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// GET PRODUCT HISTORY
router.get("/:id/history", (req, res) => {
  const { id } = req.params;
  db.all(
    `SELECT * FROM inventory_history WHERE product_id=? ORDER BY change_date DESC`,
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// IMPORT CSV
router.post("/import", upload.single("csvFile"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = path.join(__dirname, `upload_${Date.now()}.csv`);
  fs.writeFileSync(filePath, req.file.buffer);

  let added = 0, skipped = 0;

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", row => {
      const sql = `INSERT OR IGNORE INTO products (name, unit, category, brand, stock, status)
                   VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(
        sql,
        [
          row.name, 
          row.unit || "", 
          row.category || "", 
          row.brand || "", 
          row.stock || 0, 
          row.status || "active"
        ],
        function (err) {
          if (!err && this.changes > 0) added++;
          else skipped++;
        }
      );
    })
    .on("end", () => {
      fs.unlinkSync(filePath);
      res.json({ addedCount: added, skippedCount: skipped });
    });
});


router.get("/export", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const json2csv = new Parser({ fields: ['id','name','unit','category','brand','stock','status','image'] });
    const csv = json2csv.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("products_export.csv");
    res.send(csv);
  });
});


module.exports = router;
