import { useState, useEffect } from 'react';
import api from './api';

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [filter, setFilter] = useState('Wszystkie');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Formularz nowego ćwiczenia
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState('Klatka');
  const [newImage, setNewImage] = useState('');
  const [newVideo, setNewVideo] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  const categories = ['Wszystkie', 'Klatka', 'Plecy', 'Nogi', 'Barki', 'Ramiona', 'Brzuch', 'Cardio'];

  const fetchExercises = () => {
    api.get('/exercises')
      .then(res => setExercises(res.data))
      .catch(err => console.error('Błąd pobierania ćwiczeń:', err));
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleCreateExercise = (e) => {
    e.preventDefault();
    api.post('/exercises', {
      name: newName,
      muscle_group: newMuscle,
      image_url: newImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
      video_url: newVideo,
      instructions: newInstructions
    })
    .then(() => {
      setIsAdding(false);
      setNewName('');
      setNewImage('');
      setNewVideo('');
      setNewInstructions('');
      fetchExercises();
    })
    .catch(err => console.error('Błąd dodawania ćwiczenia:', err));
  };

  const filteredExercises = filter === 'Wszystkie' 
    ? exercises 
    : exercises.filter(ex => ex.muscle_group === filter);

  return (
    <div style={{ backgroundColor: '#000000', color: '#f3f4f6', minHeight: '100vh', padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Nagłówek i przycisk dodawania */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1f2937', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '900', margin: '0', letterSpacing: '1px' }}>
            ATLAS <span style={{ color: '#EF4444' }}>ĆWICZEŃ</span>
          </h1>
          <p style={{ color: '#9ca3af', margin: '5px 0 0', fontSize: '0.95rem' }}>Baza wszystkich ćwiczeń z opisem, techniką i materiałami wideo.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          style={{ backgroundColor: '#EF4444', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          + Dodaj ćwiczenie
        </button>
      </div>

      {/* Filtry kategorii */}
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

      {/* Siatka kafelków */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredExercises.length > 0 ? (
          filteredExercises.map((ex) => (
            <div 
              key={ex.id} 
              onClick={() => setSelectedExercise(ex)}
              style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
            >
              <div style={{ height: '160px', overflow: 'hidden', backgroundColor: '#1a1a1a' }}>
                <img 
                  src={ex.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800'} 
                  alt={ex.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '20px' }}>
                <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                  {ex.muscle_group || 'Ogólne'}
                </span>
                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: '800', margin: '10px 0 5px' }}>{ex.name}</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ex.instructions || 'Brak opisu technicznego.'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#6b7280', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>Brak ćwiczeń w tej kategorii.</p>
        )}
      </div>

      {/* MODAL: Szczegóły ćwiczenia i Wideo */}
      {selectedExercise && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedExercise(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
              {selectedExercise.muscle_group}
            </span>
            <h2 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: '900', margin: '10px 0 20px' }}>{selectedExercise.name}</h2>

            {/* Odtwarzacz Wideo lub Link zewnętrzny */}
            {selectedExercise.video_url ? (
              <div style={{ marginBottom: '20px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#000' }}>
                {selectedExercise.video_url.includes('youtube.com') || selectedExercise.video_url.includes('youtu.be') ? (
                  <iframe 
                    width="100%" 
                    height="315" 
                    src={selectedExercise.video_url.replace('watch?v=', 'embed/')} 
                    title={selectedExercise.name} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video controls width="100%" style={{ maxHeight: '300px', display: 'block' }}>
                    <source src={selectedExercise.video_url} type="video/mp4" />
                    Twoja przeglądarka nie obsługuje wideo.
                  </video>
                )}
              </div>
            ) : (
              <div style={{ height: '220px', marginBottom: '20px', borderRadius: '6px', overflow: 'hidden' }}>
                <img src={selectedExercise.image_url} alt={selectedExercise.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <h4 style={{ color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}>Opis i Technika</h4>
            <p style={{ color: '#d1d5db', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '20px', whiteSpace: 'pre-line' }}>
              {selectedExercise.instructions || 'Brak szczegółowego opisu.'}
            </p>

            {selectedExercise.video_url && (
              <a 
                href={selectedExercise.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'inline-block', backgroundColor: '#1a1a1a', color: '#EF4444', border: '1px solid #333', padding: '10px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}
              >
                Otwórz link wideo w nowej karcie ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Dodawanie nowego ćwiczenia */}
      {isAdding && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '900', marginBottom: '20px' }}>Nowe Ćwiczenie</h2>
            
            <form onSubmit={handleCreateExercise} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px', textTransform: 'uppercase' }}>Nazwa ćwiczenia</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px', textTransform: 'uppercase' }}>Partia mięśniowa</label>
                <select 
                  value={newMuscle} 
                  onChange={e => setNewMuscle(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }}
                >
                  {categories.filter(c => c !== 'Wszystkie').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px', textTransform: 'uppercase' }}>URL zdjęcia podglądowego</label>
                <input 
                  type="url" 
                  value={newImage} 
                  onChange={e => setNewImage(e.target.value)} 
                  placeholder="https://..." 
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px', textTransform: 'uppercase' }}>URL Wideo (YouTube lub plik MP4)</label>
                <input 
                  type="url" 
                  value={newVideo} 
                  onChange={e => setNewVideo(e.target.value)} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '5px', textTransform: 'uppercase' }}>Opis i technika wykonania</label>
                <textarea 
                  value={newInstructions} 
                  onChange={e => setNewInstructions(e.target.value)} 
                  rows="4" 
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="submit" 
                  style={{ flex: 1, backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  Zapisz
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)} 
                  style={{ flex: 1, backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #333', padding: '12px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}
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
