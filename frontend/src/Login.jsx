import { useState } from 'react';
import api from './api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/login', {
        email: email,
        password: password
      });
      
      localStorage.setItem('token', response.data.token);
      onLoginSuccess();
    } catch (err) {
      setError('Błędny e-mail lub hasło');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#000000', color: '#f3f4f6', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ backgroundColor: '#121212', padding: '40px 30px', borderRadius: '8px', width: '100%', maxWidth: '400px', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.8)' }}>
        <h1 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '8px', fontSize: '2rem', fontWeight: '900', letterSpacing: '1px' }}>
          POWER <span style={{ color: '#EF4444' }}>TRUE</span>
        </h1>
        <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '30px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Panel Sterowania Trenera</p>
        
        {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '10px', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem', marginBottom: '20px' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>E-mail</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twojmail@gmail.com"
              style={{ width: '100%', padding: '12px 15px', borderRadius: '4px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hasło</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '4px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
              required 
            />
          </div>
          <button 
            type="submit" 
            style={{ backgroundColor: '#EF4444', color: '#ffffff', padding: '14px', borderRadius: '4px', border: 'none', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}
          >
            Zaloguj się
          </button>
        </form>
      </div>
    </div>
  );
}
