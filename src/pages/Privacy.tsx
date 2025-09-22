import React from 'react';

const Privacy: React.FC = () => (
  <div style={{ maxWidth: 600, margin: '3rem auto', padding: '2rem', background: '#fff', borderRadius: '1.2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
    <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.2rem' }}>Privacy Policy</h2>
    <p style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1.2rem' }}>
      We value your privacy and are committed to protecting your personal information. This app collects only the data necessary to provide and improve our gas delivery services, such as your name, contact details, address, and order history.
    </p>
    <ul style={{ color: '#334155', fontSize: '1.05rem', marginBottom: '1.2rem', paddingLeft: '1.2rem' }}>
      <li>We do not sell or share your personal data with third parties except as required to fulfill your orders or by law.</li>
      <li>Your location is only used to deliver your order and is never shared for marketing purposes.</li>
      <li>All payment information is handled securely and is not stored on our servers.</li>
      <li>You may request deletion of your account and data at any time via the Account Deletion page.</li>
    </ul>
    <p style={{ fontSize: '1.05rem', color: '#0f172a' }}>
      For questions or concerns about your privacy, please contact us at <b>johnsondarko365@gmail.com</b>.
    </p>
  </div>
);

export default Privacy;
