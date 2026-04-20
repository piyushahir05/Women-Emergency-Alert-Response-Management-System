import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sos/caseStatus')
      .then(r => setCases(r.data))
      .catch(() => toast.error('Failed to load case data'))
      .finally(() => setLoading(false));
  }, []);

  const active = cases.filter(c => !['Resolved', 'Closed'].includes(c.status)).length;
  const resolved = cases.filter(c => c.status === 'Resolved').length;

  return (
    <>
      <Navbar />
      <div className="bg-primary min-h-screen">
        <div className="container-responsive py-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-brand to-brand-dark rounded-2xl p-6 md:p-8 mb-6 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 text-8xl opacity-10 pointer-events-none">
              🛡️
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h2>
              <p className="text-white/80 text-sm md:text-base">
                Your safety dashboard — stay alert, stay safe.
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid-stats mb-6">
            {[
              { icon: '📡', label: 'Total Alerts', value: cases.length, color: 'brand' },
              { icon: '🔴', label: 'Active Cases', value: active, color: 'warning' },
              { icon: '✅', label: 'Resolved Cases', value: resolved, color: 'success' },
            ].map(stat => (
              <div className="stat-card" key={stat.label}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className={`stat-value text-${stat.color}`}>
                  {loading ? '—' : stat.value}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚡</span>
              <h3 className="font-display font-semibold text-primary">Quick Actions</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                className="btn btn-sos" 
                onClick={() => navigate('/sos')}
              >
                🆘 Trigger SOS
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/contacts')}
              >
                👥 Manage Contacts
              </button>
              <button 
                className="btn btn-info" 
                onClick={() => navigate('/case-status')}
              >
                📋 View My Cases
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/alert-history')}
              >
                📜 Alert History
              </button>
            </div>
          </div>

          {/* Recent Cases */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📋</span>
              <h3 className="font-display font-semibold text-primary">Recent Cases</h3>
            </div>
            
            {loading ? (
              <div className="flex-center py-12">
                <div className="spinner-lg"></div>
              </div>
            ) : cases.length === 0 ? (
              <div className="empty-state">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-tertiary">No SOS cases yet. Stay safe!</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Officer</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.slice(0, 5).map(c => (
                      <tr key={c.case_id}>
                        <td className="font-semibold text-primary">#{c.case_id}</td>
                        <td><StatusBadge status={c.status} /></td>
                        <td><StatusBadge status={c.priority} type="priority" /></td>
                        <td>
                          {c.officer_name || (
                            <span className="text-tertiary text-sm">Unassigned</span>
                          )}
                        </td>
                        <td className="text-tertiary text-sm">
                          {new Date(c.created_at).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {cases.length > 3 && (
              <div className="mt-4 text-center">
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate('/case-status')}
                >
                  View All Cases →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}