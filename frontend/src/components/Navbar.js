import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css"; // Import navbar styles

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the local storage or any other logout logic
    localStorage.removeItem("token");
    // Redirect to the landing page
    navigate("/LandingPage");
  };

  return (
    <nav className="navbar">
      <h2>Tele CRM</h2>
      <div className="nav-links">
        <Link to="/LandingPage">About Us</Link>
        <Link to="/contact">Contact Us</Link>
        <Link to="/login">Login</Link>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;