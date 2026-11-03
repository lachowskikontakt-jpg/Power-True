import { useState } from 'react';
import Login from './Login';
import Exercises from './Exercises';

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
    <div>
      <div style={{ backgroundColor: '#000000', borderBottom: '1px solid #1f2937', padding: '10px 30px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleLogout}
          style={{ backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #333', padding: '6px 14px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Wyloguj się
        </button>
      </div>
      <Exercises />
    </div>
  );
}

export default App;
