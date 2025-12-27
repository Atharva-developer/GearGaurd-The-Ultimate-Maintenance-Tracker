import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user') || 'Unknown';
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('odoo');

  const handleSave = () => {
    // For now save to localStorage (placeholder). In future this should call an API.
    localStorage.setItem('settings_notifications', notifications ? '1' : '0');
    localStorage.setItem('settings_theme', theme);
    alert('Settings saved');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold text-[#714B67] mb-4">Account Settings</h2>
        <div className="mb-4 text-sm text-gray-700">Signed in as <strong>{storedUser}</strong></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Notifications</h3>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} />
              <span className="text-sm">Enable notifications</span>
            </label>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Theme</h3>
            <select value={theme} onChange={e => setTheme(e.target.value)} className="border p-2 rounded w-full">
              <option value="odoo">Odoo (default)</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={handleLogout} className="px-4 py-2 border rounded text-red-600">Logout</button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#714B67] text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
