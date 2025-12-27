import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', data.user_name);
        navigate('/kanban');
      } else {
        setError(data.detail || "Login failed");
      }
    } catch (err) {
      setError("Server not responding.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#714B67]">Sign in</h2>
          <p className="text-gray-500 mt-2 text-sm">Access your GearGuard Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] outline-none transition-all"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-semibold">Password</label>
              <Link to="/forgot-password" className="text-sm text-[#714B67] hover:underline">Forgot password?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#714B67] text-white font-bold rounded-lg shadow-md hover:bg-[#5d3d54] hover:shadow-lg transition-all"
          >
            Log in
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Don't have an account? 
          <Link to="/signup" className="ml-1 text-[#714B67] font-bold hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;