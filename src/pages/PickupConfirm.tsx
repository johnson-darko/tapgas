import React, { useState } from 'react';
import { useTheme } from '../useTheme';
import { getOrders } from '../utils/orderStorage'; 
import type { Order } from '../utils/orderStorage';
import OrderCard from '../components/OrderCard';

const PickupConfirm: React.FC = () => {
  const { theme } = useTheme();
  const [inputCode, setInputCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setError('');
    setConfirmed(false);
    const codeNum = parseInt(inputCode, 10);
    if (isNaN(codeNum) || inputCode.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      setFoundOrder(null);
      return;
    }
    const order = getOrders().find((o: Order) => o.uniqueCode === codeNum && o.status !== 'delivered');
    if (!order) {
      setError('No active order found for this code.');
      setFoundOrder(null);
      return;
    }
    setFoundOrder(order);
  };

  const handlePickup = () => {
    if (!foundOrder) return;
    // Update order status to 'onway' in local storage
    const orders = getOrders();
    const updatedOrders = orders.map((order: Order) =>
      order.orderId === foundOrder.orderId ? { ...order, status: 'onway' } : order
    );
    localStorage.setItem('tapgas_orders', JSON.stringify(updatedOrders));
    setConfirmed(true);
  };

  const [showInfo, setShowInfo] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'dark' ? '#18181b' : '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      overflowX: 'hidden',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        background: theme === 'dark' ? '#23272f' : '#fff',
        borderRadius: '1.2rem',
        boxShadow: theme === 'dark'
          ? '0 4px 24px rgba(56,189,248,0.10)'
          : '0 4px 24px rgba(0,0,0,0.08)',
        padding: '2.5rem 1.5rem 2rem 1.5rem',
        marginTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '2rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a', flex: 1 }}>
            Pickup Confirmation
          </h2>
          <button
            onClick={() => setShowInfo(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: theme === 'dark' ? '#38bdf8' : '#0f172a', marginLeft: '0.5rem' }}
            title="Driver Help"
          >❓</button>
        </div>
        {showInfo && (
          <div style={{
            position: 'absolute',
            top: '3.5rem',
            right: '1.5rem',
            background: theme === 'dark' ? '#23272f' : '#fff',
            border: '1px solid #38bdf8',
            borderRadius: '1rem',
            boxShadow: '0 2px 12px rgba(56,189,248,0.10)',
            padding: '1.2rem',
            zIndex: 100,
            maxWidth: '320px',
            color: theme === 'dark' ? '#fbbf24' : '#0f172a',
          }}>
            <div style={{ fontWeight: 700, marginBottom: '0.7rem', fontSize: '1.1rem' }}>Driver Actions</div>
            <div>
              <b>Confirm Pickup:</b> Enter or scan the customer's 6-digit code to find their order. Use this button when you have collected the cylinder from the customer. It updates the order status to <span style={{ color: '#38bdf8' }}>'On Way'</span>.
            </div>
            <button
              onClick={() => setShowInfo(false)}
              style={{ marginTop: '1rem', background: theme === 'dark' ? '#38bdf8' : '#0f172a', color: theme === 'dark' ? '#0f172a' : '#fff', border: 'none', borderRadius: '1rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}
            >Close</button>
          </div>
        )}
        <div style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'center' }}>
          <input
            type="text"
            value={inputCode}
            onChange={e => setInputCode(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            placeholder="Enter 6-digit code"
            style={{
              padding: '0.9rem',
              borderRadius: '1rem',
              border: '1px solid #e5e7eb',
              fontSize: '1.2rem',
              width: '70%',
              marginBottom: '1rem',
              textAlign: 'center',
            }}
          />
          <button
            onClick={handleConfirm}
            style={{
              background: theme === 'dark' ? '#38bdf8' : '#0f172a',
              color: theme === 'dark' ? '#0f172a' : '#fff',
              border: 'none',
              borderRadius: '2rem',
              padding: '0.7rem 2rem',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              marginLeft: '1rem',
            }}
          >Find Order</button>
        </div>
        {error && <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: '1rem' }}>{error}</div>}
        {foundOrder && !confirmed && (
          <div style={{ width: '100%', marginBottom: '2rem' }}>
            <OrderCard order={foundOrder} />
            <button
              onClick={handlePickup}
              style={{
                background: theme === 'dark' ? '#fbbf24' : '#22c55e',
                color: theme === 'dark' ? '#0f172a' : '#fff',
                border: 'none',
                borderRadius: '2rem',
                padding: '0.9rem 2.5rem',
                fontSize: '1.1rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                marginTop: '1.2rem',
                transition: 'background 0.2s',
              }}
            >Confirm Pickup</button>
          </div>
        )}
        {confirmed && (
          <div style={{ color: theme === 'dark' ? '#38bdf8' : '#22c55e', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center', marginTop: '2rem' }}>
            Pickup confirmed! Order status updated to 'On Way'.
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupConfirm;
