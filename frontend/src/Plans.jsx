import { useState, useEffect } from 'react';
import api from './api';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [atlasExercises, setAtlasExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planName, setPlanName] = useState('');
  const [planExercises, setPlanExercises] = useState([]);

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

  const openCreateModal = () => {
    setEditingPlanId(null);
    setPlanName('');
    setPlanExercises([]);
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setPlanExercises(plan.exercises || []);
    setIsModalOpen(true);
  };

  const handleAddExerciseToPlan = (atlasExId) => {
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

  const handleExerciseChange = (index, field, value) => {
    const updated = [...planExercises];
    updated[index][field] = value;
    setPlanExercises(updated);
  };

  const handleRemoveExerciseFromPlan = (index) => {
    setPlanExercises(planExercises.filter((_, i) => i !== index));
  };

  const handleSavePlan = async (e) => {
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
      if (editingPlanId) {
        await api.put(`/api/plans/${editingPlanId}`, payload);
      } else {
        await api.post('/api/plans', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Błąd zapisu planu:', err);
    }
  };

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
      
      {/* Nagłówek */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1f2937', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '900', margin: '0', letterSpacing: '1px' }}>
            PLANY <span style={{ color: '#EF4444' }}>TRENINGOWE</span>
          </h1>
          <p style={{ color: '#9ca3af', margin: '5px 0 0', fontSize: '0.95rem' }}>Twórz i edytuj zestawy ćwiczeń, serie oraz obciążenia.</p>
        </div>
        <button 
          onClick={openCreateModal}
          style={{ backgroundColor: '#EF4444', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          + Nowy Plan
        </button>
      </div>

      {/* Lista planów */}
      {loading ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Ładowanie planów treningowych...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {plans.length > 0 ? (
            plans.map((plan) => (
              <div key={plan.id} style={{ backgroundColor: '#121212', border: '1px solid #1f2937', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <h3 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: '800', margin: '0' }}>{plan.name}</h3>
                    <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800' }}>
                      {plan.exercises?.length || 0} ćwicz.
                    </span>
                  </div>

                  {/* Lista ćwiczeń wewnątrz kafelka planu */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {plan.exercises && plan.exercises.length > 0 ? (
                      plan.exercises.map((ex,
