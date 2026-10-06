import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css'; // Reusing layout styles

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
}

export const Projects = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create project form state
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Edit project state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = '/projects?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setProjects(res.data.data.projects);
      }
    } catch (err: any) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', { name, description });
      if (res.data.success) {
        setProjects([res.data.data.project, ...projects]);
        setShowCreate(false);
        setName('');
        setDescription('');
      }
    } catch (err) {
      alert('Failed to create project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
    setEditDescription(project.description || '');
    setEditStatus(project.status);
  };

  const handleEditSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    try {
      const res = await api.put(`/projects/${id}`, { name: editName, description: editDescription, status: editStatus });
      if (res.data.success) {
        setProjects(projects.map(p => p.id === id ? res.data.data.project : p));
        setEditingId(null);
      }
    } catch (err) {
      alert('Failed to update project');
    }
  };

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
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Projects</h1>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary" style={{ width: 'auto', marginTop: 0 }}>
            {showCreate ? 'Cancel' : 'New Project'}
          </button>
        </header>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Search projects..." 
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
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>

        {showCreate && (
          <div className="stat-card" style={{ marginBottom: '2rem' }}>
            <h3>Create New Project</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary">Create</button>
            </form>
          </div>
        )}

        {loading && <p>Loading projects...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="stats-grid">
            {projects.length === 0 ? (
              <p>No projects found.</p>
            ) : (
              projects.map(project => (
                <div key={project.id} className="stat-card">
                  {editingId === project.id ? (
                    <form onSubmit={(e) => handleEditSubmit(e, project.id)}>
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required style={{width: '100%', marginBottom: '0.5rem', padding: '0.5rem'}} />
                      <input type="text" value={editDescription} onChange={e => setEditDescription(e.target.value)} style={{width: '100%', marginBottom: '0.5rem', padding: '0.5rem'}} />
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{width: '100%', marginBottom: '0.5rem', padding: '0.5rem'}}>
                        <option value="PLANNING">Planning</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ON_HOLD">On Hold</option>
                      </select>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn-primary" style={{ marginTop: 0, flex: 1, padding: '0.5rem' }}>Save</button>
                        <button type="button" onClick={() => setEditingId(null)} className="btn-secondary" style={{ marginTop: 0, flex: 1, padding: '0.5rem' }}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3><Link to={`/projects/${project.id}`}>{project.name}</Link></h3>
                      <p>{project.description}</p>
                      <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: '#e0e0e0', borderRadius: '4px' }}>
                        {project.status.replace('_', ' ')}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button onClick={() => startEdit(project)} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Edit</button>
                        <button onClick={() => handleDelete(project.id)} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', background: '#e74c3c', color: 'white', borderColor: '#e74c3c' }}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};
