import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const priorities = ['Low', 'Medium', 'High'];
const statuses = ['active', 'pending', 'inactive'];

const CreateCampaignWithUsers = ({ onSuccess, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [priority, setPriority] = useState('Medium');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    // Fetch manager's team members
    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem('token');
        const managerId = storedUser?.id;
        
        if (!managerId) {
          console.error('No manager ID found in stored user');
          setError('User information not found. Please log in again.');
          return;
        }

        // First fetch current user details to get role
        try {
          const userResponse = await axios.get(
            'http://localhost:5000/api/auth/me',
            { headers: { Authorization: `Bearer ${token}` } }
          );

          console.log('User details response:', userResponse.data);

          if (!userResponse.data.success) {
            setError('Failed to fetch user details');
            return;
          }

          const userRole = userResponse.data.user?.role?.toLowerCase();
          console.log('User role from backend:', userRole);

          if (userRole !== 'manager') {
            setError('Only managers can create campaigns.');
            return;
          }

          // If user is manager, proceed with fetching team members
          const res = await axios.get(
            `http://localhost:5000/api/managers/teams/${managerId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log('Team members API response:', res.data);
          
          if (res.data.success && Array.isArray(res.data.data?.team_members)) {
            const teamMembers = res.data.data.team_members.filter(member => member.id !== managerId);
            console.log('Filtered team members:', teamMembers);
            
            if (teamMembers.length === 0) {
              // If no team members found, fetch unassigned users
              const unassignedRes = await axios.get(
                'http://localhost:5000/api/managers/unassigned-users',
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (unassignedRes.data.success && Array.isArray(unassignedRes.data.data)) {
                setEmployees(unassignedRes.data.data);
                setError('No team members found. Please assign users to your team first.');
              } else {
                setEmployees([]);
                setError('No team members or unassigned users found.');
              }
            } else {
              setEmployees(teamMembers);
              setError(''); // Clear any previous error
            }
          } else {
            console.error('Invalid response format:', res.data);
            setEmployees([]);
            setError('Error fetching team members. Please try again.');
          }
        } catch (err) {
          console.error('Error fetching user details:', err);
          setError('Failed to verify user role. Please try again.');
        }
      } catch (err) {
        console.error('Error in fetchTeamMembers:', err);
        setError('Failed to fetch team members. Please try again.');
      }
    };

    if (storedUser?.id) {
      fetchTeamMembers();
    } else {
      setError('User information not found. Please log in again.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      // 1. Create campaign
      const campaignRes = await axios.post(
        'http://localhost:5000/api/campaigns',
        { 
          name, 
          description, 
          status, 
          priority, 
          start_date: startDate ? new Date(startDate).toISOString().split('T')[0] : null,
          end_date: endDate ? new Date(endDate).toISOString().split('T')[0] : null,
          assigned_users: selectedUsers || [],  // Ensure it's always an array
          admin_id: storedUser.role === 'admin' ? storedUser.id : null  // Only set admin_id if user is admin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Campaign creation response:', campaignRes.data);

      if (campaignRes.data.success) {
        setSuccess('Campaign created successfully!');
        setName('');
        setDescription('');
        setStatus('active');
        setPriority('Medium');
        setStartDate('');
        setEndDate('');
        setSelectedUsers([]);
        if (onSuccess) onSuccess();
      } else {
        throw new Error(campaignRes.data.message || 'Failed to create campaign');
      }
    } catch (err) {
      console.error('Campaign creation error:', err.response?.data || err);
      setError(err.response?.data?.message || err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssignUsers = async (userIds) => {
    try {
      const token = localStorage.getItem('token');
      const managerId = user?.id;

      const res = await axios.post(
        'http://localhost:5000/api/managers/assign-users',
        {
          manager_id: managerId,
          user_ids: userIds
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Refresh team members
        const teamRes = await axios.get(
          `http://localhost:5000/api/managers/${managerId}/team`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (teamRes.data.success && Array.isArray(teamRes.data.data)) {
          const teamMembers = teamRes.data.data.filter(member => member.id !== managerId);
          setEmployees(teamMembers);
          setError('');
        }
      }
    } catch (err) {
      console.error('Error assigning users:', err.response?.data || err);
      setError('Failed to assign users to team');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {user && <Sidebar user={user} />}
      <div className="flex-grow ml-64 relative">
        <div className="fixed top-0 right-0 left-64 z-50">
          <Navbar />
        </div>
        <div className="pt-16 flex justify-center items-center min-h-[calc(100vh-64px)]">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Campaign & Assign Users</h2>
              <button
                onClick={() => navigate('/manager/campaigns')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Back
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-medium mb-1">Campaign Name</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <label className="block font-medium mb-1">Status</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block font-medium mb-1">Priority</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                  >
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <label className="block font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">Assign Users</label>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {employees.length === 0 ? (
                    <div className="text-gray-500">No employees found.</div>
                  ) : (
                    <>
                      {employees.map(emp => (
                        <label key={emp.id} className="flex items-center space-x-2 mb-1">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(emp.id)}
                            onChange={() => handleUserSelect(emp.id)}
                          />
                          <span>{emp.name} ({emp.role})</span>
                        </label>
                      ))}
                      {error && error.includes('No team members found') && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => handleAssignUsers(employees.map(emp => emp.id))}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Assign these users to your team
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              {error && <div className="text-red-500 mb-2">{error}</div>}
              {success && <div className="text-green-600 mb-2">{success}</div>}
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Campaign'}
                </button>
                {onClose && (
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignWithUsers;