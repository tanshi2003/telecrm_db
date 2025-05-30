import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaCheckCircle,
  FaPhoneAlt,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdShowChart } from "react-icons/md";
import BackButton from "../components/BackButton";

export default function CallerReport() {
  const { caller_id } = useParams();
  const [user, setUser] = useState(null);
  const [caller, setCaller] = useState({});
  const [callStats, setCallStats] = useState([]);
  const [leads, setLeads] = useState([]);
  const [groupedStages, setGroupedStages] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Auth logic
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = localStorage.getItem("role");
    if (
      storedUser &&
      (role?.toLowerCase() === "admin" || role?.toLowerCase() === "caller")
    ) {
      setUser(storedUser);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!caller_id) return;

    // Fetch caller stats
    fetch(`http://localhost:5000/api/monthly_caller_stats/${caller_id}`)
      .then((res) => res.json())
      .then((data) => {
        const c = data.data || data || {};
        setCaller({
          name: c.caller_name || "Caller Name",
          email: c.caller_email || "tanshikhandelwal56@gmail.com",
        });

        setCallStats([
          {
            icon: <FaPhoneAlt className="text-blue-700" />,
            label: "All Calls",
            value: c.total_calls || 0,
          },
        
          {
            icon: <FaPhoneAlt className="text-green-600" />,
            label: "Completed Calls",
            value: c.completed_calls || 0,
          },
          {
            icon: 
              <FaStar className="text-blue-700" />,
            label: "Interested Leads",
            value: c.interested_leads || 0,
           
          },
          {
            icon: (
              <FaPhoneAlt
                className="text-red-500"
                style={{ transform: "rotate(90deg)" }}
              />
            ),
            label: "Missed Calls",
            value: c.missed_calls || 0,
          },
          {
            icon: <FaCheckCircle className="text-green-600" />,
            label: "Completion Rate",
            value: c.completion_rate || "0%",
          },
          {
            icon: <FaClock className="text-blue-700" />,
            label: "Total Hours",
            value: c.total_hours || "3.5h",
          },
          {
            icon: <FaPhoneAlt className="text-yellow-600" />,
            label: "Average Call Duration Minutes",
            value: c.avg_call_duration_minutes || "0 mins",
          },
        ]);
      });

    // Fetch and group lead stages (optional; update endpoint as needed)
    fetch(`http://localhost:5000/api/monthly_caller_stats/${caller_id}/leads`)
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.data || []);
      });
  }, [caller_id, navigate]);

  // Calculate lead stage counts based on current leads state
  const leadStageCounts = {
    Fresh: leads.filter((l) => l.lead_stage === "Fresh").length || 0,
    "Call Later": leads.filter((l) => l.lead_stage === "Call Later").length || 0,
    Interested: leads.filter((l) => l.lead_stage === "Interested").length || 0,
    Won: leads.filter((l) => l.lead_stage === "Won").length || 0,
    Lost: leads.filter((l) => l.lead_stage === "Lost").length || 0,
    "Not Interested":
      leads.filter((l) => l.lead_stage === "Not Interested").length || 0,
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 to-blue-300">
      <Sidebar user={user} />
      <div className="flex-grow ml-64 mt-16 p-2 bg-gray-100">
  
     <BackButton/>
     <div className="flex flex-col md:flex-row gap-4 px-8 py-6">
          {/* Left: Leaderboard Card */}
          <div className="flex-1 max-w-2xl">
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-lg text-gray-700">
                  Leaderboard
                </div>
                <MdShowChart className="text-gray-700" size={24} />
              </div>
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {["DAY", "WEEK", "MONTH", "YEAR"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 py-1 rounded font-medium text-xs ${
                      tab === "WEEK"
                        ? "bg-blue-100 text-blue-800"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <div className="relative">
                  <select className="border rounded px-2 py-1 text-sm focus:outline-none">
                    <option>This Week</option>
                    <option>Last Week</option>
                  </select>
                </div>
                <div className="relative">
                  <select className="border rounded px-2 py-1 text-sm focus:outline-none">
                    <option>Calls</option>
                    <option>Sales</option>
                    <option>Duration</option>
                  </select>
                </div>
              </div>
              {/* Stats */}
                <div className="flex gap-8 items-center">
                <div className="text-2xl font-semibold text-gray-700">
                  {callStats.find((s) => s.label === "All Calls")?.value ?? 0}
                  <div className="text-xs font-normal text-gray-500">
                    Calls
                  </div>
                </div>
                <div className="text-2xl font-semibold text-gray-700">
                  {callStats.find((s) => s.label === "Total Duration")?.value ?? "0h"}
                  <div className="text-xs font-normal text-gray-500">
                    Duration
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Profile & Stats */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-4 flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-purple-200 flex items-center justify-center text-2xl font-bold text-purple-700 uppercase">
                {caller.name
                  ? caller.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "?"}
              </div>
              <div>
                <div className="font-semibold text-base">
                  {caller.name || "Caller Name"}
                </div>
                <div className="text-gray-500 text-sm">
                  {caller.email || "tanshikhandelwal56@gmail.com"}
                </div>
              </div>
            </div>

            {/* Calls Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
              <div className="font-semibold text-gray-600 mb-2">Calls</div>
              <div className="divide-y">
                {callStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center py-2 gap-3"
                  >
                    <span className="w-6 flex justify-center">{stat.icon}</span>
                    <span className="flex-1">{stat.label}</span>
                    <span className="font-semibold">{stat.value}</span>
                    <span className="w-3">&#8250;</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Check In */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-4 flex items-center gap-3">
              <FaMapMarkerAlt className="text-blue-700" />
              <span className="flex-1 text-gray-700">Location Check In</span>
              <span className="font-semibold">{0}</span>
            </div>

            {/* Lead Stage Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
              <div className="font-semibold text-gray-600 mb-2">Lead Stage</div>
              <div className="rounded-lg border border-gray-300">
                {/* Initial */}
                <div className="px-4 pt-3 pb-1 text-xs text-gray-500 font-semibold">
                  Initial
                </div>
                <div className="flex items-center px-4 py-2 border-t border-gray-200">
                  <span className="w-3 h-3 rounded-sm bg-green-700 mr-2"></span>
                  <span className="flex-1 text-gray-800">Fresh</span>
                  <span className="text-gray-800">{leadStageCounts.Fresh}</span>
                  <span className="w-3 text-gray-400 ml-2">&#8250;</span>
                </div>
                {/* Active */}
                <div className="px-4 pt-3 pb-1 text-xs text-gray-500 font-semibold">
                  Active
                </div>
                <div className="flex items-center px-4 py-2 border-t border-gray-200">
                  <span className="w-3 h-3 rounded-sm bg-yellow-700 mr-2"></span>
                  <span className="flex-1 text-gray-800">Call Later</span>
                  <span className="text-gray-800">
                    {leadStageCounts["Call Later"]}
                  </span>
                  <span className="w-3 text-gray-400 ml-2">&#8250;</span>
                </div>
                <div className="flex items-center px-4 py-2 border-t border-gray-200">
                  <span className="w-3 h-3 rounded-sm bg-yellow-700 mr-2"></span>
                  <span className="flex-1 text-gray-800">Interested</span>
                  <span className="text-gray-800">
                    {leadStageCounts.Interested}
                  </span>
                  <span className="w-3 text-gray-400 ml-2">&#8250;</span>
                </div>
                {/* Closed */}
                <div className="px-4 pt-3 pb-1 text-xs text-gray-500 font-semibold">
                  Closed
                </div>
                <div className="flex items-center px-4 py-2 border-t border-gray-200">
                  <span className="w-3 h-3 rounded-sm bg-green-500 mr-2"></span>
                  <span className="flex-1 text-gray-800">Won</span>
                  <span className="text-gray-800">{leadStageCounts.Won}</span>
                  <span className="w-3 text-gray-400 ml-2">&#8250;</span>
                </div>
                <div className="flex items-center px-4 py-2 border-t border-gray-200">
                  <span className="w-3 h-3 rounded-sm bg-red-600 mr-2"></span>
                  <span className="flex-1 text-gray-800">Lost</span>
                  <span className="text-gray-800">{leadStageCounts.Lost}</span>
                  <span className="w-3 text-gray-400 ml-2">&#8250;</span>
                </div>
                <div className="flex items-center px-4 py-2 border-t border-gray-200">
                  <span className="w-3 h-3 rounded-sm bg-gray-400 mr-2"></span>
                  <span className="flex-1 text-gray-800">Not Interested</span>
                  <span className="text-gray-800">
                    {leadStageCounts["Not Interested"]}
                  </span>
                  <span className="w-3 text-gray-400 ml-2">&#8250;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}