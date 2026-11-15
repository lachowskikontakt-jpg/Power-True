import { useState, useEffect } from 'react';
import api from './api';
import { ClientDetailModal } from './ClientDetailModal';

export default function Clients() {
  const [trainees, setTrainees] = useState([]);
  const [trainerPlans, setTrainerPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTraineeId, setSelectedTraineeId] = useState(null);

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
            <div key={t.id} onClick={() => setSelectedTraineeId(t.id)} style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '20px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
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
    </div>
  );
}
