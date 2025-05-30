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
  UserPlus,
  FilePlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ user }) => {
  // State management
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddLeadOptions, setShowAddLeadOptions] = useState(false);
  const [showCampaignOptions, setShowCampaignOptions] = useState(false);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [showActivityOptions, setShowActivityOptions] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  const [campaigns, setCampaigns] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Refs
  const addLeadsBtnRef = useRef(null);
  const campaignBtnRef = useRef(null);
  const reportBtnRef = useRef(null);
  const activityBtnRef = useRef(null);

  // Navigation
  const navigate = useNavigate();

  const role = user?.role;
  const displayName = user?.name || "User";

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

  const handleAddLeadsClick = () => {
    if (addLeadsBtnRef.current) {
      const rect = addLeadsBtnRef.current.getBoundingClientRect();
      const sidebarWidth = isExpanded ? 64 : 20;
      setDropdownCoords({
        top: rect.top + window.scrollY + 7,
        left: rect.left + sidebarWidth + 90,
      });
    }
    setShowAddLeadOptions((prev) => !prev);
  };

  const handleCampaignClick = () => {
    if (campaignBtnRef.current) {
      const rect = campaignBtnRef.current.getBoundingClientRect();
      const sidebarWidth = isExpanded ? 64 : 20;
      setDropdownCoords({
        top: rect.top + window.scrollY + 10,
        left: rect.left + sidebarWidth + 50,
      });
    }
    setShowCampaignOptions((prev) => !prev);
  };

  const handleReportClick = () => {
    if (reportBtnRef.current) {
      const rect = reportBtnRef.current.getBoundingClientRect();
      const sidebarWidth = isExpanded ? 64 : 20;
      setDropdownCoords({
        top: rect.top + window.scrollY,
        left: rect.left + sidebarWidth + 50,
      });
    }
    setShowReportOptions((prev) => !prev);
  };

  const handleActivityClick = () => {
    if (activityBtnRef.current) {
      const rect = activityBtnRef.current.getBoundingClientRect();
      const sidebarWidth = isExpanded ? 64 : 20;
      setDropdownCoords({
        top: rect.top + window.scrollY + 10,
        left: rect.left + sidebarWidth + 50,
      });
    }
    setShowActivityOptions((prev) => !prev);
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/campaigns", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCampaigns(response.data.data || []);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        setErrorMessage("Failed to load campaigns.");
      }
    }
  };

  useEffect(() => {
    if (showCampaignOptions) {
      fetchCampaigns();
    }
  }, [showCampaignOptions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addLeadsBtnRef.current && !addLeadsBtnRef.current.contains(e.target)) {
        setShowAddLeadOptions(false);
      }
      if (campaignBtnRef.current && !campaignBtnRef.current.contains(e.target)) {
        setShowCampaignOptions(false);
      }
      if (reportBtnRef.current && !reportBtnRef.current.contains(e.target)) {
        setShowReportOptions(false);
      }
      if (activityBtnRef.current && !activityBtnRef.current.contains(e.target)) {
        setShowActivityOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.trim().split(/\s+/).filter((part) => part.length > 0);
    const initials = nameParts.map((part) => part[0]?.toUpperCase()).join("").slice(0, 2);
    return initials;
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

  return (
    <>
      <div
        className={`fixed top-16 left-0 bg-white border-r shadow-lg transition-all duration-300 ease-in-out flex flex-col ${
          isExpanded ? "w-64" : "w-20"
        } h-[calc(100vh-64px)] overflow-y-auto z-40`}
      >
        {/* Top section */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          {isExpanded && (
            <p className="text-gray-800 text-sm font-semibold truncate">
              Welcome, {displayName}
            </p>
          )}
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-black"
          >
            {isExpanded ? <ChevronLeft /> : <Menu />}
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <div className="flex-1 mt-2">
          {[
            {
              icon: LayoutDashboard,
              label: "Dashboard",
              path: getDashboardPath(role),
            },
            { icon: Search, label: "Search", path: "/search" },
            {
              icon: PlusCircle,
              label: "Add Leads",
              isAddLeads: true,
            },
            {
              icon: FileText,
              label: "Campaigns",
              isCampaign: true,
            },
            {
              icon: Activity,
              label: "Activities", path: "/activity",
            },
            {
              icon: Filter,
              label: "Filters",
              path: "/filters",
            },
            {
              icon: BarChart2,
              label: "Reports", path: "/report",
            },
          ].map(
            ({
              icon: Icon,
              label,
              isAddLeads,
              isCampaign,
              isReport,
              isActivity,
              path,
            }) => (
              <div
                key={label}
                ref={
                  isAddLeads
                    ? addLeadsBtnRef
                    : isCampaign
                    ? campaignBtnRef
                    : isReport
                    ? reportBtnRef
                    : isActivity
                    ? activityBtnRef
                    : null
                }
                className={`group relative flex items-center ${
                  isExpanded ? "gap-4 px-4 py-3" : "justify-center p-3"
                } cursor-pointer text-gray-700 hover:bg-gray-100 transition-all rounded-md ${
                  (isAddLeads && showAddLeadOptions) ||
                  (isCampaign && showCampaignOptions) ||
                  (isReport && showReportOptions) ||
                  (isActivity && showActivityOptions)
                    ? "bg-gray-200"
                    : ""
                }`}
                onClick={
                  isAddLeads
                    ? handleAddLeadsClick
                    : isCampaign
                    ? handleCampaignClick
                    : isReport
                    ? handleReportClick
                    : isActivity
                    ? handleActivityClick
                    : path
                    ? () => navigate(path)
                    : undefined
                }
              >
                <Icon size={20} />
                {isExpanded && (
                  <span className="text-sm font-medium">{label}</span>
                )}
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
              {getInitials(displayName)}
            </div>
            {isExpanded && (
              <div className="truncate">
                <p className="text-sm font-semibold text-gray-800">
                  {displayName}
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
      </div>

      {/* Add Leads Dropdown */}
      {showAddLeadOptions && (
        <div
          className="fixed bg-white border rounded shadow-lg z-50 w-56 p-2"
          style={{
            top: `${dropdownCoords.top}px`,
            left: `${dropdownCoords.left}px`,
          }}
        >
          <div className="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-t transform rotate-45 z-40"></div>
          <div className="text-gray-800 text-sm font-semibold mb-2">
            Add Leads
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setShowAddLeadOptions(false);
              const allowedRoles = [
                "admin",
                "manager",
                "caller",
                "field_employee",
              ];
              if (
                !allowedRoles
                  .map((r) => r.toLowerCase())
                  .includes(role?.toLowerCase())
              ) {
                alert("You do not have permission to access this page");
                return;
              }
              navigate("/Lead1");
            }}
          >
            <UserPlus size={16} className="text-blue-500" />
            <span className="text-sm text-gray-800">Add Single Lead</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => navigate("/excelupload")}
          >
            <FilePlus size={16} className="text-green-500" />
            <span className="text-sm text-gray-800">Add From Excel</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;