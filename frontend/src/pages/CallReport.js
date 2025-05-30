import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
const COLORS = ["#FF4C4C", "#FFC107", "#00C49F", "#8884d8", "#FF8042", "#82ca9d"];


export default function Reports2() {
  const [user, setUser] = useState(null);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [filter, setFilter] = useState("Call Reports");
  const navigate = useNavigate();

  // Check authentication and role
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
    const response = await fetch("http://localhost:5000/api/calls", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    console.log("Token:", token);
    console.log("API DATA:", data);
    const callsArray = Array.isArray(data.data) ? data.data : [];
    const statusCounts = callsArray.reduce((acc, call) => {
      const status = call.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const chartData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
    console.log("Chart Data:", chartData);

    setBarData(chartData);
    setPieData(chartData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
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

  return (
  <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 to-blue-300">
    <Sidebar user={user} />
    <div className="flex-1 flex flex-col ml-64 mt-16 p-8 bg-gray-100">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-16">
          <h1 className="text-3xl font-bold text-black drop-shadow">Call Report</h1>
        </div>
        <BackButton />
      </div>
      {/* Charts */}
      <div className="grid grid-cols-2 gap-8">
    
{/* Bar Chart Card */}
<div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
  <h2 className="text-lg font-semibold mb-4">Bar Chart</h2>
  {/* Removed overflow-x-auto and minWidth for fixed chart */}
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={barData}
      margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
      barSize={40}
    >
      <XAxis tick={false} />
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
                className="inline-block w-4 h-4 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span className="font-semibold">{entry.status}</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                {entry.count}
              </span>
            </div>
          ))}
        </div>
      </div>
  </div>
  </div>
);
}