import { useState, useEffect } from 'react';
import api from './api';

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [filter, setFilter] = useState('Wszystkie');

  const categories = ['Wszystkie', 'Klatka', 'Plecy', 'Nogi', 'Barki', 'Ramiona', 'Brzuch', 'Cardio'];

  useEffect(() => {
    // Pobieramy ćwiczenia z bazy danych
    api.get('/exercises')
      .then(res => setExercises(res.data))
      .catch(err => console.error('Błąd pobierania ćwiczeń:', err));
  }, []);

  const filteredExercises = filter === 'Wszystkie' 
    ? exercises 
    : exercises.filter(ex => ex.category === filter);

  return (
    <div style={{ backgroundColor: '#000000', color: '#f3f4f6', minHeight: '100vh', padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Nagłówek */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1f2937', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '900', margin: '0', letterSpacing: '1px' }}>
            ATLAS <span style={{ color: '#EF4444' }}>ĆWICZEŃ</span>
          </h1>
          <p style={{ color: '#9ca3af', margin: '5px 0 0 0', fontSize: '0.95rem' }}>Baza wszystkich ćwiczeń z opisem i techniką wykonania.</p>
        </div>
      </div>

      {/* Przyciski kategorii */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '30px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              backgroundColor: filter === cat ? '#EF4444' : '#121212',
              color: filter === cat ? '#ffffff' : '#9ca3af',
              border: filter === cat ? 'none' : '1px solid #222',
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Siatka kafelków ćwiczeń */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredExercises.length > 0 ? (
          filteredExercises.map((ex, index) => (
            <div key={index} style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px' }}>
                <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                  {ex.category || 'Ogólne'}
                </span>
                <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '800', margin: '15px 0 10px 0' }}>{ex.name}</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5', margin: '0' }}>{ex.description || 'Brak opisu technicznego.'}</p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#6b7280', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>Ładowanie ćwiczeń z bazy danych...</p>
        )}
      </div>
    </div>
  );
}
