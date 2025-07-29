'use client';

import { useState, useEffect } from 'react';

export default function ProductForm({ onSubmit, initialData = {} }) {
  const [product, setProduct] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    ...initialData
  });

  useEffect(() => {
    setProduct({ name: '', sku: '', description: '', price: '', ...initialData });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(product);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '2rem 0', border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
      <input type="text" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" required />
      <input type="text" name="sku" value={product.sku} onChange={handleChange} placeholder="SKU" required />
      <textarea name="description" value={product.description} onChange={handleChange} placeholder="Description"></textarea>
      <input type="number" name="price" value={product.price} onChange={handleChange} placeholder="Price" step="0.01" required />
      <button type="submit">Save Product</button>
    </form>
  );
}