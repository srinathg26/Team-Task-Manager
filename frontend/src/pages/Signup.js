import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '24px',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  logoIcon: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '28px',
    margin: '0 auto 12px',
  },
  title: { fontSize: '24px', fontWeight: 700, color: '#1e293b', textAlign: 'center' },
  subtitle: { fontSize: '14px', color: '#94a3b8', textAlign: 'center', marginTop: '4px' },
  form: { marginTop: '28px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1e293b',
    background: '#f8fafc',
    transition: 'border-color 0.2s',
  },
  group: { marginBottom: '18px' },
  button: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    marginTop: '8px',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#ef4444',
    fontSize: '13px',
    marginBottom: '16px',
  },
  footer: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' },
  link: { color: '#6366f1', fontWeight: 600 },
};

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={styles.logoIcon}>✓</div>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>Start managing tasks with your team</p>
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {['name', 'email', 'password', 'confirm'].map((field) => (
            <div key={field} style={styles.group}>
              <label style={styles.label}>
                {field === 'confirm' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                style={styles.input}
                type={field === 'email' ? 'email' : field.includes('pass') || field === 'confirm' ? 'password' : 'text'}
                name={field}
                placeholder={
                  field === 'name' ? 'John Doe' :
                  field === 'email' ? 'you@example.com' :
                  '••••••••'
                }
                value={form[field]}
                onChange={handleChange}
                required
                onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
          ))}
          <button
            type="submit"
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
