import type { Order } from '../utils/orderStorage';
import React, { useState, useEffect } from 'react';

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
// ...existing code...
import OrderCard from '../components/OrderCard';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {

  const { theme } = useTheme();
  const orders = getOrders();
  // ...existing code...
  const activeOrders = orders.filter((o: Order) => o.status !== 'delivered');
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
    marginTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        <AnimatedOrderStory theme={theme} />
        <p style={{ fontSize: '1.15rem', marginBottom: '2rem', color: theme === 'dark' ? '#f1f5f9' : '#334155', fontWeight: 500 }}>
          Order LPG, Track, Deliver.<br />Fast, Secure, Reliable.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.2rem', width: '100%', justifyContent: 'center' }}>
          <button
            style={{
              background: theme === 'dark' ? '#38bdf8' : '#0f172a',
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
          >Order</button>
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
            onMouseOver={e => e.currentTarget.style.background = theme === 'dark' ? '#334155' : '#0f172a'}
            onMouseOut={e => e.currentTarget.style.background = theme === 'dark' ? '#fbbf24' : '#38bdf8'}
            onClick={() => navigate('/track')}
          >Track Order</button>
        </div>
        <div style={{ margin: '2rem 0', width: '100%' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a', textAlign: 'center' }}>
                    Lastest Order Overview
                  </h2>
            {activeOrders.length > 0 ? (
              <div>
                 {activeOrders.map((order: Order) => {
                  const isOrderGas = !order.cylinderType.includes('Cylinder');
                  return (
                    <div key={order.orderId} style={{ width: '100%' }}>
                      <OrderCard order={order} />
                      {/* Show new workflow details for LPG Gas Refill */}
                      {isOrderGas && (
                        <div style={{
                          margin: '0.5rem 0 1rem 0',
                          fontSize: '0.98rem',
                          fontWeight: 500,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}>
                          <div><b>Service Type:</b> {order.serviceType === 'kiosk' ? 'Drop off at Kiosk' : order.serviceType === 'pickup' ? 'Pickup from Home' : '-'}</div>
                          <div><b>Time Slot:</b> {order.timeSlot === 'morning' ? 'Morning (4:30–9:00 AM)' : order.timeSlot === 'evening' ? 'Evening (4:30–8:00 PM)' : '-'}</div>
                          <div><b>Delivery Window:</b> {
                            order.deliveryWindow === 'sameDayEvening' ? 'Same Day Evening (4:30–7:00 PM)' :
                            order.deliveryWindow === 'nextMorning' ? 'Next Morning (5:00–9:00 AM)' :
                            order.deliveryWindow === 'nextEvening' ? 'Next Evening (4:30–8:00 PM)' : '-'
                          }</div>
                          {order.pickupFee ? <div><b>Pickup Fee:</b> ₦{order.pickupFee}</div> : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
                <span role="img" aria-label="order" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>🛢️</span>
                You have no active orders.<br />Start a new order to see it here!
              </div>
            )}
        </div>
        <div style={{ marginTop: '2rem', fontSize: '0.98rem', color: theme === 'dark' ? '#38bdf8' : '#64748b', fontWeight: 500 }}>
          <span>100% Offline Support • Secure Pickup Codes • PWA Ready</span>
        </div>
      </div>
    </div>
    </>
  );
};

export default Home;
