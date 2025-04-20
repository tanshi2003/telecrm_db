import React, { useState } from "react";
import {
  LayoutDashboard,
  UserCircle,
  Phone,
  Megaphone,
  BarChart2,
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear all stored data
    navigate("/login"); // Redirect to login page
  };

  // Calculate initials dynamically if not provided
  const getInitials = (name) => {
    if (!name) return "U"; // Default to "U" for "User"
    const nameParts = name
      .trim()
      .split(/\s+/) // Split by one or more spaces
      .filter((part) => part.length > 0); // Remove empty parts
    const initials = nameParts
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2); // Limit to 2 characters
    return initials;
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { icon: <UserCircle size={20} />, label: "Users" },
    { icon: <Phone size={20} />, label: "Leads" },
    { icon: <Megaphone size={20} />, label: "Campaigns" },
    { icon: <BarChart2 size={20} />, label: "Analytics" },
    { icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <div
      className={`fixed top-13 left-0 bg-white border-r shadow-lg transition-all duration-300 ease-in-out flex flex-col ${
        isExpanded ? "w-64" : "w-20"
      } h-[calc(100vh-64px)] z-50`}
    >
      {/* Top section: Welcome + toggle */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        {isExpanded && (
          <p className="text-gray-800 text-sm font-semibold truncate">
            Welcome, {user?.name || "User"}
          </p>
        )}
        <button onClick={toggleSidebar} className="text-gray-600 hover:text-black">
          {isExpanded ? <ChevronLeft /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Menu Items */}
      <div className="flex-1 mt-2 space-y-1">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center ${
              isExpanded ? "gap-4 px-4 py-3" : "justify-center p-3"
            } cursor-pointer text-gray-700 hover:bg-gray-100 transition-all rounded-md`}
          >
            <span className="text-gray-700">{item.icon}</span>
            {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
          </div>
        ))}
      </div>

      {/* Profile Section */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 relative">
        <div
          className={`flex items-center cursor-pointer ${
            isExpanded ? "gap-4" : "justify-center"
          }`}
          onClick={() => setShowDropdown(!showDropdown)} // Toggle dropdown visibility
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-full flex items-center justify-center font-semibold shadow-md">
            {getInitials(user?.name)}
          </div>
          {isExpanded && (
            <div className="truncate">
              <p className="text-sm font-semibold text-gray-800">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || "Role"}</p>
            </div>
          )}
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-3 bottom-14 bg-white border rounded shadow-lg w-40 z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;