
import React, { useState } from 'react';
import LoginModal from '../components/LoginModal';
import { saveOrder } from '../utils/orderStorage';
import { useTheme } from '../useTheme';

const cylinderOptions = [
  { label: '3kg', value: '3kg' },
  { label: '6kg', value: '6kg' },
  { label: '12.5kg', value: '12.5kg' },
  { label: 'Other', value: 'other' },
];
const paymentOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Mobile Money', value: 'momo' },
];


const Order: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('authToken'));
  const { theme } = useTheme();
  const [orderType, setOrderType] = useState<'gas' | 'cylinder'>('gas');
  const [cylinder, setCylinder] = useState('');
  // New: Service type for LPG refill
  const [serviceType, setServiceType] = useState<'kiosk' | 'pickup' | null>(null);
  const [timeSlot, setTimeSlot] = useState<'morning' | 'evening' | null>(null);
  const [deliveryWindow, setDeliveryWindow] = useState<'sameDayEvening' | 'nextMorning' | 'nextEvening' | null>(null);
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [payment, setPayment] = useState('cash');
  const [showFillAnim, setShowFillAnim] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = (path: string) => { window.location.hash = path; };
  const [notes, setNotes] = useState('');
  const [filled, setFilled] = useState<'filled' | 'empty'>('filled');
  // Extra fee for pickup
  const pickupFee = serviceType === 'pickup' ? 500 : 0; // Example fee, can be dynamic

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    setShowFillAnim(true);
    setTimeout(() => {
      // Build order object
      const newOrder = {
        orderId: Date.now(),
        customerName: 'User', // Replace with actual user if available
        address,
        location: (() => {
          const match = address.match(/^Lat: (-?\d+\.\d+), Lng: (-?\d+\.\d+)$/);
          if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
          return undefined;
        })(),
        cylinderType: orderType === 'gas' ? cylinder : `${cylinder} Cylinder (${filled})`,
        uniqueCode: Math.floor(100000 + Math.random() * 900000),
        status: 'pending',
        date: new Date().toISOString().slice(0, 10),
        amountPaid: pickupFee, // Add pickup fee if applicable
        notes,
        payment,
        serviceType: orderType === 'gas' ? (serviceType === null ? undefined : serviceType) : undefined,
        timeSlot: orderType === 'gas' ? (timeSlot === null ? undefined : timeSlot) : undefined,
        deliveryWindow: orderType === 'gas' ? (deliveryWindow === null ? undefined : deliveryWindow) : undefined,
      };
      // Save order locally
      saveOrder(newOrder);
      // Save order in the cloud (backend)
  fetch('/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newOrder),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to save order in cloud');
          return res.json();
        })
        .catch(err => {
          // Optionally show error to user
          console.error('Cloud order save error:', err);
        })
        .finally(() => {
          setShowFillAnim(false);
          setSuccess(true);
          setTimeout(() => {
            setTimeout(() => {
              navigate('/track');
            }, 5000);
          }, 1200);
        });
    }, 1800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'dark' ? '#18181b' : '#fff',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Cylinder animation overlay */}
      {showFillAnim && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: theme === 'dark' ? 'rgba(24,24,27,0.98)' : 'rgba(248,250,252,0.98)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="120" height="240" viewBox="0 0 80 160" style={{ display: 'block' }}>
            {/* Cylinder outline */}
            <rect x="20" y="20" width="40" height="120" rx="20" fill={theme === 'dark' ? '#334155' : '#e5e7eb'} stroke={theme === 'dark' ? '#38bdf8' : '#0f172a'} strokeWidth="3" />
            {/* Cylinder top */}
            <rect x="30" y="10" width="20" height="20" rx="8" fill={theme === 'dark' ? '#38bdf8' : '#0f172a'} />
            {/* Animated gas fill */}
            <rect x="22" y="140" width="36" height="0" rx="18" fill={theme === 'dark' ? '#fbbf24' : '#38bdf8'}>
              <animate attributeName="y" from="140" to="40" dur="1.5s" fill="freeze" />
              <animate attributeName="height" from="0" to="100" dur="1.5s" fill="freeze" />
            </rect>
          </svg>
          <div style={{ marginTop: '2rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a', fontWeight: 700, fontSize: '1.3rem', textAlign: 'center' }}>
            Placing your order...
          </div>
        </div>
      )}
      {/* Success message overlay */}
      {success && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: theme === 'dark' ? 'rgba(24,24,27,0.98)' : 'rgba(248,250,252,0.98)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="120" height="240" viewBox="0 0 80 160" style={{ display: 'block' }}>
            <rect x="20" y="20" width="40" height="120" rx="20" fill={theme === 'dark' ? '#334155' : '#e5e7eb'} stroke={theme === 'dark' ? '#38bdf8' : '#0f172a'} strokeWidth="3" />
            <rect x="30" y="10" width="20" height="20" rx="8" fill={theme === 'dark' ? '#38bdf8' : '#0f172a'} />
            <rect x="22" y="40" width="36" height="100" rx="18" fill={theme === 'dark' ? '#fbbf24' : '#38bdf8'} />
            <text x="40" y="100" textAnchor="middle" fontSize="1.2rem" fill={theme === 'dark' ? '#fbbf24' : '#0f172a'} fontWeight="bold">✔</text>
          </svg>
          <div style={{ marginTop: '2rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a', fontWeight: 700, fontSize: '1.3rem', textAlign: 'center' }}>
            Order placed successfully!<br />Redirecting to Track Order...
          </div>
        </div>
      )}
      {/* Main order form UI */}
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
        display: success || showFillAnim ? 'none' : 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '2rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a' }}>
          Place a New Order
        </h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <button type="button" onClick={() => setOrderType('gas')} style={{
            background: orderType === 'gas' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
            color: orderType === 'gas' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
            border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
          }}>Order LPG Gas Refill</button>
          <button type="button" onClick={() => setOrderType('cylinder')} style={{
            background: orderType === 'cylinder' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
            color: orderType === 'cylinder' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
            border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
          }}>Buy Gas Cylinder</button>
        </div>
  <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155' }}>Cylinder Size</label>
            <select value={cylinder} onChange={e => setCylinder(e.target.value)} required style={{ width: '100%', padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginTop: '0.5rem', fontSize: '1rem' }}>
              <option value="" disabled>Select size</option>
              {cylinderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          {orderType === 'cylinder' && (
            <div>
              <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155' }}>Cylinder Fill Option</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setFilled('filled')} style={{
                  background: filled === 'filled' ? (theme === 'dark' ? '#fbbf24' : '#38bdf8') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                  color: filled === 'filled' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#38bdf8' : '#334155'),
                  border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
                }}>Filled with Gas</button>
                <button type="button" onClick={() => setFilled('empty')} style={{
                  background: filled === 'empty' ? (theme === 'dark' ? '#fbbf24' : '#38bdf8') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                  color: filled === 'empty' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#38bdf8' : '#334155'),
                  border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
                }}>Empty Cylinder</button>
              </div>
            </div>
          )}
          {/* New: Service type selection for LPG Gas Refill */}
          {orderType === 'gas' && (
            <>
              <div>
                <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155' }}>Choose Service Type</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => { setServiceType('kiosk'); setTimeSlot(null); setDeliveryWindow(null); }}
                    style={{
                      background: serviceType === 'kiosk' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                      color: serviceType === 'kiosk' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
                      border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
                    }}>Drop off at Kiosk</button>
                  <button type="button" onClick={() => { setServiceType('pickup'); setTimeSlot(null); setDeliveryWindow(null); }}
                    style={{
                      background: serviceType === 'pickup' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                      color: serviceType === 'pickup' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
                      border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
                    }}>Pickup from Home {pickupFee ? `(+₦${pickupFee})` : ''}</button>
                </div>
              </div>
              {/* Step 2: Time slot selection */}
              {serviceType && (
                <div>
                  <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155' }}>Select {serviceType === 'kiosk' ? 'Drop-off' : 'Pickup'} Time</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => { setTimeSlot('morning'); setDeliveryWindow(null); }}
                      style={{
                        background: timeSlot === 'morning' ? (theme === 'dark' ? '#fbbf24' : '#38bdf8') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                        color: timeSlot === 'morning' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#38bdf8' : '#334155'),
                        border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
                      }}>Morning (4:30–9:00 AM)</button>
                    <button type="button" onClick={() => { setTimeSlot('evening'); setDeliveryWindow(null); }}
                      style={{
                        background: timeSlot === 'evening' ? (theme === 'dark' ? '#fbbf24' : '#38bdf8') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                        color: timeSlot === 'evening' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#38bdf8' : '#334155'),
                        border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
                      }}>Evening (4:30–8:00 PM)</button>
                  </div>
                </div>
              )}
              {/* Step 3: Delivery window selection */}
              {serviceType && timeSlot && (
                <div>
                  <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155' }}>Choose Delivery Window</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {timeSlot === 'morning' ? (
                      <button type="button" onClick={() => setDeliveryWindow('sameDayEvening')}
                        style={{
                          background: deliveryWindow === 'sameDayEvening' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                          color: deliveryWindow === 'sameDayEvening' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
                          border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
                        }}>Same Day Evening (4:30–7:00 PM)</button>
                    ) : (
                      <>
                        <button type="button" onClick={() => setDeliveryWindow('nextMorning')}
                          style={{
                            background: deliveryWindow === 'nextMorning' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                            color: deliveryWindow === 'nextMorning' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
                            border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
                          }}>Next Morning (5:00–9:00 AM)</button>
                        <button type="button" onClick={() => setDeliveryWindow('nextEvening')}
                          style={{
                            background: deliveryWindow === 'nextEvening' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                            color: deliveryWindow === 'nextEvening' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
                            border: 'none', borderRadius: '1rem', padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s',
                          }}>Next Evening (4:30–8:00 PM)</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          {/* ...existing code... */}
          <div>
            <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155' }}>Address</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
              <input
                type="text"
                value={address}
                readOnly
                required
                placeholder="Click 'Use My Location'"
                style={{ flex: 1, padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', fontSize: '1rem', background: '#f1f5f9', color: '#64748b' }}
              />
              <button
                type="button"
                onClick={() => {
                  setLocating(true);
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      pos => {
                        const { latitude, longitude } = pos.coords;
                        setAddress(`Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`);
                        setLocating(false);
                      },
                      () => {
                        alert('Unable to get location. Please type your address.');
                        setLocating(false);
                      }
                    );
                  } else {
                    alert('Geolocation not supported.');
                    setLocating(false);
                  }
                }}
                style={{
                  background: theme === 'dark' ? '#38bdf8' : '#0f172a',
                  color: theme === 'dark' ? '#0f172a' : '#fff',
                  border: 'none', borderRadius: '0.8rem', padding: '0.7rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'background 0.2s', minWidth: '40px'
                }}
                disabled={locating}
              >{locating ? 'Locating...' : 'Use My Location'}</button>
            </div>
            {/* Satellite map view if address is coordinates (Google Maps) */}
            {/^Lat: (-?\d+\.\d+), Lng: (-?\d+\.\d+)$/.test(address) && (() => {
              const match = address.match(/^Lat: (-?\d+\.\d+), Lng: (-?\d+\.\d+)$/);
              if (!match) return null;
              const lat = match[1];
              const lng = match[2];
              // Google Maps embed with marker
              const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&t=k&z=16&output=embed`;
              return (
                <div style={{ marginTop: '1rem', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <iframe
                    title="Location Map"
                    src={mapUrl}
                    width="100%"
                    height="220"
                    style={{ border: 0 }}
                    allowFullScreen
                  />
                </div>
              );
            })()}
          </div>
          {/* ...existing code... */}
          <div>
            <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155' }}>Directions / Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add directions, landmarks, or extra info for delivery"
              style={{ width: '100%', minHeight: '60px', padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginTop: '0.5rem', fontSize: '1rem', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155' }}>Payment Method</label>
            <select value={payment} onChange={e => setPayment(e.target.value)} required style={{ width: '100%', padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginTop: '0.5rem', fontSize: '1rem' }}>
              {paymentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <button
            type="submit"
            style={{
              background: theme === 'dark' ? '#fbbf24' : '#38bdf8',
              color: theme === 'dark' ? '#0f172a' : '#fff',
              border: 'none', borderRadius: '2rem', padding: '0.9rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: isLoggedIn ? 'pointer' : 'not-allowed', marginTop: '1.2rem', transition: 'background 0.2s', opacity: isLoggedIn ? 1 : 0.7
            }}
            disabled={
              !isLoggedIn ||
              (orderType === 'gas' && (!cylinder || !serviceType || !timeSlot || !deliveryWindow || !address || !payment)) ||
              (orderType === 'cylinder' && (!cylinder || !filled || !address || !payment))
            }
          >
            {isLoggedIn ? 'Place Order' : 'Log in to Place Order'}
          </button>
          {!isLoggedIn && (
            <div style={{ marginTop: '1rem', color: '#ef4444', fontWeight: 600 }}>
              Please log in to place your order.
              <button type="button" onClick={() => setShowLogin(true)} style={{ marginLeft: '1rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '1rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Login</button>
            </div>
          )}
        {showLogin && (
          <LoginModal
            onSuccess={() => { setIsLoggedIn(true); setShowLogin(false); }}
            onClose={() => setShowLogin(false)}
            email={''}
          />
        )}
        </form>
        {showFillAnim && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', minHeight: '160px' }}>
            <svg width="80" height="160" viewBox="0 0 80 160" style={{ display: 'block' }}>
              {/* Cylinder outline */}
              <rect x="20" y="20" width="40" height="120" rx="20" fill={theme === 'dark' ? '#334155' : '#e5e7eb'} stroke={theme === 'dark' ? '#38bdf8' : '#0f172a'} strokeWidth="3" />
              {/* Cylinder top */}
              <rect x="30" y="10" width="20" height="20" rx="8" fill={theme === 'dark' ? '#38bdf8' : '#0f172a'} />
              {/* Animated gas fill */}
              <rect x="22" y="140" width="36" height="0" rx="18" fill={theme === 'dark' ? '#fbbf24' : '#38bdf8'}>
                <animate attributeName="y" from="140" to="40" dur="1.5s" fill="freeze" />
                <animate attributeName="height" from="0" to="100" dur="1.5s" fill="freeze" />
              </rect>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
