import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface OrderCardProps {
  order: {
    orderId: number;
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
  };
}

import { useTheme } from '../useTheme';

const statusColors: Record<string, string> = {
  pending: '#fbbf24',
  delivered: '#22c55e',
  onway: '#38bdf8',
};

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { theme } = useTheme();
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
        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: theme === 'dark' ? '#38bdf8' : '#0f172a', letterSpacing: '-1px', marginBottom: '0.2rem' }}>
          <span role="img" aria-label="cylinder">🛢️</span> {order.cylinderType}
        </div>
        {/* Removed Customer name display as requested */}
        <div style={{ fontSize: '0.98rem' }}>
          {order.location && order.address.match(/^Lat: (-?\d+\.\d+), Lng: (-?\d+\.\d+)$/)
            ? (
              <>Address Coordinates: <span style={{ fontWeight: 600 }}>{order.location.lat},{order.location.lng}</span></>
            )
            : (
              <>Address: <span style={{ fontWeight: 600 }}>{order.address}</span></>
            )}
        </div>
        <div style={{ fontSize: '0.98rem' }}>Date: <span style={{ fontWeight: 600 }}>{order.date}</span></div>
        <div style={{ fontSize: '0.98rem' }}>Amount Paid: <span style={{ fontWeight: 700, color: theme === 'dark' ? '#fbbf24' : '#22c55e' }}>GH₵{order.amountPaid}</span></div>
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
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: theme === 'dark' ? '#fbbf24' : '#38bdf8', marginBottom: '0.5rem', letterSpacing: '2px' }}>
          <span role="img" aria-label="code">🔑</span> {order.uniqueCode}
        </div>
        <div style={{ marginBottom: '0.7rem' }}>
          <QRCodeCanvas value={order.orderId.toString()} size={80} />
          <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#64748b' : '#334155', marginTop: '0.3rem' }}>Scan to confirm pickup</div>
        </div>
        <div style={{
          color: statusColors[order.status] || (theme === 'dark' ? '#64748b' : '#334155'),
          fontWeight: 800,
          fontSize: '1.05rem',
          textTransform: 'capitalize',
          marginBottom: '0.3rem',
        }}>
          {order.status}
        </div>
        <div style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#38bdf8' : '#64748b', fontWeight: 500 }}>
          Order ID: {order.orderId}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
