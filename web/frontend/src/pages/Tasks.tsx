import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

import { Sidebar } from '../components/Sidebar';
import { Modal } from '../components/Modal';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import './Dashboard.css';

import type { Task, Project } from '@planora/shared';

export const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create task modal state
  const [showCreate, setShowCreate] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchTasksAndProjects();
  }, []);

  const fetchTasksAndProjects = async () => {
    setLoading(true);
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects?limit=100') // Get all projects for dropdown
      ]);
      
      if (tasksRes.data.success) {
        setTasks(tasksRes.data.data.tasks);
      }
      if (projectsRes.data.success) {
        setProjects(projectsRes.data.data.projects);
        if (projectsRes.data.data.projects.length > 0) {
          setProjectId(projectsRes.data.data.projects[0].id);
        }
      }
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      alert("Please select a project first. If you don't have any projects, create one.");
      return;
    }
    
    try {
      const payload: any = { name, description, status, priority, projectId };
      if (dueDate) {
        payload.dueDate = new Date(dueDate).toISOString();
      }
      
      const res = await api.post('/tasks', payload);
      
      if (res.data.success) {
        setTasks([res.data.data.task, ...tasks]);
        setShowCreate(false);
        setName('');
        setDescription('');
        setDueDate(null);
        setStatus('PENDING');
        setPriority('MEDIUM');
      }
    } catch (err) {
      alert('Failed to create task');
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Tasks</h1>
          <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ width: 'auto', marginTop: 0 }}>
            + New Task
          </button>
        </header>

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Task">
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Project <span className="required-star">*</span></label>
              <select value={projectId} onChange={e => setProjectId(e.target.value)} required>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Task Name <span className="required-star">*</span></label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <div className="date-picker-wrapper">
                <DatePicker 
                  selected={dueDate} 
                  onChange={(date: Date | null) => setDueDate(date)} 
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                />
                <Calendar className="date-picker-icon" size={18} />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', borderRadius: '8px' }}>Create</button>
          </form>
        </Modal>

        {loading && <p>Loading tasks...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="stats-grid">
            {tasks.length === 0 ? (
              <p>No tasks found.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="stat-card">
                  <h3>{task.name}</h3>
                  <p>{task.description || 'No description'}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <span className="status-badge">{task.status.replace('_', ' ')}</span>
                    <span className="status-badge" style={{ background: '#f59e0b', color: 'white' }}>{task.priority}</span>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                     <Link to={`/projects/${task.projectId}`} style={{ fontSize: '0.85rem' }}>View Project</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};
