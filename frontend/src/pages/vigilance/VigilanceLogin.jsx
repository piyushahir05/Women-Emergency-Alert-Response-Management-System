import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function VigilanceLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form,    setForm]    = useState({ badge_no: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.badge_no || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/vigilance/login', form);
      login(data.token, data.officer, 'officer');
      toast.success(`Welcome, Officer ${data.officer.name}! 🛡️`);
      navigate('/vigilance');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-xl border border-red-800 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="text-center pt-8 pb-4 px-6 border-b border-red-800">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/30 rounded-full mb-4 border border-red-700">
              <span className="text-3xl">🏛️</span>
            </div>
            <h1 className="font-bold text-xl text-white tracking-tight">
              WEARMS Vigilance
            </h1>
            <p className="text-xs text-red-400 mt-1 font-medium">
              AUTHORISED PERSONNEL ONLY
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Badge Number
                </label>
                <input 
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors text-white placeholder-gray-500"
                  type="text"
                  placeholder="e.g., VIG-001"
                  value={form.badge_no} 
                  onChange={e => setForm(f => ({ ...f, badge_no: e.target.value }))} 
                />
              </div>
              
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input 
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors text-white placeholder-gray-500"
                  type="password"
                  placeholder="••••••••"
                  value={form.password} 
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </span>
                ) : (
                  '🔐 Sign In to Vigilance'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gray-900 text-gray-500">Access Portal</span>
              </div>
            </div>

            {/* User Link */}
            <p className="text-center text-sm text-gray-500">
              Are you a user?{' '}
              <Link to="/login" className="text-red-500 font-semibold hover:text-red-400 transition-colors">
                User Login →
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Restricted Access • Authorised Personnel Only
        </p>
      </div>
    </div>
  );
}