import React, { useState, useEffect } from "react";
import axios from "axios";
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

  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        const managersList = response.data.data.filter(user => user.role === "manager");
        setManagers(managersList);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
      toast.error("Failed to load managers list");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { name, email, role, password } = formData;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Password validation (at least 6 characters)
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (!name || !email || !role || !password) {
      toast.error("Name, Email, Role, and Password are required fields");
      return false;
    }

    return true;
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
      
      // Convert manager_id to number if it exists, null if empty
      const dataToSend = {
        ...formData,
        manager_id: formData.manager_id ? Number(formData.manager_id) : null
      };

      console.log("Sending data to server:", dataToSend);

      const response = await axios.post(
        "http://localhost:5000/api/users/register", 
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data.user) {
        toast.success(`🎉 User ${response.data.user.name} created successfully!`);
        console.log("Add User Response:", response.data);
        resetForm();
      } else {
        toast.error("Failed to create user: Invalid response format");
      }
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: formData
      });
      
      const errorMessage = error.response?.data?.message || 
                          "Failed to create user. Please check the data and try again.";
      toast.error(`🚫 ${errorMessage}`);
    }
  };

  // 🧼 Inline styles

  const containerStyle = {
    flex: 1,
    padding: "2rem",
    marginLeft: "250px", // sidebar space
    marginTop: "64px",   // Adjusted margin-top to match navbar height
    backgroundColor: "#f3f4f6", // Light gray background
    minHeight: "calc(100vh - 64px)", // Subtract navbar height
    position: "relative",
    zIndex: 1,
    overflow: "auto"     // Add scroll if content is too long
  };

  const headerStyle = {
    position: "relative",
    zIndex: 2,
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%"
  };

  const formCardStyle = {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
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
        <div className="flex justify-between items-center mb-6" style={headerStyle}>
          <h1 className="text-2xl font-bold">Register User</h1>
          <BackButton />
        </div>
        <div style={formCardStyle}>
          <h2 style={formTitleStyle}>Add User</h2>
          
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
            
            <select
              style={inputStyle}
              name="manager_id"
              value={formData.manager_id}
              onChange={handleInputChange}
            >
              <option value="">Select Manager (Optional)</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
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
        <ToastContainer 
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ marginTop: "70px" }} // Add margin to push below navbar
        />
      </div>
    </div>
  );
}

export default AddUser;
