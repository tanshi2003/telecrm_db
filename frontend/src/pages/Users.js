import React, { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/getUsers");
        const data = await response.json();
  
        console.log("🔹 API Response:", data);  // ✅ Log full response
        console.log("🔹 Users:", data.users);   // ✅ Log user array
  
        if (data.success === true) {  // ✅ Explicit check for `true`
          setUsers(data.users);
        } else {
          console.error("⚠️ API response did not return success: ", data);
        }
      } catch (error) {
        console.error("❌ Error fetching users:", error);
      }
    };
  
    fetchUsers();
  }, []);  

  return (
    <div className="container mt-4">
      <h1 className="mb-3">User Dashboard</h1>
      <table className="table table-striped table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Username</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Field Work Type</th>
          </tr>
        </thead>
        <tbody>
  {users.length > 0 ? (
    users.map((user) => (
      <tr key={user.id}>
        <td>{user.userName || "N/A"}</td>   {/* ✅ Fixing undefined values */}
        <td>{user.first_name || "N/A"}</td> {/* ✅ Correct database field */}
        <td>{user.last_name || "N/A"}</td>
        <td>{user.email || "N/A"}</td>
        <td>{user.phone_number || "N/A"}</td>
        <td>{user.role || "N/A"}</td>
        <td>{user.fieldWorkType || "N/A"}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="text-center">No users found.</td>
    </tr>
  )}
</tbody>
      </table>
    </div>
  );
}

export default Users;
