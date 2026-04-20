import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Modal       from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import api         from '../../api/axios';

const STATUSES = ['All','Assigned','In Progress'];
const NEXT_STATUSES = ['In Progress','Resolved','Closed'];

export default function PendingCases() {
  const [cases,      setCases]      = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filterTab,  setFilterTab]  = useState('All');
  const [updating,   setUpdating]   = useState(null);
  const [form,       setForm]       = useState({ new_status:'', remarks:'' });
  const [saving,     setSaving]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vigilance/cases/pending');
      setCases(data);
    } catch { toast.error('Failed to load cases'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    setFiltered(filterTab === 'All' ? cases : cases.filter(c => c.status === filterTab));
  }, [cases, filterTab]);

  const handleUpdate = async () => {
    if (!form.new_status) { toast.error('Please select a new status'); return; }
    setSaving(true);
    try {
      await api.put(`/vigilance/cases/${updating.case_id}/status`, form);
      toast.success(`Case #${updating.case_id} updated to "${form.new_status}"`);
      setUpdating(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  const fmt = (dt) => new Date(dt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>⏳ Pending Cases</h1>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Cases currently being tracked — sorted by priority</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button 
            key={s} 
            onClick={() => setFilterTab(s)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: filterTab === s ? '#ef4444' : '#1f2937',
              border: filterTab === s ? 'none' : '1px solid #374151',
              color: filterTab === s ? '#fff' : '#9ca3af',
            }}
          >
            {s} {s !== 'All' && `(${cases.filter(c => c.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Cases Table */}
      <div style={{ background: '#111827', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(239, 68, 68, 0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
            <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>No cases in this category.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Case ID</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>User</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Officer</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Priority</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Last Updated</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.case_id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#ef4444', fontWeight: 600 }}>#{c.case_id}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{c.user_name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{c.user_phone}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#d1d5db' }}>
                      {c.officer_name || <span style={{ color: '#6b7280' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <StatusBadge status={c.priority} type="priority" />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.7rem' }}>
                      {fmt(c.updated_at)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button 
                        onClick={() => { setUpdating(c); setForm({ new_status: '', remarks: '' }); }}
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
                        Update ↗
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      <Modal isOpen={!!updating} onClose={() => setUpdating(null)} title={`Update Case #${updating?.case_id}`}>
        <div className="form-group">
          <label className="form-label" style={{ color: '#d1d5db' }}>New Status</label>
          <select 
            className="form-select" 
            value={form.new_status}
            onChange={e => setForm(f => ({ ...f, new_status: e.target.value }))}
            style={{
              background: '#1f2937',
              border: '1px solid #374151',
              color: '#fff',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              width: '100%',
            }}
          >
            <option value="">Select new status…</option>
            {NEXT_STATUSES.map(s => <option key={s} value={s} style={{ background: '#1f2937' }}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ color: '#d1d5db' }}>
            Remarks <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea 
            className="form-textarea" 
            placeholder="Add notes about this status change…"
            value={form.remarks} 
            onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
            style={{
              background: '#1f2937',
              border: '1px solid #374151',
              color: '#fff',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              width: '100%',
              minHeight: '80px',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button 
            onClick={() => setUpdating(null)}
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
            onClick={handleUpdate} 
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
            {saving ? 'Saving...' : '✅ Update Status'}
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