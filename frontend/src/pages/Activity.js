import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { formatDistanceToNow } from 'date-fns';
import { 
    FaUserEdit, FaPhone, FaMapMarker, FaCheckCircle, 
    FaBullhorn, FaUserPlus, FaCog, FaInfoCircle,
    FaPhoneAlt, FaBook // Add missing icons
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const Activities = () => {
    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // First useEffect for auth check
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const role = localStorage.getItem("role");
        
        if (storedUser && role?.toLowerCase() === "admin") {
            setUser(storedUser);
        } else {
            navigate("/login");
        }
    }, [navigate]);

    // Second useEffect for fetching activities - moved outside conditional
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/activities', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setActivities(data.data);
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
    };

    const getIcon = (actionType) => {
        const icons = {
            'lead_update': FaUserEdit,
            'call_made': FaPhone,
            'lead_visit': FaMapMarker,
            'lead_convert': FaCheckCircle,
            'campaign_create': FaBullhorn,
            'user_create': FaUserPlus,
            'settings_update': FaCog
        };
        const IconComponent = icons[actionType] || FaInfoCircle;
        return <IconComponent />;
    };

    // If user is not set, show loading
    if (!user) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Activities</h1>
        <BackButton/>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Management */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              <FaPhoneAlt className="text-blue-600 inline-block mr-2" />
              My Calls
            </h2>
            <p>Register, assign roles, deactivate/activate users, and manage employee profiles.</p>
          
                 <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => handleNavigation("/Activitycalls")}
            >
              View
            </button>

          </div>

          {/* Campaigns */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              <FaBook className="text-blue-600 inline-block mr-2" />
              My Leads
            </h2>
            <p>Create campaigns, assign users, track progress, and analyze performance.</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => handleNavigation("/Activityleads")}
            >
              View
            </button>
          </div>

    
        </div>

        {/* Recent Activities */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
          
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="space-y-4">
              {activities.map(activity => (
                <div key={activity.id} className="bg-white p-4 rounded-lg shadow flex items-start">
                  <div className="text-blue-500 mr-4">
                    {getIcon(activity.action_type)}
                  </div>
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-500">
                      {activity.user_name} • {activity.timeAgo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;

