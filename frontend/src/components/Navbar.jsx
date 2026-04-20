import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sos', label: 'SOS' },
    { to: '/contacts', label: 'Contacts' },
    { to: '/case-status', label: 'My Cases' },
    { to: '/alert-history', label: 'History' },
  ];

  return (
    <nav style={navStyle}>
      <Link to="/dashboard" style={brandStyle}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span style={brandText}>WEARMS</span>
        <span style={brandSub}>Response System</span>
      </Link>

      <div style={linksStyle}>
        {navLinks.map((link) => (
          <NavLink 
            key={link.to} 
            to={link.to} 
            isActive={location.pathname === link.to}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div style={rightStyle}>
        <div style={userChip}>
          <div style={avatarStyle}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span>{user?.name?.split(' ')[0]}</span>
        </div>
        <button onClick={handleLogout} style={logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

function NavLink({ to, children, isActive }) {
  return (
    <Link
      to={to}
      style={{
        color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
        textDecoration: 'none',
        fontSize: '0.85rem',
        fontWeight: 500,
        padding: '6px 14px',
        borderRadius: '6px',
        transition: 'all 0.2s',
        background: isActive ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
        borderBottom: isActive ? '2px solid #ef4444' : 'none',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.target.style.background = 'rgba(255,255,255,0.1)';
          e.target.style.color = '#fff';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.target.style.background = 'transparent';
          e.target.style.color = 'rgba(255,255,255,0.7)';
        }
      }}
    >
      {children}
    </Link>
  );
}

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 2rem',
  height: '64px',
  background: '#111827',
  borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#fff',
  textDecoration: 'none',
};

const brandText = {
  fontSize: '1.1rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  color: '#fff',
};

const brandSub = {
  fontSize: '0.65rem',
  color: '#9ca3af',
  fontWeight: 400,
  marginLeft: '4px',
};

const linksStyle = {
  display: 'flex',
  gap: '4px',
};

const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const userChip = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#fff',
  fontSize: '0.85rem',
  fontWeight: 500,
  padding: '4px 8px',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.05)',
};

const avatarStyle = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: 'rgba(239, 68, 68, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#ef4444',
};

const logoutBtn = {
  background: 'rgba(239, 68, 68, 0.15)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#ef4444',
  padding: '6px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 500,
  transition: 'all 0.2s',
};