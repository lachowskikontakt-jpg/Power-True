import { useState } from 'react';
import Login from './Login';
import Exercises from './Exercises';
import Plans from './Plans';
import Clients from './Clients';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('exercises');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <Login onLoginSuccess={() => setToken(localStorage.getItem('token'))} />;
  }

  const navBtnStyle = (tabName) => ({
    backgroundColor: activeTab === tabName ? '#EF4444' : 'transparent',
    color: activeTab === tabName ? '#ffffff' : '#9ca3af',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: '800',
    cursor: 'pointer',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  });

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#0a0a0a', borderBottom: '1px solid #1f2937', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ color: '#ffffff', fontWeight: '900', fontSize: '1.3rem', letterSpacing: '1px' }}>
            POWER <span style={{ color: '#EF4444' }}>TRUE</span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('exercises')} style={navBtnStyle('exercises')}>Atlas Ćwiczeń</button>
            <button onClick={() => setActiveTab('plans')} style={navBtnStyle('plans')}>Plany Treningowe</button>
            <button onClick={() => setActiveTab('clients')} style={navBtnStyle('clients')}>Podopieczni</button>
          </div>
        </div>

        <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #333', padding: '6px 14px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
          Wyloguj się
        </button>
      </nav>

      {activeTab === 'exercises' && <Exercises />}
      {activeTab === 'plans' && <Plans />}
      {activeTab === 'clients' && <Clients />}
    </div>
  );
}

export default App;
