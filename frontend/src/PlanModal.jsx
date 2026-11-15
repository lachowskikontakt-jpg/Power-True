import { useState, useEffect } from 'react';
import api from './api';

export function PlanFormModal({ isOpen, editingPlan, atlasExercises, onClose, onSaved }) {
  const [planName, setPlanName] = useState('');
  const [planExercises, setPlanExercises] = useState([]);

  useEffect(() => {
    if (editingPlan) {
      setPlanName(editingPlan.name || '');
      setPlanExercises(editingPlan.exercises || []);
    } else {
      setPlanName('');
      setPlanExercises([]);
    }
  }, [editingPlan, isOpen]);

  if (!isOpen) return null;

  const handleAddExercise = (atlasExId) => {
    if (!atlasExId) return;
    const found = atlasExercises.find(e => e.id === atlasExId);
    if (!found) return;

    setPlanExercises([
      ...planExercises,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        exercise_id: found.id,
        name: found.name,
        image_url: found.image_url,
        video_url: found.video_url,
        sets: 3,
        reps: 10,
        weight: 0,
        notes: ''
      }
    ]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...planExercises];
    updated[index][field] = value;
    setPlanExercises(updated);
  };

  const handleRemove = (index) => {
    setPlanExercises(planExercises.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: planName,
      exercises: planExercises.map((ex, i) => ({
        ...ex,
        sets: Number(ex.sets) || 0,
        reps: Number(ex.reps) || 0,
        weight: Number(ex.weight) || 0,
        order: i
      }))
    };

    try {
      if (editingPlan) {
        await api.put(`/api/plans/${editingPlan.id}`, payload);
      } else {
        await api.post('/api/plans', payload);
      }
      onSaved();
    } catch (err) {
      console.error('Błąd zapisu planu:', err);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '900', marginBottom: '20px' }}>
          {editingPlan ? 'Edytuj Plan Treningowy' : 'Stwórz Nowy Plan'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '6px' }}>NAZWA PLANU</label>
            <input type="text" value={planName} onChange={e => setPlanName(e.target.value)} required placeholder="np. Push A, FBW..." style={{ width: '100%', padding: '12px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '6px', border: '1px solid #262626' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#EF4444', marginBottom: '8px' }}>+ DODAJ ĆWICZENIE Z ATLASU</label>
            <select onChange={(e) => { handleAddExercise(e.target.value); e.target.value = ''; }} defaultValue="" style={{ width: '100%', padding: '10px', backgroundColor: '#121212', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }}>
              <option value="" disabled>-- Wybierz ćwiczenie z listy --</option>
              {atlasExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscle_group})</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {planExercises.map((ex, idx) => (
              <div key={idx} style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '6px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{idx + 1}. {ex.name}</strong>
                  <button type="button" onClick={() => handleRemove(idx)} style={{ backgroundColor: 'transparent', color: '#EF4444', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>✕ Usuń</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#9ca3af', marginBottom: '4px' }}>SERIE</label>
                    <input type="number" value={ex.sets} onChange={e => handleChange(idx, 'sets', e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#121212', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#9ca3af', marginBottom: '4px' }}>POWTÓRZENIA</label>
                    <input type="number" value={ex.reps} onChange={e => handleChange(idx, 'reps', e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#121212', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#9ca3af', marginBottom: '4px' }}>CIĘŻAR (KG)</label>
                    <input type="number" step="0.5" value={ex.weight} onChange={e => handleChange(idx, 'weight', e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#121212', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#9ca3af', marginBottom: '4px' }}>WSKAZÓWKI / TEMPO</label>
                  <input type="text" placeholder="np. Tempo 3-1-1-0..." value={ex.notes || ''} onChange={e => handleChange(idx, 'notes', e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#121212', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 1, backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer' }}>ZAPISZ PLAN</button>
            <button type="button" onClick={onClose} style={{ flex: 1, backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #333', padding: '12px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}>ANULUJ</button>
          </div>
        </form>
      </div>
    </div>
  );
}
