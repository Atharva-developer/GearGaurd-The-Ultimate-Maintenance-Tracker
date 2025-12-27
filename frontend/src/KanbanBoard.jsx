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
  const [showModal, setShowModal] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]);
  const [user, setUser] = useState("User");
  
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

  const getEquipmentName = (id) => {
    const machine = equipmentList.find(eq => eq.id === id);
    return machine ? machine.name : "Unknown Machine";
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

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
        await axios.post('http://127.0.0.1:8000/requests/', newRequest);
        alert("Ticket Created!");
        setShowModal(false);
        fetchRequests();
        fetchStats(); // Update stats immediately
        setNewRequest({ subject: '', equipment_id: '', priority: 'Normal', request_type: 'Corrective' });
    } catch (error) {
        alert("Error creating ticket. Did you select an equipment?");
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
                <span className="cursor-pointer hover:text-white opacity-80 hover:opacity-100">Maintenance</span>
                <span className="cursor-pointer hover:text-white opacity-80 hover:opacity-100">Equipment</span>
                <span className="cursor-pointer hover:text-white opacity-80 hover:opacity-100">Reporting</span>
                <span className="cursor-pointer hover:text-white opacity-80 hover:opacity-100">Teams</span>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <Bell size={18} className="cursor-pointer opacity-80 hover:opacity-100" />
            <div className="w-8 h-8 rounded-full bg-[#F0B323] flex items-center justify-center text-xs font-bold text-white">
                {user.charAt(0).toUpperCase()}
            </div>
        </div>
      </nav>

      {/* 2. CONTROL PANEL */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10">
        <button 
            onClick={() => setShowModal(true)}
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
                                
                                <div className="pl-2">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-800 text-sm">{item.subject}</h4>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2">
                                        Machine: <span className="text-gray-700 font-medium">{getEquipmentName(item.equipment_id)}</span>
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
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl w-[500px] shadow-2xl animate-fade-in">
                <h2 className="text-2xl font-bold text-[#714B67] mb-6 border-b pb-2">New Request</h2>
                <form onSubmit={handleCreateRequest} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                        <input 
                            className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none"
                            value={newRequest.subject}
                            onChange={e => setNewRequest({...newRequest, subject: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Equipment</label>
                        <select 
                            className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none bg-white"
                            value={newRequest.equipment_id}
                            onChange={e => setNewRequest({...newRequest, equipment_id: e.target.value})}
                            required
                        >
                            <option value="">Select Machine...</option>
                            {equipmentList.map(eq => (
                                <option key={eq.id} value={eq.id}>{eq.name} ({eq.serial_number})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                            <select 
                                className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none bg-white"
                                onChange={e => setNewRequest({...newRequest, priority: e.target.value})}
                            >
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                            <select 
                                className="w-full border border-gray-300 rounded p-2 focus:border-[#714B67] outline-none bg-white"
                                onChange={e => setNewRequest({...newRequest, request_type: e.target.value})}
                            >
                                <option value="Corrective">Corrective</option>
                                <option value="Preventive">Preventive</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-[#714B67] text-white rounded font-bold hover:bg-[#5d3d54]">Create</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default KanbanBoard;