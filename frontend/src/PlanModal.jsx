import { useState, useEffect } from 'react';
import api from './api';

export function PlanFormModal({ isOpen, editingPlan, atlasExercises, onClose, onSaved }) {
  const [planName, setPlanName] = useState('');
  const [planExercises, setPlanExercises] = useState([]);
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');

  useEffect(() => {
    if (editingPlan) {
      setPlanName(editingPlan.name || '');
      setPlanExercises(editingPlan.exercises || []);
    } else {
      setPlanName('');
      setPlanExercises([]);
    }
    setIsCustomInputOpen(false);
    setCustomExerciseName('');
  }, [editingPlan, isOpen]);

  if (!isOpen) return null;

  const handleSelectChange = (value) => {
    if (!value) return;
    if (value === 'CUSTOM') {
      setIsCustomInputOpen(true);
      return;
    }
    setIsCustomInputOpen(false);
    const found = atlasExercises.find(e => e.id === value);
    if (!found) return;

    setPlanExercises([
      ...planExercises,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        exercise_id: found.id,
        name: found.name,
        image_url: found.image_url || null,
        video_url: found.video_url || null,
        sets: 3,
        reps: 10,
        weight: 0,
        notes: ''
      }
    ]);
  };

  const handleAddCustomExercise = () => {
    if (!customExerciseName.trim()) return;
    setPlanExercises([
      ...planExercises,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        exercise_id: null,
        name: customExerciseName.trim(),
        image_url: null,
        video_url: null,
        sets: 3,
        reps: 10,
        weight: 0,
        notes: ''
      }
    ]);
    setCustomExerciseName('');
    setIsCustomInputOpen(false);
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
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#EF4444', marginBottom: '8px' }}>+ DODAJ ĆWICZENIE DO PLANU</label>
            <select onChange={(e) => { handleSelectChange(e.target.value); e.target.value = ''; }} defaultValue="" style={{ width: '100%', padding: '10px', backgroundColor: '#121212', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }}>
              <option value="" disabled>-- Wybierz ćwiczenie z listy lub wpisz własne --</option>
              <option value="CUSTOM">✎ Wpisz własne ćwiczenie...</option>
              {atlasExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscle_group})</option>)}
            </select>

            {isCustomInputOpen && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  type="text"
                  value={customExerciseName}
                  onChange={e => setCustomExerciseName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomExercise(); } }}
                  placeholder="Wpisz nazwę własnego ćwiczenia..."
                  autoFocus
                  style={{ flex: 1, padding: '10px', backgroundColor: '#121212', border: '1px solid #EF4444', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomExercise}
                  style={{ backgroundColor: '#EF4444', color: '#ffffff', border: 'none', padding: '0 16px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Dodaj
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {planExercises.map((ex, idx) => (
              <div key={idx} style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '6px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <strong style={{ color: '#EF4444', fontSize: '1rem' }}>{idx + 1}.</strong>
                    <input
                      type="text"
                      value={ex.name}
                      onChange={e => handleChange(idx, 'name', e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', backgroundColor: '#121212', border: '1px solid #333', color: '#ffffff', fontWeight: '700', fontSize: '0.95rem', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
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
