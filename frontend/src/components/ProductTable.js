import React from 'react';
import ProductRow from './ProductRow';
import '../styles/productTable.css'
export default function ProductTable({ products, onProductsUpdated, onViewHistory }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Unit</th>
          <th>Category</th>
          <th>Brand</th>
          <th>Stock</th>
          <th>Status</th>
          <th>Image</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.length === 0 ? (
          <tr><td colSpan={8}>No products</td></tr>
        ) : products.map(p => (
          <ProductRow key={p.id} product={p} onSaved={onProductsUpdated} onViewHistory={() => onViewHistory(p.id)} />
        ))}
      </tbody>
    </table>
  );
}
