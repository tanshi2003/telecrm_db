import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

function AddUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_no: "",
    password: "",
    role: "",
    status: "Active",
    manager_id: "",
    location: "",
  });

  const [isEditing, setIsEditing] = useState(false); // Optional: toggle if you need editing
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { name, email, role, password } = formData;
    return name && email && role && password;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone_no: "",
      password: "",
      role: "",
      status: "Active",
      manager_id: "",
      location: "",
    });
  };

  const handleAddUser = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/users/register", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User created successfully!");
      console.log("Add User Response:", response.data);

      resetForm();
      // navigate("/users"); // Optional
    } catch (error) {
      if (error.response) {
        console.error("Backend Error:", error.response.data);
        toast.error(error.response.data.message || "Failed to add user.");
      } else {
        console.error("Error adding user:", error.message);
        toast.error("Failed to add user.");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit User" : "Add User"}</h2>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleInputChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleInputChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="text"
        name="phone_no"
        placeholder="Phone Number"
        value={formData.phone_no}
        onChange={handleInputChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleInputChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <select
        name="role"
        value={formData.role}
        onChange={handleInputChange}
        className="w-full p-2 mb-4 border rounded"
      >
        <option value="">Select Role</option>
        <option value="manager">Manager</option>
        <option value="caller">Caller</option>
        <option value="field_employee">Field Employee</option>
      </select>
      <input
        type="number"
        name="manager_id"
        placeholder="Manager ID (Optional)"
        value={formData.manager_id}
        onChange={handleInputChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={handleInputChange}
        className="w-full p-2 mb-4 border rounded"
      />

      <button
        onClick={handleAddUser}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Add User
      </button>
    </div>
  );
}

export default AddUser;
