'use client'; // This directive tells Next.js to run this code on the client (the browser)

import { useState, useEffect } from 'react';

export default function Home() {
  // 'useState' creates a state variable to store our products
  const [products, setProducts] = useState([]);

  // 'useEffect' runs code when the component first loads
  useEffect(() => {
    // Fetch data from our backend API
    fetch('http://localhost:3001/api/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []); // The empty array ensures this runs only once

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Product Master</h1>
      <hr />
      <div style={{ marginTop: '2rem' }}>
        <h2>Product List</h2>
        {products.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {products.map(product => (
              <li key={product.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '5px' }}>
                <h3 style={{ marginTop: 0 }}>{product.name}</h3>
                <p><strong>SKU:</strong> {product.sku}</p>
                <p><strong>Description:</strong> {product.description}</p>
                <p><strong>Price:</strong> ${product.price}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No products found. Try adding some with Thunder Client.</p>
        )}
      </div>
    </main>
  );
}