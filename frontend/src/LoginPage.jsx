import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://127.0.0.1:8000/login', formData);
      // Store token in LocalStorage
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', res.data.user_name);
      
      // Redirect to Dashboard
      navigate('/dashboard');
    } catch (err) {
        // Specific checks based on your requirement
        if (err.response && err.response.status === 404) {
            setError("Account does not exist");
        } else if (err.response && err.response.status === 401) {
            setError("Invalid Password");
        } else {
            setError("Login failed");
        }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <form onSubmit={handleSubmit} style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={{ padding: '10px' }} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={{ padding: '10px' }} />
        
        <button type="submit" style={{ padding: '10px', background: '#3498db', color: 'white', border: 'none' }}>Login</button>
        
        <Link to="/forgot-password" style={{ textAlign: 'center', fontSize: '12px' }}>Forgot Password?</Link>
      </form>
    </div>
  );
}

export default LoginPage;