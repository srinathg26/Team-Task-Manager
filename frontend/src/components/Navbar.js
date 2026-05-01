import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  nav: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: 700,
    fontSize: '18px',
    color: '#6366f1',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '16px',
  },
  links: { display: 'flex', gap: '4px', alignItems: 'center' },
  link: (active) => ({
    padding: '6px 16px',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '14px',
    color: active ? '#6366f1' : '#64748b',
    background: active ? '#eef2ff' : 'transparent',
    transition: 'all 0.15s',
    textDecoration: 'none',
  }),
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    position: 'relative',
  },
  userName: { fontSize: '14px', fontWeight: 500, color: '#1e293b' },
  dropdown: {
    position: 'absolute',
    top: '44px',
    right: 0,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    padding: '8px',
    minWidth: '160px',
    zIndex: 200,
  },
  dropdownItem: {
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#ef4444',
    fontWeight: 500,
    transition: 'background 0.1s',
  },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.logo}>
        <div style={styles.logoIcon}>✓</div>
        TaskFlow
      </Link>

      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link(location.pathname === '/dashboard')}>
          Dashboard
        </Link>
        <Link to="/projects" style={styles.link(location.pathname.startsWith('/projects'))}>
          Projects
        </Link>
      </div>

      <div style={styles.right}>
        <span style={styles.userName}>{user?.name}</span>
        <div style={styles.avatar} onClick={() => setOpen(!open)}>
          {user?.name?.[0]?.toUpperCase()}
          {open && (
            <div style={styles.dropdown}>
              <div
                style={styles.dropdownItem}
                onClick={handleLogout}
                onMouseEnter={(e) => (e.target.style.background = '#fef2f2')}
                onMouseLeave={(e) => (e.target.style.background = 'transparent')}
              >
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
