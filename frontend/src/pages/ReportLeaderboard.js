import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaPhoneVolume,
  FaPhoneSlash,
  FaChartLine,
  FaCheck,
  FaHourglassHalf,
  FaCalendarCheck,
  FaTrophy
} from "react-icons/fa";
import { IoCallOutline } from "react-icons/io5";
import BackButton from "../components/BackButton";
import Select from 'react-select';

export default function CallerReport() {
  const { caller_id } = useParams();
  const [user, setUser] = useState(null);
  const [caller, setCaller] = useState({});
  const [callStats, setCallStats] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auth logic and fetch user data
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!storedUser || !role || !token) {
      navigate("/login");
      return;
    }

    setUser(storedUser);

    // Fetch users based on role
    const fetchUsers = async () => {
      try {
        let endpoint;
        if (role === "admin") {
          endpoint = "http://localhost:5000/api/users";
        } else if (role === "manager") {
          endpoint = `http://localhost:5000/api/managers/teams/${storedUser.id}`;
        } else {
          endpoint = `http://localhost:5000/api/users/team/${storedUser.id}`;
        }

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch users');

        const data = await response.json();
        if (data.success) {
          // For manager, API might return { team_members: [...] }
          const usersArray = data.data?.team_members || data.data;
          setUsers(
            usersArray.map(user => ({
              value: user.id,
              label: user.name,
              email: user.email
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [navigate]);

  // Sync selectedUser with URL param and users list
  useEffect(() => {
    if (users.length && caller_id) {
      const found = users.find(u => u.value.toString() === caller_id.toString());
      setSelectedUser(found || null);
    }
  }, [users, caller_id]);

  useEffect(() => {
    if (!caller_id) return;

    // Fetch caller stats
    fetch(`http://localhost:5000/api/monthly_caller_stats/${caller_id}`)
      .then((res) => res.json())
      .then((data) => {
        const c = data.data || data || {};

        // Find the matching user from users array to get correct email
        const selectedUserData = users.find(u => u.value.toString() === caller_id.toString());
        const storedUser = JSON.parse(localStorage.getItem("user"));

        setCaller({
          name: c.caller_name || selectedUserData?.label || "Caller Name",
          email: selectedUserData?.email || c.email || storedUser?.email || "example@email.com",
        });

        setCallStats([
          {
            icon: <IoCallOutline className="text-blue-700 w-5 h-5" />,
            label: "All Calls",
            value: c.total_calls || 0,
            bgColor: "bg-blue-50"
          },
          {
            icon: <FaPhoneVolume className="text-green-600 w-5 h-5" />,
            label: "Completed Calls",
            value: c.completed_calls || 0,
            bgColor: "bg-green-50"
          },
          {
            icon: <FaCheck className="text-blue-700 w-5 h-5" />,
            label: "Interested Leads",
            value: c.interested_leads || 0,
            bgColor: "bg-blue-50"
          },
          {
            icon: <FaPhoneSlash className="text-red-500 w-5 h-5" />,
            label: "Missed Calls",
            value: c.missed_calls || 0,
            bgColor: "bg-red-50"
          },
          {
            icon: <FaChartLine className="text-green-600 w-5 h-5" />,
            label: "Completion Rate",
            value: c.completion_rate || "0%",
            bgColor: "bg-green-50"
          },
          {
            icon: <FaHourglassHalf className="text-blue-700 w-5 h-5" />,
            label: "Total Duration",
            value: c.total_hours || "0h",
            bgColor: "bg-blue-50"
          },
          {
            icon: <FaCalendarCheck className="text-yellow-600 w-5 h-5" />,
            label: "Average Call Duration",
            value: c.avg_call_duration_minutes || "0 mins",
            bgColor: "bg-yellow-50"
          },
        ]);
      });

    // Fetch and group lead stages (optional; update endpoint as needed)
    fetch(`http://localhost:5000/api/monthly_caller_stats/${caller_id}/leads`)
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.data || []);
      });
  }, [caller_id, navigate, users]);

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
        <div className="flex justify-between items-center px-4 py-2 mt-4">
          <h1 className="text-xl font-bold text-gray-800">Leaderboard</h1>
          <div className="flex items-center gap-2">
            <div className="w-48">
              <Select
                options={users}
                value={selectedUser}
                onChange={(option) => {
                  setSelectedUser(option);
                  navigate(`/report-leaderboard/${option.value}`);
                }}
                placeholder="Select Caller..."
                className="text-sm"
                menuPlacement="auto"
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

        <div className="flex flex-col md:flex-row gap-4 px-4 py-2">
          {/* Left: Leaderboard Card */}
          <div className="flex-1 max-w-2xl">
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-lg text-gray-700">
                  Leaderboard
                </div>
                <FaTrophy className="text-yellow-500" size={24} />
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
          <div className="flex-1 flex flex-col gap-2">
            {/* Profile Card - More compact */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-3 flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-lg font-bold text-purple-700 uppercase">
                {caller.name
                  ? caller.name.split(" ").map((n) => n[0]).join("")
                  : "?"}
              </div>
              <div>
                <div className="font-semibold text-sm">{caller.name || "Caller Name"}</div>
                <div className="text-gray-500 text-xs">{caller.email}</div>
              </div>
            </div>

            {/* Calls Stats - More compact */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
              <div className="font-semibold text-sm text-gray-600 mb-2">Quick Stats</div>
              <div className="grid grid-cols-2 gap-2">
                {callStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md"
                  >
                    <span className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      {stat.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-600">{stat.label}</span>
                      <span className="font-semibold text-sm">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Stage Card - More compact */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
              <div className="font-semibold text-sm text-gray-600 mb-2">Lead Stages</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(leadStageCounts).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        stage === "Won" ? "bg-green-500" :
                        stage === "Lost" ? "bg-red-500" :
                        stage === "Interested" ? "bg-yellow-500" :
                        "bg-gray-400"
                      }`}></span>
                      <span className="text-xs text-gray-700">{stage}</span>
                    </div>
                    <span className="font-semibold text-xs">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}