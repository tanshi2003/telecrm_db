import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import "bootstrap/dist/css/bootstrap.min.css";

function AddUser() {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [fieldWorkType, setFieldWorkType] = useState(""); // Only for employees
  const navigate = useNavigate();
const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { name, email, role } = formData;
    return name && email && role;
  };
  const handleAddUser = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/users/register", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Add User Response:", response.data); // Log the response

      fetchUsers();
      resetForm();
      setSuccessMessage("User created successfully!");
    } catch (error) {
      if (error.response) {
        console.error("Backend Error:", error.response.data);
        setErrorMessage(error.response.data.message || "Failed to add user.");
      } else {
        console.error("Error adding user:", error.message);
        setErrorMessage("Failed to add user.");
      }
    }
  };
  return (
    <div className="container add-user-container">
      <h1>Add User</h1>
      <form onSubmit={handleAddUser}>
        <input
          type="text"
          className="form-control"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="text"
          className="form-control"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
        />
        <input
          type="text"
          className="form-control"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
        />
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="tel"
          className="form-control"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Phone Number"
          required
        />

        {/* Role Selection */}
        <select
          className="form-control"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="">Select Role</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>

        {/* Field Work Type (Only for Employees) */}
        {role === "employee" && (
          <select
            className="form-control"
            value={fieldWorkType}
            onChange={(e) => setFieldWorkType(e.target.value)}
            required
          >
            <option value="">Select Field Work Type</option>
            <option value="field">Field Work</option>
            <option value="desk">Desk Job</option>
          </select>
        )}

        <button type="submit" className="btn btn-primary mt-3">
          Add User
        </button>
      </form>
    </div>
  );
}

export default AddUser;
{/* User Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit User" : "Add User"}</h2>

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="User Email"
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
            placeholder="Manager ID"
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

          {isEditing ? (
            <button
              onClick={handleUpdateUser}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update User
            </button>
          ) : (
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add User
            </button>
          )}
        </div>