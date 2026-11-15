export function TrainerCardWidget({ trainer }) {
  if (!trainer || !trainer.name) return null;

  return (
    <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '20px', marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
      <img
        src={trainer.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400'}
        alt={trainer.name}
        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #EF4444' }}
      />
      <div style={{ flex: 1, minWidth: '220px' }}>
        <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
          Twój Trener Prowadzący
        </span>
        <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: '900', margin: '6px 0' }}>{trainer.name}</h3>
        {trainer.bio && <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0 0 10px', lineHeight: '1.4' }}>{trainer.bio}</p>}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#d1d5db' }}>
          {trainer.phone && <span>📞 {trainer.phone}</span>}
          {trainer.hours && <span>🕒 {trainer.hours}</span>}
          {trainer.instagram && <span style={{ color: '#EF4444', fontWeight: '700' }}>IG: {trainer.instagram}</span>}
        </div>
      </div>
    </div>
  );
}

export function ProgressHistoryWidget({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
        <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '800', margin: '0 0 8px' }}>
          HISTORIA <span style={{ color: '#EF4444' }}>POSTĘPÓW</span>
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
          Brak zapisanych sesji. Kliknij „Zakończ i zapisz trening” przy swoim planie, aby śledzić progres!
        </p>
      </div>
    );
  }

  // Grupowanie logów po dacie sesji
  const sessionsMap = {};
  logs.forEach(item => {
    const dayKey = item.date ? item.date.slice(0, 16) : 'Sesja';
    if (!sessionsMap[dayKey]) {
      sessionsMap[dayKey] = { date: item.date, totalVolume: 0, exercises: [] };
    }
    sessionsMap[dayKey].totalVolume += Number(item.volume) || 0;
    sessionsMap[dayKey].exercises.push(item);
  });

  const sessions = Object.values(sessionsMap).slice(-6);
  const maxVolume = Math.max(...sessions.map(s => s.totalVolume), 1);

  return (
    <div style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
      <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '800', margin: '0 0 16px' }}>
        OBJĘTOŚĆ TRENINGOWA <span style={{ color: '#EF4444' }}>(OSTATNIE SESJE)</span>
      </h3>

      {/* Prosty wykres słupkowy objętości */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '140px', padding: '15px 10px 5px', backgroundColor: '#0a0a0a', borderRadius: '6px', border: '1px solid #262626' }}>
        {sessions.map((s, idx) => {
          const heightPct = Math.max(Math.round((s.totalVolume / maxVolume) * 100), 12);
          const dateLabel = s.date ? new Date(s.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }) : `#${idx + 1}`;
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ color: '#d1d5db', fontSize: '0.7rem', fontWeight: '700', marginBottom: '4px' }}>
                {Math.round(s.totalVolume)} kg
              </span>
              <div style={{ width: '100%', maxWidth: '45px', height: `${heightPct}%`, backgroundColor: '#EF4444', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
              <span style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '6px' }}>{dateLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
