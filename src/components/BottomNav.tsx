import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../useTheme';
import { getProfile } from '../utils/profileStorage';

const customerNav = [
  { label: 'Home', path: '/', icon: '🏠' },
  { label: 'Order', path: '/order', icon: '🛒' },
   // { label: 'Track', path: '/track', icon: '📦' },  // Hidden from bottom nav
  { label: 'History', path: '/history', icon: '🕑' },
  { label: 'Profile', path: '/profile', icon: '👤' },
];
const driverNav = [
  { label: 'Driver', path: '/driver', icon: '🚚' },
  // { label: 'Pickup', path: '/pickup', icon: '🔑' }, // Hidden from bottom nav
  // { label: 'Track', path: '/driver-track', icon: '🚦' }, // Hidden from bottom nav
    { label: 'Route', path: '/driver-route', icon: '🗺️' },
  { label: 'History', path: '/driver-history', icon: '🕑' },
  { label: 'Profile', path: '/profile', icon: '👤' },
];
const adminNav = [
  // { label: 'Home', path: '/', icon: '🏠' }, // Hidden from bottom nav
  // { label: 'Order', path: '/order', icon: '🛒' },
  { label: 'Assign', path: '/admin-assign-orders', icon: '🧑‍🤝‍🧑' },
  { label: 'Admin', path: '/admin', icon: '🗂️' },
  { label: 'Profile', path: '/profile', icon: '👤' },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const profile = getProfile();
  let navItems = customerNav;
  if (profile.role === 'admin') navItems = adminNav;
  else if (profile.role === 'driver') navItems = driverNav;
  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        background: 'transparent',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: 315,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '4.2rem',
          borderRadius: '2.2rem',
          background: theme === 'dark' ? 'rgba(24,24,27,0.98)' : 'rgba(255,255,255,0.98)',
          boxShadow: '0 4px 32px 0 rgba(56,189,248,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.10)',
          border: theme === 'dark' ? '18.5px solid #334155' : '18.5px solid #e5e7eb',
          position: 'relative',
          bottom: '-0.8rem',
          left: 0,
          right: 0,
          padding: '0 1.2rem',
          pointerEvents: 'auto',
          // Safe area for iOS PWA
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.2rem)',
        }}
      >
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              color: location.pathname === item.path
                ? '#38bdf8'
                : (theme === 'dark' ? '#fff' : '#000'),
              textDecoration: 'none',
              fontSize: '1.65rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontWeight: location.pathname === item.path ? 'bold' : 'normal',
              transition: 'color 0.2s',
              padding: '0.2rem 0.5rem 0.1rem 0.5rem',
              borderRadius: '1.2rem',
              minWidth: 54,
            }}
          >
            <span>{item.icon}</span>
            <span style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>{item.label}</span>
          </Link>
        ))}
      </div>
      {/* Safe area for iOS home indicator */}
      <div style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }} />
    </nav>
  );
};

export default BottomNav;
