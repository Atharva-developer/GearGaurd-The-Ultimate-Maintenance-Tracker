import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('http://127.0.0.1:8000/signup', formData);
      alert('Signup Successful! Please Login.');
      navigate('/login');
    } catch (err) {
      // Show backend error message (e.g., "Account already exists" or "Password weak")
      setError(err.response?.data?.detail || 'Signup Failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <form onSubmit={handleSubmit} style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h2>Sign Up</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required style={{ padding: '10px' }} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={{ padding: '10px' }} />
        <input type="password" name="password" placeholder="Password (8+ chars, 1 Uppercase, 1 Special)" onChange={handleChange} required style={{ padding: '10px' }} />
        
        <button type="submit" style={{ padding: '10px', background: '#2ecc71', color: 'white', border: 'none' }}>Create Account</button>
      </form>
    </div>
  );
}

export default SignupPage;