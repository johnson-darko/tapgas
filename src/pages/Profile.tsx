
import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useTheme } from '../useTheme';
import { getOrders } from '../utils/orderStorage';
import { getProfile, saveProfile } from '../utils/profileStorage';

const Profile: React.FC = () => {
  const { theme } = useTheme();
  const [profile, setProfile] = useState(getProfile());
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const orders = getOrders();
  const lastOrder = orders.length > 0 ? orders[0] : null;
  const isLoggedIn = !!localStorage.getItem('authToken');
  let addressDisplay = 'No address yet';
  if (lastOrder) {
    addressDisplay = lastOrder.location && lastOrder.address.match(/^Lat: (-?\d+\.\d+), Lng: (-?\d+\.\d+)$/)
      ? `Address Coordinates: ${lastOrder.location.lat},${lastOrder.location.lng}`
      : `Address: ${lastOrder.address}`;
  }

  // Request notification permission on mount if native
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.requestPermissions();
    }
  }, []);
  // Notification permission status logic removed (no longer needed)

  return (
    <div style={{
      padding: '5rem 0.5rem 1.5rem 0.5rem',
      color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.2rem' }}>
        User Profile
      </h2>
      {/* Notification device settings help note for native only */}
      {Capacitor.isNativePlatform() && (
        <div style={{
          background: '#e0e7ef',
          color: '#0f172a',
          borderRadius: '0.7rem',
          padding: '0.5rem 1.2rem',
          fontWeight: 500,
          fontSize: '1rem',
          margin: '0 auto 1.2rem auto',
          maxWidth: 320,
          letterSpacing: '0.05em',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span role="img" aria-label="bell">🔔</span>
          <div style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: '#64748b', textAlign: 'center' }}>
            To get notifications, please visit your device settings, go to Apps, select GASMAN, and allow notifications.
          </div>
        </div>
      )}
      {profile.referral_code && (
        <div style={{
          background: '#fbbf24',
          color: '#0f172a',
          borderRadius: '0.7rem',
          padding: '0.7rem 1.2rem',
          fontWeight: 700,
          fontSize: '1.1rem',
          margin: '0 auto 1.2rem auto',
          maxWidth: 320,
          letterSpacing: '0.1em',
        }}>
          Your Referral Code: <span style={{fontFamily: 'monospace', fontWeight: 900}}>{profile.referral_code}</span>
        </div>
      )}
      <div style={{
        background: theme === 'dark' ? '#334155' : '#fff',
        borderRadius: '1rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        padding: '1.2rem',
        maxWidth: '350px',
        margin: '0 auto',
        marginBottom: '2rem',
      }}>
        {editing ? (
          <form onSubmit={async e => {
            e.preventDefault();
            // Sync to backend first
            try {
              const token = localStorage.getItem('authToken');
              const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/profile`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ name: editName, phone_number: editPhone }),
              });
              if (!res.ok) throw new Error('Failed to update profile in cloud');
              const updated = { ...profile, name: editName, phone: editPhone };
              saveProfile(updated);
              setProfile(updated);
              setEditing(false);
            } catch (err) {
              alert('Could not update profile in cloud. Please try again.');
            }
          }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Name"
              style={{ padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', fontSize: '1rem' }}
              required
            />
            <input
              type="text"
              value={editPhone}
              onChange={e => setEditPhone(e.target.value)}
              placeholder="Phone"
              style={{ padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', fontSize: '1rem' }}
              required
            />
            <button type="submit" style={{
              background: theme === 'dark' ? '#38bdf8' : '#0f172a',
              color: theme === 'dark' ? '#0f172a' : '#fff',
              border: 'none', borderRadius: '2rem', padding: '0.7rem 2rem', fontSize: '1rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', marginTop: '0.5rem'
            }}>Save</button>
            <button type="button" onClick={() => setEditing(false)} style={{
              background: theme === 'dark' ? '#64748b' : '#e5e7eb',
              color: theme === 'dark' ? '#fbbf24' : '#334155',
              border: 'none', borderRadius: '2rem', padding: '0.7rem 2rem', fontSize: '1rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', marginTop: '0.5rem'
            }}>Cancel</button>
          </form>
        ) : (
          <>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{profile.name}</div>
            {profile.role && (
              <div style={{ marginBottom: '0.5rem', color: '#f59e42', fontSize: '0.98rem', fontWeight: 700 }}>
                Role: {profile.role}
              </div>
            )}
            {isLoggedIn && profile.email && (
              <div style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.98rem' }}>Email: {profile.email}</div>
            )}
            <div style={{ marginBottom: '0.5rem' }}>Phone: {profile.phone}</div>
            <div>{addressDisplay}</div>
            <button onClick={() => {
              setEditName(profile.name);
              setEditPhone(profile.phone);
              setEditing(true);
            }} style={{
              background: theme === 'dark' ? '#38bdf8' : '#0f172a',
              color: theme === 'dark' ? '#0f172a' : '#fff',
              border: 'none', borderRadius: '2rem', padding: '0.7rem 2rem', fontSize: '1rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', marginTop: '0.5rem'
            }}>Edit Profile</button>
                {isLoggedIn && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('tapgas_profile');
                      window.location.href = '/tapgas/';
                    }}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '2rem',
                      padding: '0.7rem 2rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      margin: '0.5rem auto 1.2rem auto',
                      display: 'block',
                    }}
                  >
                    Logout
                  </button>
                )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
