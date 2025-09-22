// --- DELIVERY FEE CONFIGURATION ---
// Adjust these variables to change the delivery fee logic.
// You can later move these to a config file or .env if needed.

// --- DELIVERY FEE CONFIGURATION ---
// 0-20km: ₵5 flat. Every km above 20km: ₵0.7 per km extra (rounded up to next cedi if decimal)
const DELIVERY_BASE_FEE = 5; // Flat fee for 0-20km (in cedis)
const DELIVERY_PER_KM_RATE = 0.7; // Per-km rate above 20km (in cedis)


/**
 * Calculates the delivery fee based on distance (in kilometers).
 * 0-20km: ₵5 flat. Every km above 20km: ₵0.7 per km extra (rounded up to next cedi if decimal)
 * @param {number} distanceKm - The straight-line distance in kilometers.
 * @returns {number} - The calculated delivery fee in cedis (₵)
 */
function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm <= 20) {
    return DELIVERY_BASE_FEE;
  } else {
    const extraKm = distanceKm - 20;
    const fee = DELIVERY_BASE_FEE + (DELIVERY_PER_KM_RATE * extraKm);
    // Always round up to the next cedi if decimal
    return Math.ceil(fee);
  }
}
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// LPG Station type
type LpgStation = {
  name: string;
  lat: number;
  lng: number;
};

// Custom hook to fetch LPG stations from JSON
function useLpgStations() {
  const [stations, setStations] = useState<LpgStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/lpg_stations.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load LPG stations');
        return res.json();
      })
      .then(data => {
        setStations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Could not load LPG station data');
        setLoading(false);
      });
  }, []);

  return { stations, loading, error };
}
// Type for other addresses (should match Profile.tsx)
type OtherAddress = {
  name: string;
  phone: string;
  lat: string;
  lng: string;
};

function getOtherAddresses(): OtherAddress[] {
  try {
    return JSON.parse(localStorage.getItem('tapgas_other_addresses') || '[]');
  } catch {
    return [];
  }
}
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { scheduleOrderReminderNotification } from '../utils/localNotification';
import LoginModal from '../components/LoginModal';
import { saveOrder, getOrders } from '../utils/orderStorage';
import type { Order as OrderType } from '../utils/orderStorage';
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
  // Delivery fee and distance state (must be defined here for use in render)
  const [deliveryFee, setDeliveryFee] = useState<number>(DELIVERY_BASE_FEE);
  const [distanceToStation, setDistanceToStation] = useState<number | null>(null);

  // Update delivery fee when distance changes
  useEffect(() => {
    if (distanceToStation !== null && !isNaN(distanceToStation)) {
      setDeliveryFee(calculateDeliveryFee(distanceToStation));
    } else {
      setDeliveryFee(DELIVERY_BASE_FEE);
    }
  }, [distanceToStation]);
  // Load LPG stations
  const { stations: lpgStations, loading: stationsLoading, error: stationsError } = useLpgStations();
  // Referral code input state
  const [referralCode, setReferralCode] = useState('');
  // Track if user has already been referred (from profile/localStorage)
  const [alreadyReferred, setAlreadyReferred] = useState(false);
  const [myReferralCode, setMyReferralCode] = useState('');
  // Modal state for own referral code error
  const [showOwnReferralModal, setShowOwnReferralModal] = useState(false);
  // New modal state for invalid referral code
  const [showInvalidReferralModal, setShowInvalidReferralModal] = useState(false);

  React.useEffect(() => {
    // Always load referral_code from profile for validation
    try {
      const profile = JSON.parse(localStorage.getItem('profile') || '{}');
      if (profile && profile.referral_code) setMyReferralCode(profile.referral_code);
      if (profile && profile.referred_by) setAlreadyReferred(true);
    } catch {
      // ignore
    }
  }, []);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('authToken'));
  const { theme } = useTheme();
  const [orderType, setOrderType] = useState<'gas' | 'cylinder'>('gas');
  // Info modal state
  const [infoModal, setInfoModal] = useState<{ open: boolean, text: string }>({ open: false, text: '' });
  const [cylinder, setCylinder] = useState('');
  // New: Service type for LPG refill
  const [serviceType, setServiceType] = useState<'kiosk' | 'pickup' | null>(null);
  const [timeSlot, setTimeSlot] = useState<'morning' | 'evening' | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });

  // Helper: parse time window string (e.g. "4:30–9:00 AM") to [start, end] Date objects for today
  function parseTimeWindowStr(windowStr: string): [Date, Date] | [null, null] {
    // Example: "4:30–9:00 AM" or "4:30–8:00 PM"
    const match = windowStr.match(/(\d{1,2}):(\d{2})[–-](\d{1,2}):(\d{2}) ?([AP]M)/i);
    if (!match) return [null, null];
    const [, startH, startM, endH, endM, ampm] = match;
    let sH = parseInt(startH, 10);
  const sM = parseInt(startM, 10);
  let eH = parseInt(endH, 10);
  const eM = parseInt(endM, 10);
    if (ampm.toLowerCase() === 'pm' && sH < 12) { sH += 12; eH += 12; }
    if (ampm.toLowerCase() === 'am' && sH === 12) { sH = 0; }
    if (ampm.toLowerCase() === 'am' && eH === 12) { eH = 0; }
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sH, sM, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eH, eM, 0, 0);
    return [start, end];
  }

  // Time window strings for each slot
  const timeSlotWindows = {
    morning: '4:30–9:00 AM',
    evening: '4:30–8:00 PM',
  };

  // Modal for time slot errors
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [timeSlotModalMsg, setTimeSlotModalMsg] = useState('');

  // Smart handler for time slot selection
  function handleTimeSlotSelect(slot: 'morning' | 'evening') {
    // If selected date is today, check if slot is still valid
    const todayStr = new Date().toISOString().slice(0, 10);
    if (selectedDate === todayStr) {
      const windowStr = timeSlotWindows[slot];
      const [, end] = parseTimeWindowStr(windowStr);
      const now = new Date();
      if (end && now > end) {
        setTimeSlotModalMsg(`You cannot choose this time because it's past the ${slot} schedule for today. Please choose another available time or a future date.`);
        setShowTimeSlotModal(true);
        return;
      }
    }
    setTimeSlot(slot);
    setDeliveryWindow(null);
  }
  const [deliveryWindow, setDeliveryWindow] = useState<'sameDayEvening' | 'nextMorning' | 'nextEvening' | null>(null);
  const [address, setAddress] = useState('');
  // Address mode: 'my' or 'other'
  const [addressMode, setAddressMode] = useState<'my' | 'other'>('my');
  const [otherAddresses, setOtherAddresses] = useState<OtherAddress[]>(() => getOtherAddresses());
  const [selectedOtherIdx, setSelectedOtherIdx] = useState<number>(-1);
  const [locating, setLocating] = useState(false);
  const [payment, setPayment] = useState('cash');
  const [showFillAnim, setShowFillAnim] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = (path: string) => { window.location.hash = path; };
  const [notes, setNotes] = useState('');
  const [filled, setFilled] = useState<'filled' | 'empty'>('filled');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    // Frontend validation: block using own referral code
    if (referralCode && myReferralCode && referralCode.trim() === myReferralCode) {
      setShowOwnReferralModal(true);
      return;
    }
    // Enforce required fields for LPG Gas Refill
    if (orderType === 'gas') {
      if (!serviceType) {
        alert('Please select a Service Type.');
        return;
      }
      if (!timeSlot) {
        alert('Please select a Time Slot.');
        return;
      }
      if (!deliveryWindow) {
        alert('Please select a Delivery Window.');
        return;
      }
    }
    setShowFillAnim(true);
    // Build order object (no orderId)
    const localUniqueCode = Math.floor(100000 + Math.random() * 900000);
    // Use 'any' to allow dynamic fields like referralCode
  // Use Partial<OrderType> to avoid 'any' and allow dynamic fields
  const newOrder: Partial<OrderType> & { referralCode?: string } = {
      customerName: 'User', // Replace with actual user if available
      address,
      location: (() => {
        // Only return lat/lng if both are valid numbers and not 0,0
        const match = address.match(/^Lat: (-?\d+\.\d+), Lng: (-?\d+\.\d+)$/);
        if (match) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);
          if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
            return { lat, lng };
          }
        }
        return undefined;
      })(),
      cylinderType: orderType === 'gas' ? cylinder : `${cylinder} Cylinder (${filled})`,
      uniqueCode: localUniqueCode,
      status: 'pending',
      date: selectedDate,
      amountPaid: 0,
      notes,
      payment,
      serviceType: orderType === 'gas' ? (serviceType ?? '') : '',
      timeSlot: orderType === 'gas' ? (timeSlot ?? '') : '',
      deliveryWindow: orderType === 'gas' ? (deliveryWindow ?? '') : '',
    };
    // If referral code is entered and user not already referred, add to order
    if (referralCode && !alreadyReferred) {
      newOrder.referralCode = referralCode.trim();
    }

    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    console.log('[Order] JWT from localStorage:', token);
    console.log('[Order] Headers for fetch:', headers);
    fetch(`${import.meta.env.VITE_API_BASE || ''}/order`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newOrder),
    })
      .then(async res => {
        let data;
        try {
          data = await res.json();
        } catch {
          setShowFillAnim(false);
          setShowOwnReferralModal(true);
        }
        if (!res.ok) {
          // If backend returns specific error for own referral code, show alert/modal and stop loading
          if (data && data.error && data.error.includes('own referral code')) {
            setShowFillAnim(false);
            setShowOwnReferralModal(true);
            return;
          }
          // New: Handle invalid referral code error
          if (data && data.error && data.error.toLowerCase().includes('invalid referral code')) {
            setShowFillAnim(false);
            setShowInvalidReferralModal(true);
            return;
          }
          setShowFillAnim(false);
          throw new Error('Failed to save order in cloud');
        }
        if (data && data.success && data.order) {
          console.log('Backend order response:', data.order);
          // Remove any local temp order with the same uniqueCode or a numeric orderId (temp)
          const orders = getOrders().filter((o: OrderType) => {
            if (o.uniqueCode === localUniqueCode) return false;
            if (typeof o.orderId === 'number') return false;
            return true;
          });
          localStorage.setItem('tapgas_orders', JSON.stringify(orders));
          console.log('Saving order to local storage:', data.order);
          saveOrder(data.order);

          // Immediately fetch the latest order data from backend to update local storage (for real coordinates)
          try {
            const checkRes = await fetch(`${import.meta.env.VITE_API_BASE || ''}/order/check`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: data.order.email, uniqueCode: data.order.uniqueCode })
            });
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (checkData && checkData.success && checkData.order) {
                saveOrder(checkData.order);
              }
            }
          } catch {
            // Could not fetch latest order data after placement
// (No other changes needed)
          }

          // Schedule local notification in 2 minutes (Capacitor or browser)
          scheduleOrderReminderNotification(2 * 60 * 1000);
        }
        setShowFillAnim(false);
        setSuccess(true);
        setTimeout(() => {
          setTimeout(() => {
            // Set a sessionStorage flag to trigger auto-check on Home
            sessionStorage.setItem('tapgas_auto_check_order', '1');
            window.dispatchEvent(new Event('tapgas-orders-updated'));
            navigate('/track');
          }, 5000);
        }, 1200);
      })
      .catch(err => {
        setShowFillAnim(false);
        // Optionally show error to user
        console.error('Cloud order save error:', err);
      });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'dark' ? '#18181b' : '#fff',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Modal for own referral code error */}
      {showOwnReferralModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
            minWidth: 300,
            textAlign: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#e11d48', marginBottom: '1rem' }}>
              You cannot use your own referral code.
            </div>
            <button
              style={{
                background: '#38bdf8',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.7rem 1.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                marginTop: '0.5rem',
              }}
              onClick={() => setShowOwnReferralModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {/* New modal for invalid referral code */}
      {showInvalidReferralModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
            minWidth: 300,
            textAlign: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#e11d48', marginBottom: '1rem' }}>
              Invalid referral code. Please check and try again.
            </div>
            <button
              style={{
                background: '#38bdf8',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.7rem 1.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                marginTop: '0.5rem',
              }}
              onClick={() => setShowInvalidReferralModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
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
      {/* Time slot error modal */}
      {showTimeSlotModal && (
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
            <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>⏰</div>
            {timeSlotModalMsg}
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
              onClick={() => setShowTimeSlotModal(false)}
            >OK</button>
          </div>
        </div>
      )}

      {/* LPG Stations Map */}
      <div style={{ maxWidth: 420, margin: '0 auto 1.5rem auto', background: theme === 'dark' ? '#f1f5f9' : '#f8fafc', borderRadius: '1rem', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.7rem', color: '#0f172a' }}>
          Nearby LPG Stations
        </div>
        {stationsLoading && <div style={{ color: '#64748b' }}>Loading stations...</div>}
        {stationsError && <div style={{ color: '#ef4444' }}>{stationsError}</div>}
        {!stationsLoading && !stationsError && lpgStations.length === 0 && (
          <div style={{ color: '#64748b' }}>No stations found.</div>
        )}
        {!stationsLoading && !stationsError && lpgStations.length > 0 && (
          <MapContainer center={[5.65, -0.15]} zoom={11} style={{ height: 320, width: '100%', borderRadius: '1rem', margin: '0 auto' }} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {lpgStations.map((station, idx) => (
              <Marker key={idx} position={[station.lat, station.lng]}>
                <Popup>
                  <b>{station.name}</b><br />Lat: {station.lat}, Lng: {station.lng}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
      <div style={{
        maxWidth: '420px',
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
            border: 'none', borderRadius: '1rem', padding: '0.49rem 1.05rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem', transition: 'background 0.2s',
          }}>Order LPG Gas Refill</button>
          <button type="button" onClick={() => setOrderType('cylinder')} style={{
            background: orderType === 'cylinder' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
            color: orderType === 'cylinder' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
            border: 'none', borderRadius: '1rem', padding: '0.49rem 1.05rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem', transition: 'background 0.2s',
          }}>Buy Gas Cylinder</button>
        </div>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          <div>
            <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155', fontSize: '0.7rem' }}>Cylinder Size</label>
            <select value={cylinder} onChange={e => setCylinder(e.target.value)} required style={{ width: '100%', padding: '0.49rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginTop: '0.35rem', fontSize: '0.7rem' }}>
              <option value="" disabled>Select size</option>
              {cylinderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          {orderType === 'cylinder' && (
            <div>
              <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155', fontSize: '0.7rem' }}>Cylinder Fill Option</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setFilled('filled')} style={{
                  background: filled === 'filled' ? (theme === 'dark' ? '#fbbf24' : '#38bdf8') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                  color: filled === 'filled' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#38bdf8' : '#334155'),
                  border: 'none', borderRadius: '1rem', padding: '0.49rem 1.05rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem', transition: 'background 0.2s',
                }}>Filled with Gas</button>
                <button type="button" onClick={() => setFilled('empty')} style={{
                  background: filled === 'empty' ? (theme === 'dark' ? '#fbbf24' : '#38bdf8') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                  color: filled === 'empty' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#38bdf8' : '#334155'),
                  border: 'none', borderRadius: '1rem', padding: '0.49rem 1.05rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem', transition: 'background 0.2s',
                }}>Empty Cylinder</button>
              </div>
            </div>
          )}
          {/* New: Service type selection for LPG Gas Refill */}
          {orderType === 'gas' && (
            <>
              <div>
                <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155', fontSize: '0.7rem' }}>Choose Service Type</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  {/*<button type="button" onClick={() => { setServiceType('kiosk'); setTimeSlot(null); setDeliveryWindow(null); }}
                    style={{
                      background: serviceType === 'kiosk' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                      color: serviceType === 'kiosk' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
                      border: 'none', borderRadius: '1rem', padding: '0.49rem 1.05rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem', transition: 'background 0.2s',
                    }}>Drop off at Kiosk</button>*/}
                  <button type="button" onClick={() => { setServiceType('pickup'); setTimeSlot(null); setDeliveryWindow(null); }}
                    style={{
                      background: serviceType === 'pickup' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                      color: serviceType === 'pickup' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
                      border: 'none', borderRadius: '1rem', padding: '0.49rem 1.05rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem', transition: 'background 0.2s',
                    }}>Pickup from Home</button>
                </div>
              </div>
              {/* Step 2: Time slot selection */}
              {serviceType && (
                <div>
                  <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Select {serviceType === 'kiosk' ? 'Drop-off' : 'Pickup'} Date
                    <span style={{ cursor: 'pointer' }} title="More info" onClick={() => setInfoModal({ open: true, text: 'Select when you want us to come over to your house to pick up the empty cylinder.' })}>ℹ️</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => {
                      setSelectedDate(e.target.value);
                      setTimeSlot(null);
                      setDeliveryWindow(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.49rem',
                      borderRadius: '0.8rem',
                      border: '1px solid #e5e7eb',
                      marginTop: '0.35rem',
                      fontSize: '0.7rem',
                    }}
                  />
                  <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155', marginTop: '1rem', display: 'block', fontSize: '0.7rem' }}>Select {serviceType === 'kiosk' ? 'Drop-off' : 'Pickup'} Time</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => handleTimeSlotSelect('morning')}
                      style={{
                        background: timeSlot === 'morning' ? (theme === 'dark' ? '#fbbf24' : '#38bdf8') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                        color: timeSlot === 'morning' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#38bdf8' : '#334155'),
                        border: 'none', borderRadius: '1rem', padding: '0.49rem 1.05rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem', transition: 'background 0.2s',
                      }}>Morning (4:30–9:00 AM)</button>
                    {/*<button type="button" onClick={() => handleTimeSlotSelect('evening')}
                      style={{
                        background: timeSlot === 'evening' ? (theme === 'dark' ? '#fbbf24' : '#38bdf8') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                        color: timeSlot === 'evening' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#38bdf8' : '#334155'),
                        border: 'none', borderRadius: '1rem', padding: '0.49rem 1.05rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem', transition: 'background 0.2s',
                      }}>Evening (4:30–8:00 PM)</button>*/}
                  </div>
                </div>
              )}
              {/* Step 3: Delivery window selection */}
              {serviceType && timeSlot && (
                <div>
                  <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Choose Delivery Window
                    <span style={{ cursor: 'pointer' }} title="More info" onClick={() => setInfoModal({ open: true, text: 'Choose the time range you want us to deliver your filled cylinder to your house. Please make sure you would be at home within the time window.' })}>ℹ️</span>
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {timeSlot === 'morning' ? (
                        <button type="button" onClick={() => setDeliveryWindow('sameDayEvening')}
                          style={{
                            background: deliveryWindow === 'sameDayEvening' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                            color: deliveryWindow === 'sameDayEvening' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
                            border: 'none', borderRadius: '1rem', padding: '0.49rem 1.05rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem', transition: 'background 0.2s',
                          }}>Same Day Evening (4:30–7:00 PM)</button>
                    ) : (
                      <>
                        <button type="button" onClick={() => setDeliveryWindow('nextMorning')}
                          style={{
                            background: deliveryWindow === 'nextMorning' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                            color: deliveryWindow === 'nextMorning' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
                            border: 'none', borderRadius: '1rem', padding: '0.49rem 1.05rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem', transition: 'background 0.2s',
                          }}>Next Morning (5:00–9:00 AM)</button>
                        <button type="button" onClick={() => setDeliveryWindow('nextEvening')}
                          style={{
                            background: deliveryWindow === 'nextEvening' ? (theme === 'dark' ? '#38bdf8' : '#0f172a') : (theme === 'dark' ? '#23272f' : '#e5e7eb'),
                            color: deliveryWindow === 'nextEvening' ? (theme === 'dark' ? '#0f172a' : '#fff') : (theme === 'dark' ? '#fbbf24' : '#334155'),
                            border: 'none', borderRadius: '1rem', padding: '0.49rem 1.05rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem', transition: 'background 0.2s',
                          }}>Next Evening (4:30–8:00 PM)</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          <div>
            <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Address
              <span
                style={{ cursor: 'pointer' }}
                title="More info"
                onClick={() => setInfoModal({
                  open: true,
                  text: '' // We'll render custom JSX below
                })}
              >ℹ️</span>
            </label>
            {/* Info Modal for address and other fields */}
            {infoModal.open && (
              <div
                style={{
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
                }}
                onClick={() => setInfoModal({ open: false, text: '' })}
              >
                <div
                  style={{
                    background: theme === 'dark' ? '#23272f' : '#fff',
                    color: theme === 'dark' ? '#fbbf24' : '#0f172a',
                    borderRadius: '1.2rem',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                    padding: '2rem 2.2rem',
                    minWidth: '260px',
                    maxWidth: '90vw',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.2rem' }}>Explanation</div>
                  <div style={{ fontSize: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                    <span style={{ color: '#e11d48', fontWeight: 700 }}>My Address:</span>
                    <span> Select this but make sure you are at the house/home where we would deliver the cylinder and click My Location.</span>
                    <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '1.1rem 0' }} />
                    <span style={{ color: '#e11d48', fontWeight: 700 }}>Different Address:</span>
                    <span> Select this if you would want us to pickup/deliver at the person's address.</span>
                  </div>
                  <button
                    style={{
                      background: theme === 'dark' ? '#38bdf8' : '#0f172a',
                      color: theme === 'dark' ? '#0f172a' : '#fff',
                      border: 'none',
                      borderRadius: '0.7rem',
                      padding: '0.5rem 1.2rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'block',
                      margin: '0 auto',
                    }}
                    onClick={() => setInfoModal({ open: false, text: '' })}
                  >Cancel</button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', margin: '0.5rem 0' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                <input type="radio" name="addressMode" value="my" checked={addressMode === 'my'} onChange={() => {
                  setAddressMode('my');
                  setSelectedOtherIdx(-1);
                  setNotes('');
                  setAddress('');
                }} /> My Address
              </label>
              <label style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                <input type="radio" name="addressMode" value="other" checked={addressMode === 'other'} onChange={() => {
                  setAddressMode('other');
                  setOtherAddresses(getOtherAddresses());
                  setSelectedOtherIdx(-1);
                  setAddress('');
                  setNotes('');
                }} /> Different Address
              </label>
            </div>
            {addressMode === 'my' && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  value={address}
                  readOnly
                  required
                  placeholder="Click 'My Location'"
                  style={{ flex: 1, padding: '0.49rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b' }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    setLocating(true);
                    if (Capacitor.isNativePlatform()) {
                      try {
                        await Geolocation.requestPermissions();
                        const pos = await Geolocation.getCurrentPosition();
                        const { latitude, longitude } = pos.coords;
                        setAddress(`Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`);
                        setLocating(false);
                      } catch (err) {
                        alert('Unable to get location. Please type your address.');
                        setLocating(false);
                      }
                    } else if (navigator.geolocation) {
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
                    border: 'none', borderRadius: '0.8rem', padding: '0.49rem 0.7rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.665rem', transition: 'background 0.2s', minWidth: '28px'
                  }}
                  disabled={locating}
                >{locating ? 'Locating...' : 'My Location'}</button>
              </div>
            )}
            {addressMode === 'other' && (
              <div style={{ marginTop: '0.5rem' }}>
                {otherAddresses.length === 0 ? (
                  <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '0.7rem' }}>
                    No saved different addresses. <a href="/#/profile" style={{ color: '#38bdf8', textDecoration: 'underline' }}>Go to Profile to add</a>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedOtherIdx}
                      onChange={e => {
                        const idx = parseInt(e.target.value, 10);
                        setSelectedOtherIdx(idx);
                        const addr = otherAddresses[idx];
                        setAddress(`Lat: ${addr.lat}, Lng: ${addr.lng}`);
                        setNotes(`Please deliver to ${addr.name} (${addr.phone})`);
                      }}
                      required
                      style={{ width: '100%', padding: '0.49rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', fontSize: '0.7rem', marginBottom: '0.7rem' }}
                    >
                      <option value={-1} disabled>Select saved address...</option>
                      {otherAddresses.map((addr, idx) => (
                        <option key={idx} value={idx}>{addr.name} ({addr.phone})</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={address}
                      readOnly
                      required
                      placeholder="Lat/Lng will appear here"
                      style={{ width: '100%', padding: '0.49rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b', marginBottom: '0.5rem' }}
                    />
                  </>
                )}
              </div>
            )}
            {/* Leaflet map view for selected delivery location and LPG stations */}
            {(() => {
              // Try to get coordinates from address string ("Lat: x, Lng: y")
              let deliveryLatLng: [number, number] | null = null;
              const match = address.match(/^Lat: (-?\d+\.\d+), Lng: (-?\d+\.\d+)$/);
              if (match) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                if (!isNaN(lat) && !isNaN(lng)) {
                  deliveryLatLng = [lat, lng];
                }
              }
              if (!deliveryLatLng && lpgStations.length === 0) return null;
              // Find nearest station to delivery location
              let nearestStation = null;
              let minDist = Infinity;
              if (deliveryLatLng && lpgStations.length > 0) {
                for (const station of lpgStations) {
                  const dLat = (station.lat - deliveryLatLng[0]) * Math.PI / 180;
                  const dLng = (station.lng - deliveryLatLng[1]) * Math.PI / 180;
                  const a = Math.sin(dLat/2) ** 2 + Math.cos(deliveryLatLng[0]*Math.PI/180) * Math.cos(station.lat*Math.PI/180) * Math.sin(dLng/2) ** 2;
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                  const dist = 6371 * c; // km
                  if (dist < minDist) {
                    minDist = dist;
                    nearestStation = station;
                  }
                }
              }
              // Center map on delivery location if available, else Las Colinas, Texas, USA
              const mapCenter = deliveryLatLng || [32.88, -96.95];
              return (
                <div style={{ marginTop: '1rem', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <MapContainer center={mapCenter} zoom={deliveryLatLng ? 13 : 11} style={{ height: 220, width: '100%' }} scrollWheelZoom={false}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* Delivery location marker */}
                    {deliveryLatLng && (
                      <CircleMarker center={deliveryLatLng} radius={10} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.7 }}>
                        <Popup>Pickup & Delivery Location </Popup>
                      </CircleMarker>
                    )}
                    {/* LPG station markers */}
                    {/* Render nearest station marker with green icon */}
                    {nearestStation && (
                      <Marker
                        key={`nearest-${nearestStation.lat},${nearestStation.lng}`}
                        position={[nearestStation.lat, nearestStation.lng]}
                        icon={L.icon({
                          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                          iconSize: [25, 41],
                          iconAnchor: [12, 41],
                          popupAnchor: [1, -34],
                          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
                          shadowSize: [41, 41]
                        })}
                      >
                        <Popup>
                          <b>{nearestStation.name}</b><br />Lat: {nearestStation.lat}, Lng: {nearestStation.lng}
                          {deliveryLatLng && (
                            <><br /><span style={{ color: '#22c55e', fontWeight: 700 }}>Nearest Station ({minDist.toFixed(2)} km)</span></>
                          )}
                        </Popup>
                      </Marker>
                    )}
                    {/* Render all other stations with default icon */}
                    {lpgStations.filter(station => !(
                      nearestStation && station.lat === nearestStation.lat && station.lng === nearestStation.lng
                    )).map((station) => (
                      <Marker
                        key={`normal-${station.lat},${station.lng}`}
                        position={[station.lat, station.lng]}
                      >
                        <Popup>
                          <b>{station.name}</b><br />Lat: {station.lat}, Lng: {station.lng}
                        </Popup>
                      </Marker>
                    ))}
                    {/* Draw line to nearest station */}
                    {deliveryLatLng && nearestStation && (
                      <Polyline positions={[deliveryLatLng, [nearestStation.lat, nearestStation.lng]]} pathOptions={{ color: '#22c55e', weight: 4, dashArray: '6 8' }} />
                    )}
                  </MapContainer>
                </div>
              );
            })()}
          </div>
          {/* ...existing code... */}
          <div>
            <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155', fontSize: '0.7rem' }}>Directions / Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add directions, landmarks, or extra info for delivery"
              style={{ width: '100%', minHeight: '42px', padding: '0.49rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginTop: '0.35rem', fontSize: '0.7rem', resize: 'vertical' }}
            />
          </div>
                    {/* Referral code input: only show if user not already referred */}
          {!alreadyReferred && (
            <div>
              <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155', fontSize: '0.7rem' }}>
                Referral Code
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value)}
                placeholder="Enter referral code if you have one"
                style={{ width: '100%', padding: '0.49rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginTop: '0.35rem', fontSize: '0.7rem' }}
                maxLength={12}
              />
            </div>
          )}
          <div>
            <label style={{ fontWeight: 600, color: theme === 'dark' ? '#38bdf8' : '#334155', fontSize: '0.7rem' }}>Payment Method</label>
            <select value={payment} onChange={e => setPayment(e.target.value)} required style={{ width: '100%', padding: '0.49rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginTop: '0.35rem', fontSize: '0.7rem' }}>
              {paymentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          {/* Total Price (Delivery Fee only for now) */}
          <div style={{
            marginTop: '1.5rem',
            marginBottom: '0.5rem',
            fontWeight: 700,
            fontSize: '1.15rem',
            color: theme === 'dark' ? '#fbbf24' : '#0f172a',
            textAlign: 'center',
            background: theme === 'dark' ? '#23272f' : '#f1f5f9',
            borderRadius: '0.7rem',
            padding: '0.7rem 0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}>
            Total Price: {deliveryFee !== null ? `₵${deliveryFee.toFixed(2)}` : 'N/A'}
          </div>
          <button
            type="submit"
            style={{
              background: theme === 'dark' ? '#fbbf24' : '#38bdf8',
              color: theme === 'dark' ? '#0f172a' : '#fff',
              border: 'none', borderRadius: '2rem', padding: '0.9rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: isLoggedIn ? 'pointer' : 'not-allowed', marginTop: '0.5rem', transition: 'background 0.2s', opacity: isLoggedIn ? 1 : 0.7
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
