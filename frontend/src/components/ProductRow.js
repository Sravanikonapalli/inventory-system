import React, { useState } from 'react';
import { api } from '../api';
import '../styles/productRow.css'
export default function ProductRow({ product, onSaved, onViewHistory }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ ...product });

  function statusLabel(stock) {
    return stock === 0 ? 'Out of Stock' : 'In Stock';
  }

  async function save() {
    try {
      await api.put(`/products/${product.id}`, draft);
      setIsEditing(false);
      onSaved?.();
    } catch (e) {
      console.error(e);
      alert('Save failed');
    }
  }

  async function del() {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${product.id}`);
      onSaved?.();
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  }

  return (
    <tr>
      <td>{isEditing ? <input value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} /> : product.name}</td>
      <td>{isEditing ? <input value={draft.unit || ''} onChange={e => setDraft({...draft, unit: e.target.value})} /> : product.unit || '-'}</td>
      <td>{isEditing ? <input value={draft.category || ''} onChange={e => setDraft({...draft, category: e.target.value})} /> : product.category}</td>
      <td>{isEditing ? <input value={draft.brand || ''} onChange={e => setDraft({...draft, brand: e.target.value})} /> : product.brand}</td>
      <td>{isEditing ? <input type="number" value={draft.stock} onChange={e => setDraft({...draft, stock: parseInt(e.target.value || 0, 10)})} /> : product.stock}</td>
      <td><span style={{ color: product.stock === 0 ? 'red' : 'green' }}>{statusLabel(product.stock)}</span></td>
      <td>
        {product.image ? (
            <img
            src={product.image.startsWith('http') ? product.image : `https://inventory-system-mxmq.onrender.com${product.image}`}
            alt={product.name}
            style={{ height: 30 }}
            />
        ) : (
            '-'
        )}
      </td>


      <td>
        {isEditing ? (
          <>
            <button onClick={save}>Save</button>
            <button onClick={() => { setIsEditing(false); setDraft({...product}); }}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={del}>Delete</button>
            <button onClick={onViewHistory}>History</button>
          </>
        )}
      </td>
    </tr>
  );
}
