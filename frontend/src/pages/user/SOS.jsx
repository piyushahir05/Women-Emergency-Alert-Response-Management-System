import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Modal  from '../../components/Modal';
import api    from '../../api/axios';

export default function SOS() {
  const navigate = useNavigate();
  const [location,    setLocation]    = useState(null);
  const [manualDesc,  setManualDesc]  = useState('');
  const [geoError,    setGeoError]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [triggered,   setTriggered]   = useState(null); // {case_id}
  const [countdown,   setCountdown]   = useState(5);
  const intervalRef = useRef(null);

  // Try to get geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        ()  => setGeoError(true),
        { timeout: 5000 }
      );
    } else {
      setGeoError(true);
    }
  }, []);

  // Countdown redirect after SOS
  useEffect(() => {
    if (!triggered) return;
    intervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(intervalRef.current);
          navigate('/case-status');
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [triggered, navigate]);

  const handleTrigger = async () => {
    setLoading(true);
    try {
      const payload = {
        latitude:             location?.latitude  || 0,
        longitude:            location?.longitude || 0,
        location_description: manualDesc || (location ? `${location.latitude}, ${location.longitude}` : 'Location unavailable'),
      };
      const { data } = await api.post('/sos/triggerSOS', payload);
      setTriggered(data);
      setShowConfirm(false);
      toast.success('🆘 SOS Triggered! Help is on the way.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to trigger SOS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight:'calc(100vh - 64px)', background:'#141414', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
        <div style={{ maxWidth:'520px', width:'100%', textAlign:'center' }}>

          {triggered ? (
            /* ── Success State ── */
            <div className="card" style={{ textAlign:'center', padding:'3rem 2rem' }}>
              <div style={{ fontSize:'4rem', marginBottom:'1rem', animation:'spin 1s ease-out' }}>✅</div>
              <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'#15803d', marginBottom:'0.5rem' }}>
                Help Is On The Way!
              </h2>
              <p style={{ color:'#6b7280', marginBottom:'1rem' }}>
                Case ID: <b>#{triggered.case_id}</b> has been created.
              </p>
              <div style={{
                width:'80px', height:'80px', borderRadius:'50%',
                border:'6px solid #e5e7eb', borderTopColor:'#be123c',
                margin:'1rem auto', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:'1.75rem', fontWeight:800,
                color:'#be123c', animation:'spin 1s linear infinite',
              }}>
                {countdown}
              </div>
              <p style={{ color:'#9ca3af', fontSize:'0.85rem' }}>Redirecting to case status in {countdown}s…</p>
              <button className="btn btn-primary" style={{ marginTop:'1rem' }} onClick={() => navigate('/case-status')}>
                View Case Now
              </button>
            </div>
          ) : (
            /* ── Normal State ── */
            <>
              <div style={{ marginBottom:'2rem' }}>
                <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>🛡️</div>
                <h1 style={{ fontSize:'1.8rem', fontWeight:900, color:'#6b87c5', marginBottom:'4px' }}>Emergency SOS</h1>
                <p style={{ color:'#6b7280' }}>Press the button below if you need immediate help</p>
              </div>

              {/* Location status */}
              <div className={`alert ${geoError ? 'alert-warning' : 'alert-success'}`} style={{ marginBottom:'1.5rem', justifyContent:'center' }}>
                {geoError
                  ? '📍 Location not available — please describe your location below'
                  : `📍 Location captured: ${location?.latitude?.toFixed(4)}, ${location?.longitude?.toFixed(4)}`}
              </div>

              {geoError && (
                <div className="form-group" style={{ textAlign:'left', marginBottom:'1.5rem' }}>
                  <label className="form-label">Describe your location</label>
                  <textarea className="form-textarea" placeholder="e.g. Near MG Road, opp. SBI Bank, Bengaluru..."
                    value={manualDesc} onChange={e => setManualDesc(e.target.value)} />
                </div>
              )}

              {/* Big SOS Button */}
              <button
                onClick={() => setShowConfirm(true)}
                style={{
                  width:'200px', height:'200px', borderRadius:'50%',
                  background:'linear-gradient(135deg, #dc2626 0%, #9f1239 100%)',
                  border:'8px solid rgba(220,38,38,0.25)',
                  color:'#fff', cursor:'pointer',
                  fontSize:'1.1rem', fontWeight:900, letterSpacing:'0.05em',
                  boxShadow:'0 0 0 16px rgba(220,38,38,0.1), 0 20px 40px rgba(220,38,38,0.4)',
                  display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent:'center', gap:'8px', margin:'0 auto 2rem',
                  animation:'sosPulse 2s ease-in-out infinite',
                }}
              >
                <span style={{ fontSize:'2.5rem' }}>🆘</span>
                <span>SOS</span>
                <span style={{ fontSize:'0.75rem', opacity:0.85, fontWeight:600 }}>PRESS FOR HELP</span>
              </button>

              <p style={{ color:'#9ca3af', fontSize:'0.8rem' }}>
                Pressing SOS will alert the Vigilance Department immediately
              </p>

              <style>{`
                @keyframes sosPulse {
                  0%, 100% { box-shadow: 0 0 0 16px rgba(220,38,38,0.1), 0 20px 40px rgba(220,38,38,0.4); }
                  50%       { box-shadow: 0 0 0 30px rgba(220,38,38,0.05), 0 20px 60px rgba(220,38,38,0.5); }
                }
              `}</style>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="⚠️ Confirm SOS Alert">
        <p style={{ color:'#374151', marginBottom:'1rem', lineHeight:1.7 }}>
          Are you sure you want to trigger an <b>SOS alert</b>? This will immediately notify the Vigilance Department and create a tracked emergency case.
        </p>
        {geoError && !manualDesc && (
          <div className="alert alert-warning">Please describe your location before triggering SOS.</div>
        )}
        <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', marginTop:'1.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleTrigger} disabled={loading || (geoError && !manualDesc)}>
            {loading ? 'Triggering...' : '🆘 Yes, Trigger SOS'}
          </button>
        </div>
      </Modal>
    </>
  );
}
