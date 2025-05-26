import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import BackButton from "../components/BackButton"; // Import BackButton

const Tasks = () => {
  const navigate = useNavigate();

  // Simulated tasks (normally fetched from an API)
  const [tasks, setTasks] = useState([
    {
      id: 1,
      clientName: "Client A",
      location: "Jaipur",
      time: "11:00 AM",
      description: "Discuss new product features and gather feedback",
      isCompleted: false,
    },
    {
      id: 2,
      clientName: "Client B",
      location: "Ajmer",
      time: "2:00 PM",
      description: "Deliver documents and demo the product",
      isCompleted: false,
    },
    {
      id: 3,
      clientName: "Client C",
      location: "Kota",
      time: "4:30 PM",
      description: "Follow-up meeting and resolve queries",
      isCompleted: false,
    },
  ]);

  const handleMarkComplete = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isCompleted: true } : task
      )
    );
    toast.success("Task marked as completed!");
  };

  const handleSubmitReport = (taskId) => {
    navigate(`/submit-report/${taskId}`);
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-6 bg-gray-100 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Tasks</h1>
          {/* <button
            onClick={() => navigate("/field-dashboard")}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            ← Back to Dashboard
          </button> */}
          <BackButton /> {/* Use BackButton instead of a custom button */}
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-5 rounded-lg shadow-md border-l-4 border-yellow-500"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {task.clientName}
                  </h2>
                  <p className="text-gray-600">{task.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    📍 {task.location} | 🕒 {task.time}
                  </p>
                </div>
                <div className="flex gap-3">
                  {!task.isCompleted ? (
                    <button
                      onClick={() => handleMarkComplete(task.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Mark as Completed
                    </button>
                  ) : (
                    <span className="text-green-600 font-semibold">
                      ✅ Completed
                    </span>
                  )}
                  <button
                    onClick={() => handleSubmitReport(task.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
