import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import api         from '../../api/axios';

export default function ResolvedCases() {
  const [cases,   setCases]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vigilance/cases/resolved');
      setCases(data);
    } catch { toast.error('Failed to load resolved cases'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleClose = async (c) => {
    if (!window.confirm(`Close Case #${c.case_id}? This action marks it permanently closed.`)) return;
    setClosing(c.case_id);
    try {
      await api.put(`/vigilance/cases/${c.case_id}/status`, { new_status:'Closed', remarks:'Closed by officer' });
      toast.success(`Case #${c.case_id} closed.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to close case');
    } finally { setClosing(null); }
  };

  const duration = (c) => {
    const ms = new Date(c.updated_at) - new Date(c.triggered_at);
    const h  = Math.floor(ms / 3600000);
    const m  = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const fmt = (dt) => new Date(dt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>✅ Resolved Cases</h1>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Cases successfully resolved — ready to be closed</p>
      </div>

      {/* Cases Table */}
      <div style={{ background: '#111827', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(239, 68, 68, 0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
          </div>
        ) : cases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
            <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>No resolved cases yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead style={{ borderBottom: '1px solid #1f2937' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Case ID</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>User</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Officer</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Resolved At</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Duration</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.map(c => (
                  <tr key={c.case_id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#ef4444', fontWeight: 600 }}>#{c.case_id}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{c.user_name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{c.user_phone}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#d1d5db' }}>{c.officer_name || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.7rem' }}>{fmt(c.updated_at)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#22c55e',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                      }}>
                        {duration(c)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button 
                        onClick={() => handleClose(c)} 
                        disabled={closing === c.case_id}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '0.3rem 0.8rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {closing === c.case_id ? '...' : '🔒 Close Case'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}