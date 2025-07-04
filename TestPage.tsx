import React from 'react';
import { Link } from 'react-router-dom';

interface TestPageProps {
  title?: string;
}

const TestPage: React.FC<TestPageProps> = ({ title = "Job Application Tracker" }) => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          {title}
        </h1>
        <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
          If you can see this page, React is working correctly!
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/" style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#3b82f6', 
            color: 'white',
            borderRadius: '0.25rem',
            textDecoration: 'none'
          }}>
            Home
          </Link>
          <Link to="/dashboard" style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#3b82f6', 
            color: 'white',
            borderRadius: '0.25rem',
            textDecoration: 'none'
          }}>
            Dashboard
          </Link>
          <Link to="/profile" style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#8b5cf6', 
            color: 'white',
            borderRadius: '0.25rem',
            textDecoration: 'none'
          }}>
            Profile
          </Link>
          <Link to="/login" style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#10b981', 
            color: 'white',
            borderRadius: '0.25rem',
            textDecoration: 'none'
          }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 