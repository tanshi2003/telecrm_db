import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import { getTeamById } from "../services/managerService";
import { Users, Mail } from "lucide-react";
import toast from "react-hot-toast";

const ViewTeam = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [team, setTeam] = useState(null);

  const fetchTeamData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTeamById(id);
      setTeam(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch team data");
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
          <div className="text-center text-gray-600">Team not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Team Details</h1>
          <BackButton />
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-6">
          {/* Manager Section */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold flex items-center">
                    {team.manager_name}
                    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Team Manager
                    </span>
                  </h2>
                  <p className="text-gray-600">{team.manager_email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Team Members ({team.team_size})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.team_members.map((member) => (
                <div
                  key={member.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium">{member.name}</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {member.email}
                    </p>
                    <p className="text-sm text-gray-600">Role: {member.role}</p>
                    <div className="mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          member.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTeam;