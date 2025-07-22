import React, { useState } from "react";
import Filters from "../components/Filters";
import Sidebar from "../components/Sidebar"; // Import Sidebar
import BackButton from "../components/BackButton";
import axios from "axios";

const AdminFiltersPage = () => {
  const [type, setType] = useState("leads");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle filter apply/reset actions
  const handleApply = async (filters) => {
    setLoading(true);
    setError("");
    setResults([]);
    const token = localStorage.getItem("token");
    let url = "";
    if (type === "leads") url = `${process.env.REACT_APP_API_BASE_URL}/leads/filter`;
    else if (type === "users") url = `${process.env.REACT_APP_API_BASE_URL}/users/filter`;
    else if (type === "campaigns") url = `${process.env.REACT_APP_API_BASE_URL}/campaigns/filter`;
    try {
      const res = await axios.post(url, filters, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data?.data || []);
    } catch (err) {
      setError("Failed to fetch filtered data");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults([]);
    setError("");
  };

  // Render results table
  const renderTable = () => {
    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;
    if (!results.length) return null;
    if (type === "leads") {
      return (
        <div className="overflow-x-auto mt-8">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Category</th>
                <th className="px-4 py-2 border">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {results.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-2 border">{lead.name}</td>
                  <td className="px-4 py-2 border">{lead.phone}</td>
                  <td className="px-4 py-2 border">{lead.status}</td>
                  <td className="px-4 py-2 border">{lead.category}</td>
                  <td className="px-4 py-2 border">{lead.assignedToName || lead.assignedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (type === "users") {
      return (
        <div className="overflow-x-auto mt-8">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Role</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 border">{user.name}</td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">{user.role}</td>
                  <td className="px-4 py-2 border">{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (type === "campaigns") {
      return (
        <div className="overflow-x-auto mt-8">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Priority</th>
                <th className="px-4 py-2 border">Created By</th>
              </tr>
            </thead>
            <tbody>
              {results.map((camp) => (
                <tr key={camp.id}>
                  <td className="px-4 py-2 border">{camp.name}</td>
                  <td className="px-4 py-2 border">{camp.status}</td>
                  <td className="px-4 py-2 border">{camp.priority}</td>
                  <td className="px-4 py-2 border">{camp.createdByName || camp.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64 mt-16 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Filters</h1>
          <BackButton />
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 mb-4 justify-center">
            <button
              className={`px-4 py-2 rounded font-semibold ${type === "users" ? "bg-blue-600 text-white" : "bg-white border"}`}
              onClick={() => setType("users")}
            >
              Users Filters
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold ${type === "leads" ? "bg-blue-600 text-white" : "bg-white border"}`}
              onClick={() => setType("leads")}
            >
              Leads Filters
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold ${type === "campaigns" ? "bg-blue-600 text-white" : "bg-white border"}`}
              onClick={() => setType("campaigns")}
            >
              Campaigns Filters
            </button>
          </div>
          <Filters type={type} onApply={handleApply} onReset={handleReset} removeWorkingHours={type === "users"} />
          {renderTable()}
        </div>
      </div>
    </div>
  );
};

export default AdminFiltersPage;
