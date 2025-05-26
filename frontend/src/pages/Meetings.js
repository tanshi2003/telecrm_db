import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

// Dummy data for demonstration
const dummyMeetings = [
  {
    id: 1,
    title: "Weekly Sync",
    description: "Weekly team sync-up meeting.",
    start: "2025-05-20T10:00",
    end: "2025-05-20T11:00",
    participants: [11, 12, 25], // user IDs
    location: "Conference Room A",
    status: "upcoming",
    notes: "",
    recurrence: "weekly",
    attendance: [],
  },
  {
    id: 2,
    title: "Project Kickoff",
    description: "Kickoff for new project.",
    start: "2025-05-15T14:00",
    end: "2025-05-15T15:00",
    participants: [11, 25],
    location: "Google Meet",
    status: "completed",
    notes: "Discussed project milestones.",
    recurrence: "none",
    attendance: [11, 25],
  },
];

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    participants: [],
    location: "",
    recurrence: "none",
    reminders: false,
  });
  const [team, setTeam] = useState([]);
  const [view, setView] = useState("list"); // list or calendar
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState(null);

  // Fetch team members and meetings (replace with real API in production)
  useEffect(() => {
    // Simulate fetching user info
    const user = JSON.parse(localStorage.getItem("user"));
    setUserRole(user?.role || "");
    setUserId(user?.id);

    // Simulate fetching team members (callers and field employees)
    fetch("http://localhost:5000/api/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const members = (data.data || []).filter(
          (u) =>
            u.role &&
            (u.role.toLowerCase() === "caller" ||
              u.role.toLowerCase() === "field_employee" ||
              u.role.toLowerCase() === "field employee")
        );
        setTeam(members);
      });

    // Simulate fetching meetings
    setMeetings(dummyMeetings);
  }, []);

  // Filtered meetings for search/filter
  const filteredMeetings = meetings.filter((m) => {
    const matchesTitle = m.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? m.status === statusFilter : true;
    const matchesDate = dateFilter
      ? m.start.slice(0, 10) === dateFilter
      : true;
    // Only show meetings the user is a participant of, unless manager
    const isParticipant =
      userRole === "manager" ||
      (userId && m.participants.includes(userId));
    return matchesTitle && matchesStatus && matchesDate && isParticipant;
  });

  // Handle form input
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle participant selection
  const handleParticipantChange = (id) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.includes(id)
        ? prev.participants.filter((pid) => pid !== id)
        : [...prev.participants, id],
    }));
  };

  // Handle meeting creation
  const handleCreateMeeting = (e) => {
    e.preventDefault();
    const newMeeting = {
      ...form,
      id: Date.now(),
      status: "upcoming",
      notes: "",
      attendance: [],
    };
    setMeetings((prev) => [...prev, newMeeting]);
    setShowForm(false);
    setForm({
      title: "",
      description: "",
      start: "",
      end: "",
      participants: [],
      location: "",
      recurrence: "none",
      reminders: false,
    });
    // TODO: Notify participants
    alert("Meeting scheduled and notifications sent!");
  };

  // Handle meeting update
  const handleUpdateMeeting = (updated) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
    setShowDetail(null);
    // TODO: Notify participants
    alert("Meeting updated and notifications sent!");
  };

  // Handle meeting cancel
  const handleCancelMeeting = (id) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: "cancelled" } : m
      )
    );
    setShowDetail(null);
    // TODO: Notify participants
    alert("Meeting cancelled and notifications sent!");
  };

  // Attendance toggle
  const handleAttendance = (meeting, uid) => {
    const updated = {
      ...meeting,
      attendance: meeting.attendance.includes(uid)
        ? meeting.attendance.filter((id) => id !== uid)
        : [...meeting.attendance, uid],
    };
    handleUpdateMeeting(updated);
  };

  // Meeting notes update
  const handleNotesUpdate = (meeting, notes) => {
    const updated = { ...meeting, notes };
    handleUpdateMeeting(updated);
  };

  // Calendar view (simple weekly/monthly toggle)
  const renderCalendar = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Calendar View (Monthly)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Meetings</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(
              new Set(filteredMeetings.map((m) => m.start.slice(0, 10)))
            ).map((date) => (
              <tr key={date}>
                <td className="px-4 py-2 font-semibold">{date}</td>
                <td className="px-4 py-2">
                  {filteredMeetings
                    .filter((m) => m.start.slice(0, 10) === date)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="cursor-pointer hover:underline text-blue-700"
                        onClick={() => setShowDetail(m)}
                      >
                        {m.title} ({m.status})
                      </div>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Meeting detail modal
  const MeetingDetail = ({ meeting }) => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl relative">
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500"
          onClick={() => setShowDetail(null)}
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold mb-2">{meeting.title}</h3>
        <p className="mb-2 text-gray-700">{meeting.description}</p>
        <p className="mb-2">
          <span className="font-semibold">Date:</span>{" "}
          {meeting.start.slice(0, 10)}{" "}
          <span className="font-semibold">Time:</span>{" "}
          {meeting.start.slice(11)} - {meeting.end.slice(11)}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Location/Link:</span> {meeting.location}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Status:</span>{" "}
          <span
            className={
              meeting.status === "upcoming"
                ? "text-blue-600"
                : meeting.status === "completed"
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {meeting.status}
          </span>
        </p>
        <p className="mb-2">
          <span className="font-semibold">Participants:</span>{" "}
          {meeting.participants
            .map((id) => team.find((u) => u.id === id)?.name || "Unknown")
            .join(", ")}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Recurrence:</span> {meeting.recurrence}
        </p>
        <div className="mb-2">
          <span className="font-semibold">Attendance:</span>
          <ul className="list-disc pl-6">
            {meeting.participants.map((id) => {
              const user = team.find((u) => u.id === id);
              return (
                <li key={id}>
                  {user?.name || "Unknown"}{" "}
                  {userRole === "manager" && (
                    <input
                      type="checkbox"
                      checked={meeting.attendance.includes(id)}
                      onChange={() => handleAttendance(meeting, id)}
                      className="ml-2"
                    />
                  )}
                  <span className="ml-2 text-xs text-gray-500">
                    {meeting.attendance.includes(id) ? "Present" : "Absent"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Notes:</span>
          {userRole === "manager" ? (
            <textarea
              className="w-full border rounded p-2 mt-1"
              value={meeting.notes}
              onChange={(e) => handleNotesUpdate(meeting, e.target.value)}
              rows={2}
            />
          ) : (
            <div className="bg-gray-100 rounded p-2 mt-1">{meeting.notes}</div>
          )}
        </div>
        {userRole === "manager" && (
          <div className="flex gap-3 mt-4">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => {
                setForm({
                  ...meeting,
                  start: meeting.start,
                  end: meeting.end,
                });
                setShowForm(true);
                setShowDetail(null);
              }}
            >
              Edit / Reschedule
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => handleCancelMeeting(meeting.id)}
            >
              Cancel Meeting
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Meeting form modal
  const MeetingForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <form
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl relative"
        onSubmit={form.id ? (e) => {
          e.preventDefault();
          handleUpdateMeeting(form);
          setShowForm(false);
        } : handleCreateMeeting}
      >
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500"
          onClick={() => setShowForm(false)}
          type="button"
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold mb-4">
          {form.id ? "Edit Meeting" : "Schedule New Meeting"}
        </h3>
        <div className="mb-3">
          <label className="block font-semibold mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleFormChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleFormChange}
            className="w-full border rounded p-2"
            rows={2}
          />
        </div>
        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Start Time</label>
            <input
              type="datetime-local"
              name="start"
              value={form.start}
              onChange={handleFormChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">End Time</label>
            <input
              type="datetime-local"
              name="end"
              value={form.end}
              onChange={handleFormChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="block font-semibold mb-1">Participants</label>
          <div className="flex flex-wrap gap-2">
            {team.map((member) => (
              <label key={member.id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={form.participants.includes(member.id)}
                  onChange={() => handleParticipantChange(member.id)}
                />
                <span>{member.name} ({member.role.replace("_", " ")})</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-3">
          <label className="block font-semibold mb-1">Location/Meeting Link</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleFormChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Recurrence</label>
            <select
              name="recurrence"
              value={form.recurrence}
              onChange={handleFormChange}
              className="w-full border rounded p-2"
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex-1 flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              name="reminders"
              checked={form.reminders}
              onChange={handleFormChange}
            />
            <label className="font-semibold">Enable Reminders</label>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {form.id ? "Update Meeting" : "Schedule Meeting"}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-grow bg-gray-100 ml-64 mt-16">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Meetings</h1>
            {userRole === "manager" && (
              <button
                onClick={() => {
                  setForm({
                    title: "",
                    description: "",
                    start: "",
                    end: "",
                    participants: [],
                    location: "",
                    recurrence: "none",
                    reminders: false,
                  });
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Schedule Meeting
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
            <input
              type="text"
              placeholder="Search by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 border rounded w-full md:w-1/4"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded w-full md:w-1/4"
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-2 border rounded w-full md:w-1/4"
            />
            <button
              onClick={() => setView(view === "list" ? "calendar" : "list")}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {view === "list" ? "Calendar View" : "List View"}
            </button>
          </div>

          {/* Meetings List or Calendar */}
          {view === "calendar" ? (
            renderCalendar()
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Meetings List</h2>
              {filteredMeetings.length === 0 ? (
                <p>No meetings found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Title</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Time</th>
                        <th className="px-4 py-2 text-left">Participants</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMeetings.map((meeting) => (
                        <tr key={meeting.id} className="border-b hover:bg-blue-50">
                          <td className="px-4 py-2 font-semibold">
                            <span
                              className="cursor-pointer text-blue-700 hover:underline"
                              onClick={() => setShowDetail(meeting)}
                            >
                              {meeting.title}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {meeting.start.slice(0, 10)}
                          </td>
                          <td className="px-4 py-2">
                            {meeting.start.slice(11)} - {meeting.end.slice(11)}
                          </td>
                          <td className="px-4 py-2">
                            {meeting.participants
                              .map(
                                (id) =>
                                  team.find((u) => u.id === id)?.name ||
                                  "Unknown"
                              )
                              .join(", ")}
                          </td>
                          <td className="px-4 py-2 capitalize">
                            <span
                              className={
                                meeting.status === "upcoming"
                                  ? "bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                                  : meeting.status === "completed"
                                  ? "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs"
                                  : "bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs"
                              }
                            >
                              {meeting.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <button
                              className="px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600"
                              onClick={() => setShowDetail(meeting)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Modals */}
          {showForm && <MeetingForm />}
          {showDetail && <MeetingDetail meeting={showDetail} />}
        </div>
      </div>
    </div>
  );
};

export default Meetings;