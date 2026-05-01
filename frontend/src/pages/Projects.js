import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Modal = ({ onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '24px',
  }} onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} style={{
      background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    }}>
      {children}
    </div>
  </div>
);

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = () => {
    api.get('/projects')
      .then((res) => setProjects(res.data.projects))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '' });
      setShowCreate(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const inp = {
    width: '100%', padding: '12px 14px', border: '2px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', marginBottom: '14px', background: '#f8fafc',
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>Projects</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px' }}>Manage all your team projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', borderRadius: '12px', fontWeight: 600, fontSize: '14px',
          }}
        >
          + New Project
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', color: '#ef4444', fontSize: '14px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px', background: '#fff',
          borderRadius: '20px', border: '2px dashed #e2e8f0',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <h2 style={{ color: '#1e293b', marginBottom: '8px' }}>No projects yet</h2>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Create your first project to get started</p>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: '12px 24px', background: '#6366f1',
              color: '#fff', borderRadius: '10px', fontWeight: 600,
            }}
          >
            Create Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {projects.map((project) => (
            <div key={project.id} style={{
              background: '#fff', borderRadius: '16px', padding: '24px',
              border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '16px',
                }}>
                  {project.name[0].toUpperCase()}
                </div>
                <button
                  onClick={() => handleDelete(project.id)}
                  style={{ background: 'none', color: '#ef4444', fontSize: '18px', padding: '4px' }}
                  title="Delete project"
                >🗑</button>
              </div>

              <h3 style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b', marginBottom: '6px' }}>
                {project.name}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px', minHeight: '36px' }}>
                {project.description || 'No description'}
              </p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', fontSize: '12px', color: '#64748b' }}>
                <span>👥 {project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
                <span>📋 {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                {project.members.slice(0, 4).map((m) => (
                  <div key={m.userId} title={m.user.name} style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: `hsl(${m.user.name.charCodeAt(0) * 10}, 70%, 60%)`,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 600, border: '2px solid #fff',
                  }}>
                    {m.user.name[0].toUpperCase()}
                  </div>
                ))}
                {project.members.length > 4 && (
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>+{project.members.length - 4}</span>
                )}
              </div>

              <Link to={`/projects/${project.id}`} style={{
                display: 'block', textAlign: 'center', padding: '10px',
                background: '#eef2ff', borderRadius: '10px', color: '#6366f1',
                fontWeight: 600, fontSize: '14px', transition: 'background 0.2s',
              }}>
                Open Project →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>Create New Project</h2>
          <form onSubmit={handleCreate}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
              Project Name *
            </label>
            <input
              style={inp}
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: '80px' }}
              placeholder="What is this project about?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                style={{
                  flex: 1, padding: '12px', background: '#f8fafc',
                  borderRadius: '10px', color: '#64748b', fontWeight: 600, fontSize: '14px',
                }}
              >Cancel</button>
              <button
                type="submit"
                disabled={creating}
                style={{
                  flex: 1, padding: '12px', background: '#6366f1',
                  borderRadius: '10px', color: '#fff', fontWeight: 600, fontSize: '14px',
                  opacity: creating ? 0.7 : 1,
                }}
              >{creating ? 'Creating...' : 'Create Project'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Projects;
