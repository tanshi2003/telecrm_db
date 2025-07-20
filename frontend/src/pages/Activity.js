
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import { format, parseISO } from 'date-fns';
import { 
    FaUserEdit, FaPhone, FaCheckCircle, 
    FaBullhorn, FaUserPlus, FaCog, FaInfoCircle,
    FaBook,
    FaSearch, FaCalendarAlt, FaUser
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const roleColors = {
    'manager': 'bg-blue-100 text-blue-800 border-blue-200',
    'caller': 'bg-green-100 text-green-800 border-green-200',
    'field_employee': 'bg-orange-100 text-orange-800 border-orange-200',
    'system': 'bg-gray-100 text-gray-800 border-gray-200'
};

const Activities = () => {
    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        role: "all",
        type: "all",
        date: "all"
    });    const navigate = useNavigate();
    
    const fetchActivities = React.useCallback(async () => {
        try {
            setLoading(true);
            const userRole = localStorage.getItem('role');
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?.id;
            
            if (!userId || !userRole) {
                throw new Error('User information not found in local storage');
            }

            // Use 'all' endpoint for managers and admins, 'user/:id' for others
            const endpoint = (userRole === 'manager' || userRole === 'admin') ? 'all' : `user/${userId}`;
            console.log('Fetching activities from endpoint:', endpoint);
            
            const response = await fetch(`http://localhost:5000/api/activities/${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to fetch activities:', {
                    status: response.status,
                    statusText: response.statusText,
                    endpoint,
                    userRole,
                    userId,
                    errorText
                });
                throw new Error(`Failed to fetch activities: ${response.status} ${response.statusText}\n${errorText}`);
            }

            const data = await response.json();
            console.log('Received activities data:', data);

            if (!data.success) {
                throw new Error(`API returned error: ${data.message}`);
            }

            const sortedActivities = data.data.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );            // Filter activities based on role
            let filteredData = sortedActivities;
            if (userRole === 'manager') {
                // Managers only see their own activities
                filteredData = sortedActivities.filter(activity => activity.user_id === userId);
                console.log('Filtered activities for manager:', filteredData.length);
            } else if (userRole === 'caller' || userRole === 'field_employee') {
                // Callers and field employees only see their own activities
                filteredData = sortedActivities.filter(activity => activity.user_id === userId);
                console.log('Filtered activities for user:', filteredData.length);
            }

            setActivities(filteredData);
            setFilteredActivities(filteredData);
        } catch (error) {
            console.error('Error in fetchActivities:', error);
        } finally {
            setLoading(false);
        }
    }, []); // Memoize the function

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const role = localStorage.getItem("role");
        
        if (storedUser) {
            setUser(storedUser);
            fetchActivities();
        } else {
            navigate("/login");
        }

        // Filter activities based on user role
        if (role === "caller") {
            setFilters(prev => ({...prev, role: "caller"}));
        } else if (role === "field_employee") {
            setFilters(prev => ({...prev, role: "field_employee"}));
        }
        // Admin and manager can see all activities by default
    }, [navigate, fetchActivities]);

    // Updated filtering useEffect: runs when activities, filters, or searchTerm change
    useEffect(() => {
        if (!activities.length) {
            setFilteredActivities([]);
            return;
        }

        let result = [...activities];

        // Apply search
        if (searchTerm) {
            result = result.filter(activity =>
                activity.activity_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.user_role?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }        // Role filtering removed - managers only see their own activities

        // Apply activity type filter
        if (filters.type !== "all") {
            if (filters.type === 'campaign_all') {
                result = result.filter(activity =>
                    activity.activity_type.includes('campaign_') ||
                    activity.reference_type === 'campaign'
                );
            } else if (filters.type.startsWith('campaign_')) {
                result = result.filter(activity =>
                    activity.activity_type === filters.type ||
                    (activity.reference_type === 'campaign' && activity.activity_type.includes(filters.type))
                );
            } else {
                result = result.filter(activity => activity.activity_type === filters.type);
            }
        }

        // Apply date filter
        if (filters.date !== "all") {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const dayInMs = 24 * 60 * 60 * 1000;
            switch (filters.date) {
                case "today":
                    result = result.filter(activity => {
                        const activityDate = parseISO(activity.created_at);
                        return activityDate >= now;
                    });
                    break;
                case "week":
                    result = result.filter(activity => {
                        const activityDate = parseISO(activity.created_at);
                        return activityDate >= new Date(now.getTime() - 7 * dayInMs);
                    });
                    break;
                case "month":
                    result = result.filter(activity => {
                        const activityDate = parseISO(activity.created_at);
                        return activityDate >= new Date(now.getTime() - 30 * dayInMs);
                    });
                    break;
                default:
                    break;
            }
        }

        setFilteredActivities(result);
    }, [activities, filters, searchTerm]);

    const getActivityIcon = (type, role) => {
        const icons = {
            // Lead Activities
            'lead_create': FaUserPlus,
            'lead_update': FaUserEdit,
            'lead_assign': FaUserEdit,
            'lead_convert': FaCheckCircle,
            // Call Activities
            'call_made': FaPhone,            // Campaign Activities
            'campaign_create': FaBullhorn,
            'campaign_update': FaCog,
            'campaign_assign': FaUserEdit,
            'campaign_all': FaBullhorn,
            'campaign_status': FaCheckCircle,
            'campaign_delete': FaInfoCircle,
            // Other Activities
            'user_create': FaUserPlus,
            'settings_update': FaCog,
            'note_add': FaBook
        };

        return icons[type] || FaInfoCircle;
    };

    const getStatusColor = (type) => {
        const colors = {
            'lead_create': 'bg-green-100 text-green-800',
            'lead_update': 'bg-blue-100 text-blue-800',
            'lead_assign': 'bg-purple-100 text-purple-800',
            'campaign_create': 'bg-indigo-100 text-indigo-800',
            'campaign_update': 'bg-violet-100 text-violet-800',
            'campaign_assign': 'bg-fuchsia-100 text-fuchsia-800',
            'campaign_status': 'bg-purple-100 text-purple-800',
            'campaign_delete': 'bg-rose-100 text-rose-800',
            'user_create': 'bg-pink-100 text-pink-800',
            'settings_update': 'bg-gray-100 text-gray-800',
            'note_add': 'bg-teal-100 text-teal-800',
            'location_update': 'bg-orange-100 text-orange-800',
            'lead_convert': 'bg-emerald-100 text-emerald-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getRoleColor = (role) => {
        return roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // ...existing code...

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar user={user} />
                <div className="flex-1 ml-64">
                    <div className="flex items-center justify-center h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar />
            <Sidebar user={user} />
            <div className="lg:ml-64 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Activities</h1>
                                <div className="mt-3 flex items-center">
                                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        <FaUser className="mr-2" />
                                        {user?.name || localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))?.name : "User"} • {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} View
                                    </div>
                                    <span className="ml-4 text-gray-500">
                                        {filteredActivities.length} Activities
                                    </span>
                                </div>
                            </div>
                            <div className="mt-6 md:mt-0 flex flex-col items-end gap-4">
                                <BackButton />
                                <div className="inline-flex shadow-sm rounded-lg">
                                    {['today', 'week', 'month'].map((period, i) => (
                                        <button
                                            key={period}
                                            onClick={() => setFilters({...filters, date: period})}
                                            className={[
                                                "px-4 py-2 text-sm font-medium",
                                                filters.date === period ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50",
                                                i === 0 ? "rounded-l-lg" : "",
                                                i === 2 ? "rounded-r-lg" : "",
                                                "border border-gray-200"
                                            ].join(" ")}
                                        >
                                            {period.charAt(0).toUpperCase() + period.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>                    {/* Filters Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400 h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out sm:text-sm"
                                    placeholder="Search activities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out sm:text-sm"
                                value={filters.type}
                                onChange={(e) => setFilters({...filters, type: e.target.value})}
                            >
                                <option value="all">All Activities</option>
                                <optgroup label="Lead Activities">
                                    <option value="lead_create">Lead Creation</option>
                                    <option value="lead_update">Lead Updates</option>
                                    <option value="lead_assign">Lead Assignments</option>
                                    <option value="lead_convert">Lead Conversion</option>
                                </optgroup>
                                <optgroup label="Campaign Activities">
                                    <option value="campaign_all">All Campaign Activities</option>
                                    <option value="campaign_create">Campaign Creation</option>
                                    <option value="campaign_update">Campaign Updates</option>
                                    <option value="campaign_assign">Campaign Assignments</option>
                                    <option value="campaign_status">Campaign Status Changes</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="divide-y divide-gray-100">
                            {filteredActivities.map((activity, index) => {
                                const IconComponent = getActivityIcon(activity.activity_type);
                                const statusColor = getStatusColor(activity.activity_type);
                                const roleColor = getRoleColor(activity.user_role);
                                
                                return (
                                    <div 
                                        key={activity.id} 
                                        className={[
                                            "p-6 hover:bg-gray-50 transition-all duration-200",
                                            index === 0 ? "border-t-4 border-t-blue-500" : ""
                                        ].join(" ")}
                                    >
                                        <div className="flex space-x-6">
                                            <div className={[
                                                "flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-md transform transition-transform duration-200 hover:scale-110",
                                                statusColor.split(" ")[0]
                                            ].join(" ")}>
                                                <IconComponent className={[
                                                    "w-7 h-7",
                                                    statusColor.split(" ")[1]
                                                ].join(" ")} />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <p className="text-base font-semibold text-gray-900">
                                                            {activity.user_name || 'System'}
                                                        </p>
                                                        <span className={[
                                                            "px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm",
                                                            roleColor
                                                        ].join(" ")}>
                                                            {activity.user_role || 'System'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center mt-2 sm:mt-0 text-sm text-gray-500">
                                                        <FaCalendarAlt className="mr-2 h-4 w-4 text-gray-400" />
                                                        {activity.created_at ? format(parseISO(activity.created_at), "d MMM yyyy 'at' h:mm a") : 'No date'}
                                                    </div>
                                                </div>
                                                <p className="mt-3 text-base text-gray-600 leading-relaxed">
                                                    {activity.activity_description}
                                                </p>
                                                {activity.reference_type && (
                                                    <div className="mt-3">
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                                                            {activity.reference_type} #{activity.reference_id}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {filteredActivities.length === 0 && (
                            <div className="p-16 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                                    <FaInfoCircle className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No activities found</h3>
                                <p className="mt-2 text-base text-gray-500 max-w-sm mx-auto">
                                    Try adjusting your search or filter criteria to find what you're looking for
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Activities;