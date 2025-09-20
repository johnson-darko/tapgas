// PromoTooltipIcon component
interface PromoTooltipIconProps {
  theme: string;
}

function PromoTooltipIcon({ theme }: PromoTooltipIconProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  return (
    <span style={{ position: 'relative' }}>
      <span style={{ position: 'relative', display: 'inline-block' }}>
        <span
          role="img"
          aria-label="gift"
          style={{
            fontSize: '1.155rem',
            cursor: 'pointer',
            marginRight: '0.25rem',
            color: theme === 'dark' ? '#fbbf24' : '#0ea5e9',
            display: 'inline-block',
            animation: showTooltip ? 'bounceGift 0.7s' : 'bounceGiftIdle 2s infinite',
            transition: 'font-size 0.2s',
          }}
          onClick={() => setShowTooltip((v) => !v)}
          onMouseEnter={() => setShowTooltip(true)}
        >🎁</span>
        {/* Badge */}
        <span style={{
          position: 'absolute',
          top: '-0.15rem',
          right: '-0.1rem',
          background: '#ef4444',
          color: '#fff',
          borderRadius: '50%',
          fontSize: '0.4675rem',
          fontWeight: 700,
          padding: '0.065rem 0.225rem',
          boxShadow: '0 0.5px 2px rgba(0,0,0,0.12)',
          zIndex: 2,
          border: theme === 'dark' ? '1px solid #23272f' : '1px solid #fff',
        }}>1</span>
      </span>
      <style>{`
        @keyframes bounceGift {
          0% { transform: scale(1) translateY(0); }
          30% { transform: scale(1.35) translateY(-5px); }
          50% { transform: scale(1.05) translateY(1.5px); }
          70% { transform: scale(1.15) translateY(-1.5px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes bounceGiftIdle {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.12) translateY(-2px); }
        }
      `}</style>
      {showTooltip && (
        <div style={{
          position: 'absolute',
          top: '1.1rem',
          right: 0,
          background: theme === 'dark' ? '#23272f' : '#fff',
          color: theme === 'dark' ? '#fbbf24' : '#0f172a',
          borderRadius: '0.35rem',
          boxShadow: '0 1px 6px rgba(0,0,0,0.10)',
          padding: '0.5rem',
          minWidth: '200px',
          fontSize: '0.55rem',
          fontWeight: 500,
          zIndex: 10001,
          textAlign: 'left',
        }}>
          <button
            onClick={() => setShowTooltip(false)}
            style={{
              position: 'absolute',
              top: '0.25rem',
              right: '0.35rem',
              background: 'none',
              border: 'none',
              color: theme === 'dark' ? '#fbbf24' : '#0f172a',
              fontSize: '0.66rem',
              cursor: 'pointer',
              fontWeight: 700,
              zIndex: 10002,
            }}
            aria-label="Close promo"
          >✕</button>
          <div style={{ fontWeight: 700, marginBottom: '0.25rem', paddingRight: '0.75rem' }}>Refer & Earn</div>
          <div>
            <span style={{ fontSize: '0.55rem' }}>Share your referral code with friends!<br />
            <span style={{ color: '#0ea5e9', fontWeight: 700 }}>Earn ₵1.50</span> in rewards for every friend who places their first LPG refill order using your code.<br />
            <span style={{ color: theme === 'dark' ? '#fbbf24' : '#ef4444', fontWeight: 700 }}>
              Your friend must enter your code when ordering.<br />
              Rewards are credited after their first delivery.<br />
              <span style={{ color: '#0ea5e9' }}>Your referral rewards are automatically applied as a discount to your own future orders.</span>
            </span></span>
          </div>
        </div>
      )}
    </span>
  );
}
import React, { useState } from 'react';
import { useReferralReward } from '../utils/useReferralReward';
import { useTheme } from '../useTheme';


const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [offlineMsg, setOfflineMsg] = useState<string | null>(null);
  const referralReward = useReferralReward();

  const handleRefresh = async () => {
    try {
      // Try to fetch a small resource to check connectivity
  const res = await fetch('/manifest.json', { method: 'HEAD', cache: 'no-store' });
      if (!res.ok) throw new Error('Offline');
      // Clear all caches and reload
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      window.location.reload();
    } catch {
      setOfflineMsg('Please connect to the internet and refresh for latest updates.');
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
      boxShadow: theme === 'dark' ? '0 1px 4px rgba(56,189,248,0.10)' : '0 1px 4px rgba(0,0,0,0.08)',
      padding: '0.35rem 0.6rem',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2000,
      minHeight: '1.75rem',
      transition: 'background 0.3s, color 0.3s',
    }}>
      <button
        onClick={() => navigate('/')} // Go to home page
        style={{
          fontWeight: 800,
          fontSize: '1.235rem',
          letterSpacing: '-0.5px',
          color: theme === 'dark' ? '#fff' : '#000',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
        title="Go to Home"
      >
  <img src="icons/icon-512x512.png" alt="GASMAN Logo" style={{ height: 70, objectFit: 'contain', verticalAlign: 'middle' }} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <button onClick={handleRefresh} style={{
          marginRight: '0.25rem',
          background: 'none',
          border: 'none',
          color: theme === 'dark' ? '#38bdf8' : '#0ea5e9',
          fontSize: '1.525rem',
          cursor: 'pointer',
          fontWeight: 700,
        }} title="Refresh">
          🔄
        </button>
        {/* Promo tooltip icon */}
        <span style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <PromoTooltipIcon theme={theme} />
          <span style={{ width: 5, display: 'inline-block' }} />
          <span style={{
            fontWeight: 700,
            color: theme === 'dark' ? '#fbbf24' : '#0ea5e9',
            fontSize: '1.115rem',
            minWidth: 24,
            display: 'inline-block',
            textAlign: 'right',
            letterSpacing: '0.005em',
          }}>
            ₵ {referralReward.toFixed(2)}
          </span>
        </span>
        <button onClick={toggleTheme} style={{
          marginLeft: '0.5rem',
          background: 'none',
          border: 'none',
          color: theme === 'dark' ? '#fbbf24' : '#0f172a',
          fontSize: '1.825rem',
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
          padding: '0.175rem 0.25rem',
          textAlign: 'center',
          fontWeight: 500,
          fontSize: '0.4675rem',
          borderRadius: '0.25rem',
          zIndex: 2100,
        }}>
          {offlineMsg}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
