import type { Order } from '../utils/orderStorage';
import React, { useState, useEffect } from 'react';
import IMAGE from '../assets/IMAGE.png';

// Animated SVG illustration component
interface AnimatedOrderStoryProps {
  theme: string;
}

const AnimatedOrderStory: React.FC<AnimatedOrderStoryProps> = ({ theme }) => {
  // 0 = Order LPG Gas Refill , 1 = Gas Station, 2 = Delivered
  const [step, setStep] = useState(0);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 0) timer = setTimeout(() => setStep(1), 1500);
    else if (step === 1) timer = setTimeout(() => setStep(2), 1500);
    else if (step === 2) timer = setTimeout(() => setStep(0), 1500);
    return () => clearTimeout(timer);
  }, [step]);
  // Cylinder positions for each step
  const positions = [0, 90, 180];
  return (
    <div style={{ width: '100%', maxWidth: '420px', display: 'flex', justifyContent: 'center', marginBottom: '2rem', overflowX: 'auto' }}>
      <svg style={{ width: '100%', height: 'auto', maxWidth: '320px', minWidth: '0' }} viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Road */}
        <rect x="20" y="60" width="280" height="12" rx="6" fill={theme === 'dark' ? '#334155' : '#e5e7eb'} />
        {/* Animation: cylinder starts from Order, changes to car before Gas Station, car for all other transitions */}
        {step === 0 ? (
          // Cylinder moves from Order, changes to car before Gas Station
          <g style={{ transform: `translateX(${positions[step]}px)`, transition: 'transform 1.2s cubic-bezier(.7,.2,.3,1)' }}>
            {/* Cylinder for first half, car for second half */}
            {/* Cylinder (left side) */}
            <rect x="40" y="30" width="20" height="32" rx="10" fill={theme === 'dark' ? '#38bdf8' : '#0f172a'} stroke={theme === 'dark' ? '#fbbf24' : '#38bdf8'} strokeWidth="2" />
            <rect x="45" y="22" width="10" height="10" rx="4" fill={theme === 'dark' ? '#fbbf24' : '#38bdf8'} />
            <ellipse cx="50" cy="62" rx="10" ry="4" fill={theme === 'dark' ? '#334155' : '#e5e7eb'} />
            <rect x="48" y="16" width="4" height="6" rx="2" fill={theme === 'dark' ? '#38bdf8' : '#0f172a'} />
            {/* Car (right side, overlapping for transition effect) */}
            <g style={{ opacity: positions[step] > 45 ? 1 : 0, transition: 'opacity 0.5s' }}>
              <rect x="38" y="40" width="24" height="12" rx="4" fill={theme === 'dark' ? '#38bdf8' : '#0f172a'} />
              <rect x="42" y="36" width="16" height="8" rx="2" fill={theme === 'dark' ? '#fbbf24' : '#38bdf8'} />
              <circle cx="44" cy="54" r="4" fill={theme === 'dark' ? '#fbbf24' : '#38bdf8'} />
              <circle cx="60" cy="54" r="4" fill={theme === 'dark' ? '#fbbf24' : '#38bdf8'} />
            </g>
          </g>
        ) : (
          // Car for all other transitions
          <g style={{ transform: `translateX(${positions[step]}px)`, transition: 'transform 1.2s cubic-bezier(.7,.2,.3,1)' }}>
            <rect x="38" y="40" width="24" height="12" rx="4" fill={theme === 'dark' ? '#38bdf8' : '#0f172a'} />
            <rect x="42" y="36" width="16" height="8" rx="2" fill={theme === 'dark' ? '#fbbf24' : '#38bdf8'} />
            <circle cx="44" cy="54" r="4" fill={theme === 'dark' ? '#fbbf24' : '#38bdf8'} />
            <circle cx="60" cy="54" r="4" fill={theme === 'dark' ? '#fbbf24' : '#38bdf8'} />
          </g>
        )}
        {/* Delivery box (appears at step 2) */}
        {step === 2 && (
          <g style={{ opacity: 1, transition: 'opacity 0.8s' }}>
           
          </g>
        )}
        {/* Story text */}
        <text x="50" y="78" fontSize="0.95rem" fill={theme === 'dark' ? '#fbbf24' : '#334155'} fontWeight="bold">Order</text>
        <text x="136" y="78" fontSize="0.95rem" fill={theme === 'dark' ? '#fbbf24' : '#334155'} fontWeight="bold">Gas Station</text>
        {step === 2 && <text x="238" y="78" fontSize="0.95rem" fill={theme === 'dark' ? '#fbbf24' : '#0f172a'} fontWeight="bold">Delivered</text>}
      </svg>
    </div>
  );
};

import { useTheme } from '../useTheme';
import { getOrders } from '../utils/orderStorage';
import { getProfile } from '../utils/profileStorage';
// ...existing code...
import OrderCard from '../components/OrderCard';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {

  const { theme } = useTheme();
  const [orders, setOrders] = useState<Order[]>(getOrders());
  useEffect(() => {
    setOrders(getOrders());
    // Listen for custom event to refresh orders after order placement
    const handler = () => setOrders(getOrders());
    window.addEventListener('tapgas-orders-updated', handler);

    // On mount, if there is a recent order, auto-fetch its latest data from backend (simulate Check Updates)
    const allOrders = getOrders();
    // Sort by date descending (most recent first)
    const sorted = [...allOrders].sort((a, b) => {
      const aDate = new Date(a.date || a.created_at || 0).getTime();
      const bDate = new Date(b.date || b.created_at || 0).getTime();
      return bDate - aDate;
    });
    const mostRecent = sorted[0];
    // Only auto-check if sessionStorage flag is set (after order placement)
    if (
      sessionStorage.getItem('tapgas_auto_check_order') === '1' &&
      mostRecent && mostRecent.uniqueCode && mostRecent.status !== 'delivered' && mostRecent.status !== 'failed'
    ) {
      setTimeout(() => {
        checkOrderUpdate(mostRecent, true);
        sessionStorage.removeItem('tapgas_auto_check_order');
      }, 500); // slight delay to allow UI to mount
    }

    return () => window.removeEventListener('tapgas-orders-updated', handler);
  }, []);
  // Show the most recent order, even if delivered or failed, until a new order is placed
  let activeOrders = orders.filter((o: Order) => o.status !== 'delivered' && o.status !== 'failed');
  if (activeOrders.length === 0 && orders.length > 0) {
    // Sort orders by date descending (most recent first)
    const sorted = [...orders].sort((a, b) => {
      const aDate = new Date(a.date || a.created_at || 0).getTime();
      const bDate = new Date(b.date || b.created_at || 0).getTime();
      return bDate - aDate;
    });
    // Show the most recent order (delivered or failed)
    activeOrders = [sorted[0]];
  }
  const profile = getProfile();

  // Helper: parse time window string (e.g. "2-4 pm") to [start, end] Date objects for today
  function parseTimeWindow(windowStr: string): [Date | null, Date | null] {
    if (!windowStr) return [null, null];
    // Example: "2-4 pm" or "10-12 am"
    const match = windowStr.match(/(\d{1,2})-(\d{1,2}) ?([ap]m)/i);
    if (!match) return [null, null];
  const [, startHStr, endHStr, ampm] = match;
    let startH = parseInt(startHStr, 10);
    let endH = parseInt(endHStr, 10);
    if (ampm.toLowerCase() === 'pm' && startH < 12) { startH += 12; endH += 12; }
    if (ampm.toLowerCase() === 'am' && startH === 12) { startH = 0; }
    if (ampm.toLowerCase() === 'am' && endH === 12) { endH = 0; }
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, 0, 0, 0);
    return [start, end];
  }

  // Helper: get delivery window as [start, end] Date objects
  function getDeliveryWindow(order: Order): [Date | null, Date | null] {
    if (!order.deliveryWindow) return [null, null];
    return parseTimeWindow(order.deliveryWindow);
  }

  // Helper: get drop-off/pickup window as [start, end] Date objects
  function getDropoffWindow(order: Order): [Date | null, Date | null] {
    if (!order.timeSlot) return [null, null];
    return parseTimeWindow(order.timeSlot);
  }

  // Track last fetched status for each order (in-memory, resets on reload)
  const [lastFetchedStatus, setLastFetchedStatus] = useState<{ [key: string]: string }>({});
  // Modal for check update messages
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [checkModalMsg, setCheckModalMsg] = useState('');

  async function checkOrderUpdate(order: Order, force: boolean = false): Promise<void> {
    if (!profile.email || !order.uniqueCode) {
      setCheckModalMsg('Missing email or unique code.');
      setShowCheckModal(true);
      return;
    }
    const now = new Date();
    const [dropStart, dropEnd] = getDropoffWindow(order);
    const [delivStart, delivEnd] = getDeliveryWindow(order);
    const status = order.status;
  const key = String(order.orderId ?? order.order_id ?? '');
  const lastStatus = lastFetchedStatus[key];

    if (!force) {
      // 1. Before drop-off/pickup window
      if (dropStart && now < dropStart) {
        setCheckModalMsg('No updates available yet. Please check back during your drop-off/pickup window.');
        setShowCheckModal(true);
        return;
      }

      // 2. During drop-off/pickup window
      if (dropStart && dropEnd && now >= dropStart && now <= dropEnd) {
        if (status === 'onway' || lastStatus === 'onway') {
          setCheckModalMsg('Order is on the way! You can check for updates again during your delivery window.');
          setShowCheckModal(true);
          return;
        }
        // Allow fetch
      }

      // 3. During delivery window
      if (delivStart && delivEnd && now >= delivStart && now <= delivEnd) {
        if (status === 'delivered' || status === 'failed' || lastStatus === 'delivered' || lastStatus === 'failed') {
          setCheckModalMsg('Order is complete. No further updates available.');
          setShowCheckModal(true);
          return;
        }
        // Allow fetch
      }

      // 4. After delivery window (up to 24h)
      if (delivEnd && now > delivEnd) {
        // Only allow fetch if not delivered/failed and within 24h
        const hoursSinceEnd = (now.getTime() - (delivEnd?.getTime?.() ?? 0)) / (1000 * 60 * 60);
        if ((status === 'delivered' || status === 'failed' || lastStatus === 'delivered' || lastStatus === 'failed') || hoursSinceEnd > 24) {
          setCheckModalMsg('Order is complete. No further updates available.');
          setShowCheckModal(true);
          return;
        }
        // Allow fetch
      }

      // If not in any window, block fetch
      if (
        (!dropStart || !dropEnd || now < dropStart) &&
        (!delivStart || !delivEnd || now < delivStart)
      ) {
        setCheckModalMsg('No updates available yet. Please check back during your drop-off/pickup or delivery window.');
        setShowCheckModal(true);
        return;
      }
    }

    // --- Fetch from cloud ---
    try {
  const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/order/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, uniqueCode: order.uniqueCode })
      });
      if (!res.ok) throw new Error('Failed to fetch order update');
      const data = await res.json();
      if (data && data.success && data.order) {
        // Normalize fetched order fields to camelCase
        const fetched = data.order;
        const normalizedOrder = {
          ...fetched,
          orderId: fetched.order_id || fetched.orderId,
          customerName: fetched.customer_name || fetched.customerName,
          cylinderType: fetched.cylinder_type || fetched.cylinderType,
          uniqueCode: fetched.unique_code || fetched.uniqueCode,
          payment: fetched.payment_method || fetched.payment,
          serviceType: fetched.service_type || fetched.serviceType,
          timeSlot: fetched.time_slot || fetched.timeSlot,
          deliveryWindow: fetched.delivery_window || fetched.deliveryWindow,
          failedNote: fetched.failed_note || fetched.failedNote,
          location: (typeof fetched.location_lat === 'number' && typeof fetched.location_lng === 'number')
            ? { lat: fetched.location_lat, lng: fetched.location_lng }
            : fetched.location || { lat: 0, lng: 0 },
        };
        const allOrders = getOrders();
        const updatedOrders = allOrders.map(o =>
          (o.orderId === normalizedOrder.orderId || o.order_id === normalizedOrder.orderId)
            ? { ...o, ...normalizedOrder }
            : o
        );
        localStorage.setItem('tapgas_orders', JSON.stringify(updatedOrders));
        setOrders(updatedOrders);
        // Track last fetched status for this order
        setLastFetchedStatus(prev => ({ ...prev, [normalizedOrder.orderId]: normalizedOrder.status }));
      } else {
        setCheckModalMsg('Order not found or error.');
        setShowCheckModal(true);
      }
    } catch (err) {
      setCheckModalMsg('Error checking order update.');
      setShowCheckModal(true);
      console.error(err);
    }
  }
  const navigate = useNavigate();
  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          background: theme === 'dark' ? '#18181b' : '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        <div style={{
        maxWidth: '420px',
        width: '100%',
        background: theme === 'dark' ? '#23272f' : '#fff',
        borderRadius: '1.2rem',
        boxShadow: theme === 'dark'
          ? '0 4px 24px rgba(56,189,248,0.10)'
          : '0 4px 24px rgba(0,0,0,0.08)',
        padding: '2.5rem 1.5rem 2rem 1.5rem',
    marginTop: '-0.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        <AnimatedOrderStory theme={theme} />
        <img
          src={IMAGE}
          alt="Home Visual"
          style={{
            width: '400px',
            height: '245px',
            borderRadius: '1.2rem',
            marginBottom: '3rem',
            boxShadow: theme === 'dark' ? '0 2px 12px #18181b' : '0 2px 12px #e5e7eb',
            objectFit: 'cover',
            display: 'block',
          }}
        />
  <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.2rem', width: '100%', justifyContent: 'center' }}>
          <button
            style={{
                           background: theme === 'dark' ? '#fbbf24' : '#38bdf8',
              color: theme === 'dark' ? '#0f172a' : '#fff',
              border: 'none',
              borderRadius: '2rem',
              padding: '0.8rem 2.2rem',
              fontSize: '1.1rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = theme === 'dark' ? '#0f172a' : '#38bdf8'}
            onMouseOut={e => e.currentTarget.style.background = theme === 'dark' ? '#38bdf8' : '#0f172a'}
            onClick={() => navigate('/order')}
          >Fill My Cylinder</button>
          {/* <button
            style={{
              background: theme === 'dark' ? '#fbbf24' : '#38bdf8',
              color: theme === 'dark' ? '#0f172a' : '#fff',
              border: 'none',
              borderRadius: '2rem',
              padding: '0.8rem 2.2rem',
              fontSize: '1.1rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = theme === 'dark' ? '#334155' : '#0f172a'}
            onMouseOut={e => e.currentTarget.style.background = theme === 'dark' ? '#fbbf24' : '#38bdf8'}
            onClick={() => navigate('/track')}
          >Track Order</button> */}
        </div>
       {/* <button
          onClick={() => { localStorage.removeItem('tapgas_orders'); window.location.reload(); }}
          style={{
            marginBottom: '1.5rem',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '0.8rem',
            padding: '0.5rem 1.2rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            width: '100%',
            maxWidth: '320px',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >Clear Local Orders</button> */}
        {/* Check Update Modal */}
        {showCheckModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.35)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              background: theme === 'dark' ? '#23272f' : '#fff',
              color: theme === 'dark' ? '#fbbf24' : '#0f172a',
              borderRadius: '1.2rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              padding: '2rem 2.2rem',
              maxWidth: '90vw',
              minWidth: '260px',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '1.1rem',
            }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>ℹ️</div>
              {checkModalMsg}
              <button
                style={{
                  marginTop: '1.5rem',
                  background: theme === 'dark' ? '#38bdf8' : '#0f172a',
                  color: theme === 'dark' ? '#0f172a' : '#fff',
                  border: 'none',
                  borderRadius: '0.8rem',
                  padding: '0.7rem 1.5rem',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
                onClick={() => setShowCheckModal(false)}
              >OK</button>
            </div>
          </div>
        )}
        <div style={{ margin: '1rem 0', width: '100%' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a', textAlign: 'center' }}>
                    Lastest Order Overview
                  </h2>
            {activeOrders.length > 0 ? (
              <div>
                 {activeOrders.filter(order => typeof order.orderId === 'string' || typeof order.orderId === 'number' || !order.orderId).map((order: Order) => {
                  // Always treat cylinderType as a string for .includes
                  const cylinderTypeStr = typeof order.cylinderType === 'string' ? order.cylinderType : '';
                  return (
                    <div key={order.orderId ?? order.uniqueCode} style={{ width: '100%' }}>
                      <OrderCard
                        order={{
                          ...order,
                          customerName: order.customerName ?? '',
                          address: order.address ?? '',
                          cylinderType: cylinderTypeStr,
                          uniqueCode: typeof order.uniqueCode === 'number' ? order.uniqueCode : (typeof order.uniqueCode === 'string' ? parseInt(order.uniqueCode, 10) || 0 : 0),
                          status: order.status ?? '',
                          date: order.date ?? '',
                          amountPaid: order.amountPaid ?? 0,
                          location: {
                            lat: typeof order.location?.lat === 'number' ? order.location.lat : 0,
                            lng: typeof order.location?.lng === 'number' ? order.location.lng : 0,
                          },
                        }}
                        onCheckUpdate={() => checkOrderUpdate(order)}
                        showCheckUpdate={order.status !== 'delivered' && order.status !== 'failed'}
                      />
                      {/* Show new workflow details for LPG Gas Refill */}
                      {/* Details for LPG Gas Refill now shown in info popup modal */}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                maxWidth: '350px',
                margin: '0rem auto',
                background: theme === 'dark' ? '#23272f' : '#f8fafc',
                borderRadius: '1.2rem',
                boxShadow: theme === 'dark' ? '0 2px 12px rgba(56,189,248,0.10)' : '0 2px 12px rgba(0,0,0,0.08)',
                padding: '2rem',
                textAlign: 'center',
                color: theme === 'dark' ? '#fbbf24' : '#334155',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}>
                <svg width="90" height="140" viewBox="0 0 90 140" style={{ display: 'block', margin: '0 auto 1.2rem auto' }}>
                  {/* Cylinder body */}
                  <rect x="20" y="30" width="50" height="80" rx="22" fill={theme === 'dark' ? '#334155' : '#38bdf8'} stroke={theme === 'dark' ? '#fbbf24' : '#0f172a'} strokeWidth="3" />
                  {/* Cylinder top */}
                  <rect x="32" y="15" width="25" height="20" rx="10" fill={theme === 'dark' ? '#fbbf24' : '#0f172a'} />
                  {/* Eyes (crying) */}
                  <ellipse cx="38" cy="60" rx="3" ry="5" fill="#fff" />
                  <ellipse cx="62" cy="60" rx="3" ry="5" fill="#fff" />
                  <ellipse cx="38" cy="65" rx="1.2" ry="2.2" fill="#38bdf8" />
                  <ellipse cx="62" cy="65" rx="1.2" ry="2.2" fill="#38bdf8" />
                  {/* Tears */}
                  <ellipse cx="38" cy="72" rx="1.1" ry="2.5" fill="#60a5fa" opacity="0.7" />
                  <ellipse cx="62" cy="72" rx="1.1" ry="2.5" fill="#60a5fa" opacity="0.7" />
                  {/* Sad mouth */}
                  <path d="M42 80 Q45 85 48 80" stroke="#0f172a" strokeWidth="2" fill="none" />
                  <path d="M52 80 Q55 85 58 80" stroke="#0f172a" strokeWidth="2" fill="none" />
                  {/* 3D shadow */}
                  <ellipse cx="45" cy="115" rx="18" ry="6" fill="#64748b" opacity="0.18" />
                </svg>
                <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Gas Yet!</div>
                <div style={{ fontWeight: 500, fontSize: '1rem', marginBottom: '1rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a' }}>
                  Your gas cylinder is empty and crying to be filled up.<br />Start a new order to bring it back to life!
                </div>
                <button
                  style={{
                    background: theme === 'dark' ? '#fbbf24' : '#38bdf8',
                    color: theme === 'dark' ? '#0f172a' : '#fff',
                    border: 'none',
                    borderRadius: '2rem',
                    padding: '0.7rem 2rem',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                  }}
                  onClick={() => navigate('/order')}
                >Fill My Cylinder</button>
              </div>
            )}
        </div>
        <div style={{ marginTop: '2rem', fontSize: '0.98rem', color: theme === 'dark' ? '#38bdf8' : '#64748b', fontWeight: 500 }}>
          <span>Fast•Secure•Reliable•</span>
        </div>
      </div>
    </div>
    </>
  );
};

export default Home;
