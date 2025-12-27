import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';

const WorkCentersPage = () => {
  const [workCenters, setWorkCenters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', location: '', tag: '', capacity: '' });

  useEffect(() => {
    fetchWorkCenters();
  }, []);

  const fetchWorkCenters = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/work_centers/');
      setWorkCenters(res.data || []);
    } catch (err) {
      console.error('Failed to load work centers', err);
      alert('Failed to load work centers');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/work_centers/', form);
      alert('Work Center created');
      setShowModal(false);
      setForm({ name: '', code: '', location: '', tag: '', capacity: '' });
      fetchWorkCenters();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error creating work center';
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b py-4 px-6 flex items-center justify-between">
        <h2 className="font-bold text-lg">Work Centers</h2>
        <div>
          <button onClick={() => setShowModal(true)} className="bg-[#714B67] text-white px-3 py-1 rounded flex items-center gap-2"><Plus size={16}/> New</button>
        </div>
      </div>
      <div className="p-6">
        <div className="bg-white p-4 rounded border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">Name</th>
                <th>Code</th>
                <th>Location</th>
                <th>Tag</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {workCenters.map(w => (
                <tr key={w.id} className="border-t">
                  <td className="py-2 font-semibold">{w.name}</td>
                  <td>{w.code}</td>
                  <td>{w.location}</td>
                  <td>{w.tag}</td>
                  <td>{w.capacity}</td>
                </tr>
              ))}
              {!workCenters.length && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No work centers yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[520px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Create Work Center</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500"><X/></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-bold">Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 rounded" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold">Code</label>
                  <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-bold">Location</label>
                  <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full border p-2 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold">Tag</label>
                  <input value={form.tag} onChange={e => setForm({...form, tag: e.target.value})} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-bold">Capacity</label>
                  <input value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="w-full border p-2 rounded" />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 border rounded mr-2">Cancel</button>
                <button type="submit" className="px-4 py-1 bg-[#714B67] text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkCentersPage;
