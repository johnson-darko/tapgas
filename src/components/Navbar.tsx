// PromoTooltipIcon component
function PromoTooltipIcon({ theme }) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  return (
    <span style={{ position: 'relative' }}>
      <span
        role="img"
        aria-label="gift"
        style={{
          fontSize: '1.5rem',
          cursor: 'pointer',
          marginRight: '0.5rem',
          color: theme === 'dark' ? '#fbbf24' : '#0ea5e9',
          display: 'inline-block',
          animation: showTooltip ? 'bounceGift 0.7s' : 'bounceGiftIdle 2s infinite',
        }}
        onClick={() => setShowTooltip((v) => !v)}
        onMouseEnter={() => setShowTooltip(true)}
      >🎁</span>
      <style>{`
        @keyframes bounceGift {
          0% { transform: scale(1) translateY(0); }
          30% { transform: scale(1.2) translateY(-6px); }
          50% { transform: scale(0.95) translateY(2px); }
          70% { transform: scale(1.05) translateY(-2px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes bounceGiftIdle {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.08) translateY(-3px); }
        }
      `}</style>
      {showTooltip && (
        <div style={{
          position: 'absolute',
          top: '2.2rem',
          right: 0,
          background: theme === 'dark' ? '#23272f' : '#fff',
          color: theme === 'dark' ? '#fbbf24' : '#0f172a',
          borderRadius: '0.7rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
          padding: '1rem',
          minWidth: '220px',
          fontSize: '1rem',
          fontWeight: 500,
          zIndex: 10001,
          textAlign: 'left',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Launch Promo</div>
          <div>Get a <span style={{ color: '#0ea5e9' }}>FREE Gas Level Indicator</span> with your first LPG refill or cylinder purchase!</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Limited to the first 500 signups.<br />
            <span style={{ color: theme === 'dark' ? '#fbbf24' : '#ef4444', fontWeight: 700 }}>
              Your gas order/cylinder arrives as usual.<br />
              The free indicator will be delivered separately within 2–3 weeks.
            </span>
          </div>
        </div>
      )}
    </span>
  );
}
import React, { useState } from 'react';
import { useTheme } from '../useTheme';


const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [offlineMsg, setOfflineMsg] = useState<string | null>(null);

  const handleRefresh = async () => {
    try {
      // Try to fetch a small resource to check connectivity
      const res = await fetch('/tapgas/manifest.json', { method: 'HEAD', cache: 'no-store' });
      if (res.ok) {
        window.location.reload();
      } else {
        throw new Error('Offline');
      }
    } catch {
      setOfflineMsg('No internet connection. You are currently offline. Please connect to the internet to refresh and get the latest updates.');
      setTimeout(() => setOfflineMsg(null), 4000);
    }
  };

  const navigate = window.location.hash !== undefined
    ? (path: string) => { window.location.hash = path; }
    : (path: string) => { window.location.pathname = path; };

  return (
    <nav style={{
      width: '100%',
      background: theme === 'dark'
        ? '#18181b'
        : '#fff',
      color: theme === 'dark' ? '#fff' : '#000',
      boxShadow: theme === 'dark' ? '0 2px 8px rgba(56,189,248,0.10)' : '0 2px 8px rgba(0,0,0,0.08)',
      padding: '0.7rem 1.2rem',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2000,
      minHeight: '3.5rem',
      transition: 'background 0.3s, color 0.3s',
    }}>
      <button
        onClick={() => navigate('/')} // Go to home page
        style={{
          fontWeight: 800,
          fontSize: '1.7rem',
          letterSpacing: '-1px',
          color: theme === 'dark' ? '#fff' : '#000',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
        title="Go to Home"
      >
        GASMAN
      </button>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <button onClick={handleRefresh} style={{
          marginRight: '0.5rem',
          background: 'none',
          border: 'none',
          color: theme === 'dark' ? '#38bdf8' : '#0ea5e9',
          fontSize: '1.5rem',
          cursor: 'pointer',
          fontWeight: 700,
        }} title="Refresh">
          🔄
        </button>
        {/* Promo tooltip icon */}
        <PromoTooltipIcon theme={theme} />
        <button onClick={toggleTheme} style={{
          marginLeft: '1rem',
          background: 'none',
          border: 'none',
          color: theme === 'dark' ? '#fbbf24' : '#0f172a',
          fontSize: '1.5rem',
          cursor: 'pointer',
          fontWeight: 700,
        }} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
      {offlineMsg && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          background: '#f87171',
          color: '#fff',
          padding: '0.5rem',
          textAlign: 'center',
          fontWeight: 600,
          zIndex: 2100,
        }}>
          {offlineMsg}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
