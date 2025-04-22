// src/pages/auth/Login.js
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";
import "../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin"); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Error state

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      // Determine API endpoint based on role
      const apiEndpoint =
        role === "admin"
          ? "http://localhost:5000/api/admins/login"
          : "http://localhost:5000/api/users/login";

      // Make API request
      const res = await axios.post(apiEndpoint, { email, password });

      // Extract data from response
      const { token, role: userRole, ...user } = res.data.data;

      if (!token || !userRole || !user) {
        throw new Error("Invalid response from server.");
      }

      // Store user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("user", JSON.stringify(user));

      // Debugging: Check if token and role are stored
      console.log("Token:", localStorage.getItem("token"));
      console.log("Role:", localStorage.getItem("role"));

      // Update AuthContext
      login({ token, role: userRole, user });

      // Debugging: Check the role
      console.log("User Role:", userRole);
      if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "manager") {
        navigate("/manager-dashboard");
      } else if (userRole === "caller") {
        navigate("/caller-dashboard");
      } else if (userRole === "field_employee") {
        navigate("/field_employee-dashboard");
      } else {
        throw new Error("Invalid role. Please contact support.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Something went wrong";
      setError(errorMessage); // Set error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-white via-blue-100 to-white min-h-screen flex flex-col text-black">
      {/* Login Form Container */}
      <div className="flex-grow flex items-center justify-center py-20">
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-center mb-6">Login</h2>
          <form onSubmit={handleLogin}>
            {/* Display Error Message */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Role Selection Dropdown */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="caller">Caller</option>
              <option value="field_employee">Field Employee</option>
            </select>

            {/* Email Input */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Password Input */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-bold rounded-full shadow-lg transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Login;
