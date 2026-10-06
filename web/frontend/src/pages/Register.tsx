import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', { fullName, email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/');
      }
    } catch (err: any) {
      if (err.response?.data?.error?.details) {
        setError(err.response.data.error.details[0].message);
      } else {
        setError(err.response?.data?.error?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container split-layout">
      <div className="auth-left">
        <div className="css-art-container">
          <div className="art-circle-lg"></div>
          <div className="art-circle-sm"></div>
          <div className="art-card main-card">
             <div className="art-line short"></div>
             <div className="art-line long"></div>
             <div className="art-line medium"></div>
          </div>
          <div className="art-card side-card">
             <div className="art-line medium"></div>
             <div className="art-line short"></div>
          </div>
          <div className="art-floating-bubble bubble-1"></div>
          <div className="art-floating-bubble bubble-2"></div>
        </div>
        <div className="auth-left-text">
          <h3>Empower your teamwork</h3>
          <p>Seamlessly organize projects, track tasks, and collaborate with your entire team in one unified platform.</p>
          <div className="carousel-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-logo">PLANORA</div>
          <h2>Create an Account</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={6}
              />
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          
          <div className="auth-divider">
             <span>or</span>
          </div>
          
          <p className="auth-links">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
