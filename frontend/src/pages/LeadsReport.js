import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
const COLORS = ["#FF4C4C", "#FFC107", "#00C49F", "#8884d8", "#FF8042", "#82ca9d"];


export default function LeadsChartReport() {
  const [user, setUser] = useState(null);
  const [barData, setBarData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("all");
  const navigate = useNavigate();

  // Calculate total for percentages
  const total = barData.reduce((sum, d) => sum + d.count, 0);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = localStorage.getItem("role");
    if (storedUser && role?.toLowerCase() === "admin") {
      setUser(storedUser);
    } else {
      navigate("/login");
    }
  }, [navigate]);
  // Fetch users data
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch chart data from backend
  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = selectedUser === "all" 
        ? "http://localhost:5000/api/leads"
        : `http://localhost:5000/api/leads?userId=${selectedUser}`;
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      const leadsArray = Array.isArray(data.data) ? data.data : [];      // Aggregate by status
      const statusCounts = leadsArray.reduce((acc, lead) => {
        const status = lead.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      const chartData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
      setBarData(chartData);
    } catch (error) {
      setBarData([]);
    }
  };  useEffect(() => {
    fetchUsers();
    fetchChartData();
  }, []);

  function handleNavigation(path) {
    navigate(path);
  }
  if (!user) return null;

  return (    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="flex-grow ml-64 mt-16 p-4 bg-gray-100">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-semibold text-gray-800">Lead Status Report</h1>
            <div className="flex items-center gap-4">              <div className="flex items-center gap-2">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={fetchChartData}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Show Report
                </button>
              </div>
              <button
                onClick={() => handleNavigation("/leads")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Show All Leads
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <BackButton />
          </div>
        </div>
        {/* Charts Section */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Lead Status Progress</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Progress Chart */}
              <div className="w-full">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={barData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    barSize={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="status"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fill: '#4B5563', fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: '#4B5563' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.375rem'
                      }}
                    />
                    <Bar dataKey="count" name="Count">
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>              {/* Status Distribution */}
              <div className="flex flex-col justify-center">                <div className="grid grid-cols-2 gap-2">
                  {barData.map((entry, index) => (
                    <div key={entry.status} className="flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-700 text-sm">{entry.status}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xl font-bold text-gray-800">{entry.count}</span>
                        <span className="block text-xs text-gray-500">
                          {total > 0 ? ((entry.count / total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}