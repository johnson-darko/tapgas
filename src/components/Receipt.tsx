import React, { useRef } from 'react';

const logo = '/icons/icon-512x512.png';

export interface ReceiptProps {
  orderId: string;
  cylinders: { size: string; status: string; quantity: number }[];
  totalPrice: number;
  deliveredAt?: string;
  phone?: string;
  status: string;
}

function numberToWords(num: number): string {
  if (num === 50) return 'Fifty Ghana Cedis';
  if (num === 100) return 'One Hundred Ghana Cedis';
  return num + ' Ghana Cedis';
}

export const Receipt: React.FC<ReceiptProps & { small?: boolean; showDownload?: boolean }> = ({
  orderId,
  cylinders,
  totalPrice,
  deliveredAt,
  phone = 'xxxxx213',
  status,
  small = false,
  showDownload = false,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        ref={receiptRef}
        style={{
          maxWidth: small ? 120 : 420,
          minWidth: small ? 80 : 320,
          margin: small ? 0 : '2rem auto',
          background: '#fff',
          borderRadius: '1.2rem',
          boxShadow: small ? 'none' : '0 4px 24px rgba(0,0,0,0.08)',
          padding: small ? '0.5rem' : '2rem',
          fontFamily: 'inherit',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Watermark logo */}
        <img
          src={logo}
          alt="watermark"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.08,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        {/* Header: Logo left, company address and phone right */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: small ? '0.5rem' : '1.2rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <img
              src={logo}
              alt="GASMAN Logo"
              style={{ width: small ? 24 : 64, height: small ? 24 : 64, borderRadius: '1rem', boxShadow: '0 2px 8px #e5e7eb' }}
            />
    
          </div>
          {!small && (
            <div style={{ textAlign: 'right', marginLeft: '1.5rem', flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.08rem' }}>Offinso -Ahekro 234</div>
              <div style={{ color: '#64748b', fontWeight: 600, fontSize: '1.05rem', marginTop: '0.25rem' }}>{phone}</div>
            </div>
          )}
        </div>
        {!small && <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#0f172a' }}>Delivery Receipt</h2>}
        {/* Order ID */}
        <div
          style={{
            textAlign: 'center',
            color: '#64748b',
            fontWeight: 600,
            fontSize: small ? '0.7rem' : '1.05rem',
            marginBottom: small ? '0.2rem' : '0.7rem',
          }}
        >
          Order ID: <span style={{ color: '#0f172a', fontWeight: 700 }}>{orderId}</span>
        </div>
        {/* Cylinder sizes row */}
        <div
          style={{
            display: 'flex',
            gap: small ? '0.2rem' : '1.2rem',
            justifyContent: 'center',
            marginBottom: small ? '0.1rem' : '0.5rem',
          }}
        >
          {cylinders.map((cyl, idx) => (
            <div
              key={idx}
              style={{
                minWidth: small ? 20 : 70,
                padding: small ? '0.15rem 0.1rem' : '0.7rem 0.5rem',
                background: '#f1f5f9',
                borderRadius: '0.7rem',
                textAlign: 'center',
                border: '1.5px solid #38bdf8',
                fontWeight: 700,
                color: '#0f172a',
                fontSize: small ? '0.6rem' : undefined,
              }}
            >
              {cyl.size} ({cyl.status})
            </div>
          ))}
        </div>
        {/* Quantities row */}
        <div
          style={{
            display: 'flex',
            gap: small ? '0.2rem' : '1.2rem',
            justifyContent: 'center',
            marginBottom: small ? '0.2rem' : '1.5rem',
          }}
        >
          {cylinders.map((cyl, idx) => (
            <div
              key={idx}
              style={{
                minWidth: small ? 20 : 70,
                textAlign: 'center',
                fontWeight: 600,
                color: '#38bdf8',
                fontSize: small ? '0.7rem' : '1.1rem',
              }}
            >
              {cyl.quantity}
            </div>
          ))}
        </div>
        {/* Total price and amount in words */}
        <div style={{ margin: small ? '0.2rem 0' : '1.2rem 0', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: small ? '0.7rem' : '1.2rem', color: '#0f172a' }}>
            Total: ₵{totalPrice}
          </div>
          <div style={{ fontWeight: 500, fontSize: small ? '0.6rem' : '1rem', color: '#64748b', marginTop: '0.3rem' }}>
            {numberToWords(totalPrice)}
          </div>
        </div>
        {/* Status or Delivery date */}
        <div
          style={{
            textAlign: 'center',
            color: status === 'delivered' ? '#22c55e' : '#64748b',
            fontSize: small ? '0.7rem' : '0.98rem',
            marginTop: small ? '0.1rem' : '1.2rem',
            fontWeight: 700,
          }}
        >
          {status === 'delivered' && deliveredAt
            ? `Delivered on: ${new Date(deliveredAt).toLocaleDateString()}`
            : status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      {showDownload && !small && (
         <button
          onClick={handleDownload}
          style={{
            marginTop: '1.5rem',
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
        >
         {/* Download Receipt */}
        </button> 
      )}
    </div>
  );
};
