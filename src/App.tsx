import React, { useState, useEffect } from 'react';
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
import DriverOrders from './pages/DriverOrders';
import PickupConfirm from './pages/PickupConfirm';
import DriverTrackOrder from './pages/DriverTrackOrder';
import DriverHistory from './pages/DriverHistory';
import DriverRoute from './pages/DriverRoute';


import { useTheme } from './useTheme';

const App: React.FC = () => {
  const { theme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // If no hash, redirect to hash route
    if (window.location.pathname.endsWith('/tapgas/') && !window.location.hash) {
      window.location.replace(window.location.pathname + '#/');
    }
    const timer = setTimeout(() => setShowSplash(false), 2000); // 2 seconds
    return () => clearTimeout(timer);
  }, []);

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
                  <Route path="/login" element={<Login />} />
                </Routes>
              </div>
              <Footer />
            </div>
            <BottomNav />
        </>
    </Router>
  );
};

export default App;
