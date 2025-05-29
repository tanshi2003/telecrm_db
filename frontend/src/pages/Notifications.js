import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { Bell, Briefcase, Calendar } from "lucide-react";
import BackButton from "../components/BackButton"; // Import BackButton

const Notifications = () => {
  const navigate = useNavigate();

  // Sample simulated notifications (normally fetched from an API)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "Task",
      message: "New Task Assigned: Visit Client A in Jaipur",
      timestamp: "2025-05-25 10:00 AM",
      read: false,
    },
    {
      id: 2,
      type: "Meeting",
      message: "Manager scheduled a meeting for tomorrow at 3 PM",
      timestamp: "2025-05-25 09:30 AM",
      read: false,
    },
  ]);

  // Simulate marking all as read on load
  useEffect(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  }, []);

  // Icons based on type
  const getIcon = (type) => {
    switch (type) {
      case "Task":
        return <Briefcase className="text-blue-500" size={20} />;
      case "Meeting":
        return <Calendar className="text-green-500" size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-6 bg-gray-100 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {/* <button
            onClick={() => navigate("/field-dashboard")}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            ← Back to Dashboard
          </button> */}
          <BackButton /> {/* Use BackButton instead of a custom button */}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-600">No new notifications.</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-3 p-4 border-l-4 rounded shadow-sm bg-gray-50 hover:bg-white transition-all border-yellow-400"
              >
                <div>{getIcon(notif.type)}</div>
                <div>
                  <p className="text-gray-800 font-medium">{notif.message}</p>
                  <p className="text-sm text-gray-500">{notif.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
