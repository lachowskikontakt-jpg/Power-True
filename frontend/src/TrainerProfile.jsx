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

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        handleChange('avatar_url', compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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

        <form onSubmit={handleSubmit} style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '25px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Podgląd i wybór pliku zdjęcia */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '6px', border: '1px solid #262626', flexWrap: 'wrap' }}>
            <img
              src={form.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400'}
              alt="Zdjęcie trenera"
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #EF4444' }}
            />
            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, color: '#ffffff', marginBottom: '8px' }}>Zdjęcie profilowe</label>
              <label style={{ display: 'inline-block', backgroundColor: '#1f2937', color: '#ffffff', border: '1px solid #EF4444', padding: '8px 14px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                📷 Wybierz zdjęcie z dysku / telefonu
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '6px 0 0' }}>Obsługiwane formaty: JPG, PNG, WebP.</p>
            </div>
          </div>

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
