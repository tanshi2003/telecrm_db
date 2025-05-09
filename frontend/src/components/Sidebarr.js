import React, { useState } from "react";
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  FileText,
  Activity,
  Filter,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Menu,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false); // Used for profile dropdown
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const nameParts = name
      .trim()
      .split(/\s+/)
      .filter((part) => part.length > 0);
    const initials = nameParts
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
    return initials;
  };

  const formatRole = (role) => {
    if (!role) return "Role";
    return role
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const toggleDropdown = (label) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleDropdownClick = (item) => {
    if (item.label === "Add Lead from Excel") {
      navigate("/add-lead-excel");
    } else if (item.label === "Add Lead Manually") {
      navigate("/add-lead-manual");
    }
  };

  return (
    <div
      className={`fixed top-16 left-0 bg-white border-r shadow-lg transition-all duration-300 ease-in-out flex flex-col ${
        isExpanded ? "w-64" : "w-20"
      } h-[calc(100vh-64px)] overflow-y-auto z-40`}
    >
      {/* Top section */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        {isExpanded && (
          <p className="text-gray-800 text-sm font-semibold truncate">
            Welcome, {localUser?.name || "User"}
          </p>
        )}
        <button onClick={toggleSidebar} className="text-gray-600 hover:text-black">
          {isExpanded ? <ChevronLeft /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Menu Items */}
      <div className="flex-1 mt-2 space-y-1">
        {[
          { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
          { icon: Search, label: "Search", path: "/search" },
          {
            icon: PlusCircle,
            label: "Add Leads",
            dropdown: [
              { label: "Add Lead from Excel" },
              { label: "Add Lead Manually" },
            ],
          },
          { icon: FileText, label: "Campaigns", path: "/admin/campaigns" },
          { icon: Activity, label: "Activities", path: "/activities" },
          { icon: Filter, label: "Filters", path: "/filters" },
          { icon: BarChart2, label: "Reports", path: "/reports" },
        ].map(({ icon: Icon, label, dropdown, path }) => (
          <div key={label} className="relative">
            <div
              className={`flex items-center ${
                isExpanded ? "gap-4 px-4 py-3" : "justify-center p-3"
              } cursor-pointer text-gray-700 hover:bg-gray-100 transition-all rounded-md`}
              onClick={() => (dropdown ? toggleDropdown(label) : path && navigate(path))}
            >
              <Icon size={20} />
              {isExpanded && (
                <span className="text-sm font-medium flex-1">{label}</span>
              )}
              {dropdown && isExpanded && (
                <span>
                  {activeDropdown === label ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              )}
            </div>

            {/* Dropdown Menu */}
            {dropdown && activeDropdown === label && (
              <div className="absolute top-0 left-full ml-2 bg-white border shadow-lg rounded-md w-48 z-50">
                {dropdown.map((item) => (
                  <div
                    key={item.label}
                    onClick={() => handleDropdownClick(item)}
                    className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer px-4 py-2 hover:bg-gray-100"
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Profile Section */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 relative">
        <div
          className={`flex items-center cursor-pointer ${
            isExpanded ? "gap-4" : "justify-center"
          }`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-full flex items-center justify-center font-semibold shadow-md">
            {getInitials(localUser?.name || "User")}
          </div>
          {isExpanded && (
            <div className="truncate">
              <p className="text-sm font-semibold text-gray-800">{localUser?.name || "User"}</p>
              <p className="text-xs text-gray-500 capitalize">{formatRole(role)}</p>
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
