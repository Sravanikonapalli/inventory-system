import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://inventory-system-mxmq.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: false
});

// Download helper for CSV
export async function downloadExport() {
  const resp = await api.get('/products/export', { responseType: 'blob' });
  const blob = new Blob([resp.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
