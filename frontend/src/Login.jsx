import { useState } from 'react';
import api from './api';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister ? { name, email, password } : { email, password };
      const response = await api.post(endpoint, payload);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user?.role || 'trainee');
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Błąd logowania lub rejestracji');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '4px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    color: '#ffffff',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#000000', color: '#f3f4f6', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px' }}>
      <style>{`
        .pt-input:-webkit-autofill,
        .pt-input:-webkit-autofill:hover,
        .pt-input:-webkit-autofill:focus,
        .pt-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #1a1a1a inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff !important;
          border: 1px solid #333 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        .pt-input:focus {
          border-color: #EF4444 !important;
        }
      `}</style>

      <div style={{ backgroundColor: '#121212', padding: '40px 30px', borderRadius: '8px', width: '100%', maxWidth: '400px', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.8)' }}>
        {/* Sama sztanga bez obramówki i napisów */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <svg viewBox="25 170 462 172" style={{ width: '210px', height: 'auto', display: 'block' }}>
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
        </div>

        {/* Nowa, mocna czcionka dla tytułu POWER TRUE */}
        <h1 style={{ fontFamily: "'Arial Black', Impact, sans-serif", textAlign: 'center', margin: '0 0 8px', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '2px', fontStyle: 'italic' }}>
          <span style={{ color: '#ffffff', textShadow: '3px 3px 0px rgba(239, 68, 68, 0.45)' }}>POWER</span>{' '}
          <span style={{ color: '#EF4444', textShadow: '3px 3px 0px rgba(255, 255, 255, 0.15)' }}>TRUE</span>
        </h1>
        <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '25px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {isRegister ? 'Rejestracja Podopiecznego' : 'Panel Treningowy'}
        </p>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '10px', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase' }}>Imię i nazwisko</label>
              <input className="pt-input" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jan Kowalski" style={inputStyle} />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase' }}>E-mail</label>
            <input className="pt-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="twoj@email.pl" style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase' }}>Hasło</label>
            <input className="pt-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          </div>

          <button type="submit" style={{ backgroundColor: '#EF4444', color: '#ffffff', padding: '14px', borderRadius: '4px', border: 'none', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {isRegister ? 'Załóż konto' : 'Zaloguj się'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #1f2937', paddingTop: '15px' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#9ca3af', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {isRegister ? 'Masz już konto? Zaloguj się' : 'Jesteś podopiecznym? Zarejestruj się'}
          </button>
        </div>
      </div>
    </div>
  );
}
