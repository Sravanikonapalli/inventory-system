import React, { useEffect, useState, useRef } from 'react';
import { api, downloadExport } from '../api';
import ProductTable from '../components/ProductTable';
import HistorySidebar from '../components/HistorySidebar';
import AddProductModal from '../components/AddProductModal';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef();

  // Fetch products and categories from backend
  async function fetchProducts(q = '', category = '') {
    try {
      const params = {};
      if (q) params.search = q;
      if (category) params.category = category;

      const res = await api.get('/products', { params });
      setProducts(res.data);

      // Fetch categories dynamically
      const catRes = await api.get('/products/categories');
      setCategoryList(catRes.data);
    } catch (e) {
      console.error(e);
      alert('Failed to fetch products');
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search handler
  async function onSearchSubmit(e) {
    e?.preventDefault();
    await fetchProducts(query, selectedCategory);
  }

  // CSV import
  async function triggerImport() {
    fileInputRef.current?.click();
  }

  async function handleFilePicked(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('csvFile', file);
    try {
      const res = await api.post('/products/import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(`Import finished. Added: ${res.data.addedCount}, Skipped: ${res.data.skippedCount}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Import failed');
    } finally {
      e.target.value = null;
    }
  }

  // Add new category
  async function addCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      alert(`Category "${newCategory}" added!`);
      setNewCategory('');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to add category');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Inventory</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <form onSubmit={onSearchSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products..."
          />
          <select
            value={selectedCategory}
            onChange={e => {
              setSelectedCategory(e.target.value);
              fetchProducts(query, e.target.value);
            }}
          >
            <option value="">All Categories</option>
            {categoryList.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit">Search</button>
        </form>

        {/* Import / Export / Add Product */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setIsAddModalOpen(true)}>Add New Product</button>
          <button onClick={triggerImport}>Import</button>
          <button onClick={downloadExport}>Export</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFilePicked}
          />
        </div>
      </div>

      {/*Add Category Form*/}
      <form onSubmit={addCategory} style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <input
          placeholder="New category name"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
        />
        <button type="submit">Add Category</button>
      </form>

      <ProductTable
        products={products}
        onProductsUpdated={() => fetchProducts(query, selectedCategory)}
        onViewHistory={(id) => setSelectedProductId(id)}
      />

      <HistorySidebar productId={selectedProductId} onClose={() => setSelectedProductId(null)} />

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={() => fetchProducts(query, selectedCategory)}
      />
    </div>
  );
}
