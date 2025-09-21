import React from 'react';

interface CompleteProfileModalProps {
  missingFields: string[];
  onClose?: () => void;
}

const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ missingFields, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.25)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '1.2rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        padding: '2rem',
        minWidth: 320,
        maxWidth: 400,
        position: 'relative',
        textAlign: 'center',
      }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>Complete Your Profile</h2>
        <div style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.2rem' }}>
          Please provide the following information to complete your profile:
        </div>
        <ul style={{ color: '#ef4444', fontWeight: 600, fontSize: '1.05rem', marginBottom: '1.5rem', listStyle: 'none', padding: 0 }}>
          {missingFields.map(field => (
            <li key={field}>- {field}</li>
          ))}
        </ul>
        <a
          href="#/profile"
          style={{
            display: 'inline-block',
            background: '#38bdf8',
            color: '#fff',
            borderRadius: '1rem',
            padding: '0.7rem 1.5rem',
            fontWeight: 700,
            fontSize: '1.05rem',
            textDecoration: 'none',
            marginBottom: '0.5rem',
          }}
          onClick={onClose}
        >
          Go to Profile
        </a>
        {onClose && (
          <button onClick={onClose} style={{
            display: 'block',
            margin: '1.2rem auto 0 auto',
            background: '#f1f5f9',
            color: '#334155',
            border: 'none',
            borderRadius: '1.2rem',
            padding: '0.4rem 1.2rem',
            fontWeight: 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>Dismiss</button>
        )}
      </div>
    </div>
  );
};

export default CompleteProfileModal;
