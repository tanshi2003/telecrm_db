import React, { useEffect, useState } from "react";
import { FaEdit, FaEye, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Select from "react-select";
import SearchBar from "../components/SearchBar";
import TableLoader from "../components/TableLoader";
import Sidebar from "../components/Sidebar";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({ role: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setAdmin(storedUser);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/updateStatus/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: currentStatus === "active" ? "inactive" : "active",
        }),
      });

      if (res.ok) {
        toast.success("✅ Status updated!");
        fetchUsers();
      } else {
        toast.error("❌ Update failed.");
      }
    } catch (err) {
      toast.error("❌ Error updating status.");
    }
  };

  const filteredUsers = users.filter((user) =>
    (!filter.role || user.role === filter.role) &&
    (!filter.status || user.status === filter.status) &&
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative flex min-h-screen">
      <Sidebar user={admin} />

      <main className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="max-w-7xl mx-auto bg-white rounded-md shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">👥 All Users</h2>

          {/* Filter & Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="🔍 Search by username..."
            />
            <Select
              options={[
                { label: "All Roles", value: "" },
                { label: "Manager", value: "manager" },
                { label: "Employee", value: "employee" },
              ]}
              onChange={(e) => setFilter((prev) => ({ ...prev, role: e.value }))}
              placeholder="Filter by Role"
            />
            <Select
              options={[
                { label: "All Status", value: "" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
              onChange={(e) => setFilter((prev) => ({ ...prev, status: e.value }))}
              placeholder="Filter by Status"
            />
          </div>

          {/* Table */}
          {loading ? (
            <TableLoader />
          ) : (
            <div className="overflow-x-auto rounded shadow border">
              <table className="min-w-full text-sm table-auto">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Phone</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{user.userName}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.phoneNumber}</td>
                        <td className="px-4 py-2 capitalize">{user.role}</td>
                        <td className="px-4 py-2 capitalize">{user.status}</td>
                        <td className="px-4 py-2 flex gap-3 items-center text-lg">
                          <FaEye
                            className="text-blue-600 cursor-pointer"
                            title="View Profile"
                          />
                          <FaEdit
                            className="text-green-600 cursor-pointer"
                            title="Edit"
                          />
                          {user.status === "active" ? (
                            <FaToggleOn
                              className="text-red-500 cursor-pointer"
                              title="Deactivate"
                              onClick={() => handleStatusToggle(user._id, user.status)}
                            />
                          ) : (
                            <FaToggleOff
                              className="text-gray-500 cursor-pointer"
                              title="Activate"
                              onClick={() => handleStatusToggle(user._id, user.status)}
                            />
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AllUsers;
