require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3001;

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET all products (No changes needed)
app.get('/api/products', async (req, res) => {
  try {
    const allProducts = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(allProducts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET a single product by ID (No changes needed)
app.get('/api/products/:id', async (req, res) => {
    // ... (code is unchanged)
});

// CREATE a new product (Updated to include new fields)
app.post('/api/products', async (req, res) => {
  try {
    // Destructure all fields from the request body
    const { name, sku, description, price, category, stock_quantity, supplier, is_active } = req.body;
    const newProduct = await pool.query(
      'INSERT INTO products (name, sku, description, price, category, stock_quantity, supplier, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, sku, description, price, category, stock_quantity, supplier, is_active]
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE a product (Updated to include new fields)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, price, category, stock_quantity, supplier, is_active } = req.body;
    const updatedProduct = await pool.query(
      'UPDATE products SET name = $1, sku = $2, description = $3, price = $4, category = $5, stock_quantity = $6, supplier = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
      [name, sku, description, price, category, stock_quantity, supplier, is_active, id]
    );
    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updatedProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// The OLD version
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteOp = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});