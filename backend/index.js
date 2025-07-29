const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3001;

const pool = new Pool({
  user: 'mds_user',
  host: 'localhost',
  database: 'mds_db',
  password: 'your_password', // <-- USE YOUR PASSWORD HERE
  port: 5432,
});

app.get('/api/db-test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    res.json({
      message: 'Database connection successful!',
      time: result.rows[0].now,
    });
    client.release();
  } catch (err) {
    console.error('Database connection error', err.stack);
    res.status(500).json({ error: 'Failed to connect to database' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});