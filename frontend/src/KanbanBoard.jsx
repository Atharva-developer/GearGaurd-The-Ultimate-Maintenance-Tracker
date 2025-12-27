import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Bell, Settings, Filter } from 'lucide-react';

const columnsBackendStructure = {
  New: { name: "New Requests", items: [] },
  "In Progress": { name: "In Progress", items: [] },
  Repaired: { name: "Repaired", items: [] },
  Scrap: { name: "Scrap", items: [] }
};

function KanbanBoard() {
  const [columns, setColumns] = useState(columnsBackendStructure);
  const [equipmentList, setEquipmentList] = useState([]);
  const [teams, setTeams] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [user, setUser] = useState("User");
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // NEW: State for real-time stats
  const [stats, setStats] = useState({ critical: 0, load: "0%", open: 0 });

  const navigate = useNavigate();
  
  // New Request Form State
  const [newRequest, setNewRequest] = useState({
    subject: '',
    equipment_id: '',
    priority: 'Normal',
    request_type: 'Corrective'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser || "Admin");
    fetchEquipment();
    fetchRequests();
    fetchStats(); // Fetch stats on load
    fetchTeams();
    fetchWorkCenters();
  }, []);

  // NEW: Fetch Stats Function
  const fetchStats = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/stats/');
      setStats({
        critical: res.data.critical_count,
        load: res.data.tech_load,
        open: res.data.open_count
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/requests/');
      const requests = response.data;
      
      const newColumns = { 
        New: { name: "New Requests", items: [] },
        "In Progress": { name: "In Progress", items: [] },
        Repaired: { name: "Repaired", items: [] },
        Scrap: { name: "Scrap", items: [] }
      };

      requests.forEach(req => {
          if (newColumns[req.status]) {
              newColumns[req.status].items.push(req);
          }
      });
      setColumns(newColumns);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/equipment/');
      setEquipmentList(res.data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };
  const fetchTeams = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/teams/');
      setTeams(res.data || []);
    } catch (err) {
      console.error('Error fetching teams', err);
    }
  };

  const fetchWorkCenters = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/work_centers/');
      setWorkCenters(res.data || []);
    } catch (err) {
      console.error('Error fetching work centers', err);
    }
  };

  const getTeamName = (id) => {
    const t = teams.find(x => x.id === id);
    return t ? t.name : 'Unassigned';
  };
  const getEquipmentName = (id) => {
    const machine = equipmentList.find(eq => eq.id === id);
    return machine ? machine.name : "Unknown Machine";
  };
  const getWorkCenterName = (id) => {
    const wc = workCenters.find(w => w.id === id);
    return wc ? wc.name : 'Unknown Work Center';
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      
      removed.status = destination.droppableId; 
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems }
      });

      try {
        await axios.put(`http://127.0.0.1:8000/requests/${draggableId}`, {
          status: destination.droppableId
        });
        // Update stats after moving (in case it moves to Repaired/Scrap)
        fetchStats();
      } catch (error) {
        alert("Failed to save change!");
        fetchRequests(); 
      }
    }
  };

  // Request details modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const openRequestDetails = async (req) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/requests/${req.id}`);
      setSelectedRequest(res.data);
    } catch (err) {
      // fallback to passed object
      setSelectedRequest(req);
    }
    setShowRequestModal(true);
  };

  const closeRequestModal = () => {
    setSelectedRequest(null);
    setShowRequestModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openSettings = () => {
    setShowUserMenu(false);
    navigate('/settings');
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
        const payload = { ...newRequest, created_by: localStorage.getItem('user') || 'Unknown', maintenance_team_id: newRequest.maintenance_team_id || null };
        await axios.post('http://127.0.0.1:8000/requests/', payload);
        alert("Ticket Created!");
        fetchRequests();
        fetchStats(); // Update stats immediately
        setNewRequest({ subject: '', equipment_id: '', priority: 'Normal', request_type: 'Corrective' });
    } catch (error) {
        const msg = error?.response?.data?.detail || "Error creating ticket. Did you select an equipment?";
        alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-700 flex flex-col">
      
      {/* 1. TOP NAVIGATION */}
      <nav className="bg-[#714B67] text-white px-4 py-2 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-6">
            <div className="font-bold text-xl tracking-tight">GearGuard</div>
            <div className="hidden md:flex gap-4 text-sm font-medium text-white/90">
                <span className="cursor-pointer hover:text-white border-b-2 border-white pb-0.5">Dashboard</span>
                <span onClick={() => navigate('/maintenance/calendar')} className="cursor-pointer hover:text-white opacity-80 hover:opacity-100">Maintenance Calendar</span>
                <span onClick={() => navigate('/equipment')} className="cursor-pointer hover:text-white opacity-80 hover:opacity-100">Equipment</span>
                <span onClick={() => navigate('/work-centers')} className="cursor-pointer hover:text-white opacity-80 hover:opacity-100">Work Centers</span>
                <span onClick={() => navigate('/reports')} className="cursor-pointer hover:text-white opacity-80 hover:opacity-100">Reporting</span>
                <span onClick={() => navigate('/teams')} className="cursor-pointer hover:text-white opacity-80 hover:opacity-100">Teams</span>
            </div>
        </div>
        <div className="relative flex items-center gap-4">
            <Bell size={18} className="cursor-pointer opacity-80 hover:opacity-100" />
            <button onClick={() => setShowUserMenu(prev => !prev)} className="w-8 h-8 rounded-full bg-[#F0B323] flex items-center justify-center text-xs font-bold text-white focus:outline-none">
                {user ? user.charAt(0).toUpperCase() : 'U'}
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-12 w-48 bg-white rounded shadow-md border border-gray-200 text-sm text-gray-700">
                <button onClick={openSettings} className="w-full text-left px-4 py-2 hover:bg-gray-50">Settings</button>
                <hr />
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50">Logout</button>
              </div>
            )}
        </div>
      </nav>

      {/* 2. CONTROL PANEL */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10">
        <button 
            onClick={() => navigate('/maintenance/new')}
            className="bg-[#714B67] text-white px-6 py-2 rounded shadow hover:bg-[#5d3d54] transition-all font-bold text-sm flex items-center gap-2 uppercase tracking-wide"
        >
            <Plus size={18} /> New Request
        </button>

        <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Search maintenance requests..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all bg-gray-50"
            />
        </div>
        
        <div className="flex gap-2 text-gray-500">
             <button className="p-2 hover:bg-gray-100 rounded border border-gray-200"><Filter size={18} /></button>
             <button className="p-2 hover:bg-gray-100 rounded border border-gray-200"><Settings size={18} /></button>
        </div>
      </div>

      <div className="p-6 flex-1 bg-gray-50/50 overflow-y-auto">
        
        {/* 3. STATS CARDS (Dynamic Data) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
            {/* Red Card */}
            <div className="bg-white border border-red-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-l-red-500">
                <h3 className="text-red-600 font-bold uppercase text-xs mb-2">Critical Equipment</h3>
                <div className="text-3xl font-bold text-gray-800">{stats.critical} Units</div>
                <p className="text-sm text-red-400 mt-1">Requires Immediate Attention</p>
            </div>

            {/* Blue Card */}
            <div className="bg-white border border-blue-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-l-[#714B67]">
                <h3 className="text-[#714B67] font-bold uppercase text-xs mb-2">Technician Load</h3>
                <div className="text-3xl font-bold text-gray-800">{stats.load}</div>
                <p className="text-sm text-blue-400 mt-1">Based on active tickets</p>
            </div>

             {/* Green Card */}
             <div className="bg-white border border-green-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-l-green-500">
                <h3 className="text-green-600 font-bold uppercase text-xs mb-2">Open Requests</h3>
                <div className="text-3xl font-bold text-gray-800">{stats.open}</div>
                <p className="text-sm text-green-400 mt-1">Pending Actions</p>
            </div>
        </div>

        {/* 4. KANBAN BOARD */}
        <div className="flex gap-6 overflow-x-auto pb-4 max-w-full">
            <DragDropContext onDragEnd={onDragEnd}>
            {Object.entries(columns).map(([columnId, column]) => {
                return (
                <div key={columnId} className="flex flex-col min-w-[300px] w-1/4">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="font-bold text-gray-600 text-sm uppercase tracking-wider">
                            {column.name}
                        </h3>
                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
                            {column.items.length}
                        </span>
                    </div>

                    <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                        <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 p-3 rounded-lg transition-colors min-h-[400px] ${
                            snapshot.isDraggingOver ? "bg-purple-50" : "bg-gray-100"
                        }`}
                        >
                        {column.items.map((item, index) => (
                            <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                            {(provided, snapshot) => (
                                <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white p-4 mb-3 rounded shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative"
                                style={{ ...provided.draggableProps.style }}
                                >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l ${
                                    item.priority === "Critical" ? "bg-red-500" : 
                                    item.priority === "High" ? "bg-orange-400" : "bg-[#714B67]"
                                }`}></div>
                                
                                <div className="pl-2" onClick={() => openRequestDetails(item)}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-800 text-sm">{item.subject}</h4>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2">
                                        Target: <span className="text-gray-700 font-medium">{item.target_type === 'work_center' ? getWorkCenterName(item.work_center_id) : getEquipmentName(item.equipment_id)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{item.request_type}</span>
                                        {item.priority === "Critical" && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">CRITICAL</span>
                                        )}
                                    </div>
                                </div>
                                </div>
                            )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        </div>
                    )}
                    </Droppable>
                </div>
                );
            })}
            </DragDropContext>
        </div>
      </div>

      {/* MODAL */}


      {/* REQUEST DETAILS MODAL */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Request #{selectedRequest.id}</h3>
              <button className="text-gray-600" onClick={closeRequestModal}>✕</button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div><strong>Subject:</strong> {selectedRequest.subject}</div>
              <div><strong>Target:</strong> {selectedRequest.target_type === 'work_center' ? getWorkCenterName(selectedRequest.work_center_id) : getEquipmentName(selectedRequest.equipment_id)}</div>
              <div><strong>Created By:</strong> {selectedRequest.created_by || 'Unknown'}</div>
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={closeRequestModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KanbanBoard;