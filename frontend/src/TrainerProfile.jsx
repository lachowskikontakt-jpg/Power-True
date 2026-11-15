import { useState, useEffect } from 'react';
import api from './api';

export default function TrainerProfile() {
  const [form, setForm] = useState({
    name: '',
    bio: '',
    phone: '',
    email: '',
    hours: '',
    instagram: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/api/trainer')
      .then(res => {
        if (res.data) setForm(prev => ({ ...prev, ...res.data }));
        setLoading(false);
      })
      .catch(err => {
        console.error('Błąd pobierania profilu trenera:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (field, value) => {
    setSaved(false);
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/trainer', form);
      setSaved(true);
    } catch (err) {
      console.error('Błąd zapisu wizytówki:', err);
    }
  };

  if (loading) {
    return <div style={{ backgroundColor: '#000', color: '#6b7280', minHeight: '100vh', padding: '40px', textAlign: 'center' }}>Ładowanie wizytówki...</div>;
  }

  const inputStyle = { width: '100%', padding: '12px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#ffffff', borderRadius: '4px', boxSizing: 'border-box', fontSize: '0.95rem' };
  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase' };

  return (
    <div style={{ backgroundColor: '#000000', color: '#f3f4f6', minHeight: 'calc(100vh - 65px)', padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        <div style={{ marginBottom: '25px', borderBottom: '1px solid #1f2937', paddingBottom: '15px' }}>
          <h1 style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: '900', margin: 0, letterSpacing: '1px' }}>
            WIZYTÓWKA <span style={{ color: '#EF4444' }}>TRENERA</span>
          </h1>
          <p style={{ color: '#9ca3af', margin: '5px 0 0', fontSize: '0.9rem' }}>Dane kontaktowe i opis widoczne dla Twoich podopiecznych.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '25px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Imię i nazwisko / Nazwa trenera</label>
            <input type="text" value={form.name || ''} onChange={e => handleChange('name', e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>O mnie / Specjalizacja (Bio)</label>
            <textarea rows="3" value={form.bio || ''} onChange={e => handleChange('bio', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Telefon kontaktowy</label>
              <input type="text" value={form.phone || ''} onChange={e => handleChange('phone', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>E-mail</label>
              <input type="email" value={form.email || ''} onChange={e => handleChange('email', e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Godziny pracy / Dostępność</label>
              <input type="text" value={form.hours || ''} onChange={e => handleChange('hours', e.target.value)} placeholder="np. Pon-Pt 8:00-20:00" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Instagram</label>
              <input type="text" value={form.instagram || ''} onChange={e => handleChange('instagram', e.target.value)} placeholder="@twoj_profil" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Link do zdjęcia profilowego (URL)</label>
            <input type="url" value={form.avatar_url || ''} onChange={e => handleChange('avatar_url', e.target.value)} placeholder="https://..." style={inputStyle} />
          </div>

          <button type="submit" style={{ backgroundColor: '#EF4444', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>
            Zapisz Wizytówkę
          </button>

          {saved && (
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', padding: '10px', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '700' }}>
              ✓ Wizytówka została zaktualizowana!
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
