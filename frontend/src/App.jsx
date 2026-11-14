import { useState } from 'react';
import Login from './Login';
import Exercises from './Exercises';
import Plans from './Plans';

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

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      {/* Górny pasek nawigacji */}
      <nav style={{ backgroundColor: '#0a0a0a', borderBottom: '1px solid #1f2937', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div style={{ color: '#ffffff', fontWeight: '900', fontSize: '1.3rem', letterSpacing: '1px' }}>
            POWER <span style={{ color: '#EF4444' }}>TRUE</span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('exercises')}
              style={{
                backgroundColor: activeTab === 'exercises' ? '#EF4444' : 'transparent',
                color: activeTab === 'exercises' ? '#ffffff' : '#9ca3af',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Atlas Ćwiczeń
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              style={{
                backgroundColor: activeTab === 'plans' ? '#EF4444' : 'transparent',
                color: activeTab === 'plans' ? '#ffffff' : '#9ca3af',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Plany Treningowe
            </button>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          style={{ backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #333', padding: '6px 14px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Wyloguj się
        </button>
      </nav>

      {/* Wyświetlanie aktywnej zakładki */}
      {activeTab === 'exercises' && <Exercises />}
      {activeTab === 'plans' && <Plans />}
    </div>
  );
}

export default App;
