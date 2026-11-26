import React, { useState } from "react";
import { LayoutDashboard, Search, PlusCircle, FileText, Activity, BarChart2, Menu, ChevronLeft, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
const Sidebar = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");
  const handleLogout = () => { localStorage.clear(); navigate("/login"); };
  const getDashboardPath = (r) => ({admin:"/admin",manager:"/manager-dashboard",caller:"/caller-dashboard",field_employee:"/field_employee-dashboard"}[r?.toLowerCase()] || "/");
  const formatRole = (r) => r ? r.toLowerCase().split("_").map(w => w[0].toUpperCase()+w.slice(1)).join(" ") : "";
  const handleCampaignsClick = () => { if (role !== "caller" && role !== "field_employee") navigate(role === "manager" ? "/manager/campaigns" : "/admin/campaigns1"); };
  const menuItems = [
    {icon:LayoutDashboard,label:"Dashboard",path:getDashboardPath(role)},
    {icon:Search,label:"Search",path:"/search",allowedRoles:["admin","manager","caller","field_employee"]},
    {icon:PlusCircle,label:"Add Leads",path:role==="caller"||role==="field_employee"?"/addlead":"/Lead1",allowedRoles:["admin","manager","caller","field_employee"]},
    {icon:FileText,label:"Campaigns",path:"/campaigns",onClick:handleCampaignsClick,allowedRoles:["admin","manager"]},
    {icon:Activity,label:"Activities",path:"/activities",allowedRoles:["admin","manager","caller","field_employee"]},
    {icon:BarChart2,label:"Reports",path:"/reports",allowedRoles:["admin","manager","caller","field_employee"]}
  ];
  const isActive = p => p && (location.pathname===p || location.pathname.startsWith(p+"/"));
  return <aside className={`telecrm-sidebar fixed left-0 z-40 flex flex-col transition-all duration-200 ${isExpanded?"expanded":"collapsed"}`}>
    <div className="sidebar-welcome flex items-center justify-between gap-2">{isExpanded&&<span>Workspace</span>}
      <button type="button" aria-label="Toggle sidebar" onClick={()=>setIsExpanded(!isExpanded)} className="border-0 bg-transparent text-slate-500 p-1 rounded-lg hover:bg-blue-50">{isExpanded?<ChevronLeft size={17}/>:<Menu size={18}/>}</button>
    </div>
    <div className="sidebar-menu flex-1">
      {menuItems.filter(i=>!i.allowedRoles||i.allowedRoles.includes(role?.toLowerCase())).map(({icon:Icon,label,path,onClick})=><button type="button" key={label} title={!isExpanded?label:undefined} className={`sidebar-item border-0 text-left ${isActive(path)?"active":""}`} onClick={onClick||(()=>navigate(path))}><Icon size={18} strokeWidth={2}/>{isExpanded&&<span>{label}</span>}</button>)}
    </div>
    <div className="sidebar-profile relative">
      <button type="button" className={`w-full flex items-center gap-3 border-0 bg-transparent rounded-lg text-left hover:bg-slate-50 p-2 ${isExpanded?"":"justify-center"}`} onClick={()=>setShowDropdown(!showDropdown)}>
        <div className="profile-avatar w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{(localUser?.name||"User").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}</div>
        {isExpanded&&<div className="min-w-0"><div className="profile-name text-sm truncate">{localUser?.name||"User"}</div><div className="profile-role">{formatRole(role)}</div></div>}
      </button>
      {showDropdown&&<div className="absolute bottom-14 left-2 right-2 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-1"><button type="button" onClick={handleLogout} className="w-full flex items-center gap-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 border-0 bg-transparent"><LogOut size={16}/>Sign out</button></div>}
    </div>
  </aside>;
};
export default Sidebar;