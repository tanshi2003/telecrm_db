// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const defaultLeadStatuses = [
//   "New", "Contacted", "Follow-Up Scheduled", "Interested", "Not Interested", "Call Back Later", "Under Review", "Converted", "Lost", "Not Reachable", "On Hold"
// ];
// const defaultLeadCategories = [
//   "Fresh Lead", "Bulk Lead", "Cold Lead", "Warm Lead", "Hot Lead", "Converted Lead", "Lost Lead", "Walk-in Lead", "Re-Targeted Lead", "Campaign Lead"
// ];
// const userRoles = ["Admin", "Manager", "Caller", "Field Employee"];
// const userStatuses = ["Active", "Inactive", "On Leave"];
// const campaignStatuses = ["Ongoing", "Completed", "Paused"];
// const campaignPriorities = ["High", "Medium", "Low"];

// const Filters = ({ type = "users", onApply, onReset, removeWorkingHours }) => {
//   // Common states
//   const [search, setSearch] = useState("");
//   const [dateRange, setDateRange] = useState({ start: "", end: "" });

//   // Leads
//   const [status, setStatus] = useState("");
//   const [category, setCategory] = useState("");
//   const [assignedTo, setAssignedTo] = useState("");
//   const [campaign, setCampaign] = useState("");
//   const [users, setUsers] = useState([]);
//   const [campaigns, setCampaigns] = useState([]);

//   // Users
//   const [role, setRole] = useState("");
//   const [userStatus, setUserStatus] = useState("");
//   const [location, setLocation] = useState("");
//   const [manager, setManager] = useState("");
//   const [performance, setPerformance] = useState("");
//   const [workingHours, setWorkingHours] = useState({ min: "", max: "" });

//   // Campaigns
//   const [campStatus, setCampStatus] = useState("");
//   const [priority, setPriority] = useState("");
//   const [createdBy, setCreatedBy] = useState("");
//   const [usersAssigned, setUsersAssigned] = useState("");
//   const [leadCount, setLeadCount] = useState({ min: "", max: "" });
//   const [admins, setAdmins] = useState([]);

//   // Fetch users/campaigns/admins as needed
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (type === "leads" || type === "users" || type === "campaigns") {
//       axios.get("http://localhost:5000/api/users", { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => setUsers(res.data?.data || []))
//         .catch(() => {});
//     }
//     if (type === "leads" || type === "campaigns") {
//       axios.get("http://localhost:5000/api/campaigns", { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => setCampaigns(res.data?.data || []))
//         .catch(() => {});
//     }
//     if (type === "users") {
//       // Managers for manager dropdown
//       axios.get("http://localhost:5000/api/users?role=Manager", { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => setManagers(res.data?.data || []))
//         .catch(() => {});
//     }
//     if (type === "campaigns") {
//       // Admins for createdBy dropdown
//       axios.get("http://localhost:5000/api/users?role=Admin", { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => setAdmins(res.data?.data || []))
//         .catch(() => {});
//     }
//   }, [type]);

//   // Reset all fields
//   const handleReset = () => {
//     setSearch("");
//     setDateRange({ start: "", end: "" });
//     setStatus("");
//     setCategory("");
//     setAssignedTo("");
//     setCampaign("");
//     setRole("");
//     setUserStatus("");
//     setLocation("");
//     setManager("");
//     setPerformance("");
//     setWorkingHours({ min: "", max: "" });
//     setCampStatus("");
//     setPriority("");
//     setCreatedBy("");
//     setUsersAssigned("");
//     setLeadCount({ min: "", max: "" });
//     if (onReset) onReset();
//   };

//   // Apply filters
//   const handleApply = () => {
//     let filters = {};
//     if (type === "leads") {
//       filters = { status, category, assignedTo, campaign, dateRange, search };
//     } else if (type === "users") {
//       filters = { role, status: userStatus, location, manager, performance, workingHours, search };
//     } else if (type === "campaigns") {
//       filters = { status: campStatus, priority, createdBy, dateRange, usersAssigned, leadCount, search };
//     }
//     if (onApply) onApply(filters);
//   };

//   // Render fields by type
//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
//         <h1 className="text-3xl font-bold text-blue-600 mb-6 capitalize">{type} Filters</h1>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           {/* LEADS FILTERS */}
//           {type === "leads" && <>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Status</label>
//               <select className="w-full border rounded p-2" value={status} onChange={e => setStatus(e.target.value)}>
//                 <option value="">All</option>
//                 {defaultLeadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Lead Category</label>
//               <select className="w-full border rounded p-2" value={category} onChange={e => setCategory(e.target.value)}>
//                 <option value="">All</option>
//                 {defaultLeadCategories.map(c => <option key={c} value={c}>{c}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Assigned To</label>
//               <select className="w-full border rounded p-2" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
//                 <option value="">All</option>
//                 {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Campaign</label>
//               <select className="w-full border rounded p-2" value={campaign} onChange={e => setCampaign(e.target.value)}>
//                 <option value="">All</option>
//                 {campaigns.map(camp => <option key={camp.id} value={camp.name}>{camp.name}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Date Range</label>
//               <div className="flex gap-2">
//                 <input className="w-full border rounded p-2" type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
//                 <input className="w-full border rounded p-2" type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
//               </div>
//             </div>
//             <div className="md:col-span-2">
//               <label className="block text-sm font-semibold mb-1">Search</label>
//               <input className="w-full border rounded p-2" type="text" placeholder="Search by name, phone, address, or notes..." value={search} onChange={e => setSearch(e.target.value)} />
//             </div>
//           </>}

//           {/* USERS FILTERS */}
//           {type === "users" && <>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Role</label>
//               <select className="w-full border rounded p-2" value={role} onChange={e => setRole(e.target.value)}>
//                 <option value="">All</option>
//                 {userRoles.map(r => <option key={r} value={r}>{r}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Status</label>
//               <select className="w-full border rounded p-2" value={userStatus} onChange={e => setUserStatus(e.target.value)}>
//                 <option value="">All</option>
//                 {userStatuses.map(s => <option key={s} value={s}>{s}</option>)}
//               </select>
//             </div>
//             <div className="md:col-span-2">
//               <label className="block text-sm font-semibold mb-1">Search by Name, Email, Phone</label>
//               <input className="w-full border rounded p-2" type="text" placeholder="Search by Name, Email, Phone..." value={search} onChange={e => setSearch(e.target.value)} />
//             </div>
//           </>}

//           {/* CAMPAIGNS FILTERS */}
//           {type === "campaigns" && <>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Status</label>
//               <select className="w-full border rounded p-2" value={campStatus} onChange={e => setCampStatus(e.target.value)}>
//                 <option value="">All</option>
//                 {campaignStatuses.map(s => <option key={s} value={s}>{s}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Priority</label>
//               <select className="w-full border rounded p-2" value={priority} onChange={e => setPriority(e.target.value)}>
//                 <option value="">All</option>
//                 {campaignPriorities.map(p => <option key={p} value={p}>{p}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Created By</label>
//               <select className="w-full border rounded p-2" value={createdBy} onChange={e => setCreatedBy(e.target.value)}>
//                 <option value="">All</option>
//                 {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Date Range</label>
//               <div className="flex gap-2">
//                 <input className="w-full border rounded p-2" type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
//                 <input className="w-full border rounded p-2" type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Users Assigned</label>
//               <select className="w-full border rounded p-2" value={usersAssigned} onChange={e => setUsersAssigned(e.target.value)}>
//                 <option value="">All</option>
//                 {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold mb-1">Lead Count</label>
//               <div className="flex gap-2">
//                 <input className="w-full border rounded p-2" type="number" min="0" placeholder="Min" value={leadCount.min} onChange={e => setLeadCount({ ...leadCount, min: e.target.value })} />
//                 <input className="w-full border rounded p-2" type="number" min="0" placeholder="Max" value={leadCount.max} onChange={e => setLeadCount({ ...leadCount, max: e.target.value })} />
//               </div>
//             </div>
//             <div className="md:col-span-2">
//               <label className="block text-sm font-semibold mb-1">Search</label>
//               <input className="w-full border rounded p-2" type="text" placeholder="Search by campaign name or description..." value={search} onChange={e => setSearch(e.target.value)} />
//             </div>
//           </>}
//         </div>
//         <div className="flex gap-4 justify-end">
//           <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleApply}>
//             Apply Filters
//           </button>
//           <button className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={handleReset}>
//             Reset
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Filters;
