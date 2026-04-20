import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user, 'user');
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-secondary rounded-2xl shadow-xl border border-light overflow-hidden">
          {/* Header */}
          <div className="text-center pt-8 pb-4 px-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-light rounded-full mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-primary mb-1">WEARMS</h1>
            <p className="text-sm text-tertiary">Women Emergency Alert & Response Management System</p>
          </div>

          {/* Divider */}
          <div className="divider my-2"></div>

          {/* Form */}
          <div className="p-6">
            <h2 className="font-display text-lg font-semibold text-primary mb-4">Sign In</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="priya@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full justify-center mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner spinner-sm mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  '🔐 Sign In'
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-tertiary">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand font-semibold hover:text-brand-dark transition">
                  Register here
                </Link>
              </p>
            </div>

            {/* Officer Link */}
            <div className="mt-3 text-center">
              <p className="text-xs text-tertiary">
                Are you an officer?{' '}
                <Link to="/vigilance/login" className="text-info font-semibold hover:text-info/80 transition">
                  Vigilance Login →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-tertiary mt-6">
          Protected by end-to-end encryption
        </p>
      </div>
    </div>
  );
}