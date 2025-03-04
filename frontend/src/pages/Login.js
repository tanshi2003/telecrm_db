import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/auth.css"; // Import authentication styles

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loader state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
  
      console.log("Response Data:", res.data);
  
      if (!res.data.token || !res.data.role || !res.data.user) {
        alert("Login failed: Invalid response from server.");
        setLoading(false);
        return;
      }
  
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user)); // ✅ Store user details
  
      if (res.data.role === "admin") {
        navigate("/admin-dashboard"); // ✅ Corrected path
      } else {
        navigate("/user-dashboard");  // ✅ Corrected path
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data?.message || err.message);
      alert("Login failed: " + (err.response?.data?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="auth-container bg-gradient-to-r from-darkblue via-blue-200 to-white text-center min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-darkblue mb-6">Login</h2>
        <form onSubmit={handleLogin}>
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
            disabled={loading} // Disable button when loading
            className="w-full py-3 bg-darkblue text-white font-bold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
          >
            {loading ? "Logging in..." : "Login"} {/* Show loading text */}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
