import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '50px', background: '#f4f4f4', height: '100vh' }}>
      <h1 style={{ fontSize: '3rem', color: '#2c3e50' }}>GearGuard</h1>
      <h3>The Ultimate Maintenance Tracker</h3>
      <p>Seamlessly connect Equipment, Teams, and Requests.</p>
      
      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => navigate('/login')}
          style={{ padding: '15px 30px', marginRight: '20px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px' }}>
          Login
        </button>
        <button 
          onClick={() => navigate('/signup')}
          style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px' }}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default LandingPage;