import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useTheme } from '../useTheme';
import { getOrders } from '../utils/orderStorage';
import { getProfile, saveProfile } from '../utils/profileStorage';
import LoginModal from '../components/LoginModal';

const Profile: React.FC = () => {
  const { theme } = useTheme();
  const [profile, setProfile] = useState(getProfile());
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const orders = getOrders();
  const lastOrder = orders.length > 0 ? orders[0] : null;
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('authToken'));
  const [editCylinders, setEditCylinders] = useState(profile.cylinders_count || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

// Type for other addresses (should match Order.tsx)
type OtherAddress = {
  name: string;
  phone: string;
  lat: string;
  lng: string;
};

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
        {!isLoggedIn ? (
          <>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Please log in to view your profile.</div>
            <button type="button" onClick={() => setShowLogin(true)} style={{ margin: '1rem auto', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '1rem', padding: '0.7rem 2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'block' }}>Login</button>
            {showLogin && (
              <LoginModal
                onSuccess={() => { setIsLoggedIn(true); setShowLogin(false); }}
                onClose={() => setShowLogin(false)}
                email={''}
              />
            )}
          </>
        ) : editing ? (
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
                body: JSON.stringify({ name: editName, phone_number: editPhone, cylinders_count: editCylinders }),
              });
              if (!res.ok) throw new Error('Failed to update profile in cloud');
              const updated = { ...profile, name: editName, phone: editPhone, cylinders_count: editCylinders };
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
            <label style={{ fontWeight: 600 }}>How many gas cylinders do you use?</label>
            <select
              value={editCylinders}
              onChange={e => setEditCylinders(e.target.value)}
              required
              style={{ padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', fontSize: '1rem' }}
            >
              <option value="" disabled>Select...</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value=">3">More than 3</option>
            </select>
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
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Name: {profile.name}</div>
            {profile.cylinders_count && (
              <div style={{ marginBottom: '0.5rem', color: '#0ea5e9', fontSize: '0.98rem', fontWeight: 700 }}>
                No of Cylinders at home: {profile.cylinders_count}
              </div>
            )}
            {profile.role && (
              <div style={{ marginBottom: '0.5rem', color: '#f59e42', fontSize: '0.98rem', fontWeight: 700 }}>
                Role: {profile.role}
              </div>
            )}
            {isLoggedIn && profile.email && (
              <div style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.98rem' }}>Email: {profile.email}</div>
            )}
            <div style={{ marginBottom: '0.5rem' }}>Whatsapp Contact: {profile.phone}</div>
             {/* Addresses Section */}
           {/* <div>{addressDisplay}</div>*/}
            <button onClick={() => {
              setEditName(profile.name);
              setEditPhone(profile.phone);
              setEditing(true);
            }} style={{
              background: theme === 'dark' ? '#38bdf8' : '#0f172a',
              color: theme === 'dark' ? '#0f172a' : '#fff',
              border: 'none', borderRadius: '2rem', padding: '0.7rem 2rem', fontSize: '1rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', marginTop: '0.5rem'
            }}>Edit My Info</button>

          </>
        )}
      </div>
            {/* Other Addresses Section */}
      <div style={{ margin: '1.5rem auto 2rem auto', maxWidth: 400 }}>
        <OtherAddresses />
      </div>
      {isLoggedIn && (
        <>
          <button
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('tapgas_profile');
              window.location.href = '/';
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

          {/* Request Account Deletion Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: '#fbbf24',
              color: '#0f172a',
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
            Request Account Deletion
          </button>

          {/* Modal for account deletion request */}
          {showDeleteModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.35)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                background: '#fff',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                minWidth: 260,
                textAlign: 'center',
              }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ef4444', marginBottom: '1.2rem' }}>
                  Account Deletion Request
                </div>
                <div style={{ fontSize: '1rem', marginBottom: '1.5rem', color: '#0f172a' }}>
                  Your request to delete your account and associated data will be processed within <b>30 business days</b>.<br /><br />
                  For immediate action, please use the email address below to request account deletion:<br />
                  <span style={{ display: 'inline-block', background: '#fbbf24', color: '#0f172a', fontWeight: 700, padding: '0.5rem 1.2rem', borderRadius: '0.7rem', margin: '0.7rem 0' }}>johnsondarko365@gmail.com</span>
                  <br />
                  <a href="/#/account-deletion" style={{ color: '#38bdf8', textDecoration: 'underline', fontWeight: 600 }}>Read more about account deletion</a>
                </div>
                <button
                  style={{
                    background: '#e5e7eb',
                    color: '#334155',
                    border: 'none',
                    borderRadius: '0.7rem',
                    padding: '0.5rem 1.2rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Permanent link for Google Play Store policy */}
          <div style={{ margin: '2rem auto 0 auto', maxWidth: 400, textAlign: 'center' }}>
            <a
              href="/#/account-deletion"
              style={{
                color: '#ef4444',
                fontWeight: 700,
                textDecoration: 'underline',
                fontSize: '1.05rem',
              }}
            >
              Read more about account/data deletion
            </a>
          </div>
        </>
      )}
    </div>
    
  );
};


export default Profile;

// --- OtherAddresses component ---
function getOtherAddresses() {
  try {
    return JSON.parse(localStorage.getItem('tapgas_other_addresses') || '[]');
  } catch {
    return [];
  }
}
function saveOtherAddresses(addresses: any[]) {
  localStorage.setItem('tapgas_other_addresses', JSON.stringify(addresses));
}

const OtherAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<OtherAddress[]>(() => getOtherAddresses());
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx] = useState<number>(-1);
  const [form, setForm] = useState<{ name: string; phone: string; lat: string; lng: string }>({ name: '', phone: '', lat: '', lng: '' });
  const [showFormError, setShowFormError] = useState(false);

  // For edit
  function handleEdit(idx: number) {
    setEditIdx(idx);
    setForm({
      name: addresses[idx].name,
      phone: addresses[idx].phone,
      lat: addresses[idx].lat,
      lng: addresses[idx].lng,
    });
    setShowForm(true);
  }

  function handleDelete(idx: number) {
    setDeleteIdx(idx);
  }

  function confirmDelete() {
    if (deleteIdx === null) return;
    const updated = addresses.slice();
    updated.splice(deleteIdx, 1);
    setAddresses(updated);
    saveOtherAddresses(updated);
    setDeleteIdx(null);
  }

  function cancelDelete() {
    setDeleteIdx(null);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.lat || !form.lng) {
      setShowFormError(true);
      return;
    }
    const newEntry = { ...form };
    let updated;
    if (editIdx >= 0) {
      updated = addresses.slice();
      updated[editIdx] = newEntry;
    } else {
      updated = [...addresses, newEntry];
    }
    setAddresses(updated);
    saveOtherAddresses(updated);
    setShowForm(false);
    setEditIdx(-1);
    setForm({ name: '', phone: '', lat: '', lng: '' });
  }

  function handleAddLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({ ...f, lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() }));
      },
      () => {
        alert('Could not get location. Please allow location access.');
      }
    );
  }

  return (
    <div style={{ background: '#f1f5f9', borderRadius: '1rem', padding: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.7rem', color: '#0f172a' }}>
        Other Addresses (e.g. for Parents)
      </div>
      {addresses.length === 0 && <div style={{ color: '#64748b', marginBottom: '0.7rem' }}>No other addresses saved yet.</div>}
      {addresses.map((addr, idx) => (
        <div key={idx} style={{ background: '#fff', borderRadius: '0.7rem', padding: '0.7rem', marginBottom: '0.7rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 600 }}>Name: {addr.name}</div>
          <div style={{ fontSize: '0.97rem', color: '#334155' }}>Contact: {addr.phone}</div>
          {/* Map view for this address */}
          {addr.lat && addr.lng && !isNaN(Number(addr.lat)) && !isNaN(Number(addr.lng)) && (
            <div style={{ margin: '0.7rem 0', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <iframe
                title={`Map for ${addr.name}`}
                src={`https://www.google.com/maps?q=${addr.lat},${addr.lng}&t=k&z=16&output=embed`}
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => handleEdit(idx)} style={{ background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '1rem', padding: '0.4rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
            <button type="button" onClick={() => handleDelete(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '1rem', padding: '0.4rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      ))}
      {/* Delete confirmation modal */}
      {deleteIdx !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
            minWidth: 260,
            textAlign: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ef4444', marginBottom: '1.2rem' }}>
              Delete this address?
            </div>
            <div style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete the address of <b>{addresses[deleteIdx]?.name}</b> ({addresses[deleteIdx]?.phone})?
            </div>
            <button
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '0.7rem',
                padding: '0.5rem 1.2rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                marginRight: '1rem',
              }}
              onClick={confirmDelete}
            >Delete</button>
            <button
              style={{
                background: '#e5e7eb',
                color: '#334155',
                border: 'none',
                borderRadius: '0.7rem',
                padding: '0.5rem 1.2rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
              onClick={cancelDelete}
            >Cancel</button>
          </div>
        </div>
      )}
      {showFormError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
            minWidth: 260,
            textAlign: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ef4444', marginBottom: '1.2rem' }}>
              Please fill all fields and add location.
            </div>
            <button
              style={{
                background: '#38bdf8',
                color: '#fff',
                border: 'none',
                borderRadius: '0.7rem',
                padding: '0.5rem 1.2rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '0.5rem',
              }}
              onClick={() => setShowFormError(false)}
            >OK</button>
          </div>
        </div>
      )}
      {showForm ? (
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginTop: '1rem' }}>
          <input name="name" value={form.name} onChange={handleFormChange} placeholder="Name of person" style={{ padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', fontSize: '1rem' }} required />
          <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="Contact number" style={{ padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', fontSize: '1rem' }} required />
          <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
            <button type="button" onClick={handleAddLocation} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '1rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Add Location</button>
          </div>
          {/* Map view for the address being added/edited */}
          {form.lat && form.lng && !isNaN(Number(form.lat)) && !isNaN(Number(form.lng)) && (
            <div style={{ margin: '0.7rem 0', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <iframe
                title="Map Preview"
                src={`https://www.google.com/maps?q=${form.lat},${form.lng}&t=k&z=16&output=embed`}
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.7rem' }}>
            <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '1rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>{editIdx >= 0 ? 'Save' : 'Add'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditIdx(-1); setForm({ name: '', phone: '', lat: '', lng: '' }); }} style={{ background: '#e5e7eb', color: '#334155', border: 'none', borderRadius: '1rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setShowForm(true)} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '1rem', padding: '0.7rem 2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginTop: '0.7rem' }}>Add New Address</button>
      )}
    </div>
  );
};
