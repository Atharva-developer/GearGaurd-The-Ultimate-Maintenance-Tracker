import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
}

const MaintenanceCalendar = () => {
  const [monthStart, setMonthStart] = useState(startOfMonth(new Date()));
  const [requests, setRequests] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [teams, setTeams] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [selectedDateItems, setSelectedDateItems] = useState(null);

  useEffect(() => { fetchRequests(); fetchDropdowns(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/requests/');
      setRequests(res.data || []);
    } catch (err) { console.error('Failed to load requests', err); }
  };

  const fetchDropdowns = async () => {
    try {
      const [eqRes, teamRes, wcRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/equipment/'),
        axios.get('http://127.0.0.1:8000/teams/'),
        axios.get('http://127.0.0.1:8000/work_centers/')
      ]);
      setEquipmentList(eqRes.data || []);
      setTeams(teamRes.data || []);
      setWorkCenters(wcRes.data || []);
    } catch (err) { console.error('Failed to load reference data', err); }
  };

  const nextMonth = () => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth()+1, 1));
  const prevMonth = () => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth()-1, 1));

  const monthDays = [];
  const totalDays = daysInMonth(monthStart);
  for (let d=1; d<=totalDays; d++) monthDays.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), d));

  function countScheduledForDate(date) {
    const key = date.toISOString().slice(0,10);
    return requests.filter(r => r.scheduled_date && r.scheduled_date.slice(0,10) === key).length;
  }
  function countCreatedForDate(date) {
    const key = date.toISOString().slice(0,10);
    return requests.filter(r => r.created_at && r.created_at.slice(0,10) === key).length;
  }
  function itemsForDate(date) {
    const key = date.toISOString().slice(0,10);
    return requests.filter(r => (r.scheduled_date && r.scheduled_date.slice(0,10) === key) || (r.closed_at && r.closed_at.slice(0,10) === key) || (r.created_at && r.created_at.slice(0,10) === key));
  }

  const getEquipmentName = (id) => {
    const e = equipmentList.find(x => x.id === id);
    return e ? e.name : '—';
  };
  const getTeamName = (id) => {
    const t = teams.find(x => x.id === id);
    return t ? t.name : 'Unassigned';
  };
  const getWorkCenterName = (id) => {
    const w = workCenters.find(x => x.id === id);
    return w ? w.name : '—';
  };
  const formatDateTime = (s) => {
    if (!s) return '—';
    try { return new Date(s).toLocaleString(); } catch (e) { return s; }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#714B67]">Maintenance Calendar</h2>
          <div className="flex gap-2 items-center">
            <button onClick={prevMonth} className="p-2 border rounded border-[#714B67] text-[#714B67]"><ChevronLeft size={16}/></button>
            <div className="text-sm font-bold text-[#714B67]">{monthStart.toLocaleString('default',{month:'long', year:'numeric'})}</div>
            <button onClick={nextMonth} className="p-2 border rounded border-[#714B67] text-[#714B67]"><ChevronRight size={16}/></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-sm">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-xs text-gray-500 text-center font-bold">{d}</div>
          ))}

          {monthDays.map((dt) => (
            <div key={dt.toISOString()} className="p-2 border rounded h-24 flex flex-col justify-between hover:shadow-sm cursor-pointer" onClick={() => setSelectedDateItems({date: dt, items: itemsForDate(dt)})}>
              <div className="flex justify-between items-center">
                <div className="text-sm font-bold">{dt.getDate()}</div>
                <div className="flex gap-2 items-center">
                  {countScheduledForDate(dt) > 0 && <div className="bg-[#714B67] text-white px-2 py-0.5 text-xs rounded">{countScheduledForDate(dt)}</div>}
                  {countCreatedForDate(dt) > 0 && <div className="text-[#714B67] px-2 py-0.5 text-xs rounded border border-[#714B67]">Raised {countCreatedForDate(dt)}</div>}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {itemsForDate(dt).slice(0,2).map(it => (
                  <div key={it.id} className="truncate">{it.subject} <span className="text-[10px] text-gray-400">({it.status})</span></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 mb-2 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#714B67]"></div><div>Scheduled</div></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-[#714B67]"></div><div>Raised</div></div>
        </div>

        {selectedDateItems && (
          <div className="mt-6 p-4 border rounded bg-white">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-[#714B67]">Requests on {selectedDateItems.date.toDateString()}</h4>
              <button onClick={() => setSelectedDateItems(null)} className="text-gray-500">Close</button>
            </div>
            {selectedDateItems.items.length === 0 ? (
              <div className="text-gray-500">No requests for this date.</div>
            ) : (
              <ul>
                {selectedDateItems.items.map(it => (
                  <li key={it.id} className="py-3 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">{it.subject}</div>
                        <div className="text-sm text-gray-600 mt-1">Target: {it.target_type === 'work_center' ? getWorkCenterName(it.work_center_id) : getEquipmentName(it.equipment_id)}</div>
                        <div className="text-sm text-gray-600">Team: {getTeamName(it.maintenance_team_id)}</div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>Raised: {formatDateTime(it.created_at)}</div>
                        <div>Scheduled: {it.scheduled_date ? formatDateTime(it.scheduled_date) : '—'}</div>
                        <div className="mt-1 text-xs text-gray-400">Status: {it.status}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default MaintenanceCalendar;
