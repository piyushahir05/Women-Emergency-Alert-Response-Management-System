import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

export default function ClosedCases() {
  const [cases,   setCases]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vigilance/cases/closed')
      .then(r => setCases(r.data))
      .catch(() => toast.error('Failed to load closed cases'))
      .finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    const headers = ['Case ID','User','Phone','Officer','Triggered At','Closed At','Location'];
    const rows = cases.map(c => [
      c.case_id, c.user_name, c.user_phone, c.officer_name || 'N/A',
      new Date(c.triggered_at).toLocaleString('en-IN'),
      new Date(c.updated_at).toLocaleString('en-IN'),
      c.location_description || `${c.latitude},${c.longitude}`,
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `wearms_closed_cases_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const fmt = (dt) => new Date(dt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>🔒 Closed Cases</h1>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Fully resolved and archived cases</p>
        </div>
        {cases.length > 0 && (
          <button 
            onClick={exportCSV}
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              padding: '0.4rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ⬇ Export CSV
          </button>
        )}
      </div>

      {/* Cases Table */}
      <div style={{ background: '#111827', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(239, 68, 68, 0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
          </div>
        ) : cases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🗂️</div>
            <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>No closed cases yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead style={{ borderBottom: '1px solid #1f2937' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Case ID</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>User</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Officer</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Triggered At</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Closed At</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Location</th>
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
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.7rem' }}>{fmt(c.triggered_at)}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.7rem' }}>{fmt(c.updated_at)}</td>
                    <td style={{ 
                      padding: '0.75rem 1rem', 
                      color: '#6b7280', 
                      fontSize: '0.7rem',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {c.location_description || `${Number(c.latitude).toFixed(4)}, ${Number(c.longitude).toFixed(4)}`}
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