import { useState, useEffect } from 'react';
import api from './api';
import { TrainerCardWidget, ProgressHistoryWidget } from './TraineeWidgets';

export default function TraineeDashboard({ onLogout }) {
  const [plans, setPlans] = useState([]);
  const [trainer, setTrainer] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, msgsRes, trainerRes, progRes] = await Promise.all([
        api.get('/api/plans'),
        api.get('/api/messages'),
        api.get('/api/trainer'),
        api.get('/api/progress')
      ]);
      setPlans(plansRes.data);
      setMessages(msgsRes.data);
      setTrainer(trainerRes.data);
      setProgressLogs(progRes.data);
    } catch (err) {
      console.error('Błąd pobierania danych podopiecznego:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogWorkout = async (planId) => {
    try {
      await api.post(`/api/plans/${planId}/log`);
      const progRes = await api.get('/api/progress');
      setProgressLogs(progRes.data);
      alert('Trening zapisany w dzienniku postępów!');
    } catch (err) {
      console.error('Błąd zapisu sesji:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      await api.post('/api/messages', { text: messageText });
      setMessageText('');
      const res = await api.get('/api/messages');
      setMessages(res.data);
    } catch (err) {
      console.error('Błąd wysyłania wiadomości:', err);
    }
  };

  return (
    <div style={{ backgroundColor: '#000000', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <nav style={{ backgroundColor: '#0a0a0a', borderBottom: '1px solid #1f2937', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#ffffff', fontWeight: '900', fontSize: '1.3rem', letterSpacing: '1px' }}>
          POWER <span style={{ color: '#EF4444' }}>TRUE</span>
        </div>
        <button onClick={onLogout} style={{ backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #333', padding: '6px 14px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
          Wyloguj się
        </button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px' }}>
        <TrainerCardWidget trainer={trainer} />

        <h1 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: '900', marginBottom: '5px' }}>
          TWOJE <span style={{ color: '#EF4444' }}>PLANY TRENINGOWE</span>
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: '25px', fontSize: '0.9rem' }}>Rozpiski przygotowane przez Twojego trenera.</p>

        {loading ? (
          <p style={{ color: '#6b7280' }}>Ładowanie planów...</p>
        ) : plans.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '35px' }}>
            {plans.map(plan => (
              <div key={plan.id} style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>{plan.name}</h2>
                  <button
                    onClick={() => handleLogWorkout(plan.id)}
                    style={{ backgroundColor: '#EF4444', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase' }}
                  >
                    ✓ Zakończ i zapisz trening
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(plan.exercises || []).map((ex, idx) => (
                    <div key={idx} style={{ backgroundColor: '#1a1a1a', padding: '12px 15px', borderRadius: '6px', border: '1px solid #262626' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{idx + 1}. {ex.name}</strong>
                        <span style={{ color: '#EF4444', fontWeight: '800', fontSize: '0.9rem' }}>
                          {ex.sets} serie × {ex.reps} powt. {ex.weight > 0 ? `• ${ex.weight} kg` : ''}
                        </span>
                      </div>
                      {ex.notes && <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '6px 0 0' }}>Wskazówki: {ex.notes}</p>}
                      {ex.video_url && (
                        <a href={ex.video_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '8px', color: '#EF4444', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}>
                          ▶ Zobacz wideo instruktażowe ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '30px', textAlign: 'center', marginBottom: '35px' }}>
            <p style={{ color: '#9ca3af', margin: 0 }}>Twój trener nie przypisał jeszcze żadnego planu treningowego.</p>
          </div>
        )}

        <ProgressHistoryWidget logs={progressLogs} />

        {/* Czat z trenerem */}
        <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: '800', marginTop: 0, marginBottom: '15px' }}>
            WIADOMOŚCI DO <span style={{ color: '#EF4444' }}>TRENERA</span>
          </h3>
          <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px', padding: '10px', backgroundColor: '#0a0a0a', borderRadius: '6px' }}>
            {messages.length > 0 ? messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.sender_role === 'trainee' ? 'flex-end' : 'flex-start', backgroundColor: m.sender_role === 'trainee' ? '#EF4444' : '#1f2937', color: '#ffffff', padding: '8px 12px', borderRadius: '6px', maxWidth: '75%', fontSize: '0.9rem' }}>
                <strong style={{ display: 'block', fontSize: '0.7rem', opacity: 0.8 }}>{m.sender_name || m.sender_role}</strong>
                {m.text}
              </div>
            )) : (
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>Brak wiadomości. Napisz do trenera poniżej.</p>
            )}
          </div>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder="Napisz wiadomość do trenera..."
              style={{ flex: 1, padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px' }}
            />
            <button type="submit" style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '0 20px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer' }}>
              Wyślij
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
