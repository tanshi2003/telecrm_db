import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
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
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Call Report</h1>
          <button
            onClick={() => handleNavigation("/admin/settings")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            System Settings
          </button>
        </div>
        {/* Filters and Charts */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
                      
          </div>
          {/* Charts */}
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Bar Chart</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {barData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Pie Chart</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    label
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}