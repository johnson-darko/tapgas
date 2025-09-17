import React from 'react';
import { useTheme } from '../useTheme';
import { getOrders } from '../utils/orderStorage';
import type { Order } from '../utils/orderStorage';
import OrderCard from '../components/OrderCard';

const DriverHistory: React.FC = () => {
  const { theme } = useTheme();
  const [view, setView] = React.useState<'delivered' | 'failed'>('delivered');
  const orders = getOrders();
  const deliveredOrders = orders.filter((o: Order) => o.status === 'delivered');
  const failedOrders = orders.filter((o: Order) => o.status === 'failed');

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
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '2rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a' }}>
          Driver History
        </h2>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', width: '100%' }}>
          <button
            onClick={() => setView('delivered')}
            style={{
              background: view === 'delivered' ? (theme === 'dark' ? '#22c55e' : '#fbbf24') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
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
          deliveredOrders.length > 0 ? (
            deliveredOrders.filter(order => !!order.orderId).map((order: Order) => {
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
          ) : (
            <div style={{
              maxWidth: '350px',
              margin: '2rem auto',
              background: theme === 'dark' ? '#23272f' : '#f8fafc',
              borderRadius: '1.2rem',
              boxShadow: theme === 'dark' ? '0 2px 12px rgba(56,189,248,0.10)' : '0 2px 12px rgba(0,0,0,0.08)',
              padding: '2rem',
              textAlign: 'center',
              color: theme === 'dark' ? '#22c55e' : '#334155',
              fontWeight: 600,
              fontSize: '1.1rem',
            }}>
              <span role="img" aria-label="delivered" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>✅</span>
              No delivered orders yet.<br />Delivered orders will appear here.
            </div>
          )
        ) : (
          failedOrders.length > 0 ? (
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
                  </div>
                )}
              </div>
            ))
          ) : (
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
              No failed deliveries yet.<br />Failed deliveries will appear here with your comments.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DriverHistory;
