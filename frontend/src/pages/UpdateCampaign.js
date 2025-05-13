import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";  // Import Sidebar
import BackButton from "../components/BackButton";  // Import BackButton
import { ToastContainer, toast } from "react-toastify";  // For notifications
import "react-toastify/dist/ReactToastify.css";

const UpdateCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState({
    name: '',
    description: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await axios.get(`http://localhost/api/campaigns/${id}`);
        setCampaign(response.data);
      } catch (error) {
        console.error('Error fetching campaign data', error);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampaign((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost/api/campaigns/${id}`, campaign);
      toast.success('Campaign updated successfully!');
      navigate('/admin/campaigns1'); // Redirect after successful update
    } catch (error) {
      console.error('Error updating campaign', error);
      toast.error('Failed to update campaign.');
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar user={{ name: "Admin", role: "admin" }} />

      <div className="flex-1 ml-64 mt-16 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Campaign</h1>
          <BackButton />
        </div>

        {/* Campaign Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Campaign</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Campaign Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={campaign.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter campaign name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="description">
                Campaign Description<span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={campaign.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="3"
                placeholder="Enter description"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="status">
                Status<span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={campaign.status}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="startDate">
                Start Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={campaign.startDate}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="endDate">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={campaign.endDate}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Update Campaign
              </button>
            </div>
          </form>
        </div>

        {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default UpdateCampaign;
