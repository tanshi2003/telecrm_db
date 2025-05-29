import React, { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  FileText,
  Activity,
  Filter,
  BarChart2,
  Menu,
  ChevronLeft,
  LogOut,
  BarChart,
  PhoneCall,
  Users,
  ClipboardList,
  PhoneIncoming,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ user }) => {
  // State management
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showActivityOptions, setShowActivityOptions] = useState(false);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });

  // Refs
  const reportBtnRef = useRef(null);
  const activityBtnRef = useRef(null);

  // Navigation
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");

  // Utility functions
  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getDashboardPath = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "/admin";
      case "manager":
        return "/manager-dashboard";
      case "caller":
        return "/caller-dashboard";
      case "field_employee":
        return "/field-dashboard";
      default:
        return "/";
    }
  };

  const handleDashboardClick = () => {
    const path = getDashboardPath(role);
    navigate(path);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRole = (role) => {
    if (!role) return "";
    return role
      .toLowerCase()
      .split("_")
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  // Add useEffect for positioning dropdowns
  useEffect(() => {
    const updateDropdownPosition = () => {
      if (reportBtnRef.current && showReportOptions) {
        const rect = reportBtnRef.current.getBoundingClientRect();
        setDropdownCoords({
          top: rect.bottom + window.scrollY,
          left: rect.right + 10,
        });
      }
      if (activityBtnRef.current && showActivityOptions) {
        const rect = activityBtnRef.current.getBoundingClientRect();
        setDropdownCoords({
          top: rect.bottom + window.scrollY,
          left: rect.right + 10,
        });
      }
    };

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    return () => window.removeEventListener("resize", updateDropdownPosition);
  }, [showReportOptions, showActivityOptions]);

  // Move menuItems here, after handleDashboardClick is defined
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      onClick: handleDashboardClick,
    },
    { icon: Search, label: "Search", path: "/search" },
    {
      icon: PlusCircle,
      label: "Add Leads",
      path: "/Lead1",
    },
    {
      icon: FileText,
      label: "Campaigns",
      path: "/admin/campaigns1",
    },
    {
      icon: Activity,
      label: "Activities",
      isActivity: true,
      onClick: () => setShowActivityOptions((prev) => !prev),
    },
    {
      icon: Filter,
      label: "Filters",
      path: "/filters",
    },
    {
      icon: BarChart2,
      label: "Reports",
      isReport: true,
      onClick: () => setShowReportOptions((prev) => !prev),
    },
  ];

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
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-black"
        >
          {isExpanded ? <ChevronLeft /> : <Menu />}
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-4">
        {menuItems.map(
          ({ icon: Icon, label, path, onClick, isReport, isActivity }) => (
            <div
              key={label}
              ref={isReport ? reportBtnRef : isActivity ? activityBtnRef : null}
              className={`group relative flex items-center ${
                isExpanded ? "gap-4 px-4 py-3" : "justify-center p-3"
              } cursor-pointer text-gray-700 hover:bg-gray-100 transition-all rounded-md`}
              onClick={onClick || (path ? () => navigate(path) : undefined)}
            >
              <Icon size={20} />
              {isExpanded && <span className="text-sm font-medium">{label}</span>}
              {!isExpanded && (
                <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {label}
                </span>
              )}
            </div>
          )
        )}
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
              <p className="text-sm font-semibold text-gray-800">
                {localUser?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {formatRole(role)}
              </p>
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

      {/* Reports Dropdown */}
      {showReportOptions && (
        <div
          className="fixed bg-white border rounded shadow-lg z-50 w-56 p-2"
          style={{
            top: `${dropdownCoords.top}px`,
            left: `${dropdownCoords.left}px`,
          }}
        >
          {/* Arrow on the left */}
          <div
            className="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-t transform rotate-45 z-40"
          ></div>
          <div className="text-gray-800 text-sm font-semibold mb-2">
            Reports
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => navigate("/leader-board")}
          >
            <BarChart size={16} className="text-gray-500" />
            <span className="text-sm text-gray-800">Leader Board</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => navigate("/call-report")}
          >
            <PhoneCall size={16} className="text-gray-500" />
            <span className="text-sm text-gray-800">Call Report</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => navigate("/leads-report")}
          >
            <Users size={16} className="text-gray-500" />
            <span className="text-sm text-gray-800">Leads Report</span>
          </div>
        </div>
      )}

      {/* Activity Dropdown */}
      {showActivityOptions && (
        <div
          className="fixed bg-white border rounded shadow-lg z-50 w-56 p-2"
          style={{
            top: `${dropdownCoords.top}px`,
            left: `${dropdownCoords.left}px`,
          }}
        >
          {/* Arrow on the left */}
          <div
            className="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-t transform rotate-45 z-40"
          ></div>
          <div className="text-gray-800 text-sm font-semibold mb-2">
            Activities
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => navigate("/my-leads")}
          >
            <ClipboardList size={16} className="text-blue-500" />
            <span className="text-sm text-gray-800">My Leads</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => navigate("/my-calls")}
          >
            <PhoneIncoming size={16} className="text-green-500" />
            <span className="text-sm text-gray-800">My Calls</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;