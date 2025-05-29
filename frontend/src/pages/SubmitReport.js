import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import BackButton from "../components/BackButton"; // Import BackButton

const SubmitReport = () => {
  const { taskId } = useParams(); // Get task ID from route
  const navigate = useNavigate();
  const [report, setReport] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!report.trim()) {
      toast.error("Report cannot be empty.");
      return;
    }

    // Simulate sending report to manager (could replace with actual API call)
    console.log(`Report for Task ID ${taskId}:`, report);

    setSubmitted(true);
    toast.success("Report submitted successfully to Manager!");

    // Optionally navigate back after few seconds
    setTimeout(() => navigate("/field-dashboard"), 2000);
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-6 bg-gray-100 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Submit Report</h1>
          {/* <button
            onClick={() => navigate("/field-dashboard")}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            ← Back to Dashboard
          </button> */}
          <BackButton /> {/* Use BackButton instead of a custom button */}
        </div>

        <div className="bg-white p-6 rounded shadow-md">
          <p className="mb-4 text-gray-700">
            You're submitting a report for <span className="font-semibold">Task ID: {taskId}</span>
          </p>
          <form onSubmit={handleSubmit}>
            <textarea
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Write your report about today's client visit, product discussion, follow-up, etc..."
              className="w-full border p-3 rounded h-40"
              disabled={submitted}
            ></textarea>

            <button
              type="submit"
              disabled={submitted}
              className={`mt-4 px-4 py-2 text-white rounded ${
                submitted ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {submitted ? "Report Submitted" : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitReport;
