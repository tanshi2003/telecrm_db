import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const AddLead = () => {
  const [user] = useState(JSON.parse(localStorage.getItem("user")));
  const [form, setForm] = useState({
    name: "",
    phone_no: "",
    lead_category: "Cold Lead",
    status: "New",
    address: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      axios.post(
        "http://localhost:5000/api/leads/add-lead",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lead.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-grow bg-gray-100 p-8 ml-64 mt-16">
        <h1 className="text-3xl font-bold mb-6">Add New Lead</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-lg">
          <div className="mb-4">
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Phone Number</label>
            <input
              type="text"
              name="phone_no"
              value={form.phone_no}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Category</label>
            <select
              name="lead_category"
              value={form.lead_category}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Cold Lead">Cold Lead</option>
              <option value="Warm Lead">Warm Lead</option>
              <option value="Hot Lead">Hot Lead</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Converted">Converted</option>
              <option value="Not Interested">Not Interested</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Add Lead
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddLead;
