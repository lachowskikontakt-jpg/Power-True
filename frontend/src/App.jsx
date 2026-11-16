import { useState, useEffect } from 'react';
import api from './api';
import Login from './Login';
import Exercises from './Exercises';
import Plans from './Plans';
import Clients from './Clients';
import Chat from './Chat';
import TrainerProfile from './TrainerProfile';
import TraineeDashboard from './TraineeDashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'admin');
  const [activeTab, setActiveTab] = useState('exercises');

  useEffect(() => {
    if (!token) return;
    api.get('/api/auth/me')
      .then(res => {
        const fetchedRole = res.data?.role || 'trainee';
        setRole(fetchedRole);
        localStorage.setItem('userRole', fetchedRole);
      })
      .catch(() => {});
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setToken(null);
  };

  if (!token) {
    return (
      <Login
        onLoginSuccess={() => {
          setToken(localStorage.getItem('token'));
          setRole(localStorage.getItem('userRole') || 'admin');
        }}
      />
    );
  }

  if (role !== 'admin') {
    return <TraineeDashboard onLogout={handleLogout} />;
  }

  const navBtnStyle = (tabName) => ({
    backgroundColor: activeTab === tabName ? '#EF4444' : 'transparent',
    color: activeTab === tabName ? '#ffffff' : '#9ca3af',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '4px',
    fontWeight: '800',
    cursor: 'pointer',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  });

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <nav style={{ backgroundColor: '#0a0a0a', borderBottom: '1px solid #1f2937', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap' }}>
          <div
            onClick={() => setActiveTab('exercises')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            {/* Sama sztanga w pasku nawigacji */}
            <svg viewBox="25 170 462 172" style={{ width: '74px', height: 'auto', display: 'block' }}>
              <rect x="160" y="250" width="192" height="12" fill="#9ca3af"/>
              <rect x="172" y="250" width="60" height="12" fill="#e5e7eb"/>
              <rect x="280" y="250" width="60" height="12" fill="#e5e7eb"/>
              <rect x="253" y="250" width="6" height="12" fill="#EF4444"/>
              <rect x="34" y="245" width="126" height="22" rx="2" fill="#d1d5db"/>
              <rect x="352" y="245" width="126" height="22" rx="2" fill="#d1d5db"/>
              <rect x="152" y="232" width="10" height="48" rx="1" fill="#ffffff"/>
              <rect x="350" y="232" width="10" height="48" rx="1" fill="#ffffff"/>
              <rect x="127" y="178" width="22" height="156" rx="2" fill="#EF4444"/>
              <rect x="106" y="178" width="18" height="156" rx="2" fill="#2563EB"/>
              <rect x="88" y="188" width="15" height="136" rx="2" fill="#FACC15"/>
              <rect x="73" y="199" width="12" height="114" rx="2" fill="#16A34A"/>
              <rect x="62" y="211" width="8" height="90" rx="2" fill="#FFFFFF"/>
              <rect x="363" y="178" width="22" height="156" rx="2" fill="#EF4444"/>
              <rect x="388" y="178" width="18" height="156" rx="2" fill="#2563EB"/>
              <rect x="409" y="188" width="15" height="136" rx="2" fill="#FACC15"/>
              <rect x="427" y="199" width="12" height="114" rx="2" fill="#16A34A"/>
              <rect x="442" y="211" width="8" height="90" rx="2" fill="#FFFFFF"/>
            </svg>

            <div style={{ fontFamily: "'Arial Black', Impact, sans-serif", fontWeight: '900', fontSize: '1.4rem', letterSpacing: '1.5px', lineHeight: 1, fontStyle: 'italic' }}>
              <span style={{ color: '#ffffff', textShadow: '2px 2px 0px rgba(239, 68, 68, 0.45)' }}>POWER</span>{' '}
              <span style={{ color: '#EF4444', textShadow: '2px 2px 0px rgba(255, 255, 255, 0.15)' }}>TRUE</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('exercises')} style={navBtnStyle('exercises')}>Atlas Ćwiczeń</button>
            <button onClick={() => setActiveTab('plans')} style={navBtnStyle('plans')}>Plany Treningowe</button>
            <button onClick={() => setActiveTab('clients')} style={navBtnStyle('clients')}>Podopieczni</button>
            <button onClick={() => setActiveTab('chat')} style={navBtnStyle('chat')}>Wiadomości</button>
            <button onClick={() => setActiveTab('profile')} style={navBtnStyle('profile')}>Wizytówka</button>
          </div>
        </div>

        <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #333', padding: '6px 14px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Wyloguj się
        </button>
      </nav>

      {activeTab === 'exercises' && <Exercises />}
      {activeTab === 'plans' && <Plans />}
      {activeTab === 'clients' && <Clients />}
      {activeTab === 'chat' && <Chat />}
      {activeTab === 'profile' && <TrainerProfile />}
    </div>
  );
}

export default App;
