import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)} // Navigate back
      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
    >
      Back
    </button>
  );
};

export default BackButton;