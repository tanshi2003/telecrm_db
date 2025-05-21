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
  BarChart,
  PhoneCall,
  Users,
  ClipboardList, // Icon for My Leads
  PhoneIncoming, // Icon for My Calls
} from "lucide-react"; // Added new icons for filters dropdown
import { useNavigate } from "react-router-dom";

import axios from "axios"; // Import axios for API calls

const Sidebar = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false); // Used for profile dropdown
  const [showAddLeadOptions, setShowAddLeadOptions] = useState(false); // Add Leads dropdown
  const [showCampaignOptions, setShowCampaignOptions] = useState(false); // Campaign dropdown
  const [showReportOptions, setShowReportOptions] = useState(false); // Reports dropdown
  const [showActivityOptions, setShowActivityOptions] = useState(false); // Activity dropdown
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  const [campaigns, setCampaigns] = useState([]); // State to store campaigns
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages

  const addLeadsBtnRef = useRef(null);
  const campaignBtnRef = useRef(null);
  const reportBtnRef = useRef(null);
  const activityBtnRef = useRef(null);
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");
  //console.log("Role from localStorage:",localStorage);

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

  const handleAddLeadsClick = () => {
    if (addLeadsBtnRef.current) {
      const rect = addLeadsBtnRef.current.getBoundingClientRect();
      const sidebarWidth = isExpanded ? 64 : 20; // Adjust based on sidebar width
      setDropdownCoords({
        top: rect.top + window.scrollY + 7, // Add scroll offset for proper positioning
        left: rect.left + sidebarWidth + 90, // Shifted to the right
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

  const handleCampaignNavigation = (campaignId = null) => {
    setShowCampaignOptions(false);
    if (campaignId) {
      navigate(`/campaign/${campaignId}`);
    } else {
      navigate('/manage-campaigns');
    }
  };

  const handleReportClick = () => {
    if (reportBtnRef.current) {
      const rect = reportBtnRef.current.getBoundingClientRect();
      const sidebarWidth = isExpanded ? 64 : 20; // Adjust based on sidebar width
      setDropdownCoords({
        top: rect.top + window.scrollY , // Add scroll offset for proper positioning
        left: rect.left + sidebarWidth + 50, // Shifted to the right
      });
    }
    setShowReportOptions((prev) => !prev);
  };

  const handleActivityClick = () => {
    if (activityBtnRef.current) {
      const rect = activityBtnRef.current.getBoundingClientRect();
      const sidebarWidth = isExpanded ? 64 : 20; // Adjust based on sidebar width
      setDropdownCoords({
        top: rect.top + window.scrollY + 10, // Add scroll offset for proper positioning
        left: rect.left + sidebarWidth + 50, // Shifted to the right
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
        console.error("Token expired or invalid. Redirecting to login.");
        localStorage.removeItem("token"); // Clear the token
        window.location.href = "/login"; // Redirect to login page
      } else {
        console.error("Error fetching campaigns:", error);
        setErrorMessage("Failed to load campaigns.");
      }
    }
  };

  useEffect(() => {
    if (showCampaignOptions) {
      fetchCampaigns(); // Fetch campaigns when the dropdown is opened
    }
  }, [showCampaignOptions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        addLeadsBtnRef.current &&
        !addLeadsBtnRef.current.contains(e.target)
      ) {
        setShowAddLeadOptions(false);
      }
      if (
        campaignBtnRef.current &&
        !campaignBtnRef.current.contains(e.target)
      ) {
        setShowCampaignOptions(false);
      }
      if (
        reportBtnRef.current &&
        !reportBtnRef.current.contains(e.target)
      ) {
        setShowReportOptions(false);
      }
      if (
        activityBtnRef.current &&
        !activityBtnRef.current.contains(e.target)
      ) {
        setShowActivityOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDashboardPath = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'manager':
        return '/manager-dashboard';
      case 'caller':
        return '/caller';
      default:
        return '/';
    }
  };

  const handleDashboardClick = () => {
    const path = getDashboardPath(role);
    navigate(path);
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

        {/* Sidebar Menu Items */}
        <div className="flex-1 py-4">
          {[
            { 
              icon: LayoutDashboard, 
              label: "Dashboard", 
              onClick: handleDashboardClick
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
              label: "Activities",
              isActivity: true,
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
            },
          ].map(({ icon: Icon, label, path, onClick, isAddLeads, isCampaign, isReport, isActivity }) => (
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
                  : onClick
                  ? onClick
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
    {/* Arrow on the left */}
    <div
      className="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-t transform rotate-45 z-40"
    ></div>
    
    <div className="text-gray-800 text-sm font-semibold mb-2">
      Add Leads
    </div>

    {/* Add Single Lead */}
    <div
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        console.log("Add Single Lead clicked");
        console.log("Current user role:", role);
        console.log("Current user:", localUser);
        
        // Close dropdown first
        setShowAddLeadOptions(false);
        
        // Check if user has permission
        const allowedRoles = ["admin", "manager", "caller", "field_employee"];
        if (!allowedRoles.map(r => r.toLowerCase()).includes(role?.toLowerCase())) {
          console.log("User does not have permission to access Lead1");
          alert("You do not have permission to access this page");
          return;
        }
        
        // Navigate to Lead1
        navigate("/Lead1");
      }}
    >
      <UserPlus size={16} className="text-blue-500" />
      <span className="text-sm text-gray-800">Add Single Lead</span>
    </div>

    {/* Add From Excel */}
    <div
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
      onClick={() => navigate("/excelupload")}
    >
      <FilePlus size={16} className="text-green-500" />
      <span className="text-sm text-gray-800">Add From Excel</span>
    </div>
  </div>
)}


      {/* Campaigns Dropdown */}
      {showCampaignOptions && (
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
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-800 text-sm font-semibold">
              Campaigns
            </span>
            <button
              className="text-blue-500 text-xs hover:underline"
              onClick={() => handleCampaignNavigation()}
            >
              See All
            </button>
          </div>
          {campaigns.slice(0, 3).map((campaign, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => handleCampaignNavigation(campaign.id)}
            >
              <FileText size={16} className="text-gray-500" />
              <span className="text-sm text-gray-800">{campaign.name}</span>
            </div>
          ))}
          {errorMessage && (
            <div className="text-red-500 text-xs mt-2">{errorMessage}</div>
          )}
        </div>
      )}

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
    </>
  );
};

export default Sidebar;