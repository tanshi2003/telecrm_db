import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, Legend } from "recharts";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const COLORS = ["#FF4C4C", "#FFC107", "#00C49F", "#8884d8", "#FF8042", "#82ca9d"];

export default function LeadsChartReport() {
  const [user, setUser] = useState(null);
  const [barData, setBarData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("all");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Calculate total for percentages
  const total = barData.reduce((sum, d) => sum + d.count, 0);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = localStorage.getItem("role");
    if (storedUser && (role?.toLowerCase() === "admin" || role?.toLowerCase() === "field_employee")) {
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
      const data = await response.json();      if (data.success) {
        // Include field employees and filter out managers
        const relevantUsers = data.data.filter(user => 
          user.role?.toLowerCase() !== 'manager' && 
          (user.role?.toLowerCase() === 'field_employee' || user.role?.toLowerCase() === 'caller')
        );
        setUsers(relevantUsers);
      }    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  // Fetch chart data from backend
  const fetchChartData = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Send role and selectedUser info in URL for proper filtering
      const url = selectedUser === "all" 
        ? `http://localhost:5000/api/leads?selectedUser=all` 
        : `http://localhost:5000/api/users/${selectedUser}/leads`;
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await response.json();
      console.log("API Response:", data);
      
      if (!data.success) {
        console.error("Error fetching leads:", data.message);
        setBarData([{ status: "Error", count: 0 }]);
        return;
      }      let chartData = [];
      // let params = []; // Initialize params array
      
      if (selectedUser === "all") {
        // Process aggregated data for all users
        if (data.data.overallDistribution) {
          chartData = Object.values(data.data.overallDistribution)
            .map(item => ({
              status: item.status || 'Unknown',
              count: parseInt(item.count) || 0,
              assigned_users: Array.isArray(item.assigned_users) ? item.assigned_users : [],
              campaigns: Array.isArray(item.campaigns) ? item.campaigns : []
            }));
        }
      } else {
        // Process leads data for individual user
        const leadsData = data.data || [];
        
        // Create a map to count leads by status
        const statusMap = new Map();
        leadsData.forEach(lead => {
          const status = lead.status;
          const existingCount = statusMap.get(status) || 0;
          statusMap.set(status, existingCount + 1);
        });
        
        // Convert map to array format
        chartData = Array.from(statusMap.entries()).map(([status, count]) => ({
          status,
          count,
          percentage: ((count / leadsData.length) * 100).toFixed(1)
        }));
      }
      
      // Ensure we have data to display
      if (!chartData || chartData.length === 0) {
        console.log("No lead data found");
        setBarData([{ status: "No Data", count: 0 }]);
        return;
      }
      
      // Sort by count in descending order
      chartData = chartData.sort((a, b) => b.count - a.count);
      console.log("Final chart data:", chartData);
      setBarData(chartData);
      
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setBarData([{ status: "Error", count: 0 }]);
    } finally {
      setLoading(false);
    }
  }, [selectedUser]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);
  // Fetch data when user or selectedUser changes
  useEffect(() => {
    if (user) {
      fetchChartData();
    }
  }, [user, selectedUser, fetchChartData]);


  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="flex-grow ml-64 mt-16 p-4 bg-gray-100">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-semibold text-gray-800">Lead Status Report</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {user?.role?.toLowerCase() === "field_employee" ? (
                  <div className="px-4 py-2 text-gray-700">
                    My Leads Status
                  </div>
                ) : (
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
                )}
              </div>
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
                {/* Chart Section */}
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-gray-600">Loading...</div>
                  </div>
                ) : barData.length > 0 ? (
                  <div className="mt-8 p-4">                    <ResponsiveContainer width="100%" height={500}>                      <BarChart
                        data={barData}
                        margin={{ top: 20, right: 50, left: 30, bottom: 120 }}
                        barSize={35}
                      >
                        <XAxis
                          dataKey="status"
                          angle={-45}
                          textAnchor="end"
                          height={120}
                          interval={0}
                          tick={{ fill: '#4B5563', fontSize: 13 }}
                          dy={20}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Number of Leads" radius={[4, 4, 0, 0]}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-gray-600">No lead data available</div>
                  </div>
                )}
              </div>
              
              {/* Status Distribution */}
              <div className="flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-2">
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