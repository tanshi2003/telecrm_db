// src/pages/auth/Login.js
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";
import "../styles/auth.css";
import { Eye, EyeOff } from "lucide-react"; // Import eye icons

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin"); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Error state
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

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
           ? `${process.env.REACT_APP_API_BASE_URL}/api/admins/login`
           : `${process.env.REACT_APP_API_BASE_URL}/api/users/login`;

      // Make API request
      const res = await axios.post(apiEndpoint, { email, password });

      // Extract data from response
      const { token, role: userRole, ...user } = res.data.data;

      if (!token || !userRole || !user) {
        throw new Error("Invalid response from server.");
      }

      console.log("Login successful:", {
        token: !!token,
        userRole,
        user
      });

      // Store user data in localStorage
      
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        localStorage.setItem("role", userRole);

      console.log("Data stored in localStorage:", {
        storedToken: !!localStorage.getItem("token"),
        storedRole: localStorage.getItem("role"),
        storedUser: localStorage.getItem("user")
      });

      // Update AuthContext
      login({ token, role: userRole, user });

      console.log("Navigating based on role:", userRole);

      if (userRole === "admin") {
        console.log("Admin role detected, navigating to /admin");
        navigate("/admin");
      } else if (userRole === "manager") {
        console.log("Manager role detected, navigating to /manager-dashboard");
        navigate("/manager-dashboard");
      } else if (userRole === "caller") {
        console.log("Caller role detected, navigating to /caller-dashboard");
        navigate("/caller-dashboard");
      } else if (userRole === "field_employee") {
        console.log("Field employee role detected, navigating to /field_employee-dashboard");
        navigate("/field_employee-dashboard");
      } else {
        console.log("Invalid role detected:", userRole);
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

            {/* Password Input with Eye Icon */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Toggle input type
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)} // Toggle visibility
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-500" />
                ) : (
                  <Eye size={20} className="text-gray-500" />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-bold rounded-full shadow-lg transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 hover:bg-blue-700 text-white"
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
