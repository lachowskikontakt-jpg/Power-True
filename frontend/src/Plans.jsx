import { useState, useEffect } from 'react';
import api from './api';
import { PlanFormModal } from './PlanModal';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [atlasExercises, setAtlasExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, exRes] = await Promise.all([
        api.get('/api/plans'),
        api.get('/api/exercises')
      ]);
      setPlans(plansRes.data);
      setAtlasExercises(exRes.data);
    } catch (err) {
      console.error('Błąd pobierania danych:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten plan treningowy?')) return;
    try {
      await api.delete(`/api/plans/${id}`);
      fetchData();
    } catch (err) {
      console.error('Błąd usuwania planu:', err);
    }
  };

  return (
    <div style={{ backgroundColor: '#000000', color: '#f3f4f6', minHeight: '100vh', padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1f2937', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '1px' }}>
            PLANY <span style={{ color: '#EF4444' }}>TRENINGOWE</span>
          </h1>
          <p style={{ color: '#9ca3af', margin: '5px 0 0', fontSize: '0.95rem' }}>Twórz i edytuj zestawy ćwiczeń, serie oraz obciążenia.</p>
        </div>
        <button
          onClick={() => { setEditingPlan(null); setIsModalOpen(true); }}
          style={{ backgroundColor: '#EF4444', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}
        >
          + Nowy Plan
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Ładowanie planów treningowych...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {plans.length > 0 ? (
            plans.map((plan) => (
              <div key={plan.id} style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>{plan.name}</h3>
                    <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800' }}>
                      {plan.exercises?.length || 0} ćwicz.
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {plan.exercises && plan.exercises.length > 0 ? (
                      plan.exercises.map((ex, idx) => (
                        <div key={idx} style={{ backgroundColor: '#1a1a1a', padding: '10px 12px', borderRadius: '6px', border: '1px solid #262626' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#e5e7eb', fontWeight: '700', fontSize: '0.9rem' }}>{idx + 1}. {ex.name}</span>
                            <span style={{ color: '#EF4444', fontWeight: '800', fontSize: '0.85rem' }}>
                              {ex.sets}x{ex.reps} {ex.weight > 0 ? `(${ex.weight}kg)` : ''}
                            </span>
                          </div>
                          {ex.notes && (
                            <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '4px 0 0', fontStyle: 'italic' }}>
                              Notatka: {ex.notes}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>Brak przypisanych ćwiczeń.</p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #1f2937', paddingTop: '15px' }}>
                  <button onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }} style={{ flex: 1, backgroundColor: '#1f2937', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                    ✎ Edytuj plan
                  </button>
                  <button onClick={() => handleDeletePlan(plan.id)} style={{ backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #333', padding: '10px 14px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Usuń
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#6b7280', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>Nie masz jeszcze żadnych planów treningowych. Kliknij "+ Nowy Plan", aby stworzyć pierwszy zestaw!</p>
          )}
        </div>
      )}

      <PlanFormModal
        isOpen={isModalOpen}
        editingPlan={editingPlan}
        atlasExercises={atlasExercises}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => { setIsModalOpen(false); fetchData(); }}
      />
    </div>
  );
}
