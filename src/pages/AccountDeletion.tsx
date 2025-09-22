import React from 'react';

const AccountDeletion: React.FC = () => (
  <div style={{ maxWidth: 500, margin: '3rem auto', padding: '2rem', background: '#fff', borderRadius: '1.2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
    <h2 style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.2rem' }}>Account Deletion & Data Removal</h2>
    <p style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1.2rem' }}>
      If you wish to delete your account and all associated data, please send an email request to:
    </p>
    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', marginBottom: '1.2rem', background: '#fbbf24', padding: '0.7rem 1.2rem', borderRadius: '0.7rem', display: 'inline-block' }}>
      johnsondarko365@gmail.com
    </div>
    <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '1.2rem 0' }}>
      Your request will be processed within <b>30 business days</b> in accordance with our privacy policy.
    </p>
    <p style={{ fontSize: '1.05rem', color: '#0f172a' }}>
      For any questions or to check the status of your request, please contact the same email address.
    </p>
  </div>
);

export default AccountDeletion;
