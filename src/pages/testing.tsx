
import React, { useRef } from 'react';


// Reference logo in public folder
const logo = '/icons/icon-512x512.png';

// Download helper using html2canvas
// You need to install html2canvas: npm install html2canvas
import html2canvas from 'html2canvas';

// Helper to convert number to words (simple version for demo)
function numberToWords(num: number): string {
  // For demo, just return a string. Use a library for full implementation.
  if (num === 50) return 'Fifty Ghana Cedis';
  if (num === 100) return 'One Hundred Ghana Cedis';
  return num + ' Ghana Cedis';
}

// Mock delivery note data
const deliveryNote = {
  orderId: 'TG-20250923-001',
  cylinders: [
    { size: '3kg', status: 'filled', quantity: 2 },
    { size: '4kg', status: 'empty', quantity: 1 },
    { size: '5kg', status: 'filled', quantity: 0 },
  ],
  totalPrice: 50,
  deliveredAt: '2025-09-23T14:30:00Z',
};


const Receipt: React.FC = () => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { backgroundColor: '#fff', scale: 2 });
    const link = document.createElement('a');
    link.download = 'GASMAN-Receipt.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div ref={receiptRef} style={{
        maxWidth: 420,
        margin: '2rem auto',
        background: '#fff',
        borderRadius: '1.2rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '2rem',
        fontFamily: 'inherit',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Watermark logo with lower opacity */}
        <img src={logo} alt="watermark" style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.04,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        {/* Header: Logo left, company address and phone right */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.2rem',
        }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <img src={logo} alt="GASMAN Logo" style={{ width: 64, height: 64, borderRadius: '1rem', boxShadow: '0 2px 8px #e5e7eb' }} />
          </div>
          <div style={{ textAlign: 'right', marginLeft: '1.5rem', flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.08rem' }}>Offinso -Ahekro 234</div>
            <div style={{ color: '#64748b', fontWeight: 600, fontSize: '1.05rem', marginTop: '0.25rem' }}>xxxxx213</div>
          </div>
        </div>
  <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#0f172a' }}>Delivery Receipt</h2>
        {/* Order ID */}
        <div style={{ textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.7rem' }}>
          Order ID: <span style={{ color: '#0f172a', fontWeight: 700 }}>{deliveryNote.orderId}</span>
        </div>
        {/* Cylinder sizes row */}
        <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
          {deliveryNote.cylinders.map((cyl, idx) => (
            <div key={idx} style={{
              minWidth: 70,
              padding: '0.7rem 0.5rem',
              background: '#f1f5f9',
              borderRadius: '0.7rem',
              textAlign: 'center',
              border: '1.5px solid #38bdf8',
              fontWeight: 700,
              color: '#0f172a',
            }}>
              {cyl.size} ({cyl.status})
            </div>
          ))}
        </div>
        {/* Quantities row */}
        <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {deliveryNote.cylinders.map((cyl, idx) => (
            <div key={idx} style={{
              minWidth: 70,
              textAlign: 'center',
              fontWeight: 600,
              color: '#38bdf8',
              fontSize: '1.1rem',
            }}>
              {cyl.quantity}
            </div>
          ))}
        </div>
        {/* Total price and amount in words */}
        <div style={{ margin: '1.2rem 0', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' }}>Total: ₵{deliveryNote.totalPrice}</div>
          <div style={{ fontWeight: 500, fontSize: '1rem', color: '#64748b', marginTop: '0.3rem' }}>{numberToWords(deliveryNote.totalPrice)}</div>
        </div>
        {/* Delivery date (date only, no time) */}
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.98rem', marginTop: '1.2rem' }}>
          Delivered on: {new Date(deliveryNote.deliveredAt).toLocaleDateString()}
        </div>
      </div>
      <button
        onClick={handleDownload}
        style={{
          marginTop: '-0.5rem',
          background: '#38bdf8',
          color: '#fff',
          border: 'none',
          borderRadius: '0.8rem',
          padding: '0.7rem 1.5rem',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >Download Receipt</button>
    </div>
  );
};

const Testing: React.FC = () => {
  return (
    <div>
      <Receipt />
    </div>
  );
};

export default Testing;
