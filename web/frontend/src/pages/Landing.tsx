import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';
import heroImage from '../assets/hero.png'; // Will use a generic div representation or simple CSS for the avatars

export const Landing = () => {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="nav-left">
          <button className="menu-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            Menu
          </button>
          <div className="logo-section">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <div className="logo-text">
              <span className="logo-title">PLANORA</span>
              <span className="logo-subtitle">for Software Ismobiophotonics</span>
            </div>
          </div>
        </div>
        <div className="nav-right">
          <a href="#contact" className="contact-btn">Contact Us</a>
          <Link to="/login" className="login-btn">Log in</Link>
        </div>
      </nav>

      <main className="landing-main">
        <p className="welcome-text">Welcome to</p>
        <h1 className="hero-title">PLANORA</h1>

        <div className="hero-graphic">
          <div className="graphic-item item-intern">
            <span className="graphic-label" style={{background: '#ffe8cc', color: '#d35400'}}>Intern</span>
            <div className="avatar-circle"></div>
            <div className="avatar-body"></div>
          </div>
          
          <div className="graphic-item item-project">
            <span className="graphic-label" style={{background: '#e0e7ff', color: '#3730a3'}}>Project</span>
            <div className="avatar-circle center-circle"></div>
            <div className="avatar-body center-body"></div>
            <div className="desk">
               <div className="screen"></div>
            </div>
          </div>
          
          <div className="graphic-item item-task">
            <span className="graphic-label" style={{background: '#d1fae5', color: '#065f46'}}>Task</span>
            <div className="avatar-circle"></div>
            <div className="avatar-body"></div>
          </div>
        </div>

        <div className="hero-content">
          <h2>Software Ismobiophotonics own <u>Interns Tasks</u><br/>& <u>projects managing portal</u></h2>
          <p>Helping Interns & Managers connect together</p>
        </div>

        <section id="contact" className="contact-section">
          <h3>Contact Us</h3>
          <p>Software Ismobiophotonics</p>
          <a href="https://ismobiophotonics.com/" target="_blank" rel="noreferrer">https://ismobiophotonics.com/</a>
          <p>Email: ikram@ismobiophotonics.com</p>
          <p>Email: admin@ismobiophotonics.com</p>
        </section>
      </main>
    </div>
  );
};
