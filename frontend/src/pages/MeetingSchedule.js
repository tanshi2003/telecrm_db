import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import BackButton from "../components/BackButton"; // Import BackButton

const MeetingSchedule = () => {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const getDayName = (dateStr) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString("en-US", { weekday: "long" });
  };

  const handleSchedule = (e) => {
    e.preventDefault();

    if (!clientName || !date || !time) {
      toast.error("Please fill in all fields.");
      return;
    }

    const newMeeting = {
      id: Date.now(),
      clientName,
      date,
      time,
      day: getDayName(date),
    };

    setMeetings([newMeeting, ...meetings]);
    toast.success("Meeting scheduled!");

    // Clear form
    setClientName("");
    setDate("");
    setTime("");
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-6 bg-gray-100 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Meeting Schedule</h1>
          {/* <button
            onClick={() => navigate("/field-dashboard")}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            ← Back to Dashboard
          </button> */}
          <BackButton /> {/* Use BackButton instead of a custom button */}
        </div>

        {/* Meeting Form */}
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Schedule New Meeting</h2>
          <form onSubmit={handleSchedule} className="space-y-4">
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client Name or Meeting With"
              className="w-full border rounded p-2"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded p-2"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border rounded p-2"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Schedule Meeting
            </button>
          </form>
        </div>

        {/* Meeting List */}
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
          {meetings.length === 0 ? (
            <p className="text-gray-500">No meetings scheduled yet.</p>
          ) : (
            <ul className="space-y-4">
              {meetings.map((meeting) => (
                <li key={meeting.id} className="border-b pb-2">
                  <p className="font-semibold">{meeting.clientName}</p>
                  <p className="text-sm text-gray-600">
                    {meeting.day}, {meeting.date} at {meeting.time}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingSchedule;
