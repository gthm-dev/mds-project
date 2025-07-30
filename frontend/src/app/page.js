'use client';

import { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import * as XLSX from 'xlsx';

ModuleRegistry.registerModules([AllCommunityModule]);

import 'ag-grid-community/styles/ag-theme-quartz.css';

export default function Home() {
  const [rowData, setRowData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const gridRef = useRef();

  const colDefs = [
    { field: 'name', headerName: 'Product Name', width: 250, editable: true, sortable: true, filter: 'agTextColumnFilter', pinned: 'left' },
    { field: 'sku', headerName: 'SKU', width: 150, editable: true, sortable: true, filter: 'agTextColumnFilter', pinned: 'left' },
    { field: 'category', headerName: 'Category', width: 150, editable: true, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'price', headerName: 'Price', width: 120, editable: true, sortable: true, filter: 'agNumberColumnFilter', valueFormatter: p => `₹${p.value}` },
    { field: 'stock_quantity', headerName: 'Stock', width: 120, editable: true, sortable: true, filter: 'agNumberColumnFilter' },
    { field: 'supplier', headerName: 'Supplier', width: 200, editable: true, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'is_active', headerName: 'Active', width: 100, editable: true, sortable: true },
    { field: 'description', headerName: 'Description', width: 300, editable: true, sortable: true, filter: 'agTextColumnFilter' },
  ];

  const fetchProducts = () => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => setRowData(data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  
  const handleFileUpload = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;
    reader.readAsArrayBuffer(file);

    reader.onload = async (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      for (const item of json) {
        const productData = {
          name: item.Name,
          sku: item.SKU,
          description: item.Description,
          price: item.Price,
          category: item.Category,
          stock_quantity: item['Stock Quantity'],
          supplier: item.Supplier,
          is_active: item['Is Active']
        };
        await fetch('http://localhost:3001/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      }
      alert('Import complete!');
      fetchProducts();
    };
  };

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
    const newProduct = { 
        name: 'New Product', 
        sku: 'NEW-SKU', 
        description: 'Description', 
        price: 0,
        category: 'Uncategorized',
        stock_quantity: 0,
        supplier: '',
        is_active: true
    };
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

    console.log('Attempting to delete:', selectedRow);
    
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
    <main>
      <h1>Product Master (AG Grid)</h1>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button onClick={handleAddRow}>+ Add Product</button>
        <button onClick={handleDeleteRow}>- Delete Selected Product</button>
        <label htmlFor="file-upload" className="custom-file-upload">
          Import from Excel
        </label>
        <input id="file-upload" type="file" onChange={handleFileUpload} accept=".xlsx, .xls" style={{ display: 'none' }}/>
      </div>
      <div className="ag-theme-quartz-dark" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          onCellValueChanged={handleCellValueChanged}
          rowSelection={'single'}
          onSelectionChanged={onSelectionChanged}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
        />
      </div>
    </main>
  );
}