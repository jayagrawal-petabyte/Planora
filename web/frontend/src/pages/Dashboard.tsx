import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

interface DashboardStats {
  totalProjects: number;
  projectsInProgress: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setStats(res.data.data.stats);
        }
      } catch (err: any) {
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h3>ProjectManager</h3>
        </div>
        <ul className="nav-links">
          <li><Link to="/dashboard" className="active">Dashboard</Link></li>
          <li><Link to="/projects">Projects</Link></li>
        </ul>
        <div className="sidebar-footer">
          <p>{user?.fullName}</p>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <header>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.fullName}!</p>
        </header>

        {loading && <p>Loading statistics...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Projects</h3>
              <p className="stat-value">{stats.totalProjects}</p>
            </div>
            <div className="stat-card">
              <h3>Projects In Progress</h3>
              <p className="stat-value">{stats.projectsInProgress}</p>
            </div>
            <div className="stat-card">
              <h3>Total Tasks</h3>
              <p className="stat-value">{stats.totalTasks}</p>
            </div>
            <div className="stat-card">
              <h3>Completed Tasks</h3>
              <p className="stat-value">{stats.completedTasks}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Tasks</h3>
              <p className="stat-value">{stats.pendingTasks}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
