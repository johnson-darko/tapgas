import React, { useState } from 'react';
import { useTheme } from '../useTheme';
import { getOrders } from '../utils/orderStorage';
import type { Order } from '../utils/orderStorage';
import OrderCard from '../components/OrderCard';

const DriverOrders: React.FC = () => {
  const { theme } = useTheme();
  // For MVP, show all not delivered orders as 'assigned' to driver
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const assignedOrders: Order[] = orders.filter((o: Order) => o.status !== 'delivered');

  const updateOrderStatus = (orderId: number, status: string, failNote?: string) => {
    const updatedOrders = orders.map(order =>
      order.orderId === orderId
        ? { ...order, status, failedNote: failNote }
        : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('tapgas_orders', JSON.stringify(updatedOrders));
  };

  // Modal for failed delivery note
  const [failModalOrderId, setFailModalOrderId] = useState<number | null>(null);
  const [failNote, setFailNote] = useState('');

  const [showInfo, setShowInfo] = useState(false);

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
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '2rem', color: theme === 'dark' ? '#fbbf24' : '#0f172a', flex: 1 }}>
            Assigned Orders
          </h2>
          <button
            onClick={() => setShowInfo(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: theme === 'dark' ? '#38bdf8' : '#0f172a', marginLeft: '0.5rem' }}
            title="Driver Help"
          >❓</button>
        </div>
        {showInfo && (
          <div style={{
            position: 'absolute',
            top: '3.5rem',
            right: '1.5rem',
            background: theme === 'dark' ? '#23272f' : '#fff',
            border: '1px solid #38bdf8',
            borderRadius: '1rem',
            boxShadow: '0 2px 12px rgba(56,189,248,0.10)',
            padding: '1.2rem',
            zIndex: 100,
            maxWidth: '320px',
            color: theme === 'dark' ? '#fbbf24' : '#0f172a',
          }}>
            <div style={{ fontWeight: 700, marginBottom: '0.7rem', fontSize: '1.1rem' }}>Driver Actions</div>
            <div style={{ marginBottom: '0.7rem' }}>
              <b>Mark Picked Up:</b> Use this button when you have collected the cylinder from the customer. It updates the order status to <span style={{ color: '#38bdf8' }}>'On Way'</span>.
            </div>
            <div>
              <b>Mark Delivered:</b> Use this button after you have delivered the cylinder to the customer. It updates the order status to <span style={{ color: '#22c55e' }}>'Delivered'</span>.
            </div>
            <button
              onClick={() => setShowInfo(false)}
              style={{ marginTop: '1rem', background: theme === 'dark' ? '#38bdf8' : '#0f172a', color: theme === 'dark' ? '#0f172a' : '#fff', border: 'none', borderRadius: '1rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}
            >Close</button>
          </div>
        )}
        {assignedOrders.length > 0 ? (
          assignedOrders.map((order: Order) => {
            // Only show multi-step for 'Order LPG Gas Refill' (not Buy Cylinder)
            const isOrderGas = !order.cylinderType.includes('Cylinder');
            return (
              <div key={order.orderId} style={{ width: '100%' }}>
                <OrderCard order={order} />
                {/* Show new workflow details for LPG Gas Refill */}
                {isOrderGas && (
                  <div style={{
                    background: theme === 'dark' ? '#23272f' : '#f1f5f9',
                    color: theme === 'dark' ? '#38bdf8' : '#0f172a',
                    borderRadius: '0.8rem',
                    padding: '0.7rem 1.2rem',
                    margin: '0.5rem 0 1rem 0',
                    fontSize: '0.98rem',
                    fontWeight: 500,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}>
                    <div><b>Service Type:</b> {order.serviceType === 'kiosk' ? 'Drop off at Kiosk' : order.serviceType === 'pickup' ? 'Pickup from Home' : '-'}</div>
                    <div><b>Time Slot:</b> {order.timeSlot === 'morning' ? 'Morning (4:30–9:00 AM)' : order.timeSlot === 'evening' ? 'Evening (4:30–8:00 PM)' : '-'}</div>
                    <div><b>Delivery Window:</b> {
                      order.deliveryWindow === 'sameDayEvening' ? 'Same Day Evening (4:30–7:00 PM)' :
                      order.deliveryWindow === 'nextMorning' ? 'Next Morning (5:00–9:00 AM)' :
                      order.deliveryWindow === 'nextEvening' ? 'Next Evening (4:30–8:00 PM)' : '-'
                    }</div>
                    {order.pickupFee ? <div><b>Pickup Fee:</b> ₦{order.pickupFee}</div> : null}
                  </div>
                )}
                {order.notes && (
                  <div style={{
                    background: theme === 'dark' ? '#334155' : '#f1f5f9',
                    color: theme === 'dark' ? '#fbbf24' : '#334155',
                    borderRadius: '0.8rem',
                    padding: '0.8rem 1.2rem',
                    margin: '0.5rem 0 1rem 0',
                    fontSize: '1rem',
                    fontWeight: 500,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}>
                    <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>Delivery Note:</span>
                    {order.notes}
                  </div>
                )}
                {isOrderGas && (
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.orderId, 'pickedup')}
                        style={{
                          background: theme === 'dark' ? '#fbbf24' : '#38bdf8',
                          color: theme === 'dark' ? '#0f172a' : '#fff',
                          border: 'none',
                          borderRadius: '2rem',
                          padding: '0.7rem 2rem',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                        }}
                      >Mark Picked Up</button>
                    )}
                    {order.status === 'pickedup' && (
                      <button
                        onClick={() => updateOrderStatus(order.orderId, 'onway')}
                        style={{
                          background: theme === 'dark' ? '#38bdf8' : '#fbbf24',
                          color: theme === 'dark' ? '#0f172a' : '#fff',
                          border: 'none',
                          borderRadius: '2rem',
                          padding: '0.7rem 2rem',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                        }}
                      >Start Delivery</button>
                    )}
                    {order.status === 'onway' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.orderId, 'delivered')}
                          style={{
                            background: theme === 'dark' ? '#22c55e' : '#fbbf24',
                            color: theme === 'dark' ? '#0f172a' : '#fff',
                            border: 'none',
                            borderRadius: '2rem',
                            padding: '0.7rem 2rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            cursor: 'pointer',
                          }}
                        >Mark Delivered</button>
                        <button
                          onClick={() => { setFailModalOrderId(order.orderId); setFailNote(''); }}
                          style={{
                            background: theme === 'dark' ? '#ef4444' : '#cd1b1bff',
                            color: theme === 'dark' ? '#0f172a' : '#fff',
                            border: 'none',
                            borderRadius: '2rem',
                            padding: '0.7rem 2rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            cursor: 'pointer',
                            marginLeft: '0.5rem',
                          }}
                        >Mark Failed Delivery</button>
                      </>
                    )}
      {/* Failed Delivery Modal */}
      {failModalOrderId !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: theme === 'dark' ? '#23272f' : '#fff',
            borderRadius: '1.2rem',
            boxShadow: theme === 'dark' ? '0 4px 24px rgba(56,189,248,0.10)' : '0 4px 24px rgba(0,0,0,0.08)',
            padding: '2.5rem 1.5rem 2rem 1.5rem',
            maxWidth: '350px',
            width: '90vw',
            textAlign: 'center',
            color: theme === 'dark' ? '#ef4444' : '#0f172a',
            fontWeight: 600,
            fontSize: '1.1rem',
            position: 'relative',
          }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.7rem' }}>
              Mark Failed Delivery
            </div>
            <div style={{ fontSize: '1rem', marginBottom: '0.7rem' }}>
              Please enter a comment or note for the customer:
            </div>
            <textarea
              value={failNote}
              onChange={e => setFailNote(e.target.value)}
              placeholder="Reason for failed delivery..."
              style={{ width: '100%', minHeight: '60px', padding: '0.7rem', borderRadius: '0.8rem', border: '1px solid #e5e7eb', marginBottom: '1rem', fontSize: '1rem', resize: 'vertical' }}
            />
            <button
              onClick={() => {
                updateOrderStatus(failModalOrderId, 'failed', failNote);
                setFailModalOrderId(null);
                setFailNote('');
              }}
              style={{
                background: theme === 'dark' ? '#ef4444' : '#fbbf24',
                color: theme === 'dark' ? '#0f172a' : '#fff',
                border: 'none',
                borderRadius: '2rem',
                padding: '0.7rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                marginRight: '0.7rem',
              }}
              disabled={!failNote.trim()}
            >Submit Failed Delivery</button>
            <button
              onClick={() => { setFailModalOrderId(null); setFailNote(''); }}
              style={{
                background: theme === 'dark' ? '#334155' : '#e5e7eb',
                color: theme === 'dark' ? '#fbbf24' : '#0f172a',
                border: 'none',
                borderRadius: '2rem',
                padding: '0.7rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
              }}
            >Cancel</button>
          </div>
        </div>
      )}
                  </div>
                )}
                {/* For Buy Cylinder, keep old logic (if needed) */}
                {!isOrderGas && (
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.orderId, 'onway')}
                        style={{
                          background: theme === 'dark' ? '#38bdf8' : '#fbbf24',
                          color: theme === 'dark' ? '#0f172a' : '#fff',
                          border: 'none',
                          borderRadius: '2rem',
                          padding: '0.7rem 2rem',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                        }}
                      >Start Delivery</button>
                    )}
                    {order.status === 'onway' && (
                      <button
                        onClick={() => updateOrderStatus(order.orderId, 'delivered')}
                        style={{
                          background: theme === 'dark' ? '#22c55e' : '#fbbf24',
                          color: theme === 'dark' ? '#0f172a' : '#fff',
                          border: 'none',
                          borderRadius: '2rem',
                          padding: '0.7rem 2rem',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                        }}
                      >Mark Delivered</button>
                    )}
                  </div>
                )}
              </div>
            );
          })
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
            <span role="img" aria-label="driver" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>🚚</span>
            No assigned orders yet.<br />Assigned orders will appear here for pickup and delivery.
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverOrders;
