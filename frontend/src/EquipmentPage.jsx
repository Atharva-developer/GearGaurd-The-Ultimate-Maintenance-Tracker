import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Search, Filter, Settings, Bell } from 'lucide-react';

const EquipmentPage = () => {
  const [equipment, setEquipment] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMachine, setNewMachine] = useState({ 
    name: '', serial_number: '', location: '', technician: '', category: '', employee: '' 
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/equipment/');
      setEquipment(res.data);
    } catch (error) {
      console.error("Error fetching equipment", error);
    }
  };

  const handleAddMachine = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/equipment/', newMachine);
      alert("Machine Added Successfully!");
      setShowModal(false);
      setNewMachine({ name: '', serial_number: '', location: '', technician: '', category: '', employee: '' });
      fetchEquipment();
    } catch (error) {
      alert("Error: Serial Number might already exist.");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Delete this machine?")) return;
    try {
        await axios.delete(`http://127.0.0.1:8000/equipment/${id}`);
        fetchEquipment();
    } catch (error) {
        alert("Could not delete.");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-700 flex flex-col">
      
      {/* 1. TOP NAVIGATION (Matches Kanban) */}
      <nav className="bg-[#714B67] text-white px-4 py-2 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-6">
            <div className="font-bold text-xl tracking-tight cursor-pointer" onClick={() => navigate('/kanban')}>GearGuard</div>
            <div className="hidden md:flex gap-4 text-sm font-medium text-white/90">
                <span className="cursor-pointer hover:text-white opacity-80" onClick={() => navigate('/kanban')}>Dashboard</span>
                <span className="cursor-pointer hover:text-white border-b-2 border-white pb-0.5">Equipment</span>
                <span className="cursor-pointer hover:text-white opacity-80">Reporting</span>
                <span className="cursor-pointer hover:text-white opacity-80">Teams</span>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <Bell size={18} className="cursor-pointer opacity-80 hover:opacity-100" />
            <div className="w-8 h-8 rounded-full bg-[#F0B323] flex items-center justify-center text-xs font-bold text-white">
                U
            </div>
        </div>
      </nav>

      {/* 2. CONTROL PANEL */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10">
        <div className="flex gap-4 w-full md:w-auto">
            <button 
                onClick={() => setShowModal(true)}
                className="bg-[#714B67] text-white px-6 py-2 rounded shadow hover:bg-[#5d3d54] transition-all font-bold text-sm flex items-center gap-2 uppercase tracking-wide"
            >
                <Plus size={18} /> New
            </button>
            <h1 className="text-xl font-bold text-gray-800 self-center">Equipment</h1>
        </div>

        <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all bg-gray-50"
            />
        </div>
      </div>

      {/* 3. EQUIPMENT TABLE (Wireframe Style) */}
      <div className="p-6 overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
                <tr>
                    <th className="text-left p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Equipment Name</th>
                    <th className="text-left p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Employee</th>
                    <th className="text-left p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Department</th>
                    <th className="text-left p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Serial Number</th>
                    <th className="text-left p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Technician</th>
                    <th className="text-left p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Category</th>
                    <th className="text-left p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Company</th>
                    <th className="p-4"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {equipment.map((machine) => (
                    <tr key={machine.id} className="hover:bg-purple-50 transition-colors group">
                        <td className="p-4 font-semibold text-[#714B67]">{machine.name}</td>
                        <td className="p-4 text-gray-600">{machine.employee}</td>
                        <td className="p-4 text-gray-600">{machine.location}</td>
                        <td className="p-4 font-mono text-xs text-gray-500">{machine.serial_number}</td>
                        <td className="p-4 text-gray-600">{machine.technician}</td>
                        <td className="p-4 text-gray-600">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold uppercase">{machine.category}</span>
                        </td>
                        <td className="p-4 text-gray-500 text-sm">My Company (San Francisco)</td>
                        <td className="p-4 text-right">
                            <button onClick={() => handleDelete(machine.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {equipment.length === 0 && (
            <div className="text-center p-10 text-gray-400">No equipment found. Add a new machine!</div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl w-[600px] shadow-2xl">
                <h2 className="text-xl font-bold text-[#714B67] mb-6 border-b pb-2">Add Machine & Tools</h2>
                <form onSubmit={handleAddMachine} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Equipment Name</label>
                        <input className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none" required
                            value={newMachine.name} onChange={e => setNewMachine({...newMachine, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Serial Number</label>
                        <input className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none" required
                            value={newMachine.serial_number} onChange={e => setNewMachine({...newMachine, serial_number: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Category</label>
                        <select className="w-full border border-gray-300 rounded p-2 bg-white" 
                            value={newMachine.category} onChange={e => setNewMachine({...newMachine, category: e.target.value})}>
                                <option value="">Select...</option>
                                <option value="Computers">Computers</option>
                                <option value="Monitors">Monitors</option>
                                <option value="Machinery">Machinery</option>
                                <option value="Vehicles">Vehicles</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Department</label>
                        <input className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none" 
                            value={newMachine.location} onChange={e => setNewMachine({...newMachine, location: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Employee</label>
                        <input className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none" 
                            value={newMachine.employee} onChange={e => setNewMachine({...newMachine, employee: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Technician</label>
                        <input className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none" 
                            value={newMachine.technician} onChange={e => setNewMachine({...newMachine, technician: e.target.value})} />
                    </div>

                    <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-[#714B67] text-white rounded font-bold hover:bg-[#5d3d54]">Save</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default EquipmentPage;