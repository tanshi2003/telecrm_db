import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";

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

  const [isEditing, setIsEditing] = useState(false);
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

      toast.success("🎉 User created successfully!");
      console.log("Add User Response:", response.data);
      resetForm();
    } catch (error) {
      if (error.response) {
        console.error("Backend Error:", error.response.data);
        toast.error(error.response.data.message || "Failed to add user.");
      } else {
        console.error("Error adding user:", error.message);
        toast.error("🚫 Error creating user. Try again.");
      }
    }
  };

  // 🧼 Inline styles

  const containerStyle = {
    flex: 1,
    padding: "2rem",
    marginLeft: "250px", // sidebar space
    backgroundColor: "#fff", // White bg fix here
    minHeight: "100vh",      // full viewport height so bg is consistent
  };

  const formCardStyle = {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "2rem",
    maxWidth: "800px",
    margin: "3rem auto 0 auto",
  };

  const formTitleStyle = {
    fontSize: "1.5rem",
    marginBottom: "1.5rem",
    fontWeight: "600",
    color: "#333",
  };

  const formGridStyle = {
    display: "grid",
    gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "1fr 1fr",
    gap: "1rem",
  };

  const inputStyle = {
    padding: "0.7rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "100%",
    fontSize: "1rem",
  };

  const buttonStyle = {
    marginTop: "2rem",
    padding: "0.8rem 1.5rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
  };

  return (
    <div className="d-flex">
      <Sidebar />
      
      <div style={containerStyle}>
        <div style={formCardStyle}>
          <h2 style={formTitleStyle}>{isEditing ? "Edit User" : "Add User"}</h2>
          
          <div style={formGridStyle}>
            <input
              style={inputStyle}
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <input
              style={inputStyle}
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <input
              style={inputStyle}
              type="text"
              name="phone_no"
              placeholder="Phone Number"
              value={formData.phone_no}
              onChange={handleInputChange}
            />
            <input
              style={inputStyle}
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <select
              style={inputStyle}
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="">Select Role</option>
              <option value="manager">Manager</option>
              <option value="caller">Caller</option>
              <option value="field_employee">Field Employee</option>
            </select>
            
            <input
              style={inputStyle}
              type="text"
              name="manager_id"
              placeholder="Manager Name (Optional)"
              value={formData.manager_id}
              onChange={handleInputChange}
            />
            <input
              style={inputStyle}
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleInputChange}
            />
          </div>
          
          <button onClick={handleAddUser} style={buttonStyle}>
            Add User
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop />
      </div>
    </div>
  );
}

export default AddUser;
