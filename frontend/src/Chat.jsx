import { useState, useEffect } from 'react';
import api from './api';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    try {
      const res = await api.get('/api/conversations');
      setConversations(res.data);
      if (!selectedTrainee && res.data.length > 0) {
        setSelectedTrainee(res.data[0].trainee);
      }
    } catch (err) {
      console.error('Błąd pobierania konwersacji:', err);
    }
    setLoading(false);
  };

  const loadMessages = async (traineeId) => {
    if (!traineeId) return;
    try {
      const res = await api.get(`/api/messages?trainee_id=${traineeId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Błąd pobierania wiadomości:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedTrainee) {
      loadMessages(selectedTrainee.id);
    }
  }, [selectedTrainee]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedTrainee) return;
    try {
      await api.post('/api/messages', {
        text,
        trainee_id: selectedTrainee.id
      });
      setText('');
      await loadMessages(selectedTrainee.id);
      loadConversations();
    } catch (err) {
      console.error('Błąd wysyłania wiadomości:', err);
    }
  };

  return (
    <div style={{ backgroundColor: '#000000', color: '#f3f4f6', minHeight: 'calc(100vh - 65px)', padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: '25px', borderBottom: '1px solid #1f2937', paddingBottom: '15px' }}>
        <h1 style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: '900', margin: 0, letterSpacing: '1px' }}>
          WIADOMOŚCI <span style={{ color: '#EF4444' }}>Z PODOPIECZNYMI</span>
        </h1>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Ładowanie konwersacji...</p>
      ) : conversations.length === 0 ? (
        <p style={{ color: '#9ca3af', backgroundColor: '#121212', padding: '30px', borderRadius: '8px', border: '1px solid #1f2937' }}>
          Brak podopiecznych w bazie. Gdy pojawi się pierwszy klient, tutaj zobaczysz czat z nim.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: '20px', minHeight: '500px' }}>
          {/* Lista podopiecznych po lewej */}
          <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {conversations.map(({ trainee, last_message }) => {
              const isSelected = selectedTrainee?.id === trainee.id;
              return (
                <div
                  key={trainee.id}
                  onClick={() => setSelectedTrainee(trainee)}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#1f2937' : '#1a1a1a',
                    borderLeft: isSelected ? '3px solid #EF4444' : '3px solid transparent'
                  }}
                >
                  <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.95rem' }}>{trainee.name}</strong>
                  <span style={{ color: '#9ca3af', fontSize: '0.8rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '4px' }}>
                    {last_message ? last_message.text : 'Brak wiadomości'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Okno rozmowy po prawej */}
          <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {selectedTrainee ? (
              <>
                <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '12px', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.2rem' }}>{selectedTrainee.name}</h3>
                  <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{selectedTrainee.email}</span>
                </div>

                <div style={{ flex: 1, maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', backgroundColor: '#0a0a0a', borderRadius: '6px', marginBottom: '15px' }}>
                  {messages.length > 0 ? messages.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        alignSelf: m.sender_role === 'admin' ? 'flex-end' : 'flex-start',
                        backgroundColor: m.sender_role === 'admin' ? '#EF4444' : '#1f2937',
                        color: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        maxWidth: '75%',
                        fontSize: '0.9rem'
                      }}
                    >
                      <strong style={{ display: 'block', fontSize: '0.7rem', opacity: 0.8, marginBottom: '2px' }}>
                        {m.sender_role === 'admin' ? 'Ty (Trener)' : m.sender_name}
                      </strong>
                      {m.text}
                    </div>
                  )) : (
                    <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>Brak wiadomości w tej rozmowie. Napisz jako pierwszy!</p>
                  )}
                </div>

                <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={`Napisz do: ${selectedTrainee.name}...`}
                    style={{ flex: 1, padding: '12px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px' }}
                  />
                  <button type="submit" style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '0 22px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}>
                    Wyślij
                  </button>
                </form>
              </>
            ) : (
              <p style={{ color: '#6b7280' }}>Wybierz podopiecznego z listy po lewej stronie.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
