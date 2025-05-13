import React, { useEffect, useState } from "react";
import { FaClock, FaUser, FaMapMarkerAlt, FaSignInAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar"; // If not already added

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setAdmin(storedUser);
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:5000/logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      } else {
        toast.error("Failed to fetch logs");
      }
    } catch (err) {
      toast.error("Server error while fetching logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar user={admin} />

      <main className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="max-w-7xl mx-auto bg-white rounded-md shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">📊 User Access Logs</h2>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-400 text-sm">No logs found.</p>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 shadow-sm border border-gray-200 rounded-md p-4 flex gap-4 items-start"
                >
                  <div className="text-blue-500 mt-1">
                    <FaSignInAlt size={20} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      <FaUser className="inline mr-1 text-gray-500" />
                      <strong>{log.userName}</strong> performed{" "}
                      <span className="text-indigo-600 font-semibold">
                        {log.action}
                      </span>
                    </p>

                    <p className="text-xs text-gray-600 mt-1 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1">
                        <FaClock className="text-gray-500" />{" "}
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-gray-500" />
                        IP: {log.ip || "N/A"}
                      </span>
                    </p>

                    {log.details && (
                      <p className="text-xs text-gray-700 mt-1">
                        <span className="font-medium">Details:</span> {log.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AccessLogs;
