import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      {/* <h2>Admin Panel</h2> */}
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/users">Users</Link></li>
        <li><Link to="/add-user">Add User</Link></li>
        <li><Link to="/">Logout</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
