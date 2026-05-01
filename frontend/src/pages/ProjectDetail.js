import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  TODO: { color: '#64748b', bg: '#f1f5f9', label: 'To Do' },
  IN_PROGRESS: { color: '#3b82f6', bg: '#eff6ff', label: 'In Progress' },
  DONE: { color: '#22c55e', bg: '#f0fdf4', label: 'Done' },
};
const PRIORITY_CONFIG = {
  HIGH: { color: '#ef4444', bg: '#fef2f2' },
  MEDIUM: { color: '#f59e0b', bg: '#fffbeb' },
  LOW: { color: '#22c55e', bg: '#f0fdf4' },
};

const Modal = ({ onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '24px',
  }} onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} style={{
      background: '#fff', borderRadius: '20px', padding: '32px',
      width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      maxHeight: '90vh', overflowY: 'auto',
    }}>
      {children}
    </div>
  </div>
);

const inp = {
  width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0',
  borderRadius: '10px', fontSize: '14px', marginBottom: '12px',
  background: '#f8fafc', fontFamily: 'inherit',
};
const lbl = { fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' };

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [taskFilter, setTaskFilter] = useState({ status: '', priority: '' });

  // Modals
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [memberForm, setMemberForm] = useState({ email: '', role: 'MEMBER' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchProject = useCallback(() => {
    api.get(`/projects/${id}`)
      .then((res) => setProject(res.data.project))
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const isAdmin = project && (
    project.ownerId === user.id ||
    project.members.find((m) => m.userId === user.id)?.role === 'ADMIN'
  );

  const filteredTasks = project?.tasks?.filter((t) => {
    if (taskFilter.status && t.status !== taskFilter.status) return false;
    if (taskFilter.priority && t.priority !== taskFilter.priority) return false;
    return true;
  }) || [];

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/projects/${id}/tasks`, {
        ...taskForm,
        dueDate: taskForm.dueDate || null,
        assigneeId: taskForm.assigneeId || null,
      });
      setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
      setShowAddTask(false);
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/tasks/${editTask.id}`, {
        ...taskForm,
        dueDate: taskForm.dueDate || null,
        assigneeId: taskForm.assigneeId || null,
      });
      setEditTask(null);
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      fetchProject();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/projects/${id}/members`, memberForm);
      setMemberForm({ email: '', role: 'MEMBER' });
      setShowAddMember(false);
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const openEditTask = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assigneeId: task.assigneeId || '',
    });
    setEditTask(task);
    setError('');
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#94a3b8' }}>
      Loading project...
    </div>
  );
  if (!project) return null;

  const tasksByStatus = {
    TODO: filteredTasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: filteredTasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: filteredTasks.filter((t) => t.status === 'DONE'),
  };

  const TaskForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '14px' }}>
          {error}
        </div>
      )}
      <label style={lbl}>Title *</label>
      <input style={inp} placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required autoFocus />

      <label style={lbl}>Description</label>
      <textarea style={{ ...inp, resize: 'vertical', minHeight: '70px' }} placeholder="Task description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={lbl}>Status</label>
          <select style={inp} value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Priority</label>
          <select style={inp} value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <label style={lbl}>Due Date</label>
      <input style={inp} type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />

      <label style={lbl}>Assignee</label>
      <select style={inp} value={taskForm.assigneeId} onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}>
        <option value="">Unassigned</option>
        {project.members.map((m) => (
          <option key={m.userId} value={m.userId}>{m.user.name}</option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
        <button type="button" onClick={() => { setShowAddTask(false); setEditTask(null); }}
          style={{ flex: 1, padding: '11px', background: '#f8fafc', borderRadius: '10px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>
          Cancel
        </button>
        <button type="submit" disabled={submitting}
          style={{ flex: 1, padding: '11px', background: '#6366f1', borderRadius: '10px', color: '#fff', fontWeight: 600, fontSize: '14px', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
            <span style={{ cursor: 'pointer', color: '#6366f1' }} onClick={() => navigate('/projects')}>Projects</span> / {project.name}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{project.name}</h1>
          {project.description && <p style={{ color: '#64748b', marginTop: '4px', fontSize: '15px' }}>{project.description}</p>}
        </div>
        {isAdmin && (
          <button onClick={() => { setShowAddTask(true); setError(''); setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '' }); }}
            style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderRadius: '12px', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>
            + Add Task
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #f1f5f9', marginBottom: '24px' }}>
        {['tasks', 'members'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', borderRadius: '10px 10px 0 0',
            fontWeight: 600, fontSize: '14px', background: 'none',
            color: activeTab === tab ? '#6366f1' : '#94a3b8',
            borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
            marginBottom: '-2px', transition: 'all 0.2s',
          }}>
            {tab === 'tasks' ? `📋 Tasks (${project.tasks.length})` : `👥 Members (${project.members.length})`}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <select
              style={{ padding: '8px 14px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', background: '#fff', color: '#1e293b' }}
              value={taskFilter.status}
              onChange={(e) => setTaskFilter({ ...taskFilter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <select
              style={{ padding: '8px 14px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', background: '#fff', color: '#1e293b' }}
              value={taskFilter.priority}
              onChange={(e) => setTaskFilter({ ...taskFilter, priority: e.target.value })}
            >
              <option value="">All Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            {(taskFilter.status || taskFilter.priority) && (
              <button onClick={() => setTaskFilter({ status: '', priority: '' })}
                style={{ padding: '8px 14px', background: '#fef2f2', color: '#ef4444', borderRadius: '10px', fontSize: '13px', fontWeight: 500 }}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Kanban Board */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {Object.entries(tasksByStatus).map(([status, tasks]) => (
              <div key={status} style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', minHeight: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{
                    fontSize: '13px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px',
                    background: STATUS_CONFIG[status].bg, color: STATUS_CONFIG[status].color,
                  }}>{STATUS_CONFIG[status].label}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{tasks.length}</span>
                </div>

                {tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: '#cbd5e1', fontSize: '13px' }}>No tasks</div>
                ) : tasks.map((task) => (
                  <div key={task.id} style={{
                    background: '#fff', borderRadius: '12px', padding: '14px', marginBottom: '10px',
                    border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                        background: PRIORITY_CONFIG[task.priority].bg, color: PRIORITY_CONFIG[task.priority].color,
                      }}>{task.priority}</span>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => openEditTask(task)} style={{ background: 'none', color: '#94a3b8', fontSize: '14px' }} title="Edit">✏️</button>
                          <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', color: '#ef4444', fontSize: '14px' }} title="Delete">🗑</button>
                        </div>
                      )}
                    </div>

                    <h4 style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', marginBottom: '6px' }}>{task.title}</h4>
                    {task.description && <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', lineHeight: '1.4' }}>{task.description}</p>}

                    {task.dueDate && (
                      <div style={{
                        fontSize: '11px', color: new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? '#ef4444' : '#64748b',
                        marginBottom: '8px',
                      }}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                        {new Date(task.dueDate) < new Date() && task.status !== 'DONE' && ' · Overdue'}
                      </div>
                    )}

                    {task.assignee && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: `hsl(${task.assignee.name.charCodeAt(0) * 10}, 70%, 60%)`,
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600,
                        }}>{task.assignee.name[0].toUpperCase()}</div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{task.assignee.name}</span>
                      </div>
                    )}

                    {/* Status changer */}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={{
                        width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0',
                        borderRadius: '8px', fontSize: '12px', background: STATUS_CONFIG[task.status].bg,
                        color: STATUS_CONFIG[task.status].color, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div style={{ maxWidth: '640px' }}>
          {isAdmin && (
            <button onClick={() => { setShowAddMember(true); setError(''); }}
              style={{ marginBottom: '20px', padding: '11px 22px', background: '#6366f1', color: '#fff', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
              + Add Member
            </button>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {project.members.map((m) => (
              <div key={m.userId} style={{
                background: '#fff', borderRadius: '12px', padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: `hsl(${m.user.name.charCodeAt(0) * 10}, 70%, 60%)`,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '16px',
                  }}>{m.user.name[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
                      {m.user.name}
                      {m.userId === project.ownerId && <span style={{ marginLeft: '6px', fontSize: '11px', background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: '20px' }}>Owner</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{m.user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                    background: m.role === 'ADMIN' ? '#eef2ff' : '#f1f5f9',
                    color: m.role === 'ADMIN' ? '#6366f1' : '#64748b',
                  }}>{m.role}</span>
                  {isAdmin && m.userId !== user.id && m.userId !== project.ownerId && (
                    <button onClick={() => handleRemoveMember(m.userId)}
                      style={{ background: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <Modal onClose={() => setShowAddTask(false)}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>Add New Task</h2>
          <TaskForm onSubmit={handleCreateTask} submitLabel="Create Task" />
        </Modal>
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <Modal onClose={() => setEditTask(null)}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>Edit Task</h2>
          <TaskForm onSubmit={handleEditTask} submitLabel="Save Changes" />
        </Modal>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <Modal onClose={() => setShowAddMember(false)}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>Add Member</h2>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '14px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleAddMember}>
            <label style={lbl}>Member Email *</label>
            <input style={inp} type="email" placeholder="member@example.com" value={memberForm.email}
              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} required autoFocus />
            <label style={lbl}>Role</label>
            <select style={inp} value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button type="button" onClick={() => setShowAddMember(false)}
                style={{ flex: 1, padding: '11px', background: '#f8fafc', borderRadius: '10px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                style={{ flex: 1, padding: '11px', background: '#6366f1', borderRadius: '10px', color: '#fff', fontWeight: 600, fontSize: '14px', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProjectDetail;
