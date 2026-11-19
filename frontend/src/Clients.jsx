import { useState, useEffect } from 'react';
import api from './api';
import { ClientDetailModal } from './ClientDetailModal';

export default function Clients() {
  const [trainees, setTrainees] = useState([]);
  const [trainerPlans, setTrainerPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTraineeId, setSelectedTraineeId] = useState(null);

  const [editingTrainee, setEditingTrainee] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', goal: '', phone: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [traineesRes, plansRes] = await Promise.all([
        api.get('/api/trainees'),
        api.get('/api/plans')
      ]);
      setTrainees(traineesRes.data);
      setTrainerPlans(plansRes.data);
    } catch (err) {
      console.error('Błąd pobierania podopiecznych:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (e, trainee) => {
    e.stopPropagation();
    setEditingTrainee(trainee);
    setEditForm({
      name: trainee.name || '',
      email: trainee.email || '',
      goal: trainee.goal || '',
      phone: trainee.phone || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTrainee) return;
    setSavingEdit(true);
    try {
      await api.put(`/api/trainees/${editingTrainee.id}`, editForm);
      setEditingTrainee(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Błąd podczas zapisywania zmian podopiecznego.');
    }
    setSavingEdit(false);
  };

  const handleDeleteTrainee = async (e, trainee) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć podopiecznego "${trainee.name}"?\nZostaną usunięte również wszystkie jego przypisane plany, historia treningów oraz wiadomości.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/trainees/${trainee.id}`);
      if (selectedTraineeId === trainee.id) {
        setSelectedTraineeId(null);
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Błąd podczas usuwania podopiecznego.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '4px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    color: '#ffffff',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none'
  };

  return (
    <div style={{ backgroundColor: '#000000', color: '#f3f4f6', minHeight: '100vh', padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #1f2937', paddingBottom: '20px' }}>
        <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '1px' }}>
          BAZA <span style={{ color: '#EF4444' }}>PODOPIECZNYCH</span>
        </h1>
        <p style={{ color: '#9ca3af', margin: '5px 0 0', fontSize: '0.95rem' }}>Zarządzaj swoimi klientami, sprawdzaj postępy i przypisuj im plany treningowe.</p>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Ładowanie listy podopiecznych...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {trainees.length > 0 ? trainees.map(t => (
            <div
              key={t.id}
              onClick={() => setSelectedTraineeId(t.id)}
              style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '20px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{t.name}</h3>
                  <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800' }}>
                    {t.plan_count || 0} planów
                  </span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0 0 12px' }}>{t.email}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1f2937', paddingTop: '12px', fontSize: '0.8rem', color: '#d1d5db' }}>
                  <span>Cel: <strong>{t.goal || 'Nieokreślony'}</strong></span>
                  <span>Treningi: <strong style={{ color: '#EF4444' }}>{t.session_count || 0}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #1f2937', paddingTop: '14px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={(e) => openEditModal(e, t)}
                  style={{ flex: 1, backgroundColor: '#1f2937', color: '#ffffff', border: 'none', padding: '8px 10px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  ✎ Edytuj
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteTrainee(e, t)}
                  style={{ backgroundColor: 'transparent', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '8px 12px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Usuń
                </button>
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: '#121212', borderRadius: '8px', border: '1px solid #1f2937' }}>
              <p style={{ color: '#9ca3af', margin: '0 0 10px' }}>Brak zarejestrowanych podopiecznych w bazie.</p>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>Gdy podopieczny założy konto w aplikacji, pojawi się automatycznie na tej liście.</p>
            </div>
          )}
        </div>
      )}

      <ClientDetailModal
        traineeId={selectedTraineeId}
        trainerPlans={trainerPlans}
        onClose={() => setSelectedTraineeId(null)}
        onUpdated={fetchData}
      />

      {editingTrainee && (
        <div
          onClick={() => setEditingTrainee(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 10px 30px rgba(0,0,0,0.9)' }}
          >
            <h2 style={{ color: '#ffffff', margin: '0 0 20px', fontSize: '1.35rem', fontWeight: '900' }}>
              EDYTUJ <span style={{ color: '#EF4444' }}>PODOPIECZNEGO</span>
            </h2>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px', textTransform: 'uppercase' }}>Imię i nazwisko</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px', textTransform: 'uppercase' }}>E-mail</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px', textTransform: 'uppercase' }}>Cel treningowy</label>
                <input
                  type="text"
                  placeholder="np. Trójbój siłowy / Redukcja"
                  value={editForm.goal}
                  onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px', textTransform: 'uppercase' }}>Telefon</label>
                <input
                  type="text"
                  placeholder="+48 600 000 000"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{ flex: 1, backgroundColor: '#EF4444', color: '#ffffff', border: 'none', padding: '11px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.85rem' }}
                >
                  {savingEdit ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTrainee(null)}
                  style={{ backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #333', padding: '11px 16px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
