import React, { useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../useTheme';
import { getOrders } from '../utils/orderStorage';
import type { Order } from '../utils/orderStorage';

const DriverRoute: React.FC = () => {
  const { theme } = useTheme();
  const [view, setView] = useState<'map' | 'list'>('map');
  // Only show not delivered orders
  const activeOrders = getOrders().filter((o: Order) => o.status !== 'delivered' && !!o.orderId);
  // Group orders by address (area/neighborhood)
  const groupedOrders: { [address: string]: Order[] } = {};
  activeOrders.forEach((order: Order) => {
    // Defensive: ensure all required fields for OrderCard are present if used
    order.customerName = order.customerName ?? '';
    order.address = order.address ?? '';
    order.cylinderType = order.cylinderType ?? '';
    order.uniqueCode = typeof order.uniqueCode === 'number' ? order.uniqueCode : (typeof order.uniqueCode === 'string' ? parseInt(order.uniqueCode, 10) || 0 : 0);
    order.status = order.status ?? '';
    order.date = order.date ?? '';
    order.amountPaid = order.amountPaid ?? 0;
    order.location = {
      lat: typeof order.location?.lat === 'number' ? order.location.lat : 0,
      lng: typeof order.location?.lng === 'number' ? order.location.lng : 0,
    };
    const key = order.address.trim();
    if (!groupedOrders[key]) groupedOrders[key] = [];
    groupedOrders[key].push(order);
  });
  // Sort each group by orderId (oldest first)
  Object.keys(groupedOrders).forEach(address => {
    groupedOrders[address].sort((a, b) => {
      const aId = typeof a.orderId === 'number' ? a.orderId : (typeof a.orderId === 'string' ? parseInt(a.orderId, 10) || 0 : 0);
      const bId = typeof b.orderId === 'number' ? b.orderId : (typeof b.orderId === 'string' ? parseInt(b.orderId, 10) || 0 : 0);
      return aId - bId;
    });
  });
  const groupKeys = Object.keys(groupedOrders);

  const allStops: Array<{order: Order, groupIdx: number, idx: number}> = [];
  groupKeys.forEach((address, groupIdx) => {
    groupedOrders[address].forEach((order, idx) => {
      allStops.push({ order, groupIdx, idx });
    });
  });

  // Center map on first stop or default Lagos
  const firstLoc = allStops[0]?.order.location && typeof allStops[0].order.location.lat === 'number' && typeof allStops[0].order.location.lng === 'number'
    ? allStops[0].order.location
    : { lat: 6.5244, lng: 3.3792 };

  // Next stop: first in allStops
  // ...existing code...

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'dark' ? '#18181b' : '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      overflowX: 'hidden',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        background: theme === 'dark' ? '#23272f' : '#fff',
        borderRadius: '1.2rem',
        boxShadow: theme === 'dark'
          ? '0 4px 24px rgba(56,189,248,0.10)'
          : '0 4px 24px rgba(0,0,0,0.08)',
        padding: '2.5rem 1.5rem 2rem 1.5rem',
        marginTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '2rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a' }}>
          Today's Delivery Route
        </h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setView(view === 'map' ? 'list' : 'map')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '0.7rem',
              border: 'none',
              background: theme === 'dark' ? '#fbbf24' : '#0ea5e9',
              color: theme === 'dark' ? '#23272f' : '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >{view === 'map' ? 'Show List View' : 'Show Map View'}</button>
        </div>
        {groupKeys.length > 0 ? (
          view === 'map' ? (
            <div style={{ width: '100%', height: '400px', marginBottom: '2rem', borderRadius: '1rem', overflow: 'hidden' }}>
              <MapContainer center={[
                typeof firstLoc.lat === 'number' ? firstLoc.lat : 6.5244,
                typeof firstLoc.lng === 'number' ? firstLoc.lng : 3.3792
              ]} zoom={13} style={{ width: '100%', height: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {allStops.map(({ order, groupIdx, idx }, i) => {
                  if (!order.location) return null;
                  // Assign a color per group
                  const groupColors = [
                    '#38bdf8', // blue
                    '#fbbf24', // yellow
                    '#0ea5e9', // cyan
                    '#ef4444', // red
                    '#22c55e', // green
                    '#a21caf', // purple
                  ];
                  const color = groupColors[groupIdx % groupColors.length];
                  if (i === 0) {
                    return (
                      <CircleMarker
                        key={order.orderId}
                        center={order.location && typeof order.location.lat === 'number' && typeof order.location.lng === 'number' ? [order.location.lat, order.location.lng] : [6.5244, 3.3792]}
                        radius={16}
                        pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}
                      >
                        <Popup>
                          <b>Next Stop</b><br />
                          Group {groupIdx + 1}, Stop {idx + 1}<br />
                          {order.cylinderType === 'Buy Cylinder' ? 'Deliver Cylinder' : 'Pickup Gas'}<br />
                          {order.address}<br />
                          {order.location && (
                            <button
                              style={{
                                marginTop: '0.7em',
                                padding: '0.4em 1em',
                                borderRadius: '0.5em',
                                border: 'none',
                                background: '#0ea5e9',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.95em',
                                cursor: 'pointer',
                              }}
                               onClick={() => order.location && window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.location.lat},${order.location.lng}`, '_blank')}
                            >Take Me There</button>
                          )}
                        </Popup>
                        {/* Number label for next stop */}
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
                        }}>{idx + 1}</div>
                      </CircleMarker>
                    );
                  } else {
                    return (
                      <Marker
                        key={order.orderId}
                        position={order.location && typeof order.location.lat === 'number' && typeof order.location.lng === 'number' ? [order.location.lat, order.location.lng] : [6.5244, 3.3792]}
                        icon={L.divIcon({
                          className: 'custom-marker',
                          html: `<div style="background:${color};color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;border:2px solid #fff;">${idx + 1}</div>`
                        })}
                      >
                        <Popup>
                          Group {groupIdx + 1}, Stop {idx + 1}<br />
                          {order.cylinderType === 'Buy Cylinder' ? 'Deliver Cylinder' : 'Pickup Gas'}<br />
                          {order.address}<br />
                          {order.location && (
                            <button
                              style={{
                                marginTop: '0.7em',
                                padding: '0.4em 1em',
                                borderRadius: '0.5em',
                                border: 'none',
                                background: color,
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.95em',
                                cursor: 'pointer',
                              }}
                               onClick={() => order.location && window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.location.lat},${order.location.lng}`, '_blank')}
                            >Take Me There</button>
                          )}
                        </Popup>
                      </Marker>
                    );
                  }
                })}
              </MapContainer>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {groupKeys.map((address, groupIdx) => (
                <div key={address} style={{ marginBottom: '2rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a', marginBottom: '0.7rem' }}>
                    Area/Address Group {groupIdx + 1}: {address}
                  </div>
                  {groupedOrders[address].map((order, idx) => (
                    <div key={order.orderId} style={{
                      background: theme === 'dark' ? '#334155' : '#f1f5f9',
                      color: theme === 'dark' ? '#fbbf24' : '#334155',
                      borderRadius: '1rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      padding: '1.2rem',
                      marginBottom: '1.2rem',
                      fontWeight: 500,
                      fontSize: '1.08rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: theme === 'dark' ? '#38bdf8' : '#0f172a' }}>
                        Stop {idx + 1} in Group {groupIdx + 1}
                      </div>
                      <div>
                        <span style={{ fontWeight: 700 }}>Type:</span> {order.cylinderType === 'Buy Cylinder' ? 'Deliver Cylinder' : 'Pickup Gas'}
                      </div>
                      <div>
                        <span style={{ fontWeight: 700 }}>Address:</span> {order.address}
                      </div>
                      {order.notes && (
                        <div><span style={{ fontWeight: 700 }}>Note:</span> {order.notes}</div>
                      )}
                      <div style={{ fontSize: '0.95rem', color: theme === 'dark' ? '#fbbf24' : '#64748b' }}>
                        Order ID: {order.orderId} | {order.cylinderType}
                      </div>
                      {order.location && (
                        <a
                          href={`https://www.google.com/maps?q=${order.location.lat},${order.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: theme === 'dark' ? '#38bdf8' : '#0f172a', fontWeight: 600, textDecoration: 'underline', fontSize: '0.98rem' }}
                        >View on Map</a>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        ) : (
          <div style={{
            maxWidth: '350px',
            margin: '2rem auto',
            background: theme === 'dark' ? '#23272f' : '#f8fafc',
            borderRadius: '1.2rem',
            boxShadow: theme === 'dark' ? '0 2px 12px rgba(56,189,248,0.10)' : '0 2px 12px rgba(0,0,0,0.08)',
            padding: '2rem',
            textAlign: 'center',
            color: theme === 'dark' ? '#fbbf24' : '#334155',
            fontWeight: 600,
            fontSize: '1.1rem',
          }}>
            <span role="img" aria-label="route" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>🗺️</span>
            No active deliveries.<br />Your route will appear here when orders are assigned.
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverRoute;
