import { useState, useEffect } from 'react';
import api from './api';

export function ClientDetailModal({ traineeId, trainerPlans, onClose, onUpdated }) {
  const [details, setDetails] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDetails = async () => {
    if (!traineeId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/trainees/${traineeId}`);
      setDetails(res.data);
    } catch (err) {
      console.error('Błąd pobierania danych podopiecznego:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDetails();
  }, [traineeId]);

  if (!traineeId) return null;

  const handleAssignPlan = async () => {
    if (!selectedPlanId) return;
    const template = trainerPlans.find(p => p.id === selectedPlanId);
    if (!template) return;

    try {
      await api.post('/api/plans', {
        name: template.name,
        trainee_id: traineeId,
        exercises: template.exercises || []
      });
      setSelectedPlanId('');
      await loadDetails();
      onUpdated();
    } catch (err) {
      console.error('Błąd przypisywania planu:', err);
    }
  };

  const handleRemovePlan = async (planId) => {
    if (!window.confirm('Usunąć ten plan z konta podopiecznego?')) return;
    try {
      await api.delete(`/api/plans/${planId}`);
      await loadDetails();
      onUpdated();
    } catch (err) {
      console.error('Błąd usuwania planu:', err);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>

        {loading || !details ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '30px' }}>Ładowanie karty podopiecznego...</p>
        ) : (
          <>
            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
              Karta Podopiecznego
            </span>
            <h2 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: '900', margin: '10px 0 5px' }}>{details.trainee.name}</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '0 0 20px' }}>
              {details.trainee.email} {details.trainee.phone ? `• Tel: ${details.trainee.phone}` : ''}
            </p>

            {details.trainee.goal && (
              <div style={{ backgroundColor: '#1a1a1a', padding: '12px 15px', borderRadius: '6px', border: '1px solid #262626', marginBottom: '20px' }}>
                <strong style={{ color: '#EF4444', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Cel treningowy</strong>
                <span style={{ color: '#e5e7eb', fontSize: '0.95rem' }}>{details.trainee.goal}</span>
              </div>
            )}

            <div style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '6px', border: '1px solid #262626', marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#EF4444', marginBottom: '8px' }}>+ PRZYPISZ GOTOWY PLAN Z TWOJEJ BAZY</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)} style={{ flex: 1, padding: '10px', backgroundColor: '#121212', border: '1px solid #333', color: 'white', borderRadius: '4px' }}>
                  <option value="">-- Wybierz szablon planu --</option>
                  {trainerPlans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.exercises?.length || 0} ćwicz.)</option>)}
                </select>
                <button onClick={handleAssignPlan} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '0 18px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer' }}>
                  Przypisz
                </button>
              </div>
            </div>

            <h4 style={{ color: '#ffffff', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '12px' }}>Aktywne plany podopiecznego ({details.plans.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {details.plans.length > 0 ? details.plans.map(plan => (
                <div key={plan.id} style={{ backgroundColor: '#1a1a1a', padding: '12px 15px', borderRadius: '6px', border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#ffffff', display: 'block' }}>{plan.name}</strong>
                    <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{plan.exercises?.length || 0} ćwiczeń w zestawie</span>
                  </div>
                  <button onClick={() => handleRemovePlan(plan.id)} style={{ backgroundColor: 'transparent', color: '#EF4444', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>
                    Odepnij
                  </button>
                </div>
              )) : (
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Brak przypisanych planów dla tego podopiecznego.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
