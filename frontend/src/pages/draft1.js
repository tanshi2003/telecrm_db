import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#FF4C4C", "#FFC107", "#00C49F", "#8884d8", "#FF8042", "#82ca9d"];

export default function LeadsChartReport() {
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [filter, setFilter] = useState("CALL Reports");

  const fetchChartData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/leads/status-report");
      const data = await response.json();
      setBarData(data);
      setPieData(data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [filter]);

  return (
    <div className="col-span-10 p-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div className="text-lg font-semibold">Leads chart report</div>
        <div className="flex space-x-4 text-sm">
          <div>ABOUT US</div>
          <div>CONTACT US</div>
          <div>LOGIN</div>
          <div>LOGOUT</div>
        </div>
      </div>

      {/* Filters and Charts */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <select
            className="border rounded p-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="CALL Reports">CALL Reports</option>
            <option value="Email Reports">Email Reports</option>
          </select>

          <Button>Download CSV</Button>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-8">
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold mb-4">Bar Chart</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
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
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}