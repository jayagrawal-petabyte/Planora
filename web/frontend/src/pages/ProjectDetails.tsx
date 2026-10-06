import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

interface Task {
  id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
}

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Task form
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`)
      ]);
      setProject(projRes.data.data.project);
      setTasks(tasksRes.data.data.tasks);
    } catch (err) {
      alert('Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', {
        name: taskName,
        description: taskDesc,
        projectId: id
      });
      if (res.data.success) {
        setTasks([res.data.data.task, ...tasks]);
        setTaskName('');
        setTaskDesc('');
        setShowTaskForm(false);
      }
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h3>ProjectManager</h3>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/projects" className="active">Projects</Link></li>
        </ul>
        <div className="sidebar-footer">
          <p>{user?.fullName}</p>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <header>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <div style={{ marginTop: '1rem' }}>
            <span style={{ padding: '0.3rem 0.6rem', background: '#3498db', color: 'white', borderRadius: '4px' }}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
        </header>

        <section style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Tasks</h2>
            <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn-primary" style={{ width: 'auto', marginTop: 0 }}>
              {showTaskForm ? 'Cancel' : 'Add Task'}
            </button>
          </div>

          {showTaskForm && (
            <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label>Task Name</label>
                  <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary">Save Task</button>
              </form>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.length === 0 ? (
              <p>No tasks yet.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                      {task.name}
                    </h4>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#7f8c8d' }}>{task.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => toggleTaskStatus(task.id, task.status)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
                      {task.status === 'COMPLETED' ? 'Mark Pending' : 'Complete'}
                    </button>
                    <button onClick={() => handleDeleteTask(task.id)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', background: '#e74c3c', color: 'white', border: 'none' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
