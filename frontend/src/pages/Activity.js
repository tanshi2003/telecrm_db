import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { formatDistanceToNow } from 'date-fns';
import { 
    FaUserEdit, FaPhone, FaMapMarker, FaCheckCircle, 
    FaBullhorn, FaUserPlus, FaCog, FaInfoCircle,
    FaPhoneAlt, FaBook, FaClipboard, FaMapMarkedAlt,
    FaChartLine // Add this import
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const Activities = () => {
    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
            fetchActivities(storedUser.id, storedUser.role);
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const fetchActivities = async (userId, role) => {
        try {
            // If admin, fetch all activities, otherwise fetch user-specific activities
            const endpoint = role === 'admin' 
                ? 'http://localhost:5000/api/activities/all'
                : `http://localhost:5000/api/activities/user/${userId}`;

            const response = await fetch(endpoint, {
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

    const getActivityIcon = (type, role) => {
        const icons = {
            admin: {
                'user_create': FaUserPlus,
                'settings_update': FaCog,
                'analytics_view': FaChartLine
            },
            manager: {
                'lead_assign': FaUserEdit,
                'campaign_create': FaBullhorn,
                'report_view': FaClipboard
            },
            caller: {
                'call_made': FaPhone,
                'lead_update': FaUserEdit,
                'note_add': FaBook
            },
            field: {
                'location_update': FaMapMarkedAlt,
                'lead_convert': FaCheckCircle,
                'client_visit': FaMapMarker
            }
        };

        return (icons[role]?.[type] || FaInfoCircle);
    };

    const getActivityCard = (activity) => {
        const IconComponent = getActivityIcon(activity.activity_type, activity.role);
        
        return (
            <div key={activity.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
                <div className="flex items-start">
                    <div className="p-2 rounded-full bg-blue-100">
                        <IconComponent className="text-blue-600" />
                    </div>
                    <div className="ml-4">
                        {/* Add user name for admin view */}
                        {user?.role === 'admin' && (
                            <p className="text-sm font-semibold text-blue-600">
                                {activity.user_name} ({activity.user_role})
                            </p>
                        )}
                        <p className="font-medium">{activity.activity_description}</p>
                        <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                        {activity.location && (
                            <p className="text-xs text-gray-400 mt-1">
                                <FaMapMarker className="inline mr-1" />
                                {activity.location}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen overflow-hidden">
            <Sidebar user={user} />
            <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Activities</h1>
                    <BackButton />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {activities.map(activity => getActivityCard(activity))}
                    {activities.length === 0 && (
                        <p className="text-center text-gray-500">No recent activities</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Activities;

