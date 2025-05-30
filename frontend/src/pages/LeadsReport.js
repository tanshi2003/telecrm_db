import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
const COLORS = ["#FF4C4C", "#FFC107", "#00C49F", "#8884d8", "#FF8042", "#82ca9d"];


export default function LeadsChartReport() {
  const [user, setUser] = useState(null);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [filter, setFilter] = useState("Call Reports");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = localStorage.getItem("role");
    if (storedUser && role?.toLowerCase() === "admin") {
      setUser(storedUser);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch chart data from backend
  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/leads", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      const leadsArray = Array.isArray(data.data) ? data.data : [];
      // Aggregate by status
      const statusCounts = leadsArray.reduce((acc, lead) => {
        const status = lead.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      const chartData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
      setBarData(chartData);
      setPieData(chartData);
    } catch (error) {
      setBarData([]);
      setPieData([]);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [filter]);

  function handleNavigation(path) {
    navigate(path);
  }

  if (!user) return null;

  // Calculate total for percentages
  const total = pieData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 to-blue-300">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col ml-64 mt-16 p-8 bg-gray-100">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-16">
             <h1 className="text-3xl font-bold text-black drop-shadow">Lead Report</h1>
            
            <select
              className="border rounded px-3 py-1 text-lg font-semibold"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
          
              <option>Group by</option>
              <option>Call Reports</option>
              <option>Status</option>
            </select>
            </div>
            <BackButton />
            <button
              onClick={() => handleNavigation("/leads")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold shadow"
            >
              View {total} Leads
            </button>
         
         
        </div>
           {/* Charts */}
        <div className="grid grid-cols-2 gap-8">
          {/* Bar Chart Card */}
<div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
  <h2 className="text-lg font-semibold mb-4">Bar Chart</h2>
  <div className="w-full overflow-x-auto">
    <div style={{ minWidth: `${Math.max(barData.length * 120, 700)}px` }}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
  data={barData}
  margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
  barSize={40}
>
  <XAxis tick={false}  /> {/* Hide X axis labels and line */}
  <YAxis stroke="#333" strokeWidth={2} tick={{ fontSize: 15 }} />
  <Tooltip />
  <Bar dataKey="count">
    {barData.map((_entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Bar>
</BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
          {/* Pie Chart Card */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Pie Chart</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, count }) => {
                    // Center label in slice
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#333"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={14}
                        fontWeight="bold"
                      >
                        {count}
                      </text>
                    );
                  }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Color Legend Below Both Charts */}
            <div className="flex justify-center mt-2">
        <div className="flex flex-wrap gap-2 bg-white rounded-lg shadow p-2 border max-w-6xl w-full justify-center">
          {pieData.map((entry, index) => (
            <div key={entry.status} className="flex items-center gap-2">
              <span
                className="inline-block w-6 h-3 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span className="font-semibold">{entry.status}</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                {entry.count} ({total > 0 ? ((entry.count / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}