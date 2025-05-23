import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const CALL_ICONS = {
  "All Calls": "📞",
  "Incoming Calls": "🔄",
  "Outgoing Calls": "📤",
  "Missed Calls": "❌",
  "Connected Calls": "✅",
  "Attempted Calls": "📲",
  "Total Duration": "⏱️"
};

const STAGE_COLORS = {
  "Fresh": "bg-green-200 text-green-800",
  "Call Later": "bg-yellow-200 text-yellow-800",
  "Interested": "bg-blue-200 text-blue-800",
  "Won": "bg-green-500 text-white",
  "Lost": "bg-red-500 text-white",
  "Not Interested": "bg-gray-300 text-gray-800"
};

export default function ReportLeaderboard() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({});
  const [callers, setCallers] = useState([]);
  const [leadStages, setLeadStages] = useState([]);
  const [period, setPeriod] = useState("WEEK");
  const [callType, setCallType] = useState("Calls");
  const navigate = useNavigate();

  useEffect(() => {
    // Auth check
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = localStorage.getItem("role");
    if (storedUser && role?.toLowerCase() === "admin") {
      setUser(storedUser);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch summary
    fetch("http://localhost:5000/api/Views")
      .then(res => res.json())
      .then(data => setSummary(data.data || {}));
    // Fetch callers
    fetch(`http://localhost:5000/api/Views/callers?period=${period}&callType=${callType}`)
      .then(res => res.json())
      .then(data => setCallers(data.data || []));
    // Fetch lead stages
    fetch("http://localhost:5000/api/Views")
      .then(res => res.json())
      .then(data => setLeadStages(data.data || []));
  }, [period, callType]);

  const handleNavigation = (path) => navigate(path);

  if (!user) return null;

  return (
    <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 to-blue-300">
      <Sidebar user={user} />
      <div className="flex-grow p-6 ml-64 mt-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-3xl font-bold">Leaderboard</h1>
          </div>
          
        </div>
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex gap-2 bg-white rounded-lg shadow px-2 py-1">
            {["DAY", "WEEK", "MONTH", "YEAR"].map(p => (
              <button
                key={p}
                className={`px-3 py-1 rounded ${period === p ? "bg-blue-600 text-white" : "text-gray-700"}`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <select
            className="border rounded px-2 py-1"
            value={callType}
            onChange={e => setCallType(e.target.value)}
          >
            <option value="Calls">Calls</option>
            <option value="Sales">Sales</option>
            <option value="Duration">Duration</option>
          </select>
          <select className="border rounded px-2 py-1">
            <option>This Week</option>
            <option>Last Week</option>
          </select>
        </div>
        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Leaderboard Cards */}
          <div className="col-span-2 space-y-4">
            {/* Leaderboard Summary */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow px-6 py-3">
              <div className="font-semibold text-lg">Leaderboard</div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Total Stats</div>
                <div className="text-2xl font-bold">{summary.totalStats || "0"}</div>
              </div>
            </div>
            {/* Callers List */}
            <div className="space-y-2">
              {callers.map((caller, idx) => (
                <div key={caller.id || idx} className="flex items-center justify-between bg-white rounded-lg shadow px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-800">
                      {caller.name?.[0] || "?"}
                    </div>
                    <div>
                      <div className="font-semibold">{caller.name}</div>
                      <div className="text-xs text-gray-500">
                        First Call {caller.firstCallTime || "--"} | Last Call {caller.lastCallTime || "--"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-center">
                      <div className="font-bold">{caller.calls}</div>
                      <div className="text-xs text-gray-500">Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{caller.duration}</div>
                      <div className="text-xs text-gray-500">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{caller.sales}</div>
                      <div className="text-xs text-gray-500">Sales</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right Panel */}
          <div className="space-y-4">
            {/* Calls Breakdown */}
            <div className="bg-white rounded-lg shadow px-6 py-4">
              <div className="font-semibold mb-2">Calls</div>
              <div className="space-y-1">
                {summary.callsBreakdown && Object.entries(summary.callsBreakdown).map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span>
                      {CALL_ICONS[label] || "•"} {label}
                    </span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Total Duration</span>
                <span className="font-semibold">{summary.totalDuration || "0h"}</span>
              </div>
            </div>
            {/* Location Check In */}
            <div className="bg-white rounded-lg shadow px-6 py-4">
              <div className="font-semibold mb-2">Location Check In</div>
              <div className="flex justify-between items-center">
                <span>Location Check In</span>
                <span className="font-semibold">{summary.locationCheckIn || 0}</span>
              </div>
            </div>
            {/* Lead Stage */}
            <div className="bg-white rounded-lg shadow px-6 py-4">
              <div className="font-semibold mb-2">Lead Stage</div>
              <div className="space-y-1">
                {leadStages.map(stage => (
                  <div key={stage.stage} className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded ${STAGE_COLORS[stage.stage] || "bg-gray-200"}`}>
                      {stage.stage}
                    </span>
                    <span className="font-semibold">{stage.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}