import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', members: '', company: 'My Company (San Francisco)' });
  const navigate = useNavigate();

  useEffect(() => { fetchTeams(); }, []);

  const fetchTeams = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/teams/');
      setTeams(res.data || []);
    } catch (err) { console.error('Failed to fetch teams', err); }
  };

  const createTeam = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/teams/', form);
      setShowModal(false);
      setForm({ name: '', members: '', company: 'My Company (San Francisco)' });
      fetchTeams();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to create team';
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Teams</h2>
          <div className="flex gap-2">
            <button onClick={() => navigate('/kanban')} className="text-sm px-3 py-1 border rounded">Back</button>
            <button onClick={() => setShowModal(true)} className="bg-[#714B67] text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={16}/> New</button>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="py-2">Team Name</th>
              <th className="py-2">Team Members</th>
              <th className="py-2">Company</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(t => (
              <tr key={t.id} className="border-t">
                <td className="py-3 font-bold">{t.name}</td>
                <td className="py-3">{(t.members || '').split(',').map(m => m.trim()).filter(Boolean).join(', ') || '—'}</td>
                <td className="py-3 text-sm text-gray-500">{t.company}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {teams.length === 0 && (
          <div className="text-center p-8 text-gray-400">No teams yet. Click New to add one.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded shadow" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Create New Team</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500"><X /></button>
            </div>
            <form onSubmit={createTeam} className="space-y-3">
              <input required placeholder="Team name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 rounded" />
              <textarea placeholder="Members (comma separated)" value={form.members} onChange={e => setForm({...form, members: e.target.value})} className="w-full border p-2 rounded" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1 bg-[#714B67] text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
