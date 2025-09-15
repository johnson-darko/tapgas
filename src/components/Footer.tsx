import React from 'react';

const Footer: React.FC = () => (
  <footer style={{
    textAlign: 'center',
    padding: '1rem',
    background: '#0f172a',
    color: '#fff',
    width: '100%',
    fontSize: '0.95rem',
    zIndex: 10,
    marginTop: '2rem',
    boxSizing: 'border-box',
  }}>
    TapGas &copy; {new Date().getFullYear()} &mdash; Order LPG, Track, Deliver. All rights reserved.
  </footer>
);

export default Footer;
