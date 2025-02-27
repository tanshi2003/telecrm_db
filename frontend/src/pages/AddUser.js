import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // ✅ Import toast
import "react-toastify/dist/ReactToastify.css"; // ✅ Import CSS
import "bootstrap/dist/css/bootstrap.min.css";

function AddUser() {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [fieldWorkType, setFieldWorkType] = useState("");
  const navigate = useNavigate();

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!userName || !email || !role || !phoneNumber) {
      toast.error("Please enter all required fields."); // 🔴 Show error toast
      return;
    }

    const newUser = {
      userName,
      firstName,
      lastName,
      email,
      phoneNumber,
      role,
      fieldWorkType,
    };

    try {
      const response = await fetch("http://localhost:5000/addUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const result = await response.json();
      console.log("Response from server:", result); // Debugging

      if (result.success) {
        toast.success("✅ User added successfully! Redirecting...");
        setTimeout(() => {
          navigate("/users"); // ✅ Navigate after success
        }, 1500);
      } else {
        toast.error("Failed to add user");
      }
    } catch (err) {
      console.error("Error adding user:", err);
      toast.error("Error adding user");
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
