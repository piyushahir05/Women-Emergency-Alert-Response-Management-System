import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar        from '../../components/Navbar';
import StatusBadge   from '../../components/StatusBadge';
import CaseTimeline  from '../../components/CaseTimeline';
import api           from '../../api/axios';

export default function CaseStatus() {
  const [cases,    setCases]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [history,  setHistory]  = useState({});

  useEffect(() => {
    api.get('/sos/caseStatus')
      .then(r => setCases(r.data))
      .catch(() => toast.error('Failed to load cases'))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (caseId) => {
    if (expanded === caseId) { setExpanded(null); return; }
    setExpanded(caseId);
    if (!history[caseId]) {
      try {
        const { data } = await api.get(`/sos/caseStatus/${caseId}/history`);
        setHistory(h => ({ ...h, [caseId]: data }));
      } catch {
        toast.error('Could not load history');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white">My Cases</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track the status of all your SOS alerts
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
            </div>
          ) : cases.length === 0 ? (
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500 text-sm">You haven't triggered any SOS alerts yet.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map(c => (
                <div key={c.case_id} className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        {/* Case Header */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="font-bold text-red-400 text-base">Case #{c.case_id}</span>
                          <StatusBadge status={c.status} />
                          <StatusBadge status={c.priority} type="priority" />
                        </div>
                        
                        {/* Case Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="text-gray-400">
                            📅 <span className="text-gray-300">Created:</span>{' '}
                            {new Date(c.created_at).toLocaleString('en-IN', {
                              day:'2-digit', 
                              month:'short', 
                              year:'numeric', 
                              hour:'2-digit', 
                              minute:'2-digit'
                            })}
                          </div>
                          <div className="text-gray-400">
                            📍 <span className="text-gray-300">Location:</span>{' '}
                            <span className="text-gray-400">
                              {c.location_description || `${Number(c.latitude).toFixed(4)}, ${Number(c.longitude).toFixed(4)}`}
                            </span>
                          </div>
                          {c.officer_name ? (
                            <div className="text-gray-400">
                              👮 <span className="text-gray-300">Officer:</span>{' '}
                              <span className="text-gray-300">{c.officer_name}</span>
                              {c.officer_badge && <span className="text-gray-500 text-xs ml-1">({c.officer_badge})</span>}
                            </div>
                          ) : (
                            <div className="text-yellow-500">
                              👮 Awaiting officer assignment
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* View Timeline Button */}
                      <button 
                        className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 hover:text-white transition-colors whitespace-nowrap"
                        onClick={() => toggleExpand(c.case_id)}
                      >
                        {expanded === c.case_id ? '▲ Hide Timeline' : '▼ View Timeline'}
                      </button>
                    </div>

                    {/* Expanded Timeline Section */}
                    {expanded === c.case_id && (
                      <div className="mt-5 pt-5 border-t border-gray-800">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Status History</h4>
                        <CaseTimeline historyArray={history[c.case_id] || []} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}