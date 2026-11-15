import { useState, useEffect } from 'react';
import api from './api';

export function ExerciseDetailModal({ exercise, onClose, onEdit, onDeleted }) {
  if (!exercise) return null;

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`;
    if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}`;
    if (url.includes('youtube.com/shorts/')) return `https://www.youtube.com/embed/${url.split('shorts/')[1]?.split('?')[0]}`;
    return null;
  };

  const handleDelete = () => {
    if (!window.confirm('Na pewno chcesz usunąć to ćwiczenie?')) return;
    api.delete(`/api/exercises/${exercise.id}`)
      .then(() => onDeleted())
      .catch(err => console.error('Błąd usuwania:', err));
  };

  const embedUrl = getEmbedUrl(exercise.video_url);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>

        <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
          {exercise.muscle_group || 'Ogólne'}
        </span>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: '900', margin: '10px 0 20px' }}>{exercise.name}</h2>

        {exercise.video_url ? (
          <div style={{ marginBottom: '20px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#000', border: '1px solid #1f2937' }}>
            {embedUrl ? (
              <iframe width="100%" height="340" src={embedUrl} title={exercise.name} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            ) : (
              <video controls width="100%" style={{ maxHeight: '340px', display: 'block' }}>
                <source src={exercise.video_url} type="video/mp4" />
              </video>
            )}
          </div>
        ) : (
          <div style={{ height: '240px', marginBottom: '20px', borderRadius: '6px', overflow: 'hidden' }}>
            <img src={exercise.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800'} alt={exercise.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <h4 style={{ color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Dokładny opis i technika</h4>
        <p style={{ color: '#d1d5db', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '25px', whiteSpace: 'pre-line', backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '6px', border: '1px solid #262626' }}>
          {exercise.instructions || 'Brak szczegółowego opisu.'}
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #1f2937', paddingTop: '20px' }}>
          {exercise.video_url && (
            <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: '1px solid #EF4444', padding: '10px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}>
              🔗 Otwórz link ↗
            </a>
          )}
          <button onClick={() => onEdit(exercise)} style={{ backgroundColor: '#EF4444', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '4px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', marginLeft: 'auto' }}>
            ✎ Edytuj
          </button>
          <button onClick={handleDelete} style={{ backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #333', padding: '10px 14px', borderRadius: '4px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExerciseFormModal({ isOpen, editingExercise, categories, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Klatka');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (editingExercise) {
      setName(editingExercise.name || '');
      setMuscleGroup(editingExercise.muscle_group || 'Klatka');
      setImageUrl(editingExercise.image_url || '');
      setVideoUrl(editingExercise.video_url || '');
      setInstructions(editingExercise.instructions || '');
    } else {
      setName('');
      setMuscleGroup('Klatka');
      setImageUrl('');
      setVideoUrl('');
      setInstructions('');
    }
  }, [editingExercise, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name,
      muscle_group: muscleGroup,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
      video_url: videoUrl || null,
      instructions
    };
    const req = editingExercise
      ? api.put(`/api/exercises/${editingExercise.id}`, payload)
      : api.post('/api/exercises', payload);

    req.then(() => onSaved()).catch(err => console.error('Błąd zapisu:', err));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '900', marginBottom: '20px' }}>
          {editingExercise ? 'Edytuj Ćwiczenie' : 'Dodaj Nowe Ćwiczenie'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px' }}>NAZWA ĆWICZENIA</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px' }}>PARTIA MIĘŚNIOWA</label>
            <select value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }}>
              {categories.filter(c => c !== 'Wszystkie').map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px' }}>LINK DO ZDJĘCIA (URL)</label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px' }}>LINK DO WIDEO (YOUTUBE / MP4)</label>
            <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px' }}>OPIS I TECHNIKA</label>
            <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows="4" style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 1, backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer' }}>ZAPISZ</button>
            <button type="button" onClick={onClose} style={{ flex: 1, backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #333', padding: '12px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}>ANULUJ</button>
          </div>
        </form>
      </div>
    </div>
  );
}
