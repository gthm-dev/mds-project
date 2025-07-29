const cors = require('cors');
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(cors());
const port = 3001;

// Middleware to parse incoming JSON data from requests
app.use(express.json());

const pool = new Pool({
  user: 'mds_user',
  host: 'localhost',
  database: 'mds_db',
  password: 'your_password', // <-- USE YOUR PASSWORD HERE
  port: 5432,
});

// --- API ROUTES for PRODUCTS ---

// 1. GET all products
app.get('/api/products', async (req, res) => {
  try {
    const allProducts = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(allProducts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. GET a single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. CREATE a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, sku, description, price } = req.body;
    const newProduct = await pool.query(
      'INSERT INTO products (name, sku, description, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, sku, description, price]
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. UPDATE a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, price } = req.body;
    const updatedProduct = await pool.query(
      'UPDATE products SET name = $1, sku = $2, description = $3, price = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, sku, description, price, id]
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

// 5. DELETE a product
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