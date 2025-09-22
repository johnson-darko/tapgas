import Privacy from './pages/Privacy';

import React, { useState, useEffect } from 'react';
import CompleteProfileModal from './components/CompleteProfileModal';
import { getProfile } from './utils/profileStorage';
// Global update banner component
const UpdateBanner: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <div style={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100vw',
    background: '#38bdf8',
    color: '#fff',
    textAlign: 'center',
    padding: '0.7rem 0.5rem',
    fontWeight: 700,
    fontSize: '1rem',
    zIndex: 3000,
    boxShadow: '0 -2px 8px rgba(0,0,0,0.10)',
  }}>
    New version available. <button onClick={onRefresh} style={{
      marginLeft: '1rem',
      background: '#0f172a',
      color: '#fff',
      border: 'none',
      borderRadius: '1.2rem',
      padding: '0.4rem 1.2rem',
      fontWeight: 700,
      fontSize: '1rem',
      cursor: 'pointer',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
    }}>Refresh</button>
  </div>
);
import SplashScreen from './components/SplashScreen';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Order from './pages/Order';
import TrackOrder from './pages/TrackOrder';
import History from './pages/History';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminAssignOrders from './pages/AdminAssignOrders';
import AdminDrivers from './pages/AdminDrivers';
import DriverOrders from './pages/DriverOrders';
import PickupConfirm from './pages/PickupConfirm';
import DriverTrackOrder from './pages/DriverTrackOrder';
import DriverHistory from './pages/DriverHistory';
import DriverRoute from './pages/DriverRoute';
import Testing from './pages/testing';
import AccountDeletion from './pages/AccountDeletion';

import { useTheme } from './useTheme';


const App: React.FC = () => {
  const location = window.location.hash;
  const { theme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [updateReady, setUpdateReady] = useState(false);
  // Check for incomplete profile fields
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    function checkProfile() {
      const profile = getProfile();
      const missing: string[] = [];
      if (!profile.name || profile.name.trim().length < 2) missing.push('Name');
      if (!profile.phone || profile.phone.trim().length < 7) missing.push('Phone Number');
      if (!profile.cylinders_count || isNaN(Number(profile.cylinders_count)) || Number(profile.cylinders_count) < 1) missing.push('Number of Cylinders');
      setMissingFields(missing);
      setShowProfileModal(missing.length > 0);
    }
    checkProfile();
    window.addEventListener('storage', checkProfile);
    return () => window.removeEventListener('storage', checkProfile);
  }, []);
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000); // 2 seconds
    return () => clearTimeout(timer);
  }, []);

  // Service worker update detection
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return;
        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateReady(true);
                setWaitingSW(newWorker);
              }
            });
          }
        });
        // If already waiting
        if (reg.waiting) {
          setUpdateReady(true);
          setWaitingSW(reg.waiting);
        }
      });
    }
  }, []);

  // Handler to refresh and activate new SW
  const handleUpdate = () => {
    if (waitingSW) {
      waitingSW.postMessage({ type: 'SKIP_WAITING' });
      // Listen for controllerchange to reload
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      }, { once: true });
    }
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <ScrollToTop />
      <>
        <div style={{
          minHeight: '100vh',
          background: theme === 'dark'
            ? 'linear-gradient(180deg, #18181b 80%, #22223b 100%)'
            : 'linear-gradient(180deg, #f8fafc 80%, #ffffffff 100%)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'background 0.3s',
        }}>
          <Navbar />
          <div style={{
            flex: 1,
            width: '100%',
            maxWidth: 480,
            margin: '0 auto',
            padding: '1rem 0.5rem',
            boxSizing: 'border-box',
          }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/order" element={<Order />} />
              <Route path="/track" element={<TrackOrder />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/driver" element={<DriverOrders />} />
              <Route path="/pickup" element={<PickupConfirm />} />
              <Route path="/driver-track" element={<DriverTrackOrder />} />
              <Route path="/driver-history" element={<DriverHistory />} />
              <Route path="/driver-route" element={<DriverRoute />} />
              <Route path="/account-deletion" element={<AccountDeletion />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-assign-orders" element={<AdminAssignOrders />} />
              <Route path="/admin-drivers" element={<AdminDrivers />} />
              <Route path="/testing" element={<Testing />} />
            </Routes>
          </div>
          <Footer />
        </div>
        <BottomNav />
        {updateReady && <UpdateBanner onRefresh={handleUpdate} />}
        {showProfileModal && !location.includes('#/profile') && (
          <CompleteProfileModal
            missingFields={missingFields}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </>
    </Router>
  );
};

export default App;
