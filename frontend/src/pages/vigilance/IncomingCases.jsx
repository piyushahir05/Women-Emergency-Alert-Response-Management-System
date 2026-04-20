import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Modal       from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import api         from '../../api/axios';

export default function IncomingCases() {
  const [cases,     setCases]     = useState([]);
  const [officers,  setOfficers]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [officerId, setOfficerId] = useState('');
  const [saving,    setSaving]    = useState(false);

  const fetchCases = useCallback(async () => {
    try {
      const { data } = await api.get('/vigilance/cases/new');
      setCases(data);
    } catch { toast.error('Failed to load new cases'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchCases();
    api.get('/vigilance/officers').then(r => setOfficers(r.data)).catch(() => {});
    const timer = setInterval(fetchCases, 30000);
    return () => clearInterval(timer);
  }, [fetchCases]);

  const handleAssign = async () => {
    if (!officerId) { toast.error('Please select an officer'); return; }
    setSaving(true);
    try {
      await api.post(`/vigilance/cases/${assigning.case_id}/assign`, { officer_id: Number(officerId) });
      toast.success(`Officer assigned to Case #${assigning.case_id}`);
      setAssigning(null);
      setOfficerId('');
      fetchCases();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Assignment failed');
    } finally { setSaving(false); }
  };

  const fmt = (dt) => new Date(dt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>📥 New Cases</h1>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Unassigned SOS alerts requiring immediate attention</p>
        </div>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={fetchCases}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(239, 68, 68, 0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        </div>
      ) : cases.length === 0 ? (
        <div style={{ background: '#111827', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
          <p style={{ fontWeight: 700, color: '#22c55e', fontSize: '1rem', marginBottom: '0.25rem' }}>All clear! No new cases.</p>
          <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>Auto-refreshes every 30 seconds.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cases.map(c => (
            <div 
              key={c.case_id} 
              style={{ 
                background: '#111827', 
                borderRadius: '0.75rem', 
                borderLeft: '4px solid #ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>Case #{c.case_id}</span>
                  <StatusBadge status={c.status} />
                  <StatusBadge status={c.priority} type="priority" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div style={{ color: '#9ca3af' }}>
                    👤 <span style={{ color: '#fff' }}><b>{c.user_name}</b></span> — {c.user_phone}
                  </div>
                  <div style={{ color: '#9ca3af' }}>
                    📍 <span style={{ color: '#d1d5db' }}>{c.location_description || `${Number(c.latitude).toFixed(4)}, ${Number(c.longitude).toFixed(4)}`}</span>
                  </div>
                  <div style={{ color: '#9ca3af' }}>
                    🕐 <span style={{ color: '#d1d5db' }}>{fmt(c.triggered_at)}</span>
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => { setAssigning(c); setOfficerId(''); }}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                👮 Assign Officer
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Assign Officer Modal */}
      <Modal isOpen={!!assigning} onClose={() => setAssigning(null)} title={`Assign Officer — Case #${assigning?.case_id}`}>
        <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Select an active officer to handle this emergency.
        </p>
        <div className="form-group">
          <label className="form-label" style={{ color: '#d1d5db' }}>Select Officer</label>
          <select 
            className="form-select" 
            value={officerId} 
            onChange={e => setOfficerId(e.target.value)}
            style={{
              background: '#1f2937',
              border: '1px solid #374151',
              color: '#fff',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              width: '100%',
            }}
          >
            <option value="">Choose officer…</option>
            {officers.map(o => (
              <option key={o.officer_id} value={o.officer_id} style={{ background: '#1f2937' }}>
                {o.name} — {o.badge_no} ({o.department})
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setAssigning(null)}
            style={{
              background: '#374151',
              border: 'none',
              color: '#9ca3af',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleAssign} 
            disabled={saving}
            style={{
              background: '#ef4444',
              border: 'none',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Assigning...' : '✅ Assign'}
          </button>
        </div>
      </Modal>

      {/* Add keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}