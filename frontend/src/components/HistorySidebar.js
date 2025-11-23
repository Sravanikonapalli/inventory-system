import React, { useEffect, useState } from 'react';
import { api } from '../api';
import '../styles/historySidebar.css'; 

export default function HistorySidebar({ productId, onClose }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!productId) return;
    let mounted = true;

    api.get(`/products/${productId}/history`)
      .then(res => {
        if (mounted) setHistory(res.data);
      })
      .catch(e => {
        console.error(e);
        setHistory([]);
      });

    return () => { mounted = false; };
  }, [productId]);

  if (!productId) return null;

  return (
    <div className="history-sidebar">
      <button onClick={onClose}>Close</button>
      <h3>Inventory History (Product #{productId})</h3>
      {history.length === 0 && <div>No history</div>}
      <ul>
        {history.map(h => (
          <li key={h.id}>
            <div><strong>{new Date(h.change_date).toLocaleString()}</strong></div>
            <div>Old: {h.old_quantity} → New: {h.new_quantity}</div>
            {h.user_info && <div>User: {h.user_info}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
