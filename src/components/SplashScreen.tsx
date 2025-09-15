import React from 'react';
import { useTheme } from '../useTheme'; // Adjust path if needed
import './SplashScreen.css';

export default function SplashScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [fly, setFly] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setFly(true), 1500); // bounce for 1.5s, then fly
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        minWidth: '100vw',
      }}
    >
      <div className={fly ? 'animate-splash-fly' : 'animate-splash-bounce'} style={{ marginBottom: '1rem' }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="22" y="20" width="36" height="44" rx="12" fill="#38bdf8" stroke="#0f172a" strokeWidth="2"/>
          <rect x="32" y="12" width="16" height="12" rx="4" fill="#fbbf24" stroke="#0f172a" strokeWidth="2"/>
          <rect x="36" y="8" width="8" height="6" rx="2" fill="#0f172a" />
          <rect x="30" y="64" width="20" height="6" rx="3" fill="#0f172a" />
          <circle cx="40" cy="52" r="6" fill="#fff" stroke="#0f172a" strokeWidth="2" />
          {/* Rocket flames */}
          {fly && (
            <g>
              <ellipse cx="40" cy="74" rx="6" ry="8" fill="#fbbf24" opacity="0.7" />
              <ellipse cx="40" cy="80" rx="3" ry="4" fill="#f87171" opacity="0.5" />
            </g>
          )}
        </svg>
      </div>
      <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-blue-200' : 'text-scorecard-blue'}`}>GASMAN</h2>
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>The Gas You Need, Right on Time</p>
    </div>
  );
}
