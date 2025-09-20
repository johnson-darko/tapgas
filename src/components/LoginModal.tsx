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
  const [step, setStep] = useState<'email' | 'code' | 'cylinders'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cylindersCount, setCylindersCount] = useState('');

  const isGmail = email.trim().toLowerCase().endsWith('@gmail.com');
  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    if (!isGmail) {
      setError('Only Gmail addresses (@gmail.com) are allowed.');
      setLoading(false);
      return;
    }
    // Special case: test@gmail.com skips code step and logs in instantly
    if (email.trim().toLowerCase() === 'test@gmail.com') {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/auth/verify-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: '000000' }) // code is ignored for test user
        });
        if (!res.ok) throw new Error('Instant login failed');
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        const profile = getProfile();
        saveProfile({
          ...profile,
          email,
          role: data.user?.role || 'customer',
          referral_code: data.user?.referral_code || undefined
        });
        onSuccess();
        window.location.reload();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Error logging in');
        } else {
          setError('Error logging in');
        }
      }
      setLoading(false);
      return;
    }
    // Normal flow for all other users
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('Failed to send code');
      setStep('code');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error sending code');
      } else {
        setError('Error sending code');
      }
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      if (!res.ok) throw new Error('Invalid code');
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('authToken', data.token); // Store the real JWT
      }
      // Save email, role, and referral_code to profile
      const profile = getProfile();
      // If cylinders_count is missing, require it before completing login
      if (!profile?.cylinders_count) {
        setStep('cylinders');
        setLoading(false);
        return;
      }
      saveProfile({
        ...profile,
        email,
        role: data.user.role || 'customer',
        referral_code: data.user.referral_code || undefined
      });
      onSuccess();
      window.location.reload(); // Reload to update profile/nav with new role
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error verifying code');
      } else {
        setError('Error verifying code');
      }
    }
    setLoading(false);
  };

  // Handle cylinders_count submission
  const handleCylindersSubmit = async () => {
    setLoading(true);
    setError('');
    const count = parseInt(cylindersCount, 10);
    if (isNaN(count) || count < 1) {
      setError('Please enter a valid number of cylinders (at least 1)');
      setLoading(false);
      return;
    }
    try {
      // Save to backend
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cylinders_count: count }),
      });
      if (!res.ok) throw new Error('Failed to save cylinders count');
      // Update local profile
      const profile = getProfile() || {};
      profile.cylinders_count = count;
      saveProfile(profile);
      setStep('email'); // Reset for next login
      setCylindersCount('');
      setError('');
      onSuccess();
      window.location.reload();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to save cylinders count');
      } else {
        setError('Failed to save cylinders count');
      }
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
        ) : step === 'code' ? (
          <>
            <label style={{ fontWeight: 600 }}>Enter 6-digit Code</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value)} maxLength={6} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginBottom: '1.2rem', fontSize: '1rem', letterSpacing: '0.3em' }} />
            <button onClick={handleVerifyCode} disabled={loading || code.length !== 6} style={{ width: '100%', padding: '0.9rem', borderRadius: '2rem', background: theme === 'dark' ? '#fbbf24' : '#38bdf8', color: theme === 'dark' ? '#0f172a' : '#fff', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>Confirm Code</button>
          </>
        ) : (
          <>
            <label style={{ fontWeight: 600 }}>How many gas cylinders do you have at home?</label>
            <input
              type="number"
              min={1}
              value={cylindersCount}
              onChange={e => setCylindersCount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 2"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginBottom: '1.2rem', fontSize: '1rem' }}
            />
            <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.2rem' }}>
              This helps us plan for better service and delivery in your area.
            </div>
            <button
              onClick={handleCylindersSubmit}
              disabled={loading || !cylindersCount || parseInt(cylindersCount, 10) < 1}
              style={{ width: '100%', padding: '0.9rem', borderRadius: '2rem', background: '#38bdf8', color: '#fff', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer', opacity: (!cylindersCount || parseInt(cylindersCount, 10) < 1) ? 0.6 : 1 }}
            >
              Save & Continue
            </button>
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
