import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar      from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import api         from '../../api/axios';

export default function AlertHistory() {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sos/alertHistory')
      .then(r => setAlerts(r.data))
      .catch(() => toast.error('Failed to load alert history'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white">Alert History</h1>
            <p className="text-sm text-gray-500 mt-1">
              All SOS alerts you have ever triggered
            </p>
          </div>

          {/* Alerts Card */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500 text-sm">No alerts found. Stay safe!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-800">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-500 font-medium">Alert ID</th>
                      <th className="text-left py-4 px-6 text-gray-500 font-medium">Date & Time</th>
                      <th className="text-left py-4 px-6 text-gray-500 font-medium">Location</th>
                      <th className="text-left py-4 px-6 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((a, idx) => (
                      <tr 
                        key={a.alert_id} 
                        className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                          idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'
                        }`}
                      >
                        <td className="py-3 px-6">
                          <span className="font-medium text-red-400">#{a.alert_id}</span>
                        </td>
                        <td className="py-3 px-6 text-gray-400 text-xs">
                          {new Date(a.triggered_at).toLocaleString('en-IN', {
                            day:'2-digit', 
                            month:'short', 
                            year:'numeric',
                            hour:'2-digit', 
                            minute:'2-digit',
                          })}
                        </td>
                        <td className="py-3 px-6 text-gray-400 text-xs max-w-xs truncate">
                          {a.location_description || `${Number(a.latitude).toFixed(5)}, ${Number(a.longitude).toFixed(5)}`}
                        </td>
                        <td className="py-3 px-6">
                          <StatusBadge status={a.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}