import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRReceiptPreviewProps {
  value: string;
  onClick?: () => void;
}

export const QRReceiptPreview: React.FC<QRReceiptPreviewProps> = ({ value, onClick }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={onClick}>
  <QRCodeSVG value={value} width={80} height={80} />
      <div style={{ marginTop: 8, fontSize: 13, color: '#888', fontWeight: 500 }}>
        Click to view receipt
      </div>
    </div>
  );
};
