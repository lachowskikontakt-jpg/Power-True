import { useState } from 'react';
import api from './api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', response.data.access_token);
      onLoginSuccess();
    } catch (err) {
      setError('Błędny login lub hasło');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#111827', color: 'white', padding: '20px' }}>
      <div style={{ backgroundColor: '#1F2937', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        <h2 style={{ color: '#10B981', textAlign: 'center', marginBottom: '20px' }}>POWER TRUE</h2>
        {error && <p style={{ color: '#EF4444', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '5px' }}>Login</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#374151', border: '1px solid #4B5563', color: 'white', boxSizing: 'border-box' }}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '5px' }}>Hasło</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#374151', border: '1px solid #4B5563', color: 'white', boxSizing: 'border-box' }}
              required 
            />
          </div>
          <button 
            type="submit" 
            style={{ backgroundColor: '#10B981', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
          >
            Zaloguj się
          </button>
        </form>
      </div>
    </div>
  );
}
