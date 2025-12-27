import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Search, Bell } from 'lucide-react';

const EquipmentPage = () => {
  const [equipment, setEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newMachine, setNewMachine] = useState({ 
    name: '', serial_number: '', location: '', technician: '', category: '', employee: '' 
  });
  
  const navigate = useNavigate();
  const location = useLocation();

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
      setShowModal(false);
      setNewMachine({ name: '', serial_number: '', location: '', technician: '', category: '', employee: '' });
      fetchEquipment();
    } catch (error) {
      const msg = error?.response?.data?.detail || 'Error creating equipment';
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to remove this equipment?")) return;
    try {
        await axios.delete(`http://127.0.0.1:8000/equipment/${id}`);
        fetchEquipment();
    } catch (error) {
        alert("Could not delete.");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-700 flex flex-col">
      {/* 1. TOP NAVIGATION */}
      <nav className="bg-[#714B67] text-white px-4 py-2 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-6">
            <div className="font-bold text-xl tracking-tight cursor-pointer" onClick={() => navigate('/kanban')}>GearGuard</div>
            <div className="hidden md:flex gap-4 text-sm font-medium">
                <span className={`cursor-pointer hover:text-white ${location.pathname === '/kanban' ? 'border-b-2 border-white pb-0.5' : 'opacity-70'}`} onClick={() => navigate('/kanban')}>Dashboard</span>
                <span className={`cursor-pointer hover:text-white ${location.pathname === '/equipment' ? 'border-b-2 border-white pb-0.5' : 'opacity-70'}`} onClick={() => navigate('/equipment')}>Equipment</span>
                <span className="cursor-pointer opacity-50 cursor-not-allowed">Reporting</span>
                <span onClick={() => navigate('/teams')} className="cursor-pointer hover:text-white opacity-80">Teams</span>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <Bell size={18} className="cursor-pointer opacity-80" />
            <div className="w-8 h-8 rounded-full bg-[#F0B323] flex items-center justify-center text-xs font-bold text-white">U</div>
        </div>
      </nav>

      {/* 2. CONTROL PANEL */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10">
        <div className="flex gap-4 items-center">
            <button 
                onClick={() => setShowModal(true)}
                className="bg-[#714B67] text-white px-6 py-2 rounded shadow hover:bg-[#5d3d54] transition-all font-bold text-sm flex items-center gap-2 uppercase"
            >
                <Plus size={18} /> New
            </button>
            <h1 className="text-xl font-bold text-gray-800">Equipment List</h1>
        </div>

        <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Search by name or serial..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#714B67] bg-gray-50"
            />
        </div>
      </div>

      {/* 3. EQUIPMENT TABLE */}
      <div className="p-6 overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-sm rounded-lg border border-gray-100">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold">
                <tr>
                    <th className="text-left p-4">Equipment Name</th>
                    <th className="text-left p-4">Employee</th>
                    <th className="text-left p-4">Department</th>
                    <th className="text-left p-4">Serial Number</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4 text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {equipment
                  .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((machine) => (
                    <tr key={machine.id} className="hover:bg-purple-50/50 transition-colors group">
                        <td className="p-4 font-semibold text-[#714B67]">{machine.name}</td>
                        <td className="p-4 text-gray-600">{machine.employee || 'Unassigned'}</td>
                        <td className="p-4 text-gray-600">{machine.location}</td>
                        <td className="p-4 font-mono text-xs text-gray-500">{machine.serial_number}</td>
                        <td className="p-4">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">{machine.category}</span>
                        </td>
                        <td className="p-4 text-right">
                            <button onClick={() => handleDelete(machine.id)} className="text-red-300 hover:text-red-600 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {equipment.length === 0 && (
            <div className="text-center p-20 text-gray-400 italic">Database is empty. Click "New" to add your first machine.</div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
            <div className="bg-white p-8 rounded-xl w-[600px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-[#714B67] mb-6 border-b pb-2">Add Machine</h2>
                <form onSubmit={handleAddMachine} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Equipment Name</label>
                        <input required className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none"
                            value={newMachine.name} onChange={e => setNewMachine({...newMachine, name: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Serial Number</label>
                        <input required className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none"
                            value={newMachine.serial_number} onChange={e => setNewMachine({...newMachine, serial_number: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Category</label>
                        <select className="w-full border border-gray-300 rounded p-2 bg-white" value={newMachine.category} onChange={e => setNewMachine({...newMachine, category: e.target.value})}>
                            <option value="">Select...</option>
                            <option value="Computers">Computers</option>
                            <option value="Monitors">Monitors</option>
                            <option value="Machinery">Machinery</option>
                            <option value="Vehicles">Vehicles</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Department / Location</label>
                        <input className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none" value={newMachine.location} onChange={e => setNewMachine({...newMachine, location: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Employee</label>
                        <input className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none" value={newMachine.employee} onChange={e => setNewMachine({...newMachine, employee: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Technician</label>
                        <input className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none" value={newMachine.technician} onChange={e => setNewMachine({...newMachine, technician: e.target.value})} />
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