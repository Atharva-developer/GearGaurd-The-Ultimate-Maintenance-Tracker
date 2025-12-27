import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportsPage = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => { fetchSummary(); }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/reports/summary');
      setSummary(res.data);
    } catch (err) { console.error('Failed to load reports', err); }
  };

  if (!summary) return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded">Loading reports...</div>
    </div>
  );

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded">
        <h2 className="text-xl font-bold mb-4">Maintenance Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Open Requests (all)</div>
            <div className="text-2xl font-bold">{Object.values(summary.status_counts || {}).reduce((a,b)=>a+b,0)}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Avg Time to Repair</div>
            <div className="text-2xl font-bold">{summary.avg_time_to_repair_seconds ? `${Math.round(summary.avg_time_to_repair_seconds/3600)} hrs` : 'N/A'}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Priorities</div>
            <div className="text-lg font-bold">{Object.entries(summary.priority_counts || {}).map(([k,v]) => `${k}: ${v}`).join(' • ')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">Requests by Status</h3>
            <ul>
              {Object.entries(summary.status_counts || {}).map(([s,c]) => (
                <li key={s} className="text-sm">
                  <strong>{s}</strong>: {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">Requests by Team</h3>
            <ul>
              {Object.entries(summary.team_counts || {}).map(([t,c]) => (
                <li key={t} className="text-sm">{t}: {c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
