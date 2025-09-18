import React, { useState } from 'react';

const Login: React.FC = () => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Invalid code');
      const data = await res.json();
      // Save token for remember me
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      window.location.href = '/'; // Redirect to home
    } catch (err: any) {
      setError(err.message || 'Error verifying code');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '2rem', background: '#fff', borderRadius: '1.2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '2rem' }}>Login</h2>
      {step === 'email' ? (
        <>
          <label style={{ fontWeight: 600 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginBottom: '1.2rem', fontSize: '1rem' }} />
          <button onClick={handleSendCode} disabled={loading || !email} style={{ width: '100%', padding: '0.9rem', borderRadius: '2rem', background: '#38bdf8', color: '#fff', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>Send Code</button>
        </>
      ) : (
        <>
          <label style={{ fontWeight: 600 }}>Enter 6-digit Code</label>
          <input type="text" value={code} onChange={e => setCode(e.target.value)} maxLength={6} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginBottom: '1.2rem', fontSize: '1rem', letterSpacing: '0.3em' }} />
          <button onClick={handleVerifyCode} disabled={loading || code.length !== 6} style={{ width: '100%', padding: '0.9rem', borderRadius: '2rem', background: '#22c55e', color: '#fff', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>Confirm Code</button>
        </>
      )}
      {error && <div style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 600 }}>{error}</div>}
    </div>
  );
};

export default Login;
