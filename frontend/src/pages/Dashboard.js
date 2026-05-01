import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  TODO: { bg: '#f1f5f9', color: '#64748b', label: 'To Do' },
  IN_PROGRESS: { bg: '#eff6ff', color: '#3b82f6', label: 'In Progress' },
  DONE: { bg: '#f0fdf4', color: '#22c55e', label: 'Done' },
};

const PRIORITY_COLORS = {
  HIGH: { bg: '#fef2f2', color: '#ef4444' },
  MEDIUM: { bg: '#fffbeb', color: '#f59e0b' },
  LOW: { bg: '#f0fdf4', color: '#22c55e' },
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '12px',
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{label}</div>
    </div>
  </div>
);

const TaskRow = ({ task }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 0', borderBottom: '1px solid #f1f5f9',
  }}>
    <div>
      <div style={{ fontWeight: 500, fontSize: '14px', color: '#1e293b' }}>{task.title}</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
        📁 {task.project?.name}
        {task.dueDate && ` · 📅 ${new Date(task.dueDate).toLocaleDateString()}`}
      </div>
    </div>
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <span style={{
        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
        background: PRIORITY_COLORS[task.priority]?.bg, color: PRIORITY_COLORS[task.priority]?.color,
      }}>{task.priority}</span>
      <span style={{
        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
        background: COLORS[task.status]?.bg, color: COLORS[task.status]?.color,
      }}>{COLORS[task.status]?.label}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#94a3b8' }}>
      Loading dashboard...
    </div>
  );

  if (error) return (
    <div style={{ padding: '40px', color: '#ef4444', textAlign: 'center' }}>{error}</div>
  );

  const { stats, statusSummary, myTasks, overdueTasks, recentActivity } = data;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '4px' }}>Here's what's happening with your projects today.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon="📁" label="Total Projects" value={stats.totalProjects} color="#eef2ff" />
        <StatCard icon="📋" label="Total Tasks" value={stats.totalTasks} color="#f0fdf4" />
        <StatCard icon="👤" label="My Tasks" value={stats.myTasks} color="#eff6ff" />
        <StatCard icon="⏰" label="Overdue Tasks" value={stats.overdueTasks} color="#fef2f2" />
      </div>

      {/* Status Breakdown */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '24px',
        border: '1px solid #f1f5f9', marginBottom: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1e293b' }}>Task Status Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {Object.entries(statusSummary).map(([status, count]) => (
            <div key={status} style={{
              padding: '16px', borderRadius: '12px', background: COLORS[status]?.bg, textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: COLORS[status]?.color }}>{count}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: COLORS[status]?.color, marginTop: '4px' }}>{COLORS[status]?.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* My Tasks */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '24px',
          border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>My Assigned Tasks</h2>
            <Link to="/projects" style={{ fontSize: '13px', color: '#6366f1', fontWeight: 500 }}>View all →</Link>
          </div>
          {myTasks.length === 0
            ? <p style={{ color: '#94a3b8', fontSize: '14px' }}>No tasks assigned to you.</p>
            : myTasks.slice(0, 5).map((t) => <TaskRow key={t.id} task={t} />)
          }
        </div>

        {/* Overdue Tasks */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '24px',
          border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444', marginBottom: '16px' }}>
            ⚠️ Overdue Tasks
          </h2>
          {overdueTasks.length === 0
            ? <p style={{ color: '#94a3b8', fontSize: '14px' }}>🎉 No overdue tasks!</p>
            : overdueTasks.slice(0, 5).map((t) => <TaskRow key={t.id} task={t} />)
          }
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '24px',
          border: '1px solid #f1f5f9', marginTop: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Recent Activity</h2>
          {recentActivity.map((t) => <TaskRow key={t.id} task={t} />)}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
