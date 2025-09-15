import React from 'react';
// ...existing code...
import { useTheme } from '../useTheme';


const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
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
    </nav>
  );
};

export default Navbar;
