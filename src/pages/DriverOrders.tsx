import React, { useState, useEffect } from 'react';
import { useTheme } from '../useTheme';
import { fetchAssignedOrdersForDriver, getOrders } from '../utils/orderStorage';
import type { Order } from '../utils/orderStorage';
import OrderCard from '../components/OrderCard';

const DriverOrders: React.FC = () => {
  const { theme } = useTheme();
  // Orders state: assigned to this driver (from backend)
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  // On mount, load orders from localStorage
  useEffect(() => {
    const local = getOrders();
    console.log('Loaded from localStorage on mount:', local);
    setOrders(local);
    setLoading(false);
  }, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');
  const assignedOrders: Order[] = orders.filter((o: Order) => o.status !== 'delivered' && o.status !== 'failed' && !!o.orderId);
  const filteredOrders = searchId.trim()
    ? assignedOrders.filter(o => {
        const orderIdStr = o.orderId !== undefined ? String(o.orderId).toLowerCase() : '';
        const search = searchId.trim().toLowerCase();
        return orderIdStr.includes(search);
      })
    : assignedOrders;

  // Manual sync: fetch assigned orders only when user clicks Sync
  const handleSync = () => {
    setLoading(true);
    fetchAssignedOrdersForDriver()
      .then(res => {
        console.log('Fetched orders from backend:', res.orders); // Debug log
        if (res.success) {
          // Normalize and merge new assigned orders into localStorage only if not already present
          const local = getOrders();
          const localIds = new Set(local.map(o => o.orderId ?? o.order_id));
          const normalized = res.orders.map((o: any) => ({
            ...o,
            orderId: o.orderId ?? o.order_id ?? undefined,
            cylinderType: o.cylinderType ?? o.cylinder_type ?? '',
            address: o.address ?? '',
            uniqueCode: o.uniqueCode ?? o.unique_code ?? '',
            serviceType: o.serviceType ?? o.service_type ?? '',
            timeSlot: o.timeSlot ?? o.time_slot ?? '',
            deliveryWindow: o.deliveryWindow ?? o.delivery_window ?? '',
            location: (typeof o.location_lat === 'number' && typeof o.location_lng === 'number')
              ? { lat: o.location_lat, lng: o.location_lng }
              : { lat: 0, lng: 0 },
          }));
          // Only add new orders not already in local
          const newOrders = normalized.filter(o => !localIds.has(o.orderId));
          const merged = [...local, ...newOrders];
          console.log('Merging local orders:', local);
          console.log('New assigned orders from backend:', normalized);
          console.log('Orders to add (not in local):', newOrders);
          console.log('Final merged orders to save:', merged);
          setOrders(merged);
          localStorage.setItem('tapgas_orders', JSON.stringify(merged));
          setError(null);
        } else {
          setOrders([]);
          setError(res.error || 'Failed to fetch assigned orders');
        }
      })
      .catch(() => {
        setOrders([]);
        setError('Failed to fetch assigned orders');
      })
      .finally(() => setLoading(false));
  };

  const updateOrderStatus = (orderId: string | number, status: string, failNote?: string) => {
    const updatedOrders = orders.map(order =>
      order.orderId === orderId
        ? { ...order, status, failedNote: failNote }
        : order
    );
    setOrders(updatedOrders);
    // Optionally, send status update to backend here in future
    localStorage.setItem('tapgas_orders', JSON.stringify(updatedOrders));
  };

  // Modal for failed delivery note
  const [failModalOrderId, setFailModalOrderId] = useState<string | number | null>(null);
  const [failNote, setFailNote] = useState('');
 
   // Modal for delivery confirmation with unique code
   const [deliverModalOrderId, setDeliverModalOrderId] = useState<string | number | null>(null);
   const [deliverCode, setDeliverCode] = useState('');
   const [deliverMatch, setDeliverMatch] = useState(false);


  // Info/help popup state
  const [showInfo, setShowInfo] = useState(false);
  const [showInfoIdx, setShowInfoIdx] = useState<null | string | number>(null);

  // Modal for sending order updates
  const [showSendModal, setShowSendModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

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
            Assigned Orders
          </h2>
          <button
            onClick={handleSync}
            style={{ marginLeft: '0.5rem', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '0.8rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
            title="Sync Assigned Orders"
          >Sync</button>
          <button
            onClick={() => setShowInfo(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: theme === 'dark' ? '#38bdf8' : '#0f172a', marginLeft: '0.5rem' }}
            title="Driver Help"
          >❓</button>
          <button
            onClick={() => { localStorage.removeItem('tapgas_orders'); setOrders([]); }}
            style={{ marginLeft: '1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.8rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
            title="Clear All Orders"
          >Clear Local Orders</button>
        </div>
        {/* Search by Order ID */}
        <div style={{ width: '100%', margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            type="text"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            placeholder="Search by Order ID..."
            style={{ width: '100%', maxWidth: '320px', padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', fontSize: '1rem', marginBottom: '0.7rem' }}
          />
          <button
            onClick={() => { setShowSendModal(true); setSendResult(null); }}
            style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '0.8rem', padding: '0.6rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', marginTop: '0.2rem', minWidth: '180px' }}
          >Send Order Updates</button>
        </div>
      {/* Send Order Updates Modal */}
      {showSendModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: theme === 'dark' ? '#23272f' : '#fff',
            borderRadius: '1.2rem',
            boxShadow: theme === 'dark' ? '0 4px 24px rgba(56,189,248,0.10)' : '0 4px 24px rgba(0,0,0,0.08)',
            padding: '2.5rem 1.5rem 2rem 1.5rem',
            maxWidth: '350px',
            width: '90vw',
            textAlign: 'center',
            color: theme === 'dark' ? '#22c55e' : '#0f172a',
            fontWeight: 600,
            fontSize: '1.1rem',
            position: 'relative',
          }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.7rem' }}>
              Send Order Updates
            </div>
            <div style={{ fontSize: '1rem', marginBottom: '0.7rem' }}>
              Have you completed all deliveries and want to sync your order status updates to the server?
            </div>
            {sendResult && (
              <div style={{ color: sendResult.startsWith('Success') ? '#22c55e' : '#ef4444', marginBottom: '1rem', fontWeight: 700 }}>{sendResult}</div>
            )}
            <button
              onClick={async () => {
                setSending(true);
                setSendResult(null);
                try {
                  // Only send orders with status not 'pending' (i.e., updated by driver)
                  const updatedOrders = orders.filter(o => o.status && o.status !== 'pending');
                  // Map to backend expected format: { orderId, status, failedNote }
                  const updates = updatedOrders.map(o => ({
                    orderId: o.orderId || o.order_id,
                    status: o.status,
                    failedNote: o.failedNote || o.failed_note || null
                  }));
                  const res = await fetch('/driver/update-orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ updates }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setSendResult('Success: Order updates sent!');
                    // Optionally, update local storage with backend response
                    if (Array.isArray(data.orders)) {
                      setOrders(data.orders);
                      localStorage.setItem('tapgas_orders', JSON.stringify(data.orders));
                    }
                  } else {
                    setSendResult('Error: ' + (data.error || 'Failed to update orders'));
                  }
                } catch (err) {
                  setSendResult('Error: Failed to send updates');
                } finally {
                  setSending(false);
                }
              }}
              style={{
                background: sending ? '#e5e7eb' : '#22c55e',
                color: sending ? '#64748b' : '#fff',
                border: 'none',
                borderRadius: '2rem',
                padding: '0.7rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: sending ? 'not-allowed' : 'pointer',
                marginRight: '0.7rem',
                marginBottom: '0.5rem',
              }}
              disabled={sending}
            >{sending ? 'Sending...' : 'Send Order Updates'}</button>
            <button
              onClick={() => { setShowSendModal(false); setSendResult(null); }}
              style={{
                background: theme === 'dark' ? '#334155' : '#e5e7eb',
                color: theme === 'dark' ? '#fbbf24' : '#0f172a',
                border: 'none',
                borderRadius: '2rem',
                padding: '0.7rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
              }}
            >Cancel</button>
          </div>
        </div>
      )}
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
            <div style={{ marginBottom: '0.7rem' }}>
              <b>Mark Picked Up:</b> Use this button when you have collected the cylinder from the customer. It updates the order status to <span style={{ color: '#38bdf8' }}>'On Way'</span>.
            </div>
            <div>
              <b>Mark Delivered:</b> Use this button after you have delivered the cylinder to the customer. After inputting the user's code, it updates the order status to <span style={{ color: '#22c55e' }}>'Delivered'</span>.
            </div>
            <button
              onClick={() => setShowInfo(false)}
              style={{ marginTop: '1rem', background: theme === 'dark' ? '#38bdf8' : '#0f172a', color: theme === 'dark' ? '#0f172a' : '#fff', border: 'none', borderRadius: '1rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}
            >Close</button>
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', margin: '2rem 0', color: theme === 'dark' ? '#38bdf8' : '#0f172a', fontWeight: 600 }}>
            Loading assigned orders...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', margin: '2rem 0', color: '#ef4444', fontWeight: 600 }}>
            {error}
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order: Order) => {
            // Only show multi-step for 'Order LPG Gas Refill' (not Buy Cylinder)
            const isOrderGas = typeof order.cylinderType === 'string' && !order.cylinderType.includes('Cylinder');
            // Provide fallbacks for required fields
            const safeOrder = {
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
            };
            return (
              <div key={order.orderId} style={{ width: '100%' }}>
                {/* Removed Order Details text and info icon */}
                <OrderCard order={safeOrder} role="driver" />
                {/* Removed Service Type, Time Slot, Delivery Window, and Pickup Fee extra box */}
                {/* Removed Delivery Note extra box */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {order.status === 'pending' && order.orderId && isOrderGas && (
                    <button
                      onClick={() => updateOrderStatus(order.orderId!, 'pickedup')}
                      style={{
                        background: theme === 'dark' ? '#fbbf24' : '#38bdf8',
                        color: theme === 'dark' ? '#0f172a' : '#fff',
                        border: 'none',
                        borderRadius: '2rem',
                        padding: '0.7rem 2rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                      }}
                    >Mark Picked Up</button>
                  )}
                  {order.status === 'pickedup' && order.orderId && isOrderGas && (
                    <button
                      onClick={() => updateOrderStatus(order.orderId!, 'onway')}
                      style={{
                        background: theme === 'dark' ? '#38bdf8' : '#fbbf24',
                        color: theme === 'dark' ? '#0f172a' : '#fff',
                        border: 'none',
                        borderRadius: '2rem',
                        padding: '0.7rem 2rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                      }}
                    >Start Delivery</button>
                  )}
                  {order.status === 'onway' && order.orderId && (
                    <>
                      <button
                        onClick={() => {
                          setDeliverModalOrderId(order.orderId);
                          setDeliverCode('');
                          setDeliverMatch(false);
                        }}
                        style={{
                          background: theme === 'dark' ? '#22c55e' : '#fbbf24',
                          color: theme === 'dark' ? '#0f172a' : '#fff',
                          border: 'none',
                          borderRadius: '2rem',
                          padding: '0.7rem 2rem',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                        }}
                      >Mark Delivered</button>
                      <button
                        onClick={() => { setFailModalOrderId(order.orderId as string | number); setFailNote(''); }}
                        style={{
                          background: theme === 'dark' ? '#ef4444' : '#cd1b1bff',
                          color: theme === 'dark' ? '#0f172a' : '#fff',
                          border: 'none',
                          borderRadius: '2rem',
                          padding: '0.7rem 2rem',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                          marginLeft: '0.5rem',
                        }}
                      >Mark Failed Delivery</button>
                    </>
                  )}
      {/* Delivered Confirmation Modal */}
      {deliverModalOrderId !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: theme === 'dark' ? '#23272f' : '#fff',
            borderRadius: '1.2rem',
            boxShadow: theme === 'dark' ? '0 4px 24px rgba(56,189,248,0.10)' : '0 4px 24px rgba(0,0,0,0.08)',
            padding: '2.5rem 1.5rem 2rem 1.5rem',
            maxWidth: '350px',
            width: '90vw',
            textAlign: 'center',
            color: theme === 'dark' ? '#22c55e' : '#0f172a',
            fontWeight: 600,
            fontSize: '1.1rem',
            position: 'relative',
          }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.7rem' }}>
              Confirm Delivery
            </div>
            <div style={{ fontSize: '1rem', marginBottom: '0.7rem' }}>
              Please enter the customer's 6-digit unique code:
            </div>
            <input
              type="text"
              value={deliverCode}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setDeliverCode(val);
                // Find the order and check code
                const order = orders.find(o => o.orderId === deliverModalOrderId);
                if (order && val.length === 6 && String(order.uniqueCode) === String(val)) {
                  setDeliverMatch(true);
                } else {
                  setDeliverMatch(false);
                }
              }}
              maxLength={6}
              placeholder="Enter 6-digit code"
              style={{ width: '100%', minHeight: '40px', padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginBottom: '1rem', fontSize: '1rem', textAlign: 'center' }}
            />
            {deliverMatch && (
              <div style={{ color: theme === 'dark' ? '#22c55e' : '#22c55e', fontWeight: 700, marginBottom: '1rem' }}>
                Order found
              </div>
            )}
            <button
              onClick={() => {
                if (deliverModalOrderId && deliverMatch) {
                  updateOrderStatus(deliverModalOrderId, 'delivered');
                  setDeliverModalOrderId(null);
                  setDeliverCode('');
                  setDeliverMatch(false);
                }
              }}
              style={{
                background: deliverMatch ? (theme === 'dark' ? '#22c55e' : '#fbbf24') : '#e5e7eb',
                color: deliverMatch ? (theme === 'dark' ? '#0f172a' : '#fff') : '#64748b',
                border: 'none',
                borderRadius: '2rem',
                padding: '0.7rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: deliverMatch ? 'pointer' : 'not-allowed',
                marginRight: '0.7rem',
                marginBottom: '0.5rem',
              }}
              disabled={!deliverMatch}
            >Delivered</button>
            <button
              onClick={() => {
                setDeliverModalOrderId(null);
                setDeliverCode('');
                setDeliverMatch(false);
              }}
              style={{
                background: theme === 'dark' ? '#334155' : '#e5e7eb',
                color: theme === 'dark' ? '#fbbf24' : '#0f172a',
                border: 'none',
                borderRadius: '2rem',
                padding: '0.7rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
              }}
            >Cancel</button>
          </div>
        </div>
    )}
  {/* Failed Delivery Modal */}
  {failModalOrderId !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: theme === 'dark' ? '#23272f' : '#fff',
            borderRadius: '1.2rem',
            boxShadow: theme === 'dark' ? '0 4px 24px rgba(56,189,248,0.10)' : '0 4px 24px rgba(0,0,0,0.08)',
            padding: '2.5rem 1.5rem 2rem 1.5rem',
            maxWidth: '350px',
            width: '90vw',
            textAlign: 'center',
            color: theme === 'dark' ? '#ef4444' : '#0f172a',
            fontWeight: 600,
            fontSize: '1.1rem',
            position: 'relative',
          }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.7rem' }}>
              Mark Failed Delivery
            </div>
            <div style={{ fontSize: '1rem', marginBottom: '0.7rem' }}>
              Please enter a comment or note for the customer:
            </div>
            <textarea
              value={failNote}
              onChange={e => setFailNote(e.target.value)}
              placeholder="Reason for failed delivery..."
              style={{ width: '100%', minHeight: '60px', padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginBottom: '1rem', fontSize: '1rem', resize: 'vertical' }}
            />
            <button
              onClick={() => {
                updateOrderStatus(failModalOrderId, 'failed', failNote);
                setFailModalOrderId(null);
                setFailNote('');
              }}
              style={{
                background: theme === 'dark' ? '#ef4444' : '#fbbf24',
                color: theme === 'dark' ? '#0f172a' : '#fff',
                border: 'none',
                borderRadius: '2rem',
                padding: '0.7rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                marginRight: '0.7rem',
              }}
              disabled={!failNote.trim()}
            >Submit Failed Delivery</button>
            <button
              onClick={() => { setFailModalOrderId(null); setFailNote(''); }}
              style={{
                background: theme === 'dark' ? '#334155' : '#e5e7eb',
                color: theme === 'dark' ? '#fbbf24' : '#0f172a',
                border: 'none',
                borderRadius: '2rem',
                padding: '0.7rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
              }}
            >Cancel</button>
          </div>
        </div>
      )}
                  </div>
                
                {/* For Buy Cylinder, keep old logic (if needed) */}
                {!isOrderGas && (
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {order.status === 'pending' && order.orderId && (
                      <button
                        onClick={() => updateOrderStatus(order.orderId as string | number, 'onway')}
                        style={{
                          background: theme === 'dark' ? '#38bdf8' : '#fbbf24',
                          color: theme === 'dark' ? '#0f172a' : '#fff',
                          border: 'none',
                          borderRadius: '2rem',
                          padding: '0.7rem 2rem',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                        }}
                      >Start Delivery</button>
                    )}
                    {/* Removed duplicate Mark Delivered button for Buy Cylinder */}
                  </div>
                )}
              </div>
            );
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
            color: theme === 'dark' ? '#fbbf24' : '#334155',
            fontWeight: 600,
            fontSize: '1.1rem',
          }}>
            <span role="img" aria-label="driver" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>🚚</span>
            No assigned orders yet.<br />Assigned orders will appear here for pickup and delivery.
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverOrders;
