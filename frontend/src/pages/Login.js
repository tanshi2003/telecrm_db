import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer"; // Import Footer component

import "../styles/auth.css"; // Import authentication styles

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role is "user"
  const [loading, setLoading] = useState(false); // Loader state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine the API endpoint based on the selected role
      const apiEndpoint =
        role === "admin"
          ? "http://localhost:5000/api/admins/login"
          : "http://localhost:5000/api/users/login";

      const res = await axios.post(apiEndpoint, { email, password });

      console.log("Response Data:", res.data);

      // Access the nested data object
      const { token, role: userRole, ...user } = res.data.data;

      if (!token || !userRole || !user) {
        alert("Login failed: Invalid response from server.");
        setLoading(false);
        return;
      }

      // Store user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("user", JSON.stringify(user));

      // Show success message
      alert("Login successful!");

      // Navigate based on role
      if (userRole === "admin") {
        navigate("/admin-dashboard"); // Admin dashboard
      } else if (userRole === "user") {
        navigate("/user-dashboard"); // User dashboard
      } else {
        alert("Unknown role: Access denied.");
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data?.message || err.message);
      alert("Login failed: " + (err.response?.data?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-white via-blue-100 to-white text-black min-h-screen flex flex-col">
      {/* Login Box Container */}
      <div className="flex-grow flex items-center justify-center py-20">
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-darkblue mb-6 text-center">Login</h2>
          <form onSubmit={handleLogin}>
            {/* Role Dropdown */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
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
              className="w-full py-3 bg-blue-900 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
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
