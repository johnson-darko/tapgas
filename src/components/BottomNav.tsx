import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../useTheme';
import { getProfile } from '../utils/profileStorage';

const customerNav = [
  { label: 'Home', path: '/', icon: '🏠' },
  { label: 'Order', path: '/order', icon: '🛒' },
  { label: 'Track', path: '/track', icon: '📦' },
  { label: 'History', path: '/history', icon: '🕑' },
  { label: 'Profile', path: '/profile', icon: '👤' },
];
const driverNav = [
  { label: 'Driver', path: '/driver', icon: '🚚' },
  { label: 'Pickup', path: '/pickup', icon: '🔑' },
  { label: 'Track', path: '/driver-track', icon: '🚦' },
  { label: 'History', path: '/driver-history', icon: '🕑' },
  { label: 'Route', path: '/driver-route', icon: '🗺️' },
  { label: 'Profile', path: '/profile', icon: '👤' },
];
const adminNav = [
  { label: 'Home', path: '/', icon: '🏠' },
  { label: 'Order', path: '/order', icon: '🛒' },
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
    <nav style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      background: theme === 'dark'
        ? '#18181b'
        : '#fff',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '3.5rem',
      zIndex: 1000,
      boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
      borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
    }}>
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            color: location.pathname === item.path
              ? '#38bdf8'
              : (theme === 'dark' ? '#fff' : '#000'),
            textDecoration: 'none',
            fontSize: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontWeight: location.pathname === item.path ? 'bold' : 'normal',
            transition: 'color 0.2s',
          }}
        >
          <span>{item.icon}</span>
          <span style={{ fontSize: '0.7rem' }}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
