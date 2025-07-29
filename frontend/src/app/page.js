'use client';

import { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

import 'ag-grid-community/styles/ag-theme-quartz.css';

export default function Home() {
  const [rowData, setRowData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const gridRef = useRef();

  // Column Definitions: Add 'sortable: true' to each column
  const colDefs = [
    { field: 'name', headerName: 'Product Name', flex: 2, editable: true, sortable: true },
    { field: 'sku', headerName: 'SKU', flex: 1, editable: true, sortable: true },
    { field: 'description', headerName: 'Description', flex: 3, editable: true, sortable: true },
    { field: 'price', headerName: 'Price', flex: 1, editable: true, sortable: true, valueFormatter: p => `$${p.value}` }
  ];

  const fetchProducts = () => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => setRowData(data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCellValueChanged = async (event) => {
    const updatedProduct = event.data;
    await fetch(`http://localhost:3001/api/products/${updatedProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    });
    fetchProducts();
  };

  const handleAddRow = async () => {
    const newProduct = { name: 'New Product', sku: 'NEW-SKU', description: 'Description', price: 0 };
    const response = await fetch('http://localhost:3001/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    });
    if (response.ok) {
      fetchProducts();
    }
  };

  const handleDeleteRow = async () => {
    if (!selectedRow || !selectedRow.id) {
      alert('Please select a row to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedRow.name}?`)) {
      const response = await fetch(`http://localhost:3001/api/products/${selectedRow.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchProducts();
        setSelectedRow(null);
      }
    }
  };
  
  const onSelectionChanged = () => {
      const selectedNodes = gridRef.current.api.getSelectedNodes();
      const selectedData = selectedNodes.map(node => node.data)[0];
      setSelectedRow(selectedData);
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Product Master (AG Grid)</h1>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <button onClick={handleAddRow}>+ Add Product</button>
        <button onClick={handleDeleteRow}>- Delete Selected Product</button>
      </div>
      <div className="ag-theme-quartz" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          onCellValueChanged={handleCellValueChanged}
          rowSelection={'single'}
          onSelectionChanged={onSelectionChanged}
          // --- Pagination Props ---
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
        />
      </div>
    </main>
  );
}