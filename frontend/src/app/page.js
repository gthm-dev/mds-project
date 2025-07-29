'use client';

import { useState, useEffect } from 'react';
import ProductForm from './components/ProductForm';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = () => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (productData) => {
    const response = await fetch('http://localhost:3001/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (response.ok) {
      fetchProducts(); // Re-fetch all products to update the list
      setIsFormVisible(false);
    }
  };

  const handleUpdate = async (productData) => {
    const response = await fetch(`http://localhost:3001/api/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (response.ok) {
      fetchProducts(); // Re-fetch
      setEditingProduct(null);
      setIsFormVisible(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchProducts(); // Re-fetch
      }
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsFormVisible(true);
  };

  const handleAddNewClick = () => {
    setEditingProduct(null);
    setIsFormVisible(true);
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Product Master</h1>
      <hr />

      {!isFormVisible && <button onClick={handleAddNewClick} style={{ marginTop: '1rem' }}>+ Add New Product</button>}

      {isFormVisible && (
        <div>
          <h2>{editingProduct ? 'Edit Product' : 'Create Product'}</h2>
          <ProductForm 
            onSubmit={editingProduct ? handleUpdate : handleCreate}
            initialData={editingProduct} 
          />
          <button onClick={() => setIsFormVisible(false)}>Cancel</button>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Product List</h2>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '5px' }}>
            <h3>{product.name}</h3>
            <p><strong>SKU:</strong> {product.sku}</p>
            <p><strong>Price:</strong> ${product.price}</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleEditClick(product)}>Edit</button>
              <button onClick={() => handleDelete(product.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}