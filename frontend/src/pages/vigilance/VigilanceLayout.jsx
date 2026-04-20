import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function VigilanceLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ new: 0, pending: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [newR, pendingR] = await Promise.all([
          api.get('/vigilance/cases/new'),
          api.get('/vigilance/cases/pending'),
        ]);
        setCounts({ new: newR.data.length, pending: pendingR.data.length });
      } catch {}
    };
    fetchCounts();
    const timer = setInterval(fetchCounts, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => { logout(); navigate('/vigilance/login'); };

  const navItems = [
    { to: '/vigilance/dashboard', icon: '📥', label: 'New Cases', badge: counts.new },
    { to: '/vigilance/pending', icon: '⏳', label: 'Pending Cases', badge: counts.pending },
    { to: '/vigilance/resolved', icon: '✅', label: 'Resolved' },
    { to: '/vigilance/closed', icon: '🔒', label: 'Closed' },
    { to: '/vigilance/officers', icon: '👮', label: 'Officers' },
    { to: '/vigilance/reports', icon: '📊', label: 'Reports' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000000' }}>
      
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '280px' : '0',
        minWidth: sidebarOpen ? '280px' : '0',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111827 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
        borderRight: '1px solid rgba(220, 38, 38, 0.2)',
      }}>
        {/* Brand */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(220, 38, 38, 0.2)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>
            <span style={{ color: '#ef4444' }}>🛡️</span> WEARMS
          </div>
          <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', fontWeight: 600 }}>
            VIGILANCE DEPARTMENT
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
          {navItems.map(item => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '4px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                background: isActive ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #ef4444' : '3px solid transparent',
                transition: 'all 0.2s',
              })}
            >
              <span>{item.icon} {item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}>{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Officer info */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(220, 38, 38, 0.2)' }}>
          <div style={{ fontSize: '0.7rem', color: '#ef4444', marginBottom: '8px', fontWeight: 600 }}>
            AUTHORISED OFFICER
          </div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>{user?.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginBottom: '12px' }}>
            Badge: {user?.badge_no}
          </div>
          <button onClick={handleLogout} style={{
            width: '100%',
            padding: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
            e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
            e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}>
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: '60px',
          background: '#111827',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem',
          gap: '1rem',
          borderBottom: '1px solid rgba(220, 38, 38, 0.3)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <button 
            onClick={() => setSidebarOpen(s => !s)} 
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseLeave={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            ☰
          </button>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
            WEARMS VIGILANCE COMMAND
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {counts.new > 0 && (
              <span style={{ 
                background: 'rgba(239, 68, 68, 0.15)', 
                color: '#ef4444', 
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '4px 12px', 
                borderRadius: '999px', 
                fontSize: '0.7rem', 
                fontWeight: 700 
              }}>
                🔴 {counts.new} NEW CASE{counts.new !== 1 ? 'S' : ''}
              </span>
            )}
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>👮</span>
            <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{user?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ 
          flex: 1, 
          padding: '1.75rem', 
          background: '#0a0a0a', 
          overflowY: 'auto',
          minHeight: 'calc(100vh - 60px)',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}