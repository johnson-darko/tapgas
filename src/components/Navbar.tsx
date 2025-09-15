import React, { useState } from 'react';
// ...existing code...
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
      <div style={{ fontWeight: 800, fontSize: '1.7rem', letterSpacing: '-1px', color: theme === 'dark' ? '#fff' : '#000' }}>
        TapGas
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button onClick={handleRefresh} style={{
          marginRight: '1rem',
          background: 'none',
          border: 'none',
          color: theme === 'dark' ? '#38bdf8' : '#0ea5e9',
          fontSize: '1.5rem',
          cursor: 'pointer',
          fontWeight: 700,
        }} title="Refresh">
          🔄
        </button>
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
