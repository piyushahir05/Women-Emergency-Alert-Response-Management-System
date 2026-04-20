import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '', 
    address: '' 
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Phone must be 10 digits';
    if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { 
      setErrors(errs); 
      return; 
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className={`form-input ${errors[name] ? 'error' : ''}`}
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={e => { 
          setForm(f => ({ ...f, [name]: e.target.value })); 
          setErrors(x => ({ ...x, [name]: '' })); 
        }}
      />
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  );

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
            <h2 className="font-display text-lg font-semibold text-primary mb-4">Create Account</h2>

            <form onSubmit={handleSubmit}>
              {field('name', 'Full Name', 'text', 'Priya Sharma')}
              {field('email', 'Email Address', 'email', 'priya@example.com')}
              {field('phone', 'Phone Number', 'tel', '9876543210')}
              {field('password', 'Password', 'password', 'Min. 8 characters')}
              {field('confirmPassword', 'Confirm Password', 'password', 'Re-enter password')}
              
              <div className="form-group">
                <label className="form-label">
                  Address <span className="text-tertiary font-normal">(optional)</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Your home address..."
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full justify-center mt-4" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner spinner-sm mr-2"></div>
                    Registering...
                  </>
                ) : (
                  '🛡️ Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-tertiary">
                Already have an account?{' '}
                <Link to="/login" className="text-brand font-semibold hover:text-brand-dark transition">
                  Sign in
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
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}