import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '../../components/Modal';
import api   from '../../api/axios';

export default function Officers() {
  const [officers, setOfficers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [toggling, setToggling] = useState(null);
  const [form,     setForm]     = useState({ name:'', badge_no:'', department:'', phone:'', password:'' });
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vigilance/officers/all');
      setOfficers(data);
    } catch { toast.error('Failed to load officers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const { data } = await api.put(`/vigilance/officers/${id}/toggle`);
      setOfficers(os => os.map(o => o.officer_id === id ? { ...o, is_active: data.is_active } : o));
      toast.success(`Officer ${data.is_active ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Toggle failed'); }
    finally { setToggling(null); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.badge_no || !form.password) { toast.error('Name, badge no, and password are required'); return; }
    setSaving(true);
    try {
      await api.post('/vigilance/officers', form);
      toast.success('Officer added!');
      setShowAdd(false);
      setForm({ name:'', badge_no:'', department:'', phone:'', password:'' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add officer');
    } finally { setSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>👮 Officers</h1>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Manage vigilance department officers</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          style={{
            background: '#ef4444',
            border: 'none',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          + Add Officer
        </button>
      </div>

      {/* Officers Table */}
      <div style={{ background: '#111827', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(239, 68, 68, 0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead style={{ borderBottom: '1px solid #1f2937' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Badge No</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Department</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Phone</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {officers.map(o => (
                  <tr key={o.officer_id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <code style={{ 
                        background: '#1f2937', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.7rem', 
                        color: '#ef4444',
                        fontWeight: 600,
                      }}>
                        {o.badge_no}
                      </code>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#fff' }}>{o.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9ca3af' }}>{o.department || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9ca3af' }}>{o.phone || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: o.is_active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                        color: o.is_active ? '#22c55e' : '#6b7280',
                        border: o.is_active ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(107, 114, 128, 0.3)',
                      }}>
                        {o.is_active ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button 
                        onClick={() => handleToggle(o.officer_id)}
                        disabled={toggling === o.officer_id}
                        style={{
                          background: o.is_active ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                          border: o.is_active ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                          color: o.is_active ? '#ef4444' : '#22c55e',
                          padding: '0.3rem 0.8rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {toggling === o.officer_id ? '...' : (o.is_active ? 'Deactivate' : 'Activate')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Officer Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="➕ Add New Officer">
        <form onSubmit={handleAdd}>
          {[
            ['name', 'Full Name *', 'text', 'Inspector Anita Gupta'],
            ['badge_no', 'Badge Number *', 'text', 'VIG-005'],
            ['department', 'Department', 'text', 'Women Safety Division'],
            ['phone', 'Phone', 'tel', '9876543210'],
            ['password', 'Password *', 'password', 'Min. 8 characters'],
          ].map(([key, label, type, ph]) => (
            <div className="form-group" key={key} style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ color: '#d1d5db', marginBottom: '0.5rem', display: 'block', fontSize: '0.8rem' }}>{label}</label>
              <input 
                className="form-input" 
                type={type} 
                placeholder={ph}
                value={form[key]} 
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '0.8rem',
                }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => setShowAdd(false)}
              style={{
                background: '#374151',
                border: 'none',
                color: '#9ca3af',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              style={{
                background: '#ef4444',
                border: 'none',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: saving ? 0.5 : 1,
              }}
            >
              {saving ? 'Adding...' : 'Add Officer'}
            </button>
          </div>
        </form>
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