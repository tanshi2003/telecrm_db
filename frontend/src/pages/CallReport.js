import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import Select from 'react-select';

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const timeRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

export default function CallReport() {
  const [user, setUser] = useState(null);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [timeRange, setTimeRange] = useState(timeRangeOptions[1]); // Default to "This Week"
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:5000/api/calls/stats/${timeRange.value}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch data');
      }      console.log('API Response:', data); // Debug log to see data structure

      // Ensure data.data is an array and handle empty data
      const responseData = Array.isArray(data.data) ? data.data : [];
      
      // Transform the data for combined status and disposition
      const combinedData = responseData.map(item => ({
        label: `${item.status}/${item.disposition}`,
        count: item.count,
        status: item.status,
        disposition: item.disposition
      }));

      // Sort data by status and disposition
      const sortedData = combinedData.sort((a, b) => {
        if (a.status === b.status) {
          return a.disposition.localeCompare(b.disposition);
        }
        return a.status.localeCompare(b.status);
      });

      setBarData(sortedData);
      setPieData(sortedData);
      
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };  // Memoize fetchChartData to prevent infinite loops
  const memoizedFetchChartData = React.useCallback(fetchChartData, [timeRange]);

  useEffect(() => {
    if (user) {
      memoizedFetchChartData();
    }
  }, [user, memoizedFetchChartData]);

  if (!user) return null;
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-lg">
          <p className="text-sm font-semibold">Status: {data.status}</p>
          <p className="text-sm">Disposition: {data.disposition}</p>
          <p className="text-sm">Count: {data.count}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 to-blue-300">
      <Sidebar user={user} />
      <div className="flex-grow ml-64 mt-16 p-2 bg-gray-100">
        <div className="flex justify-between items-center px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Calls Report</h1>
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Select
                options={timeRangeOptions}
                value={timeRange}
                onChange={setTimeRange}
                className="text-sm"
                isSearchable={false}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: '#1d4ed8',
                    primary25: '#dbeafe',
                  },
                })}
              />
            </div>
            <BackButton />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchChartData}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 mb-6">
              {/* Bar Chart Card */}
              <div className="bg-white rounded-xl shadow-md p-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Call Status & Disposition Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={barData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    barSize={30}
                  >
                    <XAxis 
                      dataKey="label" 
                      angle={-45} 
                      textAnchor="end"
                      height={80}
                      stroke="#4B5563"
                      fontSize={11}
                      interval={0}
                    />
                    <YAxis stroke="#4B5563" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count">
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart Card */}
              <div className="bg-white rounded-xl shadow-md p-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Combined Status Report</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, value, payload }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return value ? (
                          <text
                            x={x}
                            y={y}
                            fill="#fff"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={11}
                            fontWeight="bold"
                          >
                            {`${value}`}
                          </text>
                        ) : null;
                      }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Legend */}
            <div className="px-8">
              <div className="bg-white rounded-xl shadow-md p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pieData.map((entry, index) => (
                    <div 
                      key={`${entry.status}-${entry.disposition}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {entry.status}/{entry.disposition}
                        </p>
                        <p className="text-lg font-semibold text-gray-900">{entry.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}