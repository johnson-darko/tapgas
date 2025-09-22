import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface OrderCardProps {
  order: {
    orderId?: string | number;
    id?: number;
    customerName: string;
    address: string;
    cylinderType: string;
    uniqueCode: number;
    status: string;
    date: string;
    amountPaid: number;
    location?: {
      lat: number;
      lng: number;
    };
    serviceType?: string;
    timeSlot?: string;
    deliveryWindow?: string;
    notes?: string;
  };
  onCheckUpdate?: () => void;
  showCheckUpdate?: boolean;
  role?: string;
}

import { useTheme } from '../useTheme';

const statusColors: Record<string, string> = {
  pending: '#fbbf24',
  delivered: '#22c55e',
  onway: '#38bdf8',
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onCheckUpdate, showCheckUpdate, role }) => {
  const { theme } = useTheme();
  const [showInfo, setShowInfo] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  return (
    <div style={{
      borderRadius: '1.5rem',
      boxShadow: theme === 'dark' ? '0 6px 32px rgba(56,189,248,0.12)' : '0 6px 32px rgba(0,0,0,0.10)',
      padding: '0',
      margin: '1.5rem 0',
      background: theme === 'dark' ? '#23232b' : '#fff',
      display: 'flex',
      flexDirection: 'row',
      maxWidth: '420px',
      marginLeft: 'auto',
      marginRight: 'auto',
      color: theme === 'dark' ? '#f8fafc' : '#22223b',
      border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Left section: details */}
      <div style={{
        flex: 2,
        padding: '1.5rem 1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        justifyContent: 'center',
      }}>
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
        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: theme === 'dark' ? '#38bdf8' : '#0f172a', letterSpacing: '-1px', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span role="img" aria-label="cylinder"></span> {order.cylinderType}
        </div>
        {/* Removed Customer name display as requested */}
        {/* <div style={{ fontSize: '0.98rem' }}>
          Address: <span style={{ fontWeight: 600 }}>{order.address}</span>
        </div>*/}
        <div style={{ fontSize: '0.98rem' }}>
          {order.cylinderType &&
            (/\(Filled\)|\(Empty\)|cylinder/i.test(order.cylinderType))
            ? 'Delivery date: '
            : 'Pick up date: '}
          <span style={{ fontWeight: 600 }}>
            {order.date ? new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
          </span>
        </div>
        <div style={{ fontSize: '0.98rem' }}>
          Amount Paid: <span style={{ fontWeight: 700, color: theme === 'dark' ? '#fbbf24' : '#22c55e' }}>Not yet</span>
        </div>
        {/* Always show info icon for order details */}
        <div style={{ marginTop: '0.2rem', display: 'flex', justifyContent: 'center' }}>
          <span
            title="Order information"
            style={{ cursor: 'pointer', fontSize: '1.1em', color: theme === 'dark' ? '#fbbf24' : '#0f172a', verticalAlign: 'middle' }}
            onClick={() => setShowInfo(true)}
          >Infoℹ️</span>
        </div>
        {showInfo && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.35)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setShowInfo(false)}
          >
            <div
              style={{
                background: theme === 'dark' ? '#23232b' : '#fff',
                color: theme === 'dark' ? '#fbbf24' : '#0f172a',
                borderRadius: '1.2rem',
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                padding: '2rem 2.5rem',
                minWidth: '260px',
                maxWidth: '90vw',
                fontSize: '1.05rem',
                position: 'relative',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.2rem', textAlign: 'center' }}>Order Details</div>
              {/* Only show these for LPG Gas Refill (not buy cylinder) */}
              {order.cylinderType &&
                order.cylinderType !== 'Many cylinder types, check info icon.' &&
                !/\(Filled\)|\(Empty\)/i.test(order.cylinderType) &&
                !order.cylinderType.toLowerCase().includes('cylinder') && (
                  <>
                    <div><b>Service Type:</b> {order.serviceType === 'kiosk' ? 'Drop off at Kiosk' : order.serviceType === 'pickup' ? 'Pickup from Home' : '-'}</div>
                    <div><b>Time Slot:</b> {order.timeSlot === 'morning' ? 'Morning (4:30–9:00 AM)' : order.timeSlot === 'evening' ? 'Evening (4:30–8:00 PM)' : '-'}</div>
                    <div><b>Delivery Window:</b> {
                      order.deliveryWindow === 'sameDayEvening' ? 'Same Day Evening (4:30–7:00 PM)' :
                      order.deliveryWindow === 'nextMorning' ? 'Next Morning (5:00–9:00 AM)' :
                      order.deliveryWindow === 'nextEvening' ? 'Next Evening (4:30–8:00 PM)' : '-'
                    }</div>
                  </>
              )}
              {/* Hide for buy cylinder orders (show nothing) */}
              {order.cylinderType && order.cylinderType.toLowerCase().includes('cylinder') && null}
              <div style={{ marginTop: '1.2rem', fontSize: '1rem' }}>
                <b>Directions / Notes:</b><br />
                <span style={{ color: theme === 'dark' ? '#fbbf24' : '#0f172a' }}>{order.notes ? order.notes : 'None provided'}</span>
              </div>
              <button
                style={{
                  marginTop: '1.5rem',
                  background: theme === 'dark' ? '#38bdf8' : '#0f172a',
                  color: theme === 'dark' ? '#0f172a' : '#fff',
                  border: 'none',
                  borderRadius: '0.7rem',
                  padding: '0.5rem 1.2rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                onClick={() => setShowInfo(false)}
              >Close</button>
            </div>
          </div>
        )}
      </div>
      {/* Perforated divider */}
      <div style={{
        width: '2.2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        position: 'relative',
      }}>
        {[...Array(7)].map((_, i) => (
          <div key={i} style={{
            width: '0.5rem',
            height: '0.5rem',
            borderRadius: '50%',
            background: theme === 'dark' ? '#334155' : '#e5e7eb',
            margin: '0.18rem 0',
          }} />
        ))}
      </div>
      {/* Right section: code and status */}
      <div style={{
        flex: 1.2,
        padding: '1.5rem 1.2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'dark' ? '#18181b' : '#f8fafc',
        borderLeft: theme === 'dark' ? '1px dashed #334155' : '1px dashed #e5e7eb',
      }}>
        {role !== 'driver' && (
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: theme === 'dark' ? '#fbbf24' : '#38bdf8', marginBottom: '0.5rem', letterSpacing: '2px' }}>
            <span role="img" aria-label="code">🔑</span> {order.uniqueCode}
          </div>
        )}
        <div style={{ marginBottom: '0.7rem', cursor: 'pointer' }} onClick={() => setShowQrModal(true)}>
          <QRCodeCanvas value={(order.orderId ?? '').toString()} size={80} style={{ filter: 'brightness(1.1)' }} />
          <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#64748b' : '#334155', marginTop: '0.3rem' }}>Scan to confirm pickup</div>
        </div>
        {/* QR Modal */}
        {showQrModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setShowQrModal(false)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '1.2rem',
                padding: '2.5rem',
                boxShadow: '0 8px 40px 8px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '2px solid #fbbf24',
              }}
              onClick={e => e.stopPropagation()}
            >
              <QRCodeCanvas value={(order.orderId ?? '').toString()} size={240} style={{ marginBottom: '1.2rem', filter: 'brightness(2) drop-shadow(0 0 16px #fff)' }} />
              <button
                style={{
                  marginTop: '1.2rem',
                  background: theme === 'dark' ? '#38bdf8' : '#0f172a',
                  color: theme === 'dark' ? '#0f172a' : '#fff',
                  border: 'none',
                  borderRadius: '0.7rem',
                  padding: '0.7rem 1.5rem',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'block',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
                }}
                onClick={() => setShowQrModal(false)}
              >Close</button>
            </div>
          </div>
        )}
         <div style={{
           color: statusColors[order.status] || (theme === 'dark' ? '#64748b' : '#334155'),
           fontWeight: 800,
           fontSize: '1.05rem',
           textTransform: 'capitalize',
           marginBottom: '0.3rem',
           textAlign: 'center',
         }}>
           {order.status}
         </div>
         {typeof onCheckUpdate === 'function' && showCheckUpdate && (
           <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '0.3rem' }}>
             <button
               style={{
                 fontSize: '0.95rem',
                 fontWeight: 600,
                 background: '#38bdf8',
                 color: '#fff',
                 border: 'none',
                 borderRadius: '0.7rem',
                 padding: '0.4rem 1.2rem',
                 cursor: 'pointer',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
               }}
               onClick={e => { e.stopPropagation(); onCheckUpdate(); }}
             >Check Updates</button>
           </div>
         )}
        <div style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#38bdf8' : '#64748b', fontWeight: 500 }}>
          Order ID: {order.orderId ?? 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
