import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { api } from '../api';
import '../styles/addProductModal.css'; 

Modal.setAppElement('#root'); // Accessibility

export default function AddProductModal({ isOpen, onClose, onSaved, product }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    unit: '',
    category: '',
    brand: '',
    stock: 0,
    status: 'active',
    image: null,
  });
  const [preview, setPreview] = useState(null); 

  useEffect(() => {
    if (!isOpen) return;

    api.get('/products/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));

    if (product) {
      setForm({
        name: product.name || '',
        unit: product.unit || '',
        category: product.category || '',
        brand: product.brand || '',
        stock: product.stock || 0,
        status: product.status || 'active',
        image: null,
      });
      setPreview(product.image ? `https://inventory-system-mxmq.onrender.com${product.image}` : null);
    } else {
      setForm({
        name: '',
        unit: '',
        category: '',
        brand: '',
        stock: 0,
        status: 'active',
        image: null,
      });
      setPreview(null);
    }
  }, [isOpen, product]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    setForm(f => ({ ...f, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const fd = new FormData();
      for (const key in form) {
        if (form[key] !== null) fd.append(key, form[key]);
      }

      if (product?.id) {
        await api.put(`/products/${product.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Add/Edit Product"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit} className="modal-form">
        <input required placeholder="Name" name="name" value={form.name} onChange={handleChange} />
        <input placeholder="Unit" name="unit" value={form.unit} onChange={handleChange} />
        <select required name="category" value={form.category} onChange={handleChange}>
          <option value="">Select Category</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Brand" name="brand" value={form.brand} onChange={handleChange} />
        <input type="number" placeholder="Stock" name="stock" value={form.stock} onChange={handleChange} />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && <img src={preview} alt="Preview" className="image-preview" />}
        <div className="modal-buttons">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">{product ? 'Save' : 'Add Product'}</button>
        </div>
      </form>
    </Modal>
  );
}
