import { useState, useEffect } from 'react';
import Login from './Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <Login onLoginSuccess={() => setToken(localStorage.getItem('token'))} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#111827', color: 'white', fontFamily: 'sans-serif', padding: '20px' }}>
      <h1 style={{ color: '#10B981', fontSize: '2.5rem', margin: '0' }}>POWER TRUE</h1>
      <p style={{ color: '#9CA3AF', marginTop: '10px', fontSize: '1.1rem' }}>Panel Trenera – Jesteś pomyślnie zalogowany!</p>
      <button 
        onClick={handleLogout}
        style={{ backgroundColor: '#EF4444', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
      >
        Wyloguj się
      </button>
    </div>
  );
}

export default App;
