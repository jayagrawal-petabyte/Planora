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
  
  // Create project form state
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
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
              <p>No projects found. Create one to get started!</p>
            ) : (
              projects.map(project => (
                <div key={project.id} className="stat-card">
                  <h3><Link to={`/projects/${project.id}`}>{project.name}</Link></h3>
                  <p>{project.description}</p>
                  <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: '#e0e0e0', borderRadius: '4px' }}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};
