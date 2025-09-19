import type { Order } from '../utils/orderStorage';
import React from 'react';
import { useTheme } from '../useTheme';
import { getOrders } from '../utils/orderStorage';
import OrderCard from '../components/OrderCard';

const History: React.FC = () => {
  const { theme } = useTheme();
  const [view, setView] = React.useState<'delivered' | 'failed'>('delivered');
  const orders = getOrders();
  const deliveredOrders = orders.filter((o: Order) => o.status === 'delivered');
  const failedOrders = orders.filter((o: Order) => o.status === 'failed');
  return (
    <div style={{
      padding: '5rem 0.5rem 1.5rem 0.5rem', // top padding to offset fixed Navbar
      color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.2rem', textAlign: 'center' }}>
        Order History
      </h2>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <button
          onClick={() => setView('delivered')}
          style={{
            background: view === 'delivered' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
            color: view === 'delivered' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
            border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
          }}
        >Delivered</button>
        <button
          onClick={() => setView('failed')}
          style={{
            background: view === 'failed' ? (theme === 'dark' ? '#ef4444' : '#fbbf24') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
            color: view === 'failed' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
            border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
          }}
        >Failed Delivery</button>
      </div>
      {view === 'delivered' ? (
        deliveredOrders.length === 0 ? (
          <div style={{
            maxWidth: '350px',
            margin: '2rem auto',
            background: theme === 'dark' ? '#23272f' : '#f8fafc',
            borderRadius: '1.2rem',
            boxShadow: theme === 'dark' ? '0 2px 12px rgba(56,189,248,0.10)' : '0 2px 12px rgba(0,0,0,0.08)',
            padding: '2rem',
            textAlign: 'center',
            color: theme === 'dark' ? '#fbbf24' : '#334155',
            fontWeight: 600,
            fontSize: '1.1rem',
          }}>
            <span style={{ display: 'block', marginBottom: '1rem' }}>
              <svg width="60" height="90" viewBox="0 0 90 140" style={{ display: 'block', margin: '0 auto' }}>
                {/* Cylinder body */}
                <rect x="20" y="30" width="50" height="80" rx="22" fill={theme === 'dark' ? '#334155' : '#38bdf8'} stroke={theme === 'dark' ? '#fbbf24' : '#0f172a'} strokeWidth="3" />
                {/* Cylinder top */}
                <rect x="32" y="15" width="25" height="20" rx="10" fill={theme === 'dark' ? '#fbbf24' : '#0f172a'} />
                {/* Eyes (smiling) */}
                <ellipse cx="38" cy="60" rx="3" ry="5" fill="#fff" />
                <ellipse cx="62" cy="60" rx="3" ry="5" fill="#fff" />
                {/* Smile */}
                <path d="M40 75 Q45 85 50 75" stroke="#0f172a" strokeWidth="2" fill="none" />
                {/* 3D shadow */}
                <ellipse cx="45" cy="115" rx="18" ry="6" fill="#64748b" opacity="0.18" />
              </svg>
            </span>
            You have no completed deliveries yet.<br />Your delivered orders will appear here for easy reference.
          </div>
        ) : (
           deliveredOrders.map((order: Order) => {
             const normalizedOrder = {
               ...order,
               customerName: order.customerName ?? '',
               address: order.address ?? '',
               cylinderType: order.cylinderType ?? '',
               status: order.status ?? '',
               date: order.date ?? '',
               uniqueCode: Number(order.uniqueCode) || 0,
               amountPaid: Number(order.amountPaid) || 0,
               location: order.location && typeof order.location.lat === 'number' && typeof order.location.lng === 'number'
                 ? { lat: order.location.lat, lng: order.location.lng }
                 : undefined,
             };
             return <OrderCard key={order.orderId} order={normalizedOrder} />;
           })
        )
      ) : (
        failedOrders.length === 0 ? (
          <div style={{
            maxWidth: '350px',
            margin: '2rem auto',
            background: theme === 'dark' ? '#23272f' : '#f8fafc',
            borderRadius: '1.2rem',
            boxShadow: theme === 'dark' ? '0 2px 12px rgba(56,189,248,0.10)' : '0 2px 12px rgba(0,0,0,0.08)',
            padding: '2rem',
            textAlign: 'center',
            color: theme === 'dark' ? '#ef4444' : '#334155',
            fontWeight: 600,
            fontSize: '1.1rem',
          }}>
            <span role="img" aria-label="failed" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>❌</span>
            You have no failed deliveries.<br />Failed deliveries will appear here with driver comments.
          </div>
        ) : (
           failedOrders.filter(order => !!order.orderId).map((order: Order) => (
            <div key={order.orderId} style={{ width: '100%' }}>
              <OrderCard order={{
                ...order,
                customerName: order.customerName ?? '',
                address: order.address ?? '',
                cylinderType: order.cylinderType ?? '',
                status: order.status ?? '',
                date: order.date ?? '',
                uniqueCode: Number(order.uniqueCode) || 0,
                amountPaid: Number(order.amountPaid) || 0,
                location: order.location && typeof order.location.lat === 'number' && typeof order.location.lng === 'number'
                  ? { lat: order.location.lat, lng: order.location.lng }
                  : undefined,
              }} />
              {order.failedNote && (
                <div style={{
                  background: theme === 'dark' ? '#ef4444' : '#fb2424ff',
                  color: theme === 'dark' ? '#0f172a' : '#fff',
                  borderRadius: '0.8rem',
                  padding: '0.8rem 1.2rem',
                  margin: '0.5rem 0 1rem 0',
                  fontSize: '1rem',
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}>
                  <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>Driver Comment:</span>
                  {order.failedNote}
                  <p>To Reschedule for a Redelivery, Call Our Customer number: 116600</p>
                </div>
              )}
            </div>
          ))
        )
      )}
    </div>
  );
};

export default History;
