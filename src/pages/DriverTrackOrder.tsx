import React, { useState } from 'react';
import { useTheme } from '../useTheme';
import { getOrders } from '../utils/orderStorage';

const statusSteps = [
  { label: 'Assigned', icon: '📝' },
  { label: 'Picked Up', icon: '🚚' },
  { label: 'Delivered', icon: '✅' },
];

const DriverTrackOrder: React.FC = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<'newest' | 'oldest'>('newest');
  const sortedOrders = [...getOrders()].filter(o => o.status !== 'delivered').sort((a, b) => {
    if (filter === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'dark' ? '#18181b' : '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
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
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '2rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a' }}>
          Track Assigned Orders
        </h2>
        <div style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <label style={{ fontWeight: 600, marginRight: '0.7rem', color: theme === 'dark' ? '#38bdf8' : '#334155' }}>Sort:</label>
          <select value={filter} onChange={e => setFilter(e.target.value as 'newest' | 'oldest')} style={{ padding: '0.5rem 1rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', fontSize: '1rem' }}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        {sortedOrders.map(order => {
          // Find current stage index
          const statusIndex = order.status === 'pending' ? 0 : order.status === 'onway' ? 1 : order.status === 'delivered' ? 2 : 0;
          return (
            <div key={order.orderId} style={{
              width: '100%',
              background: theme === 'dark' ? '#18181b' : '#f8fafc',
              borderRadius: '1rem',
              boxShadow: theme === 'dark' ? '0 2px 8px rgba(56,189,248,0.10)' : '0 2px 8px rgba(0,0,0,0.08)',
              padding: '1.2rem',
              marginBottom: '2rem',
            }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: theme === 'dark' ? '#38bdf8' : '#0f172a', marginBottom: '0.5rem' }}>
                Cylinder: {order.cylinderType}
              </div>
              <div style={{ fontSize: '0.98rem', marginBottom: '0.3rem' }}>Date: <span style={{ fontWeight: 600 }}>{order.date}</span></div>
              <div style={{ fontSize: '0.98rem', marginBottom: '0.3rem' }}>Order ID: <span style={{ fontWeight: 600 }}>{order.orderId}</span></div>
              <div style={{ width: '100%', marginBottom: '1rem', marginTop: '1.2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a' }}>Delivery Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {statusSteps.map((step, idx) => (
                    <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{step.icon}</span>
                      <span style={{
                        fontWeight: 700,
                        color: idx === statusIndex ? (theme === 'dark' ? '#fbbf24' : '#38bdf8') : (theme === 'dark' ? '#64748b' : '#64748b'),
                        fontSize: '1rem',
                        textDecoration: idx < statusIndex ? 'line-through' : 'none',
                        opacity: idx <= statusIndex ? 1 : 0.5,
                      }}>{step.label}</span>
                      {idx === statusIndex && (
                        <span style={{ marginLeft: 'auto', color: theme === 'dark' ? '#fbbf24' : '#0f172a', fontWeight: 600 }}>
                          Current
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Show map last */}
              {order.location && (
                <div style={{ margin: '0.7rem 0', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <iframe
                    title={`Order Location ${order.orderId}`}
                    src={`https://www.google.com/maps?q=${order.location.lat},${order.location.lng}&t=k&z=16&output=embed`}
                    width="100%"
                    height="120"
                    style={{ border: 0 }}
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          );
        })}
        <div style={{ marginTop: '2rem', fontSize: '0.98rem', color: theme === 'dark' ? '#38bdf8' : '#64748b', fontWeight: 500 }}>
          <span>Need help? Contact support for updates.</span>
        </div>
      </div>
    </div>
  );
};

export default DriverTrackOrder;
