import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Save, X, Calendar, Clock, User, Briefcase } from 'lucide-react';

const NewRequestPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user') || 'Unknown');
  const [activeTab, setActiveTab] = useState('notes'); // For bottom tabs
  
  // Dropdown Data
  const [equipmentList, setEquipmentList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [users, setUsers] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    target_type: 'equipment', // 'equipment' or 'work_center'
    equipment_id: '',
    work_center_id: '',
    category: '', // Read-only, auto-filled
    request_date: new Date().toISOString().split('T')[0],
    request_type: 'Corrective',
    technician_id: '',
    maintenance_team_id: '',
    scheduled_date: '',
    duration: 0,
    priority: 'Normal',
    description: ''
  });

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const eqRes = await axios.get('http://127.0.0.1:8000/equipment/');
      const teamRes = await axios.get('http://127.0.0.1:8000/teams/');
      const wcRes = await axios.get('http://127.0.0.1:8000/work_centers/');
      // Assuming you have a users endpoint, otherwise mock it or use login info
      // const userRes = await axios.get('http://127.0.0.1:8000/users/'); 
      
      setEquipmentList(eqRes.data);
      setTeamList(teamRes.data);
      setWorkCenters(wcRes.data || []);
      // setUsers(userRes.data);
    } catch (err) {
      console.error("Failed to load dropdowns", err);
    }
  };

  // Auto-fill Category when Equipment is selected
  const handleEquipmentChange = (e) => {
    const eqId = e.target.value;
    const selectedEq = equipmentList.find(eq => eq.id == eqId);
    setFormData({
      ...formData,
      equipment_id: eqId,
      category: selectedEq ? selectedEq.category : '' // Auto-fill Category
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, created_by: localStorage.getItem('user') || 'Unknown' };
      // Clean up numeric IDs
      if (!payload.equipment_id) delete payload.equipment_id;
      if (!payload.work_center_id) delete payload.work_center_id;
      await axios.post('http://127.0.0.1:8000/requests/', payload);
      alert("Request Created Successfully!");
      navigate('/kanban'); // Go back to board
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.detail || 'Error creating request';
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 1. Odoo-Style Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-[#714B67]" onClick={() => navigate('/kanban')}>Maintenance Requests</span>
          <span>/</span>
          <span className="text-gray-800 font-bold">New</span>
        </div>
        <div className="flex gap-2">
            <button onClick={handleSubmit} className="bg-[#714B67] text-white px-4 py-1.5 rounded text-sm font-bold uppercase hover:bg-[#5d3d54] flex items-center gap-2">
                <Save size={16}/> Save
            </button>
            <button onClick={() => navigate('/kanban')} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm font-bold uppercase hover:bg-gray-50 flex items-center gap-2">
                <X size={16}/> Discard
            </button>
        </div>
      </div>

      {/* 2. Main Form Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto bg-white shadow-sm border border-gray-200 rounded-lg p-8">
            
            {/* Status Pipeline (Top Right) */}
            <div className="flex justify-end mb-6">
                <div className="flex bg-gray-100 rounded-full p-1 text-xs font-bold text-gray-500">
                    <span className="px-3 py-1 bg-white shadow-sm text-[#714B67] rounded-full">New Request</span>
                    <span className="px-3 py-1">In Progress</span>
                    <span className="px-3 py-1">Repaired</span>
                    <span className="px-3 py-1">Scrap</span>
                </div>
            </div>

            {/* Subject Title */}
            <div className="mb-8 border-b border-gray-100 pb-4">
                <label className="block text-sm font-bold text-[#714B67] mb-1">Subject</label>
                <input 
                    className="w-full text-3xl font-bold text-gray-800 placeholder-gray-300 border-none focus:ring-0 p-0"
                    placeholder="e.g. Conveyor Belt Rattling"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                />
            </div>

            {/* The Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                
                {/* LEFT COLUMN */}
                <div className="space-y-4">
                    <div className="flex items-center">
                        <label className="w-1/3 text-sm font-bold text-gray-600">Created By</label>
                        <input className="w-2/3 border-b border-gray-300 focus:border-[#714B67] outline-none py-1 bg-transparent text-gray-500" value={currentUser || 'Unknown'} disabled />
                    </div>

                    <div className="flex items-center">
                        <label className="w-1/3 text-sm font-bold text-gray-600">Target</label>
                        <select 
                            className="w-2/3 border-b border-gray-300 focus:border-[#714B67] outline-none py-1 bg-transparent"
                            value={formData.target_type}
                            onChange={e => setFormData({...formData, target_type: e.target.value})}
                        >
                            <option value="equipment">Equipment</option>
                            <option value="work_center">Work Center</option>
                        </select>
                    </div>

                    {formData.target_type === 'equipment' ? (
                      <>
                        <div className="flex items-center">
                            <label className="w-1/3 text-sm font-bold text-gray-600">Equipment</label>
                            <select 
                                className="w-2/3 border-b border-gray-300 focus:border-[#714B67] outline-none py-1 bg-transparent"
                                value={formData.equipment_id}
                                onChange={handleEquipmentChange}
                            >
                                <option value="">Select Equipment...</option>
                                {equipmentList.map(eq => (
                                    <option key={eq.id} value={eq.id}>{eq.name} - {eq.serial_number}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center">
                            <label className="w-1/3 text-sm font-bold text-gray-600">Category</label>
                            <input 
                                className="w-2/3 border-b border-gray-300 focus:border-[#714B67] outline-none py-1 bg-gray-50 text-gray-500"
                                value={formData.category} 
                                disabled 
                                placeholder="Auto-filled..."
                            />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center">
                          <label className="w-1/3 text-sm font-bold text-gray-600">Work Center</label>
                          <select
                              className="w-2/3 border-b border-gray-300 focus:border-[#714B67] outline-none py-1 bg-transparent"
                              value={formData.work_center_id}
                              onChange={e => setFormData({...formData, work_center_id: e.target.value})}
                          >
                              <option value="">Select Work Center...</option>
                              {workCenters.map(wc => (
                                  <option key={wc.id} value={wc.id}>{wc.name} {wc.code ? `- ${wc.code}` : ''}</option>
                              ))}
                          </select>
                      </div>
                    )}

                    <div className="flex items-center">
                        <label className="w-1/3 text-sm font-bold text-gray-600">Request Date</label>
                        <input 
                            type="date"
                            className="w-2/3 border-b border-gray-300 focus:border-[#714B67] outline-none py-1 bg-transparent"
                            value={formData.request_date}
                            onChange={e => setFormData({...formData, request_date: e.target.value})}
                        />
                    </div>

                    <div className="flex items-start mt-4">
                        <label className="w-1/3 text-sm font-bold text-gray-600 pt-1">Maintenance Type</label>
                        <div className="w-2/3 flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" name="mtype" value="Corrective"
                                    checked={formData.request_type === 'Corrective'}
                                    onChange={e => setFormData({...formData, request_type: e.target.value})}
                                    className="text-[#714B67] focus:ring-[#714B67]"
                                />
                                <span className="text-sm">Corrective</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" name="mtype" value="Preventive"
                                    checked={formData.request_type === 'Preventive'}
                                    onChange={e => setFormData({...formData, request_type: e.target.value})}
                                    className="text-[#714B67] focus:ring-[#714B67]"
                                />
                                <span className="text-sm">Preventive</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-4">
                    <div className="flex items-center">
                        <label className="w-1/3 text-sm font-bold text-gray-600">Team</label>
                        <select 
                            className="w-2/3 border-b border-gray-300 focus:border-[#714B67] outline-none py-1 bg-transparent"
                            value={formData.maintenance_team_id}
                            onChange={e => setFormData({...formData, maintenance_team_id: e.target.value})}
                        >
                            <option value="">Select Team...</option>
                            {teamList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center">
                        <label className="w-1/3 text-sm font-bold text-gray-600">Technician</label>
                         {/* Mock Technician Dropdown */}
                        <select 
                            className="w-2/3 border-b border-gray-300 focus:border-[#714B67] outline-none py-1 bg-transparent"
                            value={formData.technician}
                            onChange={e => setFormData({...formData, technician: e.target.value})}
                        >
                            <option value="">Select Technician...</option>
                            <option value="Mitchell Admin">Mitchell Admin</option>
                            <option value="Marc Demo">Marc Demo</option>
                        </select>
                    </div>

                    <div className="flex items-center">
                        <label className="w-1/3 text-sm font-bold text-gray-600">Scheduled Date</label>
                        <input 
                            type="datetime-local"
                            className="w-2/3 border-b border-gray-300 focus:border-[#714B67] outline-none py-1 bg-transparent"
                            value={formData.scheduled_date}
                            onChange={e => setFormData({...formData, scheduled_date: e.target.value})}
                        />
                    </div>

                    <div className="flex items-center">
                        <label className="w-1/3 text-sm font-bold text-gray-600">Duration (Hrs)</label>
                        <input 
                            type="number"
                            className="w-2/3 border-b border-gray-300 focus:border-[#714B67] outline-none py-1 bg-transparent"
                            value={formData.duration}
                            onChange={e => setFormData({...formData, duration: e.target.value})}
                        />
                    </div>

                    <div className="flex items-center">
                        <label className="w-1/3 text-sm font-bold text-gray-600">Priority</label>
                        <div className="w-2/3 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, priority: 'Normal'})}
                                className={`px-3 py-2 border rounded text-sm font-medium ${formData.priority === 'Normal' ? 'bg-[#F3E8F2] border-[#714B67] text-[#714B67]' : 'bg-white text-gray-600'}`}
                            >
                                Low
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({...formData, priority: 'High'})}
                                className={`px-3 py-2 border rounded text-sm font-medium ${formData.priority === 'High' ? 'bg-[#FFF7ED] border-orange-400 text-orange-600' : 'bg-white text-gray-600'}`}
                            >
                                Medium
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({...formData, priority: 'Critical'})}
                                className={`px-3 py-2 border rounded text-sm font-medium ${formData.priority === 'Critical' ? 'bg-[#FFF0F2] border-red-500 text-red-600' : 'bg-white text-gray-600'}`}
                            >
                                High
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Bottom Tabs (Notes) */}
            <div className="mt-12">
                <div className="flex border-b border-gray-200 mb-4">
                    <button 
                        onClick={() => setActiveTab('notes')}
                        className={`pb-2 px-4 text-sm font-bold ${activeTab === 'notes' ? 'border-b-2 border-[#714B67] text-[#714B67]' : 'text-gray-500'}`}
                    >
                        Notes
                    </button>
                    <button 
                        onClick={() => setActiveTab('instructions')}
                        className={`pb-2 px-4 text-sm font-bold ${activeTab === 'instructions' ? 'border-b-2 border-[#714B67] text-[#714B67]' : 'text-gray-500'}`}
                    >
                        Instructions
                    </button>
                </div>
                
                {activeTab === 'notes' && (
                    <textarea 
                        className="w-full border border-gray-300 rounded p-3 h-32 focus:border-[#714B67] outline-none bg-gray-50"
                        placeholder="Add internal notes about this request..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                )}
                 {activeTab === 'instructions' && (
                    <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded text-sm">
                        Standard Operating Procedure for this equipment type will appear here.
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default NewRequestPage;