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
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Task form
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Edit Task
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskStatus, setEditTaskStatus] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState('');

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id, search, statusFilter, priorityFilter]);

  const fetchProjectAndTasks = async () => {
    try {
      let tasksUrl = `/tasks?projectId=${id}`;
      if (search) tasksUrl += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) tasksUrl += `&status=${encodeURIComponent(statusFilter)}`;
      if (priorityFilter) tasksUrl += `&priority=${encodeURIComponent(priorityFilter)}`;

      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(tasksUrl)
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

  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskName(task.name);
    setEditTaskDesc(task.description || '');
    setEditTaskStatus(task.status);
    setEditTaskPriority(task.priority);
  };

  const handleEditTaskSubmit = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    try {
      const res = await api.put(`/tasks/${taskId}`, {
        name: editTaskName,
        description: editTaskDesc,
        status: editTaskStatus,
        priority: editTaskPriority
      });
      if (res.data.success) {
        setTasks(tasks.map(t => t.id === taskId ? res.data.data.task : t));
        setEditingTaskId(null);
      }
    } catch (err) {
      alert('Failed to update task');
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
          <li><Link to="/dashboard">Dashboard</Link></li>
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

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
            />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
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
                  {editingTaskId === task.id ? (
                    <form onSubmit={(e) => handleEditTaskSubmit(e, task.id)} style={{ width: '100%' }}>
                      <input type="text" value={editTaskName} onChange={e => setEditTaskName(e.target.value)} required style={{width: '100%', marginBottom: '0.5rem', padding: '0.5rem'}} />
                      <input type="text" value={editTaskDesc} onChange={e => setEditTaskDesc(e.target.value)} style={{width: '100%', marginBottom: '0.5rem', padding: '0.5rem'}} />
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        <select value={editTaskStatus} onChange={e => setEditTaskStatus(e.target.value)} style={{flex: 1, padding: '0.5rem'}}>
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                        <select value={editTaskPriority} onChange={e => setEditTaskPriority(e.target.value)} style={{flex: 1, padding: '0.5rem'}}>
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn-primary" style={{ marginTop: 0, flex: 1, padding: '0.5rem' }}>Save</button>
                        <button type="button" onClick={() => setEditingTaskId(null)} className="btn-secondary" style={{ marginTop: 0, flex: 1, padding: '0.5rem' }}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                          {task.name}
                        </h4>
                        <p style={{ margin: '0', fontSize: '0.9rem', color: '#7f8c8d' }}>{task.description}</p>
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', background: '#e0e0e0', borderRadius: '4px' }}>{task.status}</span>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', background: task.priority === 'HIGH' ? '#e74c3c' : task.priority === 'MEDIUM' ? '#f39c12' : '#3498db', color: 'white', borderRadius: '4px' }}>{task.priority}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => toggleTaskStatus(task.id, task.status)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
                          {task.status === 'COMPLETED' ? 'Mark Pending' : 'Complete'}
                        </button>
                        <button onClick={() => startEditTask(task)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteTask(task.id)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', background: '#e74c3c', color: 'white', border: 'none' }}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
