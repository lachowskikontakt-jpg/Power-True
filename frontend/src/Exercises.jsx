import { useState, useEffect } from 'react';
import api from './api';
import { ExerciseDetailModal, ExerciseFormModal } from './ExerciseModals';

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Wszystkie');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);

  const categories = ['Wszystkie', 'Klatka', 'Plecy', 'Nogi', 'Barki', 'Ramiona', 'Brzuch', 'Cardio', 'Inne'];

  const fetchExercises = () => {
    setLoading(true);
    api.get('/api/exercises')
      .then(res => {
        setExercises(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Błąd pobierania ćwiczeń:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const filteredExercises = filter === 'Wszystkie'
    ? exercises
    : exercises.filter(ex => (ex.muscle_group || ex.category) === filter);

  return (
    <div style={{ backgroundColor: '#000000', color: '#f3f4f6', minHeight: '100vh', padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1f2937', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '1px' }}>
            ATLAS <span style={{ color: '#EF4444' }}>ĆWICZEŃ</span>
          </h1>
          <p style={{ color: '#9ca3af', margin: '5px 0 0', fontSize: '0.95rem' }}>Baza wszystkich ćwiczeń z opisem, techniką wykonania i wideo.</p>
        </div>
        <button
          onClick={() => { setEditingExercise(null); setIsFormOpen(true); }}
          style={{ backgroundColor: '#EF4444', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}
        >
          + Dodaj ćwiczenie
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '30px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              backgroundColor: filter === cat ? '#EF4444' : '#121212',
              color: filter === cat ? '#ffffff' : '#9ca3af',
              border: '1px solid',
              borderColor: filter === cat ? '#EF4444' : '#1f2937',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Ładowanie ćwiczeń z bazy danych...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredExercises.length > 0 ? (
            filteredExercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => setSelectedExercise(ex)}
                style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              >
                <div style={{ height: '170px', overflow: 'hidden', backgroundColor: '#1a1a1a', position: 'relative' }}>
                  <img src={ex.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800'} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {ex.video_url && (
                    <span style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#EF4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', border: '1px solid #EF4444' }}>
                      ▶ WIDEO
                    </span>
                  )}
                </div>
                <div style={{ padding: '20px' }}>
                  <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                    {ex.muscle_group || ex.category || 'Ogólne'}
                  </span>
                  <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: '800', margin: '12px 0 8px' }}>{ex.name}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
                    {ex.instructions || 'Kliknij, aby zobaczyć szczegóły i opis techniczny.'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#6b7280', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>Brak ćwiczeń w tej kategorii.</p>
          )}
        </div>
      )}

      <ExerciseDetailModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onEdit={(ex) => { setSelectedExercise(null); setEditingExercise(ex); setIsFormOpen(true); }}
        onDeleted={() => { setSelectedExercise(null); fetchExercises(); }}
      />

      <ExerciseFormModal
        isOpen={isFormOpen}
        editingExercise={editingExercise}
        categories={categories}
        onClose={() => setIsFormOpen(false)}
        onSaved={() => { setIsFormOpen(false); fetchExercises(); }}
      />
    </div>
  );
}
