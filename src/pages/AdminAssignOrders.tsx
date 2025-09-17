

import React, { useEffect, useState } from 'react';
import { getOrders } from '../utils/orderStorage';
import type { Order } from '../utils/orderStorage';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Helper: Load drivers from localStorage
function getDrivers(): string[] {
  try {
    const raw = localStorage.getItem('tapgas_drivers');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Helper: Simple clustering by proximity (group by ~0.01 lat/lng grid)
type OrderCluster = Order[];
function clusterOrders(orders: Order[]): OrderCluster[] {
  const clusters: { [key: string]: Order[] } = {};
  orders.forEach((order: Order) => {
    if (!order.location || typeof order.location.lat !== 'number' || typeof order.location.lng !== 'number') return;
    const latKey = Math.round(order.location.lat * 100);
    const lngKey = Math.round(order.location.lng * 100);
    const key = `${latKey},${lngKey}`;
    if (!clusters[key]) clusters[key] = [];
    clusters[key].push(order);
  });
  return Object.values(clusters);
}

type AssignedCluster = { driver: string } | null;

import { useNavigate } from 'react-router-dom';

const AdminAssignOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [assigningCluster, setAssigningCluster] = useState<number | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  // Track assigned clusters: index -> { driver }
  const [assigned, setAssigned] = useState<AssignedCluster[]>(() => {
    try {
      const raw = localStorage.getItem('tapgas_assigned_clusters');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [view, setView] = useState<'assign' | 'drivers'>('assign');
  const navigate = useNavigate();

  useEffect(() => {
    setOrders(getOrders().filter((o: Order) => o.status !== 'delivered' && o.location));
    setDrivers(getDrivers());
  }, []);

  const clusters: OrderCluster[] = clusterOrders(orders);

  const handleAssign = (clusterIdx: number) => {
    setAssigningCluster(clusterIdx);
    setSelectedDriver('');
    setSearch('');
  };

  const handleConfirmAssign = async () => {
    if (assigningCluster !== null) {
      const clusterOrders = clusters[assigningCluster];
      const orderIds = clusterOrders.map(o => o.orderId).filter(Boolean);
      try {
        const res = await fetch('http://localhost:5020/assign-cluster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ driver_email: selectedDriver, order_ids: orderIds }),
        });
        const data = await res.json();
        if (data.success) {
          setAssigned(prev => {
            const next = [...prev];
            next[assigningCluster] = { driver: selectedDriver };
            localStorage.setItem('tapgas_assigned_clusters', JSON.stringify(next));
            return next;
          });
          setAssigningCluster(null);
          setSelectedDriver('');
          alert(`Assigned cluster to driver: ${selectedDriver}`);
        } else {
          alert('Failed to assign cluster: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Network error assigning cluster');
      }
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: '1.2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setView('assign')}
          style={{
            background: view === 'assign' ? '#38bdf8' : '#e5e7eb',
            color: view === 'assign' ? '#fff' : '#0f172a',
            border: 'none',
            borderRadius: '0.7rem',
            padding: '0.5rem 1.2rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >Assign Orders</button>
        <button
          onClick={() => navigate('/admin-drivers')}
          style={{
            background: view === 'drivers' ? '#38bdf8' : '#e5e7eb',
            color: view === 'drivers' ? '#fff' : '#0f172a',
            border: 'none',
            borderRadius: '0.7rem',
            padding: '0.5rem 1.2rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >Assign Regions/Zones</button>
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Assign Orders to Drivers</h2>
      {clusters.length === 0 ? (
        <div>No undelivered orders with location found.</div>
      ) : (
        clusters.map((cluster: OrderCluster, idx: number) => {
          // Pick a color for this cluster
          const clusterColors = [
            '#38bdf8', // blue
            '#fbbf24', // yellow
            '#0ea5e9', // cyan
            '#ef4444', // red
            '#22c55e', // green
            '#a21caf', // purple
          ];
          const color = clusterColors[idx % clusterColors.length];
          // Center map on first order in cluster or default Lagos
          const firstLoc = cluster[0]?.location && typeof cluster[0].location.lat === 'number' && typeof cluster[0].location.lng === 'number'
            ? cluster[0].location
            : { lat: 6.5244, lng: 3.3792 };
          const isAssigned = assigned[idx] && assigned[idx]?.driver;
          return (
            <div key={idx} style={{ marginBottom: '2rem', padding: '1.2rem', border: isAssigned ? '2px solid #22c55e' : '1px solid #e5e7eb', borderRadius: '1rem', background: isAssigned ? '#f0fdf4' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.7rem' }}>
                <span style={{ fontWeight: 600, color: isAssigned ? '#22c55e' : undefined }}>
                  Cluster #{idx + 1} ({cluster.length} orders)
                </span>
                {isAssigned && (
                  <>
                    <span style={{ marginLeft: 12, fontWeight: 500, color: '#16a34a', fontSize: '1rem', background: '#dcfce7', borderRadius: '0.5rem', padding: '0.2rem 0.7rem' }}>
                      Assigned: {assigned[idx]?.driver}
                    </span>
                    <button
                      onClick={() => {
                        setAssigned(prev => {
                          const next = [...prev];
                          next[idx] = null;
                          localStorage.setItem('tapgas_assigned_clusters', JSON.stringify(next));
                          return next;
                        });
                      }}
                      style={{ marginLeft: 10, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.2rem 0.7rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
                    >Unassign</button>
                  </>
                )}
              </div>
              <ul style={{ marginBottom: '1rem' }}>
                {cluster.map((order: Order) => (
                  <li key={order.orderId}>
                    {order.customerName || 'N/A'} - {order.address || 'N/A'} (Lat: {order.location?.lat}, Lng: {order.location?.lng})
                  </li>
                ))}
              </ul>
              <div style={{ width: '100%', height: '260px', marginBottom: '1.2rem', borderRadius: '1rem', overflow: 'hidden' }}>
                <MapContainer
                  center={[
                    typeof firstLoc.lat === 'number' ? firstLoc.lat : 6.5244,
                    typeof firstLoc.lng === 'number' ? firstLoc.lng : 3.3792
                  ]}
                  zoom={13}
                  style={{ width: '100%', height: '100%' }}
                  scrollWheelZoom={true}
                  dragging={true}
                  doubleClickZoom={true}
                  zoomControl={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {/* Group orders by lat/lng string */}
                  {Object.entries(
                    cluster.reduce((acc, order) => {
                      if (order.location && typeof order.location.lat === 'number' && typeof order.location.lng === 'number') {
                        const key = `${order.location.lat},${order.location.lng}`;
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(order);
                      }
                      return acc;
                    }, {} as Record<string, Order[]>)
                  ).map(([locKey, ordersAtLoc], i) => {
                    const [lat, lng] = locKey.split(',').map(Number);
                    return (
                      <CircleMarker
                        key={locKey}
                        center={[lat, lng]}
                        radius={16}
                        pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}
                      >
                        <Popup>
                          <b>{ordersAtLoc.length > 1 ? `${ordersAtLoc.length} Orders` : ordersAtLoc[0].customerName || 'Order'}</b><br />
                          {ordersAtLoc[0].address}<br />
                          <span style={{ color: '#64748b', fontSize: '0.95em' }}>Lat: {lat}, Lng: {lng}</span>
                          {ordersAtLoc.length > 1 && (
                            <ul style={{
                              margin: '0.7em 0 0 0',
                              padding: 0,
                              listStyle: 'none',
                              maxHeight: '120px',
                              overflowY: 'auto',
                            }}>
                              {ordersAtLoc.map((o) => (
                                <li key={o.orderId} style={{ fontSize: '0.97em', marginBottom: '0.2em' }}>
                                  {o.customerName || 'Order'} - {o.orderId}
                                </li>
                              ))}
                            </ul>
                          )}
                        </Popup>
                        {/* Show count badge if multiple orders at this location */}
                        {ordersAtLoc.length > 1 ? (
                          <div style={{
                            position: 'absolute',
                            left: '-12px',
                            top: '-12px',
                            background: color,
                            color: '#fff',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            border: '2px solid #fff',
                            pointerEvents: 'none',
                          }}>{ordersAtLoc.length}</div>
                        ) : (
                          <div style={{
                            position: 'absolute',
                            left: '-12px',
                            top: '-12px',
                            background: color,
                            color: '#fff',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1rem',
                            border: '2px solid #fff',
                            pointerEvents: 'none',
                          }}>1</div>
                        )}
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
              <button onClick={() => handleAssign(idx)} style={{ background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '0.7rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Assign to Driver</button>
              {assigningCluster === idx && (
                <div style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.18)',
                  zIndex: 10000,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    background: '#fff',
                    borderRadius: '1rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    padding: '2rem',
                    minWidth: 320,
                    maxWidth: '90vw',
                    position: 'relative',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>Assign Cluster #{idx + 1} to Driver</div>
                    <input
                      type="text"
                      placeholder="Search driver by email..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{ width: '100%', marginBottom: '1rem', padding: '0.6rem 1rem', borderRadius: '0.7rem', border: '1px solid #e5e7eb', fontSize: '1rem' }}
                    />
                    <div style={{ marginBottom: '1rem' }}>
                      <select
                        value={selectedDriver}
                        onChange={e => setSelectedDriver(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '0.7rem', fontSize: '1rem' }}
                      >
                        <option value="">-- Select Driver --</option>
                        {drivers.filter(email => email.toLowerCase().includes(search.toLowerCase())).map(email => (
                          <option key={email} value={email}>{email}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem' }}>
                      <button
                        onClick={handleConfirmAssign}
                        disabled={!selectedDriver}
                        style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '0.7rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: selectedDriver ? 'pointer' : 'not-allowed' }}
                      >Confirm</button>
                      <button
                        onClick={() => setAssigningCluster(null)}
                        style={{ background: '#e5e7eb', color: '#0f172a', border: 'none', borderRadius: '0.7rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}
                      >Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminAssignOrders;
