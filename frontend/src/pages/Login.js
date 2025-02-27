import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/auth.css"; // Import authentication styles

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee"); // Default role is employee
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password, role });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials!");
    }
  };

  const handleForgotPassword = async () => {
    if (role !== "admin") {
      alert("Password reset is only available for admins.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      alert("Password reset link has been sent to your email.");
    } catch (err) {
      alert("Failed to send password reset email.");
    }
  };

  return (
    <div className="auth-container bg-gradient-to-r from-darkblue via-blue-200 to-white text-center min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-darkblue mb-6">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-darkblue font-bold mb-2" htmlFor="role">Login as:</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full py-3 bg-darkblue text-white font-bold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
          >
            Login
          </button>
        </form>
        {role === "admin" && (
          <button
            onClick={handleForgotPassword}
            className="mt-4 text-darkblue underline focus:outline-none"
          >
            Forgot Password?
          </button>
        )}
      </div>
    </div>
  );
}

export default Login;