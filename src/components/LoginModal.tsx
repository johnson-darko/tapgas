import React, { useState } from 'react';
import { getProfile, saveProfile } from '../utils/profileStorage';
import { useTheme } from '../useTheme';

interface LoginModalProps {
  email?: string;
  onSuccess: () => void;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ email: initialEmail = '', onSuccess, onClose }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isGmail = email.trim().toLowerCase().endsWith('@gmail.com');
  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    if (!isGmail) {
      setError('Only Gmail addresses (@gmail.com) are allowed.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to send code');
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Error sending code');
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) throw new Error('Invalid code');
      const data = await res.json();
      localStorage.setItem('authToken', 'session'); // Mark as logged in
      // Save email and role to profile
      const profile = getProfile();
      saveProfile({ ...profile, email, role: data.user.role || 'customer' });
  onSuccess();
  window.location.reload(); // Reload to update profile/nav with new role
    } catch (err: any) {
      setError(err.message || 'Error verifying code');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '1.2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', padding: '2rem', minWidth: 320, maxWidth: 400, position: 'relative' }}>
  <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.7rem', textAlign: 'center' }}>Sign in with Email</h2>
        <div style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.5rem' }}>
          Enter your Gmail address to receive a 6-digit verification code
        </div>
        {step === 'email' ? (
          <>
            <label style={{ fontWeight: 600 }}>Gmail Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="youremail@gmail.com"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginBottom: '0.7rem', fontSize: '1rem' }}
            />
            <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.2rem' }}>
              Only Gmail addresses (@gmail.com) are accepted for security
            </div>
            <button onClick={handleSendCode} disabled={loading || !email || !isGmail} style={{ width: '100%', padding: '0.9rem', borderRadius: '2rem', background: '#38bdf8', color: '#fff', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer', opacity: (!email || !isGmail) ? 0.6 : 1 }}>Send Verification Code</button>
          </>
        ) : (
          <>
            <label style={{ fontWeight: 600 }}>Enter 6-digit Code</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value)} maxLength={6} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginBottom: '1.2rem', fontSize: '1rem', letterSpacing: '0.3em' }} />
            <button onClick={handleVerifyCode} disabled={loading || code.length !== 6} style={{ width: '100%', padding: '0.9rem', borderRadius: '2rem', background: theme === 'dark' ? '#fbbf24' : '#38bdf8', color: theme === 'dark' ? '#0f172a' : '#fff', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>Confirm Code</button>
          </>
        )}
        {error && <div style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 600 }}>{error}</div>}
        <button
          onClick={onClose}
          style={{
            display: 'block',
            margin: '2rem auto 0 auto',
            background: '#f1f5f9',
            color: '#334155',
            border: 'none',
            borderRadius: '1.2rem',
            padding: '0.4rem 1.2rem',
            fontWeight: 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
