import React from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css"; // Create this CSS file for styles
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left: Company Info */}
        <div className="footer-section">
          <h3>TeleCRM</h3>
          <p>
            Unlock new opportunities, build lasting relationships, and accelerate your business success with our expert CRM solutions.
          </p>
        </div>

        {/* Middle: Navigation */}
        <div className="footer-section">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/LandingPage">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            {/* <li><Link to="/terms">Terms of Use</Link></li> */}
          </ul>
        </div>

        {/* Right: Contact Info */}
        <div className="footer-section">
          <h4>Contact Info</h4>
          <p><i className="fas fa-map-marker-alt"></i> Unit 34, A Bazar Road, Landmark Market, Kolkata - 700025, India</p>
          <p><i className="fas fa-phone"></i> +91-255-400-7008</p>
          <p><i className="fas fa-envelope"></i> hello@telecrm.com</p>
        </div>
      </div>

      <hr className="footer-divider" />

      {/* Bottom: Copyright + Policies */}
      <div className="footer-bottom">
        <p>© 2025 TeleCRM. All Rights Reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/cookies">Cookies Policy</Link>
          <div className="social-icons">
            <a href="https://facebook.com/telecrm" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://twitter.com/telecrm" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://linkedin.com/company/telecrm" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
            <a href="https://instagram.com/telecrm" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
