import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import BackButton from "../components/BackButton"; // Import BackButton


const ClientFeedback = () => {
  const navigate = useNavigate();

  const [feedbacks, setFeedbacks] = useState([]);
  const [clientName, setClientName] = useState("");
  const [rating, setRating] = useState("");
  const [comments, setComments] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!clientName || !rating || !comments.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    const newFeedback = {
      id: Date.now(),
      clientName,
      rating,
      comments,
      date: new Date().toLocaleDateString(),
    };

    setFeedbacks([newFeedback, ...feedbacks]);
    toast.success("Client feedback submitted!");

    // Clear form
    setClientName("");
    setRating("");
    setComments("");
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-6 bg-gray-100 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Client Feedback</h1>
          {/* <button
            onClick={() => navigate("/field-dashboard")}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            ← Back to Dashboard
          </button> */}
          <BackButton /> {/* Use BackButton instead of a custom button */}
        </div>

        {/* Feedback Form */}
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Collect Client Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client Name"
              className="w-full border rounded p-2"
            />
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select Rating</option>
              <option value="5">Excellent ⭐⭐⭐⭐⭐</option>
              <option value="4">Good ⭐⭐⭐⭐</option>
              <option value="3">Average ⭐⭐⭐</option>
              <option value="2">Poor ⭐⭐</option>
              <option value="1">Very Poor ⭐</option>
            </select>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Client comments..."
              className="w-full border rounded p-2 h-28"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Submit Feedback
            </button>
          </form>
        </div>

        {/* Feedback List */}
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">Previous Feedbacks</h2>
          {feedbacks.length === 0 ? (
            <p className="text-gray-500">No feedback submitted yet.</p>
          ) : (
            <ul className="space-y-4">
              {feedbacks.map((fb) => (
                <li key={fb.id} className="border-b pb-2">
                  <p className="font-semibold">{fb.clientName}</p>
                  <p className="text-sm text-gray-600">Rating: {fb.rating} ⭐</p>
                  <p className="text-gray-700">{fb.comments}</p>
                  <p className="text-xs text-gray-400">Date: {fb.date}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientFeedback;
