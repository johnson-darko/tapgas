import React from 'react';
import { useTheme } from '../useTheme';
import { getOrders, ORDER_STORAGE_KEY } from '../utils/orderStorage';
import { syncOrdersFromBackend } from '../utils/orderStorage';
import type { Order } from '../utils/orderStorage';
import OrderCard from '../components/OrderCard';

const Admin: React.FC = () => {
  const { theme } = useTheme();
  const [view, setView] = React.useState<'all' | 'delivered' | 'failed' | 'analytics'>('all');
  const [sort, setSort] = React.useState<'newest' | 'oldest'>('newest');
  const [search, setSearch] = React.useState('');
  const [syncing, setSyncing] = React.useState(false);
  const [syncMsg, setSyncMsg] = React.useState<string | null>(null);
  const [orders, setOrders] = React.useState<Order[]>(getOrders());

  // Keep orders in sync with localStorage
  React.useEffect(() => {
    const handler = () => setOrders(getOrders());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
  let filteredOrders: Order[] = orders;
  if (view === 'delivered') filteredOrders = orders.filter((o: Order) => o.status === 'delivered');
  if (view === 'failed') filteredOrders = orders.filter((o: Order) => o.status === 'failed');
  if (search.trim()) {
    const searchLower = search.toLowerCase();
    filteredOrders = filteredOrders.filter((o: Order) =>
      (o.customerName ?? '').toLowerCase().includes(searchLower) ||
      (o.address ?? '').toLowerCase().includes(searchLower) ||
      (o.cylinderType && o.cylinderType.toLowerCase().includes(searchLower)) ||
      (o.notes && o.notes.toLowerCase().includes(searchLower)) ||
      (o.uniqueCode !== undefined && String(o.uniqueCode).toLowerCase().includes(searchLower)) ||
      (o.orderId !== undefined && String(o.orderId).toLowerCase().includes(searchLower))
    );
  }
  // Only keep orders with orderId
  filteredOrders = filteredOrders.filter((o: Order) => !!o.orderId);
  if (sort === 'newest') filteredOrders = [...filteredOrders].sort((a: Order, b: Order) => (b.orderId as string).localeCompare(a.orderId as string));
  if (sort === 'oldest') filteredOrders = [...filteredOrders].sort((a: Order, b: Order) => (a.orderId as string).localeCompare(b.orderId as string));

  return (
    <div style={{
      padding: '5rem 0.5rem 1.5rem 0.5rem',
      color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.2rem' }}>
        Admin Panel
      </h2>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <button
          onClick={async () => {
            setSyncing(true);
            setSyncMsg(null);
            const result = await syncOrdersFromBackend();
            setOrders(getOrders());
            if (result.success) {
              setSyncMsg(`Orders synced! (${result.count} total)`);
            } else {
              setSyncMsg(result.error || 'Sync failed');
            }
            setSyncing(false);
          }}
          style={{
            background: theme === 'dark' ? '#38bdf8' : '#0ea5e9',
            color: '#fff',
            border: 'none',
            borderRadius: '1rem',
            padding: '0.7rem 1.5rem',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: syncing ? 'not-allowed' : 'pointer',
            opacity: syncing ? 0.7 : 1,
          }}
          disabled={syncing}
          title="Sync all orders from cloud"
        >
          {syncing ? 'Syncing...' : 'Sync Orders'}
        </button>
        <button
          onClick={() => {
            localStorage.removeItem(ORDER_STORAGE_KEY);
            setOrders([]);
            setSyncMsg('All local orders cleared!');
          }}
          style={{
            background: theme === 'dark' ? '#ef4444' : '#f87171',
            color: '#fff',
            border: 'none',
            borderRadius: '1rem',
            padding: '0.7rem 1.5rem',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
          }}
          title="Clear all local orders"
        >
          Clear Orders
        </button>
      </div>
      {syncMsg && (
        <div style={{ margin: '0.5rem auto 1rem auto', color: theme === 'dark' ? '#fbbf24' : '#ef4444', fontWeight: 600 }}>
          {syncMsg}
        </div>
      )}
      <div style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: theme === 'dark' ? '#fbbf24' : '#38bdf8' }}>
        View and manage all orders
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <button onClick={() => setView('all')} style={{ background: view === 'all' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'), color: view === 'all' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'), border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>All Orders</button>
        <button onClick={() => setView('delivered')} style={{ background: view === 'delivered' ? (theme === 'dark' ? '#22c55e' : '#fbbf24') : (theme === 'dark' ? '#23272f' : '#e5e7eb'), color: view === 'delivered' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'), border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>Delivered</button>
        <button onClick={() => setView('failed')} style={{ background: view === 'failed' ? (theme === 'dark' ? '#ef4444' : '#fbbf24') : (theme === 'dark' ? '#23272f' : '#e5e7eb'), color: view === 'failed' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'), border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>Failed Delivery</button>
        <button onClick={() => setView('analytics')} style={{ background: view === 'analytics' ? (theme === 'dark' ? '#fbbf24' : '#38bdf8') : (theme === 'dark' ? '#23272f' : '#e5e7eb'), color: view === 'analytics' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'), border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>Analytics</button>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." style={{ padding: '0.7rem 1.2rem', borderRadius: '1rem', border: '1px solid #e5e7eb', fontSize: '1rem', minWidth: '180px' }} />
        <select value={sort} onChange={e => setSort(e.target.value as 'newest' | 'oldest')} style={{ padding: '0.7rem 1.2rem', borderRadius: '1rem', border: '1px solid #e5e7eb', fontSize: '1rem' }}>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
        </select>
      </div>
      {view !== 'analytics' ? (
        filteredOrders.length > 0 ? (
          filteredOrders.map((order: Order) => (
            <OrderCard
              key={order.orderId}
              order={{
                ...order,
                customerName: order.customerName ?? 'N/A',
                address: order.address ?? 'N/A',
                cylinderType: order.cylinderType ?? 'N/A',
                uniqueCode: typeof order.uniqueCode === 'number' ? order.uniqueCode : Number(order.uniqueCode) || 0,
                status: order.status ?? 'pending',
                date: order.date ?? '',
                amountPaid: order.amountPaid ?? 0,
                location: order.location && typeof order.location.lat === 'number' && typeof order.location.lng === 'number'
                  ? { lat: order.location.lat, lng: order.location.lng }
                  : { lat: 0, lng: 0 },
              }}
            />
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
            color: theme === 'dark' ? '#fbbf24' : '#334155',
            fontWeight: 600,
            fontSize: '1.1rem',
          }}>
            <span role="img" aria-label="admin" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>🗂️</span>
            No orders found for this view.
          </div>
        )
      ) : (
        (() => {
          // Analytics table logic
          const dropOffCounts: Record<string, number> = {};
          const deliveryCounts: Record<string, number> = {};
          const pickupCounts: Record<string, number> = {};
          orders.forEach((order: Order) => {
            if (order.timeSlot) {
              dropOffCounts[order.timeSlot] = (dropOffCounts[order.timeSlot] || 0) + 1;
            }
            if (order.deliveryWindow) {
              deliveryCounts[order.deliveryWindow] = (deliveryCounts[order.deliveryWindow] || 0) + 1;
            }
            if (order.pickupFee && order.timeSlot) {
              pickupCounts[order.timeSlot] = (pickupCounts[order.timeSlot] || 0) + 1;
            }
          });
          return (
            <div style={{ margin: '2rem auto', maxWidth: '420px', background: theme === 'dark' ? '#23272f' : '#f8fafc', borderRadius: '1.2rem', boxShadow: theme === 'dark' ? '0 2px 12px rgba(56,189,248,0.10)' : '0 2px 12px rgba(0,0,0,0.08)', padding: '2rem', color: theme === 'dark' ? '#fbbf24' : '#334155' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.2rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a' }}>Order Time Analytics</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ background: theme === 'dark' ? '#18181b' : '#e5e7eb' }}>
                    <th style={{ padding: '0.7rem', borderRadius: '0.5rem 0 0 0.5rem', fontWeight: 600 }}>Drop-off Time</th>
                    <th style={{ padding: '0.7rem', fontWeight: 600 }}>Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(dropOffCounts).map(([slot, count]) => (
                    <tr key={slot}>
                      <td style={{ padding: '0.7rem', borderBottom: '1px solid #e5e7eb' }}>{slot}</td>
                      <td style={{ padding: '0.7rem', borderBottom: '1px solid #e5e7eb' }}>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ background: theme === 'dark' ? '#18181b' : '#e5e7eb' }}>
                    <th style={{ padding: '0.7rem', borderRadius: '0.5rem 0 0 0.5rem', fontWeight: 600 }}>Pickup Time</th>
                    <th style={{ padding: '0.7rem', fontWeight: 600 }}>Pickups</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(pickupCounts).map(([slot, count]) => (
                    <tr key={slot}>
                      <td style={{ padding: '0.7rem', borderBottom: '1px solid #e5e7eb' }}>{slot}</td>
                      <td style={{ padding: '0.7rem', borderBottom: '1px solid #e5e7eb' }}>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: theme === 'dark' ? '#18181b' : '#e5e7eb' }}>
                    <th style={{ padding: '0.7rem', borderRadius: '0.5rem 0 0 0.5rem', fontWeight: 600 }}>Delivery Window</th>
                    <th style={{ padding: '0.7rem', fontWeight: 600 }}>Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(deliveryCounts).map(([window, count]) => (
                    <tr key={window}>
                      <td style={{ padding: '0.7rem', borderBottom: '1px solid #e5e7eb' }}>{window}</td>
                      <td style={{ padding: '0.7rem', borderBottom: '1px solid #e5e7eb' }}>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()
      )}
    </div>
  );
};

export default Admin;
