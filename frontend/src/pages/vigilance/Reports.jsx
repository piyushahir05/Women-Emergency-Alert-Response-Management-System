import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import api from '../../api/axios';

export default function Reports() {
  const [summary,    setSummary]    = useState(null);
  const [byDay,      setByDay]      = useState([]);
  const [byOfficer,  setByOfficer]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, d, o] = await Promise.all([
        api.get('/vigilance/reports/summary'),
        api.get('/vigilance/reports/by-day'),
        api.get('/vigilance/reports/by-officer'),
      ]);
      setSummary(s.data);
      setByDay(d.data.map(r => ({ ...r, alert_date: r.alert_date?.slice(0, 10) })));
      setByOfficer(o.data);
      setLastUpdate(new Date().toLocaleTimeString('en-IN'));
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statCards = summary ? [
    { icon: '📡', label: 'Alerts Today', value: summary.total_alerts_today, color: '#ef4444' },
    { icon: '🔴', label: 'Active Cases', value: summary.active_cases, color: '#f97316' },
    { icon: '⏳', label: 'Pending Cases', value: summary.pending_cases, color: '#eab308' },
    { icon: '✅', label: 'Resolved Cases', value: summary.resolved_cases, color: '#22c55e' },
    { icon: '🔒', label: 'Closed Cases', value: summary.closed_cases, color: '#6b7280' },
    { icon: '⚡', label: 'Avg Response (min)', value: summary.avg_response_time_minutes ?? '—', color: '#f97316' },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>📊 Reports Dashboard</h1>
          {lastUpdate && <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>Last updated: {lastUpdate}</p>}
        </div>
        <button 
          onClick={load} 
          disabled={loading}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '0.4rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {loading ? '⏳ Loading…' : '↻ Refresh'}
        </button>
      </div>

      {/* Stat Cards */}
      {loading && !summary ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(239, 68, 68, 0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '1rem', 
          marginBottom: '1.5rem' 
        }}>
          {statCards.map(s => (
            <div 
              key={s.label}
              style={{
                background: '#111827',
                borderRadius: '0.75rem',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
              <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        
        {/* Alerts Per Day chart */}
        <div style={{ background: '#111827', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>📅 Alerts Per Day (Last 30 Days)</span>
          </div>
          {byDay.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byDay} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="alert_date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} name="Alerts" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Officer Workload chart */}
        <div style={{ background: '#111827', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>👮 Officer Workload</span>
          </div>
          {byOfficer.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>No officer data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byOfficer} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} width={100} />
                <Tooltip 
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Bar dataKey="total_cases" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Total Cases" />
                <Bar dataKey="active_cases" fill="#f97316" radius={[0, 4, 4, 0]} name="Active" />
                <Bar dataKey="resolved_cases" fill="#22c55e" radius={[0, 4, 4, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Officer Detail Table */}
      <div style={{ background: '#111827', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>📋 Cases Per Officer (Detail)</span>
        </div>
        
        {byOfficer.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>No data available</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead style={{ borderBottom: '1px solid #1f2937' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Officer</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Badge No</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Department</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Total</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Active</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Resolved</th>
                </tr>
              </thead>
              <tbody>
                {byOfficer.map(o => (
                  <tr key={o.officer_id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#fff' }}>{o.name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <code style={{ background: '#1f2937', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', color: '#ef4444' }}>{o.badge_no}</code>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9ca3af' }}>{o.department || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#fff' }}>{o.total_cases}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {o.active_cases > 0
                        ? <span style={{ color: '#f97316', fontWeight: 600 }}>{o.active_cases}</span>
                        : <span style={{ color: '#6b7280' }}>0</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>{o.resolved_cases}</span>
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