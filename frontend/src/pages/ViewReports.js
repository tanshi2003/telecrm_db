import React from "react";
import BackButton from "../components/BackButton";

const ViewReports = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">View Reports</h1>
        <BackButton />
      </div>
      <p>Analyze performance summaries by user, team, or campaign. Export data and download reports.</p>
    </div>
  );
};

export default ViewReports;