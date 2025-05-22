import React, { useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import { FaTrashAlt, FaAt } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Excelupload = () => {
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleUploadClick = () => {
    console.log("File upload clicked");
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("File changed:", file);

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ File size exceeds 5MB limit!");
        return;
      }

      // Simulate file upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        console.log("Upload progress:", progress);
        if (progress >= 100) {
          clearInterval(interval);
          alert("✅ File uploaded successfully!");
          console.log("File uploaded successfully!");
        }
      }, 200);
    }
  };

  const handleDateToggle = () => {
    setShowCalendar(!showCalendar);
    console.log("Calendar toggled:", !showCalendar);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
    console.log("Date selected:", date);
    console.log("Selected date:", selectedDate);
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-grow bg-gray-100 ml-64 mt-16 p-8 relative">
        {/* Back Button at top right */}
        <div className="absolute top-8 right-8 z-10">
          <BackButton />
        </div>
        {/* Bulk Upload Section */}
        <div className="mb-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Bulk Upload</h2>
          <div className="bg-gray-200 rounded-md h-48 flex flex-col justify-center items-center px-4">
            <input
              type="file"
              accept=".csv,.xlsx"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-center text-gray-700 font-medium">
              Click to upload .csv or .xlsx files
              <br />
              <span className="text-sm text-gray-500">
                (Max 5MB or 10k rows/sheet)
              </span>
            </p>
            <button
              onClick={handleUploadClick}
              className="mt-4 bg-gray-400 text-white px-6 py-2 rounded-full hover:bg-gray-500 transition"
            >
              Upload to add
            </button>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-3 w-3/4 bg-white rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-2 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Previously Uploaded Files */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Previously Uploaded files(3)
          </h3>
          <div className="flex justify-end gap-4 mb-2 relative">
            <div
              className="border px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer"
              onClick={handleDateToggle}
            >
              <MdOutlineDateRange />
              <span>Date</span>
              {showCalendar && (
                <div className="absolute top-full mt-2 right-0 z-10 bg-white p-2 rounded shadow">
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    inline
                  />
                </div>
              )}
            </div>
            <div className="border px-4 py-2 rounded-md">Uploaded by ▾</div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="grid grid-cols-5 bg-gray-100 text-gray-600 font-medium px-4 py-2">
              <div>Name</div>
              <div>Leads</div>
              <div>Uploaded by</div>
              <div>Uploaded on</div>
              <div>Actions</div>
            </div>

            {[
              {
                name: "Testing",
                leads: 50,
                uploadedBy: "TK",
                time: "1M ago",
              },
              {
                name: "TeleCRM Sample Upload sheet.xlsx",
                leads: 20,
                uploadedBy: "TK",
                time: "1M ago",
              },
              {
                name: "Leads-report-Jan-2025",
                leads: 10,
                uploadedBy: "TK",
                time: "2M ago",
              },
            ].map((file, index) => (
              <div
                key={index}
                className="grid grid-cols-5 px-4 py-2 items-center border-t hover:bg-gray-50"
              >
                <div>{file.name}</div>
                <div>{file.leads}</div>
                <div>
                  <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                    {file.uploadedBy}
                  </div>
                </div>
                <div>{file.time}</div>
                <div className="flex gap-4 text-gray-600">
                  <FaAt className="cursor-pointer hover:text-blue-500" />
                  <FaTrashAlt className="cursor-pointer hover:text-red-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Excelupload;